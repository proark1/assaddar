"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { clearSession, setSession } from "@/lib/portal/auth";
import { appUrl, requireEmailVerification } from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import { findUserByEmail, id, mutateStore, readStore } from "@/lib/portal/store";
import { hashPassword, verifyPassword } from "@/lib/portal/password";
import { createAuthToken, findConsumableAuthToken } from "@/lib/portal/tokens";

function safeLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value || "de");
  return isLocale(raw) ? raw : "de";
}

function nextPath(locale: Locale, value: FormDataEntryValue | null) {
  const raw = String(value || "");
  if (raw.startsWith(`/${locale}/`) && !raw.includes("//")) return raw;
  return `/${locale}/portal`;
}

export async function loginAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const store = await readStore();
  const user = findUserByEmail(store, email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect(`/${locale}/login?error=invalid`);
  }

  if (requireEmailVerification() && !user.emailVerifiedAt) {
    redirect(`/${locale}/login?error=verify`);
  }

  await setSession(user.id);
  redirect(nextPath(locale, formData.get("next")));
}

export async function registerAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email.includes("@") || password.length < 8) {
    redirect(`/${locale}/register?error=invalid`);
  }

  const result = await mutateStore((store) => {
    const existing = findUserByEmail(store, email);
    if (existing) return null;

    const createdAt = new Date().toISOString();
    const nextId = id("user");
    const shouldVerify = requireEmailVerification();
    store.users.push({
      id: nextId,
      name,
      email,
      passwordHash: hashPassword(password),
      role: "customer",
      emailVerifiedAt: shouldVerify ? undefined : createdAt,
      createdAt,
    });

    if (!shouldVerify) return { userId: nextId, rawToken: "" };

    const token = createAuthToken(nextId, "email_verification", 60 * 24);
    store.authTokens.push(token.record);
    return { userId: nextId, rawToken: token.rawToken };
  });

  if (!result) redirect(`/${locale}/register?error=exists`);

  if (result.rawToken) {
    const verifyUrl = `${appUrl()}/${locale}/verify-email?token=${encodeURIComponent(
      result.rawToken,
    )}`;
    await sendPortalEmail({
      to: email,
      subject: "Assad Dar Portal: E-Mail bestätigen",
      text: [
        `Hallo ${name},`,
        "",
        "bitte bestätigen Sie Ihre E-Mail-Adresse für das Assad Dar Portal:",
        verifyUrl,
        "",
        "Der Link ist 24 Stunden gültig.",
      ].join("\n"),
    });
    redirect(`/${locale}/login?verify=sent`);
  }

  await setSession(result.userId);
  redirect(`/${locale}/portal`);
}

export async function logoutAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await clearSession();
  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const email = String(formData.get("email") || "").trim().toLowerCase();

  const result = await mutateStore((store) => {
    const user = findUserByEmail(store, email);
    if (!user) return null;
    const token = createAuthToken(user.id, "password_reset", 60);
    store.authTokens.push(token.record);
    return { rawToken: token.rawToken, name: user.name, email: user.email };
  });

  if (result) {
    const resetUrl = `${appUrl()}/${locale}/reset-password?token=${encodeURIComponent(
      result.rawToken,
    )}`;
    await sendPortalEmail({
      to: result.email,
      subject: "Assad Dar Portal: Passwort zurücksetzen",
      text: [
        `Hallo ${result.name},`,
        "",
        "über diesen Link können Sie Ihr Passwort zurücksetzen:",
        resetUrl,
        "",
        "Der Link ist 60 Minuten gültig. Falls Sie die Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.",
      ].join("\n"),
    });
  }

  redirect(`/${locale}/forgot-password?sent=1`);
}

export async function resetPasswordAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const rawToken = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (password.length < 8 || !rawToken) {
    redirect(`/${locale}/reset-password?error=invalid`);
  }

  const ok = await mutateStore((store) => {
    const token = findConsumableAuthToken(store, rawToken, "password_reset");
    if (!token) return false;
    const user = store.users.find((entry) => entry.id === token.userId);
    if (!user) return false;

    user.passwordHash = hashPassword(password);
    token.consumedAt = new Date().toISOString();
    return true;
  });

  if (!ok) redirect(`/${locale}/reset-password?error=token`);
  redirect(`/${locale}/login?reset=1`);
}

export async function verifyEmailAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const rawToken = String(formData.get("token") || "");

  const ok = await mutateStore((store) => {
    const token = findConsumableAuthToken(store, rawToken, "email_verification");
    if (!token) return false;
    const user = store.users.find((entry) => entry.id === token.userId);
    if (!user) return false;

    const verifiedAt = new Date().toISOString();
    user.emailVerifiedAt = verifiedAt;
    token.consumedAt = verifiedAt;
    return true;
  });

  if (!ok) redirect(`/${locale}/verify-email?error=token`);
  redirect(`/${locale}/login?verified=1`);
}

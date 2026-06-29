"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isLocale, type Locale } from "@/content";
import { clearSession, getCurrentUser, setSession } from "@/lib/portal/auth";
import {
  appUrl,
  portalProductionConfigErrors,
  requireEmailVerification,
} from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import { getAuthCopy } from "@/lib/portal/auth-copy";
import {
  bumpUserSessionVersion,
  createRegisteredCustomerForAuth,
  findUserByEmail,
  id,
  mutateStore,
  readStore,
} from "@/lib/portal/store";
import { hashPassword, verifyPassword } from "@/lib/portal/password";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/portal/rate-limit";
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

function ensurePortalReady(locale: Locale) {
  if (portalProductionConfigErrors().length > 0) {
    redirect(`/${locale}/login?error=config`);
  }
}

function bumpSessionVersion(user: { sessionVersion?: number }) {
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
}

export async function loginAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const requestHeaders = await headers();
  const rateLimit = await checkRateLimit(
    `login:${clientIpFromHeaders(requestHeaders)}:${email}`,
    8,
    15 * 60 * 1000,
    { failClosed: true },
  );

  if (!rateLimit.allowed) {
    redirect(`/${locale}/login?error=rate`);
  }

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
  ensurePortalReady(locale);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email.includes("@") || password.length < 8) {
    redirect(`/${locale}/register?error=invalid`);
  }

  const requestHeaders = await headers();
  const rateLimit = await checkRateLimit(
    `register:${clientIpFromHeaders(requestHeaders)}:${email}`,
    4,
    60 * 60 * 1000,
    { failClosed: true },
  );

  if (!rateLimit.allowed) {
    redirect(`/${locale}/register?error=rate`);
  }

  const createdAt = new Date().toISOString();
  const nextId = id("user");
  const shouldVerify = requireEmailVerification();
  const token = shouldVerify
    ? createAuthToken(nextId, "email_verification", 60 * 24)
    : null;

  const result = await createRegisteredCustomerForAuth({
    id: nextId,
    name,
    email,
    passwordHash: hashPassword(password),
    emailVerifiedAt: shouldVerify ? undefined : createdAt,
    createdAt,
    authToken: token?.record,
  });

  if (!result) redirect(`/${locale}/register?error=exists`);

  if (token?.rawToken) {
    const verifyUrl = `${appUrl()}/${locale}/verify-email?token=${encodeURIComponent(
      token.rawToken,
    )}`;
    const copy = getAuthCopy(locale);
    await sendPortalEmail({
      to: email,
      subject: copy.emails.verify.subject,
      text: copy.emails.verify.body(name, verifyUrl),
    });
    redirect(`/${locale}/login?verify=sent`);
  }

  await setSession(result.userId);
  redirect(`/${locale}/portal`);
}

export async function logoutAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const current = await getCurrentUser();
  if (current) await bumpUserSessionVersion(current.id);
  await clearSession();
  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const requestHeaders = await headers();
  const rateLimit = await checkRateLimit(
    `password-reset:${clientIpFromHeaders(requestHeaders)}:${email}`,
    4,
    60 * 60 * 1000,
    { failClosed: true },
  );

  if (!rateLimit.allowed) {
    redirect(`/${locale}/forgot-password?sent=1`);
  }

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
    const copy = getAuthCopy(locale);
    await sendPortalEmail({
      to: result.email,
      subject: copy.emails.reset.subject,
      text: copy.emails.reset.body(result.name, resetUrl),
    });
  }

  redirect(`/${locale}/forgot-password?sent=1`);
}

export async function resetPasswordAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
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
    bumpSessionVersion(user);
    token.consumedAt = new Date().toISOString();
    return true;
  });

  if (!ok) redirect(`/${locale}/reset-password?error=token`);
  redirect(`/${locale}/login?reset=1`);
}

export async function verifyEmailAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
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

export async function changePasswordAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
  const currentPassword = String(formData.get("currentPassword") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const current = await getCurrentUser();

  if (!current) redirect(`/${locale}/login`);
  if (password.length < 8 || password !== confirm) {
    redirect(`/${locale}/portal/settings?error=password`);
  }

  const ok = await mutateStore((store) => {
    const user = store.users.find((entry) => entry.id === current.id);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return false;
    }

    user.passwordHash = hashPassword(password);
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date().toISOString();
    bumpSessionVersion(user);
    return true;
  });

  if (!ok) redirect(`/${locale}/portal/settings?error=current`);
  await setSession(current.id);
  redirect(`/${locale}/portal/settings?saved=password`);
}

export async function acceptInviteAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  ensurePortalReady(locale);
  const rawToken = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!rawToken || password.length < 8 || password !== confirm) {
    redirect(`/${locale}/invite?token=${encodeURIComponent(rawToken)}&error=invalid`);
  }

  const result = await mutateStore((store) => {
    const token = findConsumableAuthToken(store, rawToken, "project_invite");
    if (!token) return null;
    const user = store.users.find((entry) => entry.id === token.userId);
    if (!user || user.role !== "customer") return null;

    const now = new Date().toISOString();
    user.passwordHash = hashPassword(password);
    user.emailVerifiedAt = now;
    bumpSessionVersion(user);
    token.consumedAt = now;
    return { userId: user.id };
  });

  if (!result) redirect(`/${locale}/invite?error=token`);
  await setSession(result.userId);
  redirect(`/${locale}/portal?invited=1`);
}

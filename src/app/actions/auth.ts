"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { clearSession, setSession } from "@/lib/portal/auth";
import { findUserByEmail, id, mutateStore, readStore } from "@/lib/portal/store";
import { hashPassword, verifyPassword } from "@/lib/portal/password";

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

  const userId = await mutateStore((store) => {
    const existing = findUserByEmail(store, email);
    if (existing) return null;

    const createdAt = new Date().toISOString();
    const nextId = id("user");
    store.users.push({
      id: nextId,
      name,
      email,
      passwordHash: hashPassword(password),
      role: "customer",
      createdAt,
    });
    return nextId;
  });

  if (!userId) redirect(`/${locale}/register?error=exists`);

  await setSession(userId);
  redirect(`/${locale}/portal`);
}

export async function logoutAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await clearSession();
  redirect(`/${locale}`);
}

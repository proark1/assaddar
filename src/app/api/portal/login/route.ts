import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/content";
import { createSessionCookie } from "@/lib/portal/auth";
import { requireEmailVerification } from "@/lib/portal/config";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/portal/rate-limit";
import { findUserByEmailForLogin } from "@/lib/portal/store";
import { verifyPassword } from "@/lib/portal/password";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value || "de");
  return isLocale(raw) ? raw : "de";
}

function nextPath(locale: Locale, value: FormDataEntryValue | null) {
  const raw = String(value || "");
  if (raw.startsWith(`/${locale}/`) && !raw.includes("//")) return raw;
  return `/${locale}/portal`;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const locale = safeLocale(formData.get("locale"));
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const rateLimit = await checkRateLimit(
    `login:${clientIpFromHeaders(request.headers)}:${email || "unknown"}`,
    8,
    10 * 60 * 1000,
  );

  if (!rateLimit.allowed) {
    return redirectTo(request, `/${locale}/login?error=rate`);
  }

  const user = await findUserByEmailForLogin(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return redirectTo(request, `/${locale}/login?error=invalid`);
  }

  if (requireEmailVerification() && !user.emailVerifiedAt) {
    return redirectTo(request, `/${locale}/login?error=verify`);
  }

  const response = redirectTo(request, nextPath(locale, formData.get("next")));
  const session = createSessionCookie(user.id);
  response.cookies.set(session.name, session.value, session.options);
  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/content";
import { createSessionCookie } from "@/lib/portal/auth";
import {
  portalProductionConfigErrors,
  requireEmailVerification,
} from "@/lib/portal/config";
import {
  clearFailedLoginAttempts,
  recordFailedLoginAttempt,
} from "@/lib/portal/login-attempts";
import { rejectUntrustedOrigin } from "@/lib/portal/security";
import { findUserByEmailForLogin } from "@/lib/portal/store";
import { verifyPassword } from "@/lib/portal/password";
import { getAuthCopy } from "@/lib/portal/auth-copy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeLocale(value: unknown): Locale {
  const raw = String(value || "de");
  return isLocale(raw) ? raw : "de";
}

function nextPath(locale: Locale, value: unknown) {
  const raw = String(value || "");
  if (raw.startsWith(`/${locale}/`) && !raw.includes("//")) return raw;
  return `/${locale}/portal`;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: NextRequest) {
  if (rejectUntrustedOrigin(request.headers)) {
    return jsonError("Die Anfrage stammt nicht von dieser Website.", 403);
  }

  const configErrors = portalProductionConfigErrors();
  if (configErrors.length > 0) {
    return jsonError(
      "Das Portal ist noch nicht vollständig für die Produktion konfiguriert.",
      503,
    );
  }

  let payload: { locale?: string; email?: string; password?: string; next?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonError("Die Login-Anfrage konnte nicht gelesen werden.");
  }

  const locale = safeLocale(payload.locale);
  const copy = getAuthCopy(locale).loginApi;
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const user = await findUserByEmailForLogin(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    const rateLimit = await recordFailedLoginAttempt(request.headers, email);
    return jsonError(copy.invalid, rateLimit.allowed ? 401 : 429);
  }

  if (requireEmailVerification() && !user.emailVerifiedAt) {
    return jsonError(copy.verify, 403);
  }

  await clearFailedLoginAttempts(request.headers, email);

  const response = NextResponse.json({
    ok: true,
    redirectTo: nextPath(locale, payload.next),
  });
  const session = createSessionCookie(user);
  response.cookies.set(session.name, session.value, session.options);
  return response;
}

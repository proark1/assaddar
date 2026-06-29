import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "@/content";
import { findUserByIdForSession } from "./store";
import type { User } from "./types";
import { assertPortalProductionReady, requireProductionSecret } from "./config";

const COOKIE_NAME = "assaddar_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  sessionVersion: number;
  expiresAt: number;
};

function secret() {
  return (
    requireProductionSecret(
      "AUTH_SECRET",
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    ) ||
    "assaddar-local-development-secret-change-me"
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = toBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function cookieDomain() {
  return process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
}

function versionOf(user: Pick<User, "sessionVersion">) {
  return user.sessionVersion ?? 0;
}

export function createSessionCookie(user: Pick<User, "id" | "sessionVersion">) {
  const expiresAt = Date.now() + ONE_WEEK_SECONDS * 1000;

  return {
    name: COOKIE_NAME,
    value: encodeSession({
      userId: user.id,
      sessionVersion: versionOf(user),
      expiresAt,
    }),
    options: {
      domain: cookieDomain(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_WEEK_SECONDS,
    } as const,
  };
}

function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (!payload.userId || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  const user = await findUserByIdForSession(userId);
  if (!user) return;

  const jar = await cookies();
  const session = createSessionCookie(user);
  jar.set(session.name, session.value, session.options);
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    domain: cookieDomain(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const payload = decodeSession(jar.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  const user = await findUserByIdForSession(payload.userId);
  if (!user) return null;
  if ((payload.sessionVersion ?? 0) !== versionOf(user)) return null;
  return user;
}

export async function requireUser(locale: Locale) {
  assertPortalProductionReady();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

export async function requireAdmin(locale: Locale) {
  const user = await requireUser(locale);
  if (user.role !== "admin") redirect(`/${locale}/portal`);
  return user;
}

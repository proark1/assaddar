import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { AuthToken, PortalStore } from "./types";
import { id } from "./store";

export type AuthTokenPurpose = AuthToken["purpose"];

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashesMatch(rawToken: string, storedHash: string) {
  const actual = Buffer.from(hashAuthToken(rawToken), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

export function createAuthToken(
  userId: string,
  purpose: AuthTokenPurpose,
  ttlMinutes: number,
) {
  const rawToken = createRawToken();
  const now = Date.now();
  const record: AuthToken = {
    id: id("token"),
    userId,
    purpose,
    tokenHash: hashAuthToken(rawToken),
    expiresAt: new Date(now + ttlMinutes * 60 * 1000).toISOString(),
    createdAt: new Date(now).toISOString(),
  };

  return { rawToken, record };
}

export function findConsumableAuthToken(
  store: PortalStore,
  rawToken: string,
  purpose: AuthTokenPurpose,
) {
  const now = Date.now();
  return store.authTokens.find((token) => {
    if (token.purpose !== purpose || token.consumedAt) return false;
    if (new Date(token.expiresAt).getTime() < now) return false;
    return hashesMatch(rawToken, token.tokenHash);
  });
}

import { appUrl } from "./config";

type HeaderReader = {
  get(name: string): string | null;
};

function originOf(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function requestOrigin(headers: HeaderReader) {
  const host = headers.get("x-forwarded-host") || headers.get("host");
  if (!host) return "";
  const proto =
    headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return originOf(`${proto}://${host}`);
}

export function trustedRequestOrigin(headers: HeaderReader) {
  const origin = headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  const observed = originOf(origin);
  if (!observed) return false;

  const allowed = new Set(
    [requestOrigin(headers), originOf(appUrl())].filter(Boolean),
  );
  return allowed.has(observed);
}

export function rejectUntrustedOrigin(headers: HeaderReader) {
  return !trustedRequestOrigin(headers);
}

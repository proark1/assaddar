import {
  checkRateLimit,
  clearRateLimit,
  clientIpFromHeaders,
} from "./rate-limit";

type HeaderReader = {
  get(name: string): string | null;
};

const LOGIN_FAILURE_LIMIT = 8;
const LOGIN_FAILURE_WINDOW_MS = 10 * 60 * 1000;

export function loginFailureRateLimitKey(headers: HeaderReader, email: string) {
  const normalizedEmail = email.trim().toLowerCase() || "unknown";
  return `login-failed:${clientIpFromHeaders(headers)}:${normalizedEmail}`;
}

export async function recordFailedLoginAttempt(
  headers: HeaderReader,
  email: string,
) {
  return checkRateLimit(
    loginFailureRateLimitKey(headers, email),
    LOGIN_FAILURE_LIMIT,
    LOGIN_FAILURE_WINDOW_MS,
    { failClosed: false },
  );
}

export async function clearFailedLoginAttempts(
  headers: HeaderReader,
  email: string,
) {
  await clearRateLimit(loginFailureRateLimitKey(headers, email));
}

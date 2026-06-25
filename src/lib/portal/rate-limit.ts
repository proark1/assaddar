import { mutateStore } from "./store";
import { isPostgresBackendEnabled } from "./config";
import { checkPostgresRateLimit } from "./store-postgres";

type HeaderReader = {
  get(name: string): string | null;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function cleanupExpired(now: number) {
  if (buckets.size < 1000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIpFromHeaders(headers: HeaderReader) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const now = Date.now();
  cleanupExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(0, limit - 1),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    remaining: Math.max(0, limit - existing.count),
  };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number; remaining: number }> {
  try {
    if (isPostgresBackendEnabled()) {
      return await checkPostgresRateLimit(key, limit, windowMs);
    }

    return await mutateStore((store) => {
      const now = Date.now();
      const existing = store.rateLimitBuckets.find((bucket) => bucket.key === key);
      const nowIso = new Date(now).toISOString();

      if (!existing || new Date(existing.resetAt).getTime() <= now) {
        const next = {
          key,
          count: 1,
          resetAt: new Date(now + windowMs).toISOString(),
          updatedAt: nowIso,
        };
        if (existing) Object.assign(existing, next);
        else store.rateLimitBuckets.push(next);

        return {
          allowed: true,
          retryAfterSeconds: Math.ceil(windowMs / 1000),
          remaining: Math.max(0, limit - 1),
        };
      }

      if (existing.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((new Date(existing.resetAt).getTime() - now) / 1000),
          ),
          remaining: 0,
        };
      }

      existing.count += 1;
      existing.updatedAt = nowIso;
      return {
        allowed: true,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((new Date(existing.resetAt).getTime() - now) / 1000),
        ),
        remaining: Math.max(0, limit - existing.count),
      };
    });
  } catch {
    return memoryRateLimit(key, limit, windowMs);
  }
}

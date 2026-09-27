import { prisma } from "@culturando/db";

export type RateLimitResult = {
  allowed: boolean;
  /** Requests counted in the current window, including this one. */
  count: number;
  limit: number;
  resetAt: Date;
};

/**
 * Storage behind the limiter. Actions only use checkRateLimit/resetRateLimit, so moving
 * to another backend (e.g. Upstash Redis) means writing another store, not touching them.
 */
export type RateLimitStore = {
  /** Atomically increments the counter of `key` for the window and returns the new count. */
  increment(key: string, windowStart: Date, expiresAt: Date): Promise<number>;
  reset(key: string): Promise<void>;
  deleteExpired(now: Date): Promise<number>;
};

export const postgresRateLimitStore: RateLimitStore = {
  async increment(key, windowStart, expiresAt) {
    // Single statement: concurrent requests on the same key cannot lose increments.
    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
      INSERT INTO "RateLimitBucket" ("key", "windowStart", "count", "expiresAt")
      VALUES (${key}, ${windowStart}, 1, ${expiresAt})
      ON CONFLICT ("key", "windowStart")
      DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
      RETURNING "count"
    `;

    return rows[0]?.count ?? 1;
  },
  async reset(key) {
    await prisma.rateLimitBucket.deleteMany({ where: { key } });
  },
  async deleteExpired(now) {
    const { count } = await prisma.rateLimitBucket.deleteMany({
      where: { expiresAt: { lte: now } },
    });

    return count;
  },
};

const store: RateLimitStore = postgresRateLimitStore;

// Expired rows are dead weight (a new window always gets a new row). Deleting them on a
// small sample of checks keeps the table bounded without a cron job and without adding a
// second write to every request; the expiresAt index keeps the delete cheap.
const CLEANUP_PROBABILITY = 0.02;

/**
 * Fixed-window limiter: counts the request under `key` and reports whether it is within
 * `limit` requests per `windowSeconds`. Every call counts, including blocked ones.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  { now = new Date() }: { now?: Date } = {},
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  const count = await store.increment(key, windowStart, resetAt);

  if (Math.random() < CLEANUP_PROBABILITY) {
    // Housekeeping must never turn a rate limit check into an error.
    await store.deleteExpired(now).catch(() => undefined);
  }

  return { allowed: count <= limit, count, limit, resetAt };
}

/** Clears every window of `key`, e.g. the per-account login counter after a successful login. */
export async function resetRateLimit(key: string) {
  await store.reset(key);
}

export async function deleteExpiredRateLimitBuckets(now = new Date()) {
  return store.deleteExpired(now);
}

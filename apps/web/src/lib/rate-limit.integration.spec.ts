import { prisma } from "@culturando/db";
import { beforeEach, describe, expect, it } from "vitest";

import { resetDatabase } from "@/test/db-test-helpers";

import { checkRateLimit, deleteExpiredRateLimitBuckets, resetRateLimit } from "./rate-limit";

const WINDOW_SECONDS = 60;
// Aligned to a window boundary, so "same window" / "next window" cases are unambiguous.
const WINDOW_START = new Date("2026-01-01T10:00:00.000Z");

function at(secondsAfterWindowStart: number) {
  return { now: new Date(WINDOW_START.getTime() + secondsAfterWindowStart * 1000) };
}

describe("checkRateLimit", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("allows requests up to the limit and blocks the next one in the same window", async () => {
    const results = [];

    for (let attempt = 0; attempt < 4; attempt += 1) {
      results.push(await checkRateLimit("test:threshold", 3, WINDOW_SECONDS, at(attempt)));
    }

    expect(results.map((result) => result.allowed)).toEqual([true, true, true, false]);
    expect(results.map((result) => result.count)).toEqual([1, 2, 3, 4]);
    expect(results[3]?.resetAt).toEqual(new Date(WINDOW_START.getTime() + WINDOW_SECONDS * 1000));
  });

  it("allows requests again once the window has expired", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await checkRateLimit("test:window", 2, WINDOW_SECONDS, at(attempt));
    }

    expect((await checkRateLimit("test:window", 2, WINDOW_SECONDS, at(59))).allowed).toBe(false);

    const nextWindow = await checkRateLimit("test:window", 2, WINDOW_SECONDS, at(60));

    expect(nextWindow).toMatchObject({ allowed: true, count: 1 });
  });

  it("allows requests again after the key is reset (successful login)", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await checkRateLimit("test:reset", 2, WINDOW_SECONDS, at(attempt));
    }

    await resetRateLimit("test:reset");

    expect(await checkRateLimit("test:reset", 2, WINDOW_SECONDS, at(5))).toMatchObject({
      allowed: true,
      count: 1,
    });
  });

  it("counts each key independently", async () => {
    await checkRateLimit("test:key-a", 1, WINDOW_SECONDS, at(0));

    expect((await checkRateLimit("test:key-a", 1, WINDOW_SECONDS, at(1))).allowed).toBe(false);
    expect((await checkRateLimit("test:key-b", 1, WINDOW_SECONDS, at(1))).allowed).toBe(true);
  });

  it("does not lose increments under concurrent requests", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => checkRateLimit("test:concurrent", 5, WINDOW_SECONDS, at(0))),
    );

    expect(results.map((result) => result.count).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
  });
});

describe("deleteExpiredRateLimitBuckets", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("removes only the buckets whose window has ended", async () => {
    await checkRateLimit("test:old", 5, WINDOW_SECONDS, at(0));
    await checkRateLimit("test:current", 5, WINDOW_SECONDS, at(60));

    const deleted = await deleteExpiredRateLimitBuckets(at(61).now);

    expect(deleted).toBe(1);
    expect(await prisma.rateLimitBucket.findMany({ select: { key: true } })).toEqual([
      { key: "test:current" },
    ]);
  });
});

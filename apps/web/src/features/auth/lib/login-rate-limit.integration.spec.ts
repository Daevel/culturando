import { beforeEach, describe, expect, it } from "vitest";

import { rateLimitPolicies } from "@/lib/rate-limit-policies";
import { resetDatabase } from "@/test/db-test-helpers";

import {
  clearLoginRateLimit,
  enforceLoginRateLimit,
  isRateLimitedSigninError,
} from "./login-rate-limit";

const { loginEmail, loginIp } = rateLimitPolicies;

async function attempt(ip: string, email: string) {
  try {
    await enforceLoginRateLimit({ ip, email });
    return "allowed";
  } catch (error) {
    if (isRateLimitedSigninError(error)) {
      return "rate-limited";
    }

    throw error;
  }
}

describe("login rate limit", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("blocks one account attacked from many IPs (distributed brute force)", async () => {
    for (let index = 0; index < loginEmail.limit; index += 1) {
      expect(await attempt(`198.51.100.${index}`, "victim@example.com")).toBe("allowed");
    }

    expect(await attempt("198.51.100.250", "victim@example.com")).toBe("rate-limited");
    // Other accounts are unaffected.
    expect(await attempt("198.51.100.250", "someone-else@example.com")).toBe("allowed");
  });

  it("blocks one IP trying many accounts (credential stuffing)", async () => {
    for (let index = 0; index < loginIp.limit; index += 1) {
      expect(await attempt("203.0.113.7", `user-${index}@example.com`)).toBe("allowed");
    }

    expect(await attempt("203.0.113.7", "user-next@example.com")).toBe("rate-limited");
  });

  it("clears the per-account counter after a successful login", async () => {
    for (let index = 0; index < loginEmail.limit; index += 1) {
      await attempt(`198.51.100.${index}`, "owner@example.com");
    }

    expect(await attempt("198.51.100.200", "owner@example.com")).toBe("rate-limited");

    await clearLoginRateLimit("owner@example.com");

    expect(await attempt("198.51.100.201", "owner@example.com")).toBe("allowed");
  });
});

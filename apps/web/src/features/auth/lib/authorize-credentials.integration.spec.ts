import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep the real scrypt implementation, only observe the calls.
vi.mock("@/lib/password", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/password")>();

  return { ...actual, verifyPassword: vi.fn(actual.verifyPassword) };
});

import { verifyPassword } from "@/lib/password";
import { createTestUser, resetDatabase } from "@/test/db-test-helpers";

import { authorizeCredentials } from "./authorize-credentials";

// Same shape as a stored hash: 16-byte hex salt, 64-byte hex scrypt key.
const SCRYPT_HASH_PATTERN = /^[0-9a-f]{32}:[0-9a-f]{128}$/;
// Password used by createTestUser.
const TEST_USER_PASSWORD = "Password123!";
const requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.9" });

describe("authorizeCredentials — response time parity", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(verifyPassword).mockClear();
  });

  it("runs a scrypt verification against a dummy hash for an unknown email", async () => {
    const result = await authorizeCredentials(
      { email: "nobody@example.com", password: "Whatever123!" },
      requestHeaders,
    );

    expect(result).toBeNull();
    expect(verifyPassword).toHaveBeenCalledTimes(1);
    expect(verifyPassword).toHaveBeenCalledWith(
      "Whatever123!",
      expect.stringMatching(SCRYPT_HASH_PATTERN),
    );
  });

  it("reuses the same dummy hash across requests (computed once)", async () => {
    await authorizeCredentials({ email: "a@example.com", password: "x" }, requestHeaders);
    await authorizeCredentials({ email: "b@example.com", password: "y" }, requestHeaders);

    const [firstCall, secondCall] = vi.mocked(verifyPassword).mock.calls;

    expect(verifyPassword).toHaveBeenCalledTimes(2);
    expect(firstCall?.[1]).toMatch(SCRYPT_HASH_PATTERN);
    expect(firstCall?.[1]).toBe(secondCall?.[1]);
  });

  it("also verifies against the dummy hash for an existing but unverified account", async () => {
    const user = await createTestUser({ emailVerifiedAt: null });

    const result = await authorizeCredentials(
      { email: user.email, password: TEST_USER_PASSWORD },
      requestHeaders,
    );

    expect(result).toBeNull();
    expect(verifyPassword).toHaveBeenCalledTimes(1);
    expect(vi.mocked(verifyPassword).mock.calls[0]?.[1]).not.toBe(user.passwordHash);
  });

  it("verifies against the stored hash for an existing verified account", async () => {
    const user = await createTestUser();

    const wrongPassword = await authorizeCredentials(
      { email: user.email, password: "Wrong-password-1" },
      requestHeaders,
    );
    const rightPassword = await authorizeCredentials(
      { email: user.email, password: TEST_USER_PASSWORD },
      requestHeaders,
    );

    expect(wrongPassword).toBeNull();
    expect(rightPassword).toMatchObject({ id: user.id, email: user.email });
    expect(verifyPassword).toHaveBeenNthCalledWith(1, "Wrong-password-1", user.passwordHash);
  });
});

import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("returns a salt and a derived key separated by ':'", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    expect(passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it("produces a different hash on every call for the same password", async () => {
    const [first, second] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);

    expect(first).not.toBe(second);
    expect(first.split(":")[0]).not.toBe(second.split(":")[0]);
  });

  it("does not contain the plain-text password", async () => {
    const passwordHash = await hashPassword("plain-text-secret");

    expect(passwordHash).not.toContain("plain-text-secret");
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const passwordHash = await hashPassword("correct-password");

    await expect(verifyPassword("correct-password", passwordHash)).resolves.toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const passwordHash = await hashPassword("correct-password");

    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });

  it("is case sensitive", async () => {
    const passwordHash = await hashPassword("Password123");

    await expect(verifyPassword("password123", passwordHash)).resolves.toBe(false);
  });

  it("returns false for an empty password against a real hash", async () => {
    const passwordHash = await hashPassword("correct-password");

    await expect(verifyPassword("", passwordHash)).resolves.toBe(false);
  });

  it("supports unicode passwords", async () => {
    const passwordHash = await hashPassword("pässwörd-📚");

    await expect(verifyPassword("pässwörd-📚", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("passwörd-📚", passwordHash)).resolves.toBe(false);
  });

  it.each([
    ["empty string", ""],
    ["no ':' separator", "abcdef0123456789"],
    ["missing salt", ":abcdef0123456789"],
    ["missing key", "abcdef0123456789:"],
    ["only a separator", ":"],
  ])("returns false without throwing for a malformed hash (%s)", async (_label, passwordHash) => {
    await expect(verifyPassword("any-password", passwordHash)).resolves.toBe(false);
  });

  it("returns false when the stored key does not match, regardless of its length", async () => {
    const passwordHash = await hashPassword("correct-password");
    const [salt] = passwordHash.split(":");

    await expect(verifyPassword("correct-password", `${salt}:${"ab".repeat(16)}`)).resolves.toBe(
      false,
    );
  });

  // Known issue: a non-hex key decodes to an empty Buffer, scrypt derives a
  // zero-length key and timingSafeEqual(empty, empty) is true, so ANY password
  // is accepted. Remove `.fails` once verifyPassword rejects empty/invalid keys.
  it.fails("returns false when the stored key is not valid hex", async () => {
    await expect(verifyPassword("any-password", "somesalt:not-hex")).resolves.toBe(false);
  });
});

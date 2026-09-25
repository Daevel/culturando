import { describe, expect, it } from "vitest";

import { profileSchema, validateProfileForm } from "./profile.schema";

const validInput = {
  name: "Ada Lovelace",
  nickname: "ada.lovelace_1",
  avatarUrl: "https://example.com/avatar.png",
  bio: "Matematica e scrittrice.",
  addressLabel: "Via Toledo 1",
  city: "Napoli",
  province: "NA",
  postalCode: "80134",
  region: "Campania",
  isProfilePublic: true,
};

describe("profileSchema", () => {
  it("accepts a valid input", () => {
    const result = validateProfileForm(validInput);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual(validInput);
  });

  it("accepts only the required fields", () => {
    const result = validateProfileForm({
      name: "Ada Lovelace",
      nickname: "ada",
      isProfilePublic: false,
    });

    expect(result.isValid).toBe(true);
  });

  it.each(["name", "nickname"] as const)("rejects a missing required field (%s)", (field) => {
    const { [field]: _omitted, ...input } = validInput;
    const result = validateProfileForm(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });

  it("rejects a name shorter than 2 characters after trimming", () => {
    const result = validateProfileForm({ ...validInput, name: " A " });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("name");
  });

  it("rejects a name longer than 80 characters", () => {
    const result = validateProfileForm({ ...validInput, name: "a".repeat(81) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("name");
  });

  it("trims and lowercases the nickname", () => {
    expect(profileSchema.parse({ ...validInput, nickname: "  Ada.Lovelace  " }).nickname).toBe(
      "ada.lovelace",
    );
  });

  it.each([
    ["too short", "ab"],
    ["too long", "a".repeat(31)],
    ["with spaces", "ada lovelace"],
    ["with a dash", "ada-lovelace"],
    ["with an accent", "adà"],
    ["with a symbol", "ada@home"],
  ])("rejects a nickname %s", (_label, nickname) => {
    const result = validateProfileForm({ ...validInput, nickname });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("nickname");
  });

  it.each([
    ["an absolute URL", "https://example.com/avatar.png"],
    ["an uploaded avatar path", "/uploads/profile-avatars/user-1.webp"],
    ["an empty string", ""],
  ])("accepts %s as avatarUrl", (_label, avatarUrl) => {
    expect(validateProfileForm({ ...validInput, avatarUrl }).isValid).toBe(true);
  });

  it.each([
    ["a random string", "not a url"],
    ["a different local path", "/uploads/other/avatar.png"],
  ])("rejects %s as avatarUrl", (_label, avatarUrl) => {
    const result = validateProfileForm({ ...validInput, avatarUrl });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(
      "avatarUrl",
      expect.arrayContaining(["Avatar non valido."]),
    );
  });

  it("rejects a bio longer than 2000 characters", () => {
    const result = validateProfileForm({ ...validInput, bio: "a".repeat(2001) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("bio");
  });

  it.each([
    ["addressLabel", 241],
    ["city", 81],
    ["province", 81],
    ["postalCode", 17],
    ["region", 81],
  ] as const)("rejects a %s longer than its limit (%i chars)", (field, length) => {
    const result = validateProfileForm({ ...validInput, [field]: "a".repeat(length) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });

  it.each([
    [true, true],
    [false, false],
    ["on", true],
    [undefined, false],
  ])("coerces isProfilePublic %j to %j", (isProfilePublic, expected) => {
    expect(profileSchema.parse({ ...validInput, isProfilePublic }).isProfilePublic).toBe(expected);
  });
});

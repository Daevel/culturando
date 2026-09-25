import { authConfig } from "@culturando/config";
import { describe, expect, it } from "vitest";

import { signupSchema, validateSignupForm } from "./signup.schema";

const validPassword = "a".repeat(authConfig.minPasswordLength);

const validInput = {
  name: "Ada Lovelace",
  salutationPreference: "feminine",
  email: "ada@example.com",
  password: validPassword,
  confirmPassword: validPassword,
};

describe("signupSchema", () => {
  it("accepts a valid input", () => {
    const result = validateSignupForm(validInput);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual(validInput);
  });

  it("trims name and email", () => {
    const result = signupSchema.parse({
      ...validInput,
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
    });

    expect(result.name).toBe("Ada Lovelace");
    expect(result.email).toBe("ada@example.com");
  });

  it("defaults salutationPreference to 'neutral'", () => {
    const { salutationPreference: _omitted, ...input } = validInput;

    expect(signupSchema.parse(input).salutationPreference).toBe("neutral");
  });

  it("rejects an unknown salutationPreference", () => {
    const result = validateSignupForm({ ...validInput, salutationPreference: "other" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("salutationPreference");
  });

  it.each([
    "name",
    "email",
    "password",
    "confirmPassword",
  ] as const)("rejects a missing required field (%s)", (field) => {
    const { [field]: _omitted, ...input } = validInput;
    const result = validateSignupForm(input);

    expect(result.isValid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors).toHaveProperty(field);
  });

  it.each(["name", "email"] as const)("rejects a whitespace-only %s", (field) => {
    const result = validateSignupForm({ ...validInput, [field]: "   " });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });

  it.each([
    "not-an-email",
    "missing-domain@",
    "@missing-local.com",
  ])("rejects an invalid email (%s)", (email) => {
    const result = validateSignupForm({ ...validInput, email });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("email");
    expect(result.errors).not.toHaveProperty("password");
  });

  it("accepts a password of exactly minPasswordLength characters", () => {
    expect(validateSignupForm(validInput).isValid).toBe(true);
  });

  it("rejects a password shorter than minPasswordLength", () => {
    const password = "a".repeat(authConfig.minPasswordLength - 1);
    const result = validateSignupForm({ ...validInput, password, confirmPassword: password });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("password");
  });

  it("accepts a password of exactly maxPasswordLength characters", () => {
    const password = "a".repeat(authConfig.maxPasswordLength);

    expect(validateSignupForm({ ...validInput, password, confirmPassword: password }).isValid).toBe(
      true,
    );
  });

  it("rejects a password longer than maxPasswordLength", () => {
    const password = "a".repeat(authConfig.maxPasswordLength + 1);
    const result = validateSignupForm({ ...validInput, password, confirmPassword: password });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("password");
  });

  it("reports mismatched passwords on confirmPassword", () => {
    const result = validateSignupForm({
      ...validInput,
      confirmPassword: `${validPassword}-different`,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({ confirmPassword: ["Le password non coincidono."] });
  });
});

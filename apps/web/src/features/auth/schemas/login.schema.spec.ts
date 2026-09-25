import { authConfig } from "@culturando/config";
import { describe, expect, it } from "vitest";

import { loginSchema, validateLoginForm } from "./login.schema";

const validInput = {
  email: "ada@example.com",
  password: "a".repeat(authConfig.minPasswordLength),
  rememberMe: true,
};

describe("loginSchema", () => {
  it("accepts a valid input", () => {
    const result = validateLoginForm(validInput);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual(validInput);
  });

  it("trims the email", () => {
    expect(loginSchema.parse({ ...validInput, email: "  ada@example.com " }).email).toBe(
      "ada@example.com",
    );
  });

  it("defaults rememberMe to false", () => {
    const { rememberMe: _omitted, ...input } = validInput;

    expect(loginSchema.parse(input).rememberMe).toBe(false);
  });

  it.each(["email", "password"] as const)("rejects a missing required field (%s)", (field) => {
    const { [field]: _omitted, ...input } = validInput;
    const result = validateLoginForm(input);

    expect(result.isValid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors).toHaveProperty(field);
  });

  it("rejects an empty password with the required-field message", () => {
    const result = validateLoginForm({ ...validInput, password: "" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(
      "password",
      expect.arrayContaining(["La password è obbligatoria."]),
    );
  });

  it("rejects an invalid email", () => {
    const result = validateLoginForm({ ...validInput, email: "not-an-email" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("email");
  });

  it("rejects a password shorter than minPasswordLength", () => {
    const result = validateLoginForm({
      ...validInput,
      password: "a".repeat(authConfig.minPasswordLength - 1),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("password");
  });

  it("does not enforce maxPasswordLength on login", () => {
    const result = validateLoginForm({
      ...validInput,
      password: "a".repeat(authConfig.maxPasswordLength + 1),
    });

    expect(result.isValid).toBe(true);
  });
});

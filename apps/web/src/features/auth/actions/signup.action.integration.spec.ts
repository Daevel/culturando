import { prisma } from "@culturando/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "203.0.113.50" })),
}));
vi.mock("../emails/send-verification-email", () => ({ sendVerificationEmail: vi.fn() }));

import { rateLimitPolicies } from "@/lib/rate-limit-policies";
import { resetDatabase } from "@/test/db-test-helpers";

import type { AuthFormState } from "../types/auth-form.types";
import { checkSignupEmailAvailabilityAction } from "./check-signup-email.action";
import { signupAction } from "./signup.action";

const initialState: AuthFormState = { success: false, errors: {} };

function signupFormData(email: string) {
  const formData = new FormData();
  formData.set("name", "Rate Limit Test");
  formData.set("salutationPreference", "neutral");
  formData.set("email", email);
  formData.set("password", "Password123!");
  formData.set("confirmPassword", "Password123!");
  return formData;
}

describe("signupAction — rate limit per IP", () => {
  beforeAll(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("blocks signups beyond the per-IP limit without creating the user", async () => {
    const { limit } = rateLimitPolicies.signupIp;

    for (let index = 0; index < limit; index += 1) {
      const result = await signupAction(
        initialState,
        signupFormData(`signup-${index}@example.com`),
      );
      expect(result.success).toBe(true);
    }

    const blocked = await signupAction(initialState, signupFormData("signup-blocked@example.com"));

    expect(blocked).toMatchObject({
      success: false,
      messageKey: "auth.signup.rateLimitedMessage",
    });
    expect(
      await prisma.user.findUnique({ where: { email: "signup-blocked@example.com" } }),
    ).toBeNull();
  });
});

describe("checkSignupEmailAvailabilityAction — rate limit per IP", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('answers "unknown" instead of available/unavailable once the limit is hit', async () => {
    const { limit } = rateLimitPolicies.signupEmailCheckIp;

    for (let index = 0; index < limit; index += 1) {
      expect(await checkSignupEmailAvailabilityAction(`probe-${index}@example.com`)).toEqual({
        isAvailable: true,
      });
    }

    expect(await checkSignupEmailAvailabilityAction("probe-next@example.com")).toEqual({
      isAvailable: null,
    });
  });
});

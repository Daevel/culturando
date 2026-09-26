"use server";

import { prisma } from "@culturando/db";

import { getClientIp } from "@/lib/client-ip";
import { hashPassword } from "@/lib/password";
import { checkRateLimitPolicy } from "@/lib/rate-limit-policies";
import { sendVerificationEmail } from "../emails/send-verification-email";
import { createVerificationUrl } from "../lib/verification-url";
import { validateSignupForm } from "../schemas/signup.schema";
import type { AuthFormState } from "../types/auth-form.types";
import { createEmailVerificationToken } from "./email-verification";

type SignupField = "name" | "salutationPreference" | "email" | "password" | "confirmPassword";

export async function signupAction(
  _state: AuthFormState<SignupField>,
  formData: FormData,
): Promise<AuthFormState<SignupField>> {
  const values = {
    name: formData.get("name"),
    salutationPreference: formData.get("salutationPreference"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = validateSignupForm(values);

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<SignupField, string[]>>;

    return {
      success: false,
      errors: {
        name: errors.name?.[0],
        salutationPreference: errors.salutationPreference?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      },
    };
  }

  if (!validation.data) {
    return {
      success: false,
      errors: {},
      messageKey: "auth.signup.genericErrorMessage",
    };
  }

  // Counted after validation (malformed submissions cost nothing) but before the duplicate
  // check, which would otherwise be an unlimited account-enumeration probe.
  const rateLimit = await checkRateLimitPolicy("signupIp", await getClientIp());

  if (!rateLimit.allowed) {
    return {
      success: false,
      errors: {},
      messageKey: "auth.signup.rateLimitedMessage",
    };
  }

  const email = validation.data.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: "Questo indirizzo email è stato già usato",
      },
      messageKey: "auth.signup.emailAlreadyExistsMessage",
    };
  }

  const passwordHash = await hashPassword(validation.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: validation.data.name,
      salutationPreference: validation.data.salutationPreference,
      passwordHash,
    },
  });
  const verificationToken = await createEmailVerificationToken(user.id);
  const verificationUrl = createVerificationUrl(verificationToken);

  await sendVerificationEmail({
    to: email,
    name: validation.data.name,
    verificationUrl,
  });

  return {
    success: true,
    errors: {},
    messageKey: "auth.signup.successMessage",
  };
}

"use server";

import { prisma } from "@culturando/db";

import { hashPassword } from "@/lib/password";
import { validateSignupForm } from "../schemas/signup.schema";
import type { AuthFormState } from "../types/auth-form.types";
import {
  buildEmailVerificationUrl,
  createEmailVerificationToken,
  sendVerificationEmail,
} from "./email-verification";

type SignupField = "name" | "email" | "password" | "confirmPassword";

export async function signupAction(
  _state: AuthFormState<SignupField>,
  formData: FormData,
): Promise<AuthFormState<SignupField>> {
  const values = {
    name: formData.get("name"),
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
      passwordHash,
    },
  });
  const verificationToken = await createEmailVerificationToken(user.id);
  const verificationUrl = buildEmailVerificationUrl(verificationToken);

  await sendVerificationEmail({
    email,
    name: validation.data.name,
    verificationUrl,
  });

  return {
    success: true,
    errors: {},
    messageKey: "auth.signup.successMessage",
  };
}

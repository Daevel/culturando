"use server";

import { prisma } from "@culturando/db";

import { hashPassword } from "@/lib/password";
import { validateSignupForm } from "../schemas/signup.schema";
import type { AuthFormState } from "../types/auth-form.types";

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

  if (existingUser?.passwordHash) {
    return {
      success: false,
      errors: {
        email: "Esiste già un account con questa email.",
      },
      messageKey: "auth.signup.emailAlreadyExistsMessage",
    };
  }

  const passwordHash = await hashPassword(validation.data.password);

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: validation.data.name,
        passwordHash,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        name: validation.data.name,
        passwordHash,
      },
    });
  }

  return {
    success: true,
    errors: {},
    messageKey: "auth.signup.successMessage",
  };
}

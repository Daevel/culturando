"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { routes } from "@/config/routes";
import { validateLoginForm } from "../schemas/login.schema";
import type { AuthFormState } from "../types/auth-form.types";

type LoginField = "email" | "password" | "rememberMe";

export async function loginAction(
  _state: AuthFormState<LoginField>,
  formData: FormData,
): Promise<AuthFormState<LoginField>> {
  const values = {
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on",
  };

  const validation = validateLoginForm(values);

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<LoginField, string[]>>;

    return {
      success: false,
      errors: {
        email: errors.email?.[0],
        password: errors.password?.[0],
        rememberMe: errors.rememberMe?.[0],
      },
    };
  }

  const loginValues = validation.data;

  if (!loginValues) {
    return {
      success: false,
      errors: {},
      messageKey: "auth.login.invalidCredentialsMessage",
    };
  }

  try {
    await signIn("credentials", {
      email: loginValues.email,
      password: loginValues.password,
      redirectTo: routes.dashboard,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        errors: {},
        messageKey: "auth.login.invalidCredentialsMessage",
      };
    }

    throw error;
  }

  return {
    success: true,
    errors: {},
    messageKey: "auth.login.successMessage",
  };
}

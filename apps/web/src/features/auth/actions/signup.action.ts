"use server";

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

  // TODO: integrare registrazione utente
  return {
    success: true,
    errors: {},
    messageKey: "auth.signup.successMessage",
  };
}

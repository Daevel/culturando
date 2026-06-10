import { validateSignupForm } from "../schemas/signup.schema";

export async function signupAction(values: unknown) {
  const validation = validateSignupForm(values);

  if (!validation.isValid) {
    return {
      success: false,
      data: null,
      errors: validation.errors,
    };
  }

  // TODO: integrare registrazione utente
  return {
    success: true,
    data: validation.data,
    errors: {},
  };
}
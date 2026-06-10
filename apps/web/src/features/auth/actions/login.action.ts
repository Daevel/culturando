import { validateLoginForm } from "../schemas/login.schema";

export async function loginAction(values: unknown) {
  const validation = validateLoginForm(values);

  if (!validation.isValid) {
    return {
      success: false,
      data: null,
      errors: validation.errors,
    };
  }

  // TODO: integrare Auth.js
  return {
    success: true,
    data: validation.data,
    errors: {},
  };
}
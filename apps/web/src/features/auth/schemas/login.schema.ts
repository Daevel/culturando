import { authConfig } from "@culturando/config";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "L'email è obbligatoria.").email("Inserisci un'email valida."),
  password: z
    .string()
    .min(1, "La password è obbligatoria.")
    .min(
      authConfig.minPasswordLength,
      `La password deve contenere almeno ${authConfig.minPasswordLength} caratteri.`,
    ),
  rememberMe: z.coerce.boolean().default(false),
});

export function validateLoginForm(values: unknown) {
  const result = loginSchema.safeParse(values);

  if (result.success) {
    return {
      isValid: true,
      data: result.data,
      errors: {},
    };
  }

  return {
    isValid: false,
    data: null,
    errors: result.error.flatten().fieldErrors,
  };
}

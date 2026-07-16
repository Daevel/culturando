import { authConfig } from "@culturando/config";
import { z } from "zod";

export const salutationPreferences = ["masculine", "feminine", "neutral"] as const;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Il nome è obbligatorio."),
    salutationPreference: z.enum(salutationPreferences).default("neutral"),
    email: z.string().trim().min(1, "L'email è obbligatoria.").email("Inserisci un'email valida."),
    password: z
      .string()
      .min(1, "La password è obbligatoria.")
      .min(
        authConfig.minPasswordLength,
        `La password deve contenere almeno ${authConfig.minPasswordLength} caratteri.`,
      )
      .max(
        authConfig.maxPasswordLength,
        `La password non può superare ${authConfig.maxPasswordLength} caratteri.`,
      ),
    confirmPassword: z.string().min(1, "Conferma la password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Le password non coincidono.",
  });

export function validateSignupForm(values: unknown) {
  const result = signupSchema.safeParse(values);

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

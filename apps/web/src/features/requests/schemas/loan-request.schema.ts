import { z } from "zod";

export const loanRequestSchema = z.object({
  type: z.enum(["consultation", "loan", "info"]),
  message: z
    .string()
    .trim()
    .max(800, "Il messaggio non può superare 800 caratteri.")
    .optional()
    .transform((value) => value || undefined),
});

export function validateLoanRequestForm(values: unknown) {
  const result = loanRequestSchema.safeParse(values);

  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.flatten().fieldErrors,
      data: undefined,
    };
  }

  return {
    isValid: true,
    errors: {},
    data: result.data,
  };
}

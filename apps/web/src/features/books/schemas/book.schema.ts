import { z } from "zod";

export const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Il titolo è obbligatorio.")
    .max(180, "Il titolo è troppo lungo."),
  author: z
    .string()
    .trim()
    .min(1, "L'autore è obbligatorio.")
    .max(140, "Il nome autore è troppo lungo."),
  isbn: z
    .string()
    .trim()
    .max(20, "L'ISBN è troppo lungo.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  description: z
    .string()
    .trim()
    .max(600, "La descrizione non può superare 600 caratteri.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z.enum(["available", "reserved", "unavailable"]),
  visibility: z.enum(["public", "private"]),
});

export function validateBookForm(values: unknown) {
  const result = bookSchema.safeParse(values);

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

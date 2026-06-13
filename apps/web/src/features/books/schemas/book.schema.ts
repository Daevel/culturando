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
  publisher: z
    .string()
    .trim()
    .max(120, "L'editore è troppo lungo.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  publicationYear: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value >= 1000 && value <= 2100),
      "Inserisci un anno valido.",
    ),
  language: z
    .string()
    .trim()
    .max(60, "La lingua è troppo lunga.")
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
  condition: z.enum(["new", "good", "worn"]),
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

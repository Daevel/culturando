import { z } from "zod";

export const bookSchema = z
  .object({
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
    category: z
      .string()
      .trim()
      .max(80, "La categoria è troppo lunga.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    description: z
      .string()
      .trim()
      .max(600, "La descrizione non può superare 600 caratteri.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    availability: z.enum(["available", "consultation_only", "loanable", "unavailable"]),
    visibility: z.enum(["public", "private"]),
    physicalCondition: z.enum(["new", "good", "worn", "damaged"]),
    latitude: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : undefined))
      .refine(
        (value) => value === undefined || (value >= -90 && value <= 90),
        "Latitudine non valida.",
      ),
    longitude: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : undefined))
      .refine(
        (value) => value === undefined || (value >= -180 && value <= 180),
        "Longitudine non valida.",
      ),
    radiusMeters: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : undefined))
      .refine(
        (value) =>
          value === undefined || (Number.isInteger(value) && value >= 100 && value <= 10000),
        "Inserisci un raggio tra 100 e 10000 metri.",
      ),
  })
  .refine(
    (value) =>
      [value.latitude, value.longitude, value.radiusMeters].every((field) => field === undefined) ||
      [value.latitude, value.longitude, value.radiusMeters].every((field) => field !== undefined),
    {
      message: "Completa latitudine, longitudine e raggio oppure lascia tutti i campi vuoti.",
      path: ["latitude"],
    },
  );

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

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
    .max(140, "Il nome autore è troppo lungo.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  isbn: z
    .string()
    .trim()
    .min(1, "L'ISBN è obbligatorio.")
    .max(20, "L'ISBN è troppo lungo.")
    .transform((value) => value.replace(/[-\s]/g, ""))
    .refine((value) => value.length > 0, "L'ISBN è obbligatorio."),
  publisher: z
    .string()
    .trim()
    .max(120, "L'editore è troppo lungo.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  publishedYear: z
    .string()
    .trim()
    .optional()
    .refine((value) => value === undefined || value === "" || /^\d+$/.test(value), {
      message: "L'anno di pubblicazione deve contenere solo numeri.",
    })
    .transform((value) => (value ? Number(value) : undefined))
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value >= 1000 && value <= 2100),
      "Inserisci un anno valido.",
    ),
  language: z
    .string()
    .trim()
    .max(40, "La lingua è troppo lunga.")
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
  addressLabel: z
    .string()
    .trim()
    .min(1, "L'indirizzo è obbligatorio.")
    .max(180, "L'indirizzo è troppo lungo."),
  city: z
    .string()
    .trim()
    .min(1, "La città è obbligatoria.")
    .max(80, "La città è troppo lunga.")
    .transform((value) => value),
  province: z
    .string()
    .trim()
    .min(1, "La provincia è obbligatoria.")
    .max(80, "La provincia è troppo lunga.")
    .transform((value) => value),
  region: z
    .string()
    .trim()
    .min(1, "La regione è obbligatoria.")
    .max(80, "La regione è troppo lunga.")
    .transform((value) => value),
  country: z.string().trim().min(1, "Il paese è obbligatorio.").max(80, "Il paese è troppo lungo."),
  imageUrls: z
    .string()
    .trim()
    .max(1000, "Inserisci meno URL immagine.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  externalCoverUrl: z
    .string()
    .trim()
    .max(300, "L'URL copertina esterna è troppo lungo.")
    .optional()
    .transform((value) => (value ? value : undefined)),
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

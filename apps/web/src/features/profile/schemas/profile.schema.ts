import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Il nome deve contenere almeno 2 caratteri.").max(80),
  avatarUrl: z.union([z.url("Inserisci un URL valido."), z.literal("")]).optional(),
  bio: z
    .string()
    .trim()
    .max(500, "La biografia può contenere al massimo 500 caratteri.")
    .optional(),
  city: z.string().trim().max(80).optional(),
  province: z.string().trim().max(80).optional(),
  region: z.string().trim().max(80).optional(),
  isProfilePublic: z.coerce.boolean(),
});

export type ProfileFormValues = z.output<typeof profileSchema>;

export function validateProfileForm(values: unknown) {
  const result = profileSchema.safeParse(values);

  if (!result.success) {
    return {
      isValid: false,
      errors: z.flattenError(result.error).fieldErrors,
    };
  }

  return {
    isValid: true,
    data: result.data,
    errors: {},
  };
}

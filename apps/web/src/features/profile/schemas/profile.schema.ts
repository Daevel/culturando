import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Il nome completo deve contenere almeno 2 caratteri.").max(80),
  nickname: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Il nickname deve contenere almeno 3 caratteri.")
    .max(30, "Il nickname può contenere al massimo 30 caratteri.")
    .regex(/^[a-z0-9_.]+$/, "Usa solo lettere, numeri, punti e underscore."),
  avatarUrl: z.string().trim().refine(isValidAvatarUrl, "Avatar non valido.").optional(),
  bio: z
    .string()
    .trim()
    .max(2000, "La biografia può contenere al massimo 2000 caratteri.")
    .optional(),
  addressLabel: z.string().trim().max(240).optional(),
  city: z.string().trim().max(80).optional(),
  province: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(16).optional(),
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

function isValidAvatarUrl(value: string | undefined) {
  if (!value) {
    return true;
  }

  if (value.startsWith("/uploads/profile-avatars/")) {
    return true;
  }

  return z.url().safeParse(value).success;
}

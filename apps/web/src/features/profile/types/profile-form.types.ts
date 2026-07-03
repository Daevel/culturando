import type { TranslationKey } from "@culturando/translation";

export type ProfileFormField = "avatarUrl" | "bio" | "city" | "name" | "province" | "region";

export type ProfileFormState = {
  success: boolean;
  errors: Partial<Record<ProfileFormField, string>>;
  messageKey?: TranslationKey;
};

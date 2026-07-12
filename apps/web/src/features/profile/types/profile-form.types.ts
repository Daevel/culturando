import type { TranslationKey } from "@culturando/translation";

export type ProfileFormField =
  | "addressLabel"
  | "avatarUrl"
  | "bio"
  | "city"
  | "name"
  | "nickname"
  | "postalCode"
  | "province"
  | "region";

export type ProfileFormState = {
  success: boolean;
  errors: Partial<Record<ProfileFormField, string>>;
  messageKey?: TranslationKey;
};

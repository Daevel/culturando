import type { TranslationKey } from "@culturando/translation";

export type BookFormField =
  | "title"
  | "author"
  | "isbn"
  | "description"
  | "category"
  | "availability"
  | "visibility"
  | "physicalCondition"
  | "latitude"
  | "longitude"
  | "radiusMeters";

export type BookFormState = {
  success: boolean;
  errors: Partial<Record<BookFormField, string>>;
  messageKey?: TranslationKey;
};

import type { TranslationKey } from "@culturando/translation";

export type BookFormField =
  | "title"
  | "author"
  | "isbn"
  | "publisher"
  | "publishedYear"
  | "language"
  | "description"
  | "category"
  | "availability"
  | "visibility"
  | "physicalCondition"
  | "addressLabel"
  | "city"
  | "province"
  | "region"
  | "country"
  | "coverImage"
  | "imageUrls"
  | "externalCoverUrl";

export type BookFormState = {
  success: boolean;
  errors: Partial<Record<BookFormField, string>>;
  messageKey?: TranslationKey;
};

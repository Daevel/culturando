import type { TranslationKey } from "@culturando/translation";

export type BookFormField =
  | "title"
  | "author"
  | "isbn"
  | "publisher"
  | "publicationYear"
  | "language"
  | "description"
  | "status"
  | "visibility"
  | "condition";

export type BookFormState = {
  success: boolean;
  errors: Partial<Record<BookFormField, string>>;
  messageKey?: TranslationKey;
};

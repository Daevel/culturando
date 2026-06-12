import type { TranslationKey } from "@culturando/translation";

export type BookFormField = "title" | "author" | "isbn" | "description" | "status" | "visibility";

export type BookFormState = {
  success: boolean;
  errors: Partial<Record<BookFormField, string>>;
  messageKey?: TranslationKey;
};

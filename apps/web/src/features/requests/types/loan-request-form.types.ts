import type { TranslationKey } from "@culturando/translation";

export type LoanRequestFormField = "type" | "message";

export type LoanRequestFormState = {
  success: boolean;
  errors: Partial<Record<LoanRequestFormField, string>>;
  messageKey?: TranslationKey;
};

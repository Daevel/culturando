import type { TranslationKey } from "@culturando/translation";
import type { z } from "zod";

import type { loginSchema } from "../schemas/login.schema";
import type { signupSchema } from "../schemas/signup.schema";

export type LoginFormValues = z.infer<typeof loginSchema>;

export type SignupFormValues = z.infer<typeof signupSchema>;

export type AuthFormState<TField extends string = string> = {
  success: boolean;
  errors?: Partial<Record<TField, string>>;
  messageKey?: TranslationKey;
};

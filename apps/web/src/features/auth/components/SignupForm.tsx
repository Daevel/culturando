"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { signupAction } from "../actions/signup.action";
import type { AuthFormState } from "../types/auth-form.types";

const initialState: AuthFormState<"name" | "email" | "password" | "confirmPassword"> = {
  success: false,
  errors: {},
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const t = useTranslation();

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-y-6" noValidate>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.signup.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signup.description")}</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">{t("auth.signup.fields.name.label")}</Label>
          <Input
            aria-describedby={state.errors?.name ? "signup-name-error" : undefined}
            aria-invalid={Boolean(state.errors?.name)}
            id="name"
            name="name"
            type="text"
            placeholder={t("auth.signup.fields.name.placeholder")}
          />
          {state.errors?.name ? (
            <p className="text-sm text-destructive" id="signup-name-error">
              {state.errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">{t("auth.signup.fields.email.label")}</Label>
          <Input
            aria-describedby={state.errors?.email ? "signup-email-error" : undefined}
            aria-invalid={Boolean(state.errors?.email)}
            id="email"
            name="email"
            type="email"
            placeholder={t("auth.signup.fields.email.placeholder")}
          />
          {state.errors?.email ? (
            <p className="text-sm text-destructive" id="signup-email-error">
              {state.errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">{t("auth.signup.fields.password.label")}</Label>
          <Input
            aria-describedby={state.errors?.password ? "signup-password-error" : undefined}
            aria-invalid={Boolean(state.errors?.password)}
            id="password"
            name="password"
            type="password"
            placeholder={t("auth.signup.fields.password.placeholder")}
          />
          {state.errors?.password ? (
            <p className="text-sm text-destructive" id="signup-password-error">
              {state.errors.password}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="confirmPassword">{t("auth.signup.fields.confirmPassword.label")}</Label>
          <Input
            aria-describedby={
              state.errors?.confirmPassword ? "signup-confirm-password-error" : undefined
            }
            aria-invalid={Boolean(state.errors?.confirmPassword)}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder={t("auth.signup.fields.confirmPassword.placeholder")}
          />
          {state.errors?.confirmPassword ? (
            <p className="text-sm text-destructive" id="signup-confirm-password-error">
              {state.errors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      {state.messageKey ? (
        <p className={cnMessageClass(state.success)} role="status">
          {t(state.messageKey)}
        </p>
      ) : null}

      <div className="flex flex-col gap-y-3">
        <Button disabled={isPending} type="submit">
          {isPending ? t("auth.signup.pendingLabel") : t("auth.signup.submitLabel")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.signup.alternativeLabel")}
        </p>

        <Button asChild type="button" variant="secondary">
          <Link href={routes.login}>{t("auth.signup.secondaryActionLabel")}</Link>
        </Button>
      </div>
    </form>
  );
}

function cnMessageClass(success: boolean) {
  return success
    ? "text-center text-sm text-muted-foreground"
    : "text-center text-sm text-destructive";
}

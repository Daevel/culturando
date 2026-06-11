"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { loginAction } from "../actions/login.action";
import type { AuthFormState } from "../types/auth-form.types";

const initialState: AuthFormState<"email" | "password" | "rememberMe"> = {
  success: false,
  errors: {},
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const t = useTranslation();

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-y-6" noValidate>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.login.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.login.description")}</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">{t("auth.login.fields.email.label")}</Label>
          <Input
            aria-describedby={state.errors?.email ? "login-email-error" : undefined}
            aria-invalid={Boolean(state.errors?.email)}
            id="email"
            name="email"
            type="email"
            placeholder={t("auth.login.fields.email.placeholder")}
          />
          {state.errors?.email ? (
            <p className="text-sm text-destructive" id="login-email-error">
              {state.errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">{t("auth.login.fields.password.label")}</Label>
          <Input
            aria-describedby={state.errors?.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(state.errors?.password)}
            id="password"
            name="password"
            type="password"
            placeholder={t("auth.login.fields.password.placeholder")}
          />
          {state.errors?.password ? (
            <p className="text-sm text-destructive" id="login-password-error">
              {state.errors.password}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <Checkbox id="rememberMe" name="rememberMe" />
        <Label htmlFor="rememberMe">{t("auth.login.fields.rememberMe.label")}</Label>
      </div>

      {state.messageKey ? (
        <p className={cnMessageClass(state.success)} role="status">
          {t(state.messageKey)}
        </p>
      ) : null}

      <div className="flex flex-col gap-y-3">
        <Button disabled={isPending} type="submit">
          {isPending ? t("auth.login.pendingLabel") : t("auth.login.submitLabel")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.login.alternativeLabel")}
        </p>

        <Button asChild type="button" variant="secondary">
          <Link href={routes.signup}>{t("auth.login.secondaryActionLabel")}</Link>
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

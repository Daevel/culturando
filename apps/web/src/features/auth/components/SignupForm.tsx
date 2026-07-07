"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { signupAction } from "../actions/signup.action";
import { signupSchema } from "../schemas/signup.schema";
import type { AuthFormState } from "../types/auth-form.types";

type SignupFormInput = z.input<typeof signupSchema>;
type SignupFormValues = z.output<typeof signupSchema>;

const initialState: AuthFormState<"name" | "email" | "password" | "confirmPassword"> = {
  success: false,
  errors: {},
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const t = useTranslation();

  function onSubmit(values: SignupFormValues) {
    const formData = new FormData();

    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(() => {
      formAction(formData);
    });
  }

  const nameError = errors.name?.message ?? state.errors?.name;
  const emailError = errors.email?.message ?? state.errors?.email;
  const passwordError = errors.password?.message ?? state.errors?.password;
  const confirmPasswordError = errors.confirmPassword?.message ?? state.errors?.confirmPassword;

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-y-6"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.signup.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signup.description")}</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">{t("auth.signup.fields.name.label")}</Label>
          <Input
            aria-describedby={nameError ? "signup-name-error" : undefined}
            aria-invalid={Boolean(nameError)}
            id="name"
            type="text"
            placeholder={t("auth.signup.fields.name.placeholder")}
            {...register("name")}
          />
          {nameError ? (
            <p className="text-sm text-destructive" id="signup-name-error">
              {nameError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">{t("auth.signup.fields.email.label")}</Label>
          <Input
            aria-describedby={emailError ? "signup-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            id="email"
            type="email"
            placeholder={t("auth.signup.fields.email.placeholder")}
            {...register("email")}
          />
          {emailError ? (
            <p className="text-sm text-destructive" id="signup-email-error">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">{t("auth.signup.fields.password.label")}</Label>
          <Input
            aria-describedby={passwordError ? "signup-password-error" : undefined}
            aria-invalid={Boolean(passwordError)}
            id="password"
            type="password"
            placeholder={t("auth.signup.fields.password.placeholder")}
            {...register("password")}
          />
          {passwordError ? (
            <p className="text-sm text-destructive" id="signup-password-error">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="confirmPassword">{t("auth.signup.fields.confirmPassword.label")}</Label>
          <Input
            aria-describedby={confirmPasswordError ? "signup-confirm-password-error" : undefined}
            aria-invalid={Boolean(confirmPasswordError)}
            id="confirmPassword"
            type="password"
            placeholder={t("auth.signup.fields.confirmPassword.placeholder")}
            {...register("confirmPassword")}
          />
          {confirmPasswordError ? (
            <p className="text-sm text-destructive" id="signup-confirm-password-error">
              {confirmPasswordError}
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
        <Button isLoading={isPending} type="submit">
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

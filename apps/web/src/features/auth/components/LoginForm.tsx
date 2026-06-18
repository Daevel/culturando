"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { loginAction } from "../actions/login.action";
import { loginSchema } from "../schemas/login.schema";
import type { AuthFormState } from "../types/auth-form.types";

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormValues = z.output<typeof loginSchema>;

const initialState: AuthFormState<"email" | "password" | "rememberMe"> = {
  success: false,
  errors: {},
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const t = useTranslation();

  function onSubmit(values: LoginFormValues) {
    const formData = new FormData();

    formData.set("email", values.email);
    formData.set("password", values.password);

    if (values.rememberMe) {
      formData.set("rememberMe", "on");
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  const emailError = errors.email?.message ?? state.errors?.email;
  const passwordError = errors.password?.message ?? state.errors?.password;

  return (
    <section className="flex flex-row w-full">
      <main className="flex flex-row w-full">
        <div id="login-side" className="w-full flex flex-col justify-center items-center">
          <form
            className="flex w-full max-w-sm flex-col gap-y-6"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{t("auth.login.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.login.description")}</p>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email">{t("auth.login.fields.email.label")}</Label>
                <Input
                  aria-describedby={emailError ? "login-email-error" : undefined}
                  aria-invalid={Boolean(emailError)}
                  id="email"
                  type="email"
                  placeholder={t("auth.login.fields.email.placeholder")}
                  {...register("email")}
                />
                {emailError ? (
                  <p className="text-sm text-destructive" id="login-email-error">
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password">{t("auth.login.fields.password.label")}</Label>
                <Input
                  aria-describedby={passwordError ? "login-password-error" : undefined}
                  aria-invalid={Boolean(passwordError)}
                  id="password"
                  type="password"
                  placeholder={t("auth.login.fields.password.placeholder")}
                  {...register("password")}
                />
                {passwordError ? (
                  <p className="text-sm text-destructive" id="login-password-error">
                    {passwordError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-x-2">
              <Checkbox id="rememberMe" {...register("rememberMe")} />
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
        </div>
        <div
          id="landimage-side"
          className="bg-red-300 w-full flex flex-col items-center justify-center"
        >
          <Image src={"/favicon.ico"} alt="favion-image" width={32} height={32} />
          <h1>Placeholder per immagine</h1>
        </div>
      </main>
    </section>
  );
}

function cnMessageClass(success: boolean) {
  return success
    ? "text-center text-sm text-muted-foreground"
    : "text-center text-sm text-destructive";
}

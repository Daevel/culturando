"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageDescription, PageTitle } from "@/components/ui/page";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { Wizard, type WizardStep } from "@/components/ui/wizard";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { checkSignupEmailAvailabilityAction } from "../actions/check-signup-email.action";
import { signupAction } from "../actions/signup.action";
import { signupSchema } from "../schemas/signup.schema";
import type { AuthFormState } from "../types/auth-form.types";

type SignupFormInput = z.input<typeof signupSchema>;
type SignupFormValues = z.output<typeof signupSchema>;
type SignupField = "name" | "salutationPreference" | "email" | "password" | "confirmPassword";
type EmailAvailabilityStatus = "idle" | "checking" | "available" | "unavailable";
const defaultSalutationPreference = "neutral" satisfies SignupFormValues["salutationPreference"];

const initialState: AuthFormState<SignupField> = {
  success: false,
  errors: {},
};

const stepFields: SignupField[][] = [["name", "email"], ["password", "confirmPassword"], []];

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const {
    handleSubmit,
    register,
    clearErrors,
    control,
    setError,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      salutationPreference: defaultSalutationPreference,
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const t = useTranslation();
  const { showToast } = useToast();
  const emailAlreadyExistsMessage = t("auth.signup.emailAlreadyExistsMessage");
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailabilityStatus, setEmailAvailabilityStatus] =
    useState<EmailAvailabilityStatus>("idle");
  const signupSteps: WizardStep[] = [
    {
      id: "account",
      title: t("auth.signup.wizard.steps.account.title"),
      description: t("auth.signup.wizard.steps.account.description"),
    },
    {
      id: "security",
      title: t("auth.signup.wizard.steps.security.title"),
      description: t("auth.signup.wizard.steps.security.description"),
    },
    {
      id: "confirm",
      title: t("auth.signup.wizard.steps.confirm.title"),
      description: t("auth.signup.wizard.steps.confirm.description"),
    },
  ];
  const nameValue = watch("name");
  const emailValue = useWatch({
    control,
    name: "email",
  });

  useEffect(() => {
    if (state.success && state.messageKey) {
      showToast({
        title: t("auth.signup.toast.title"),
        description: t(state.messageKey),
        variant: "success",
      });
    }
  }, [showToast, state.messageKey, state.success, t]);

  useEffect(() => {
    const email = String(emailValue ?? "")
      .trim()
      .toLowerCase();

    clearErrors("email");
    setEmailAvailabilityStatus("idle");

    if (!looksLikeEmail(email)) {
      return;
    }

    let isCurrent = true;
    setEmailAvailabilityStatus("checking");

    const timeoutId = window.setTimeout(() => {
      void checkEmailAvailability(email).then((isAvailable) => {
        if (!isCurrent) {
          return;
        }

        setEmailAvailabilityStatus(isAvailable ? "available" : "unavailable");

        if (!isAvailable) {
          setError("email", {
            message: emailAlreadyExistsMessage,
            type: "manual",
          });
        }
      });
    }, 450);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [clearErrors, emailAlreadyExistsMessage, emailValue, setError]);

  useEffect(() => {
    if (state.errors?.name || state.errors?.email) {
      setCurrentStep(0);
      return;
    }

    if (state.errors?.password || state.errors?.confirmPassword) {
      setCurrentStep(1);
    }
  }, [state.errors]);

  function onSubmit(values: SignupFormValues) {
    const formData = new FormData();

    formData.set("name", values.name);
    formData.set("salutationPreference", defaultSalutationPreference);
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
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === signupSteps.length - 1;

  async function goToNextStep() {
    const fieldsToValidate = stepFields[currentStep];
    const isStepValid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));

    if (!isStepValid) {
      return;
    }

    if (currentStep === 0) {
      setIsCheckingEmail(true);
      setEmailAvailabilityStatus("checking");
      const isAvailable = await checkEmailAvailability(String(emailValue ?? ""));
      setIsCheckingEmail(false);
      setEmailAvailabilityStatus(isAvailable ? "available" : "unavailable");

      if (!isAvailable) {
        setError("email", {
          message: emailAlreadyExistsMessage,
          type: "manual",
        });
        return;
      }
    }

    setCurrentStep((step) => Math.min(step + 1, signupSteps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function completeSignup() {
    if (!isLastStep) {
      return;
    }

    await handleSubmit(onSubmit)();
  }

  return (
    <Wizard
      className="w-full max-w-2xl"
      currentStep={currentStep}
      description={t("auth.signup.description")}
      progressLabel={t("auth.signup.wizard.progressLabel")}
      stepCounterLabel={(current, total) =>
        `${t("auth.signup.wizard.stepLabel")} ${current} ${t("auth.signup.wizard.ofLabel")} ${total}`
      }
      steps={signupSteps}
      title={t("auth.signup.title")}
    >
      <form
        className="flex flex-col gap-y-6"
        noValidate
        onKeyDown={(event) => {
          if (event.key !== "Enter" || isLastStep) {
            return;
          }

          event.preventDefault();
          void goToNextStep();
        }}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="sr-only">
          <PageTitle className="max-w-none text-2xl lg:text-3xl">
            {t("auth.signup.title")}
          </PageTitle>
          <PageDescription className="text-sm sm:text-sm">
            {t("auth.signup.description")}
          </PageDescription>
        </div>

        {currentStep === 0 ? (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="name">{t("auth.signup.fields.name.label")}</Label>
              <Input
                aria-describedby={nameError ? "signup-name-error" : undefined}
                aria-invalid={Boolean(nameError)}
                id="name"
                placeholder={t("auth.signup.fields.name.placeholder")}
                type="text"
                {...register("name")}
              />
              {nameError ? (
                <p className="text-sm text-destructive" id="signup-name-error">
                  {nameError}
                </p>
              ) : null}
            </div>

            <input
              type="hidden"
              value={defaultSalutationPreference}
              {...register("salutationPreference")}
            />

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="email">{t("auth.signup.fields.email.label")}</Label>
              <Input
                aria-describedby={getEmailDescriptionId(emailError, emailAvailabilityStatus)}
                aria-invalid={Boolean(emailError)}
                id="email"
                placeholder={t("auth.signup.fields.email.placeholder")}
                type="email"
                {...register("email", {
                  onChange: () => clearErrors("email"),
                })}
              />
              {emailError ? (
                <p
                  className="flex items-center gap-2 text-sm text-destructive"
                  id="signup-email-error"
                >
                  <XCircle aria-hidden="true" size={16} />
                  {emailError}
                </p>
              ) : null}
              {emailAvailabilityStatus === "checking" ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner aria-hidden="true" className="size-4" />
                  {t("auth.signup.wizard.checkingEmailLabel")}
                </p>
              ) : null}
              {emailAvailabilityStatus === "available" ? (
                <p
                  className="flex items-center gap-2 text-sm text-green-700"
                  id="signup-email-success"
                >
                  <CheckCircle2 aria-hidden="true" size={16} />
                  {t("auth.signup.wizard.emailAvailableMessage")}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="password">{t("auth.signup.fields.password.label")}</Label>
              <Input
                aria-describedby={passwordError ? "signup-password-error" : undefined}
                aria-invalid={Boolean(passwordError)}
                id="password"
                placeholder={t("auth.signup.fields.password.placeholder")}
                type="password"
                {...register("password")}
              />
              {passwordError ? (
                <p className="text-sm text-destructive" id="signup-password-error">
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="confirmPassword">
                {t("auth.signup.fields.confirmPassword.label")}
              </Label>
              <Input
                aria-describedby={
                  confirmPasswordError ? "signup-confirm-password-error" : undefined
                }
                aria-invalid={Boolean(confirmPasswordError)}
                id="confirmPassword"
                placeholder={t("auth.signup.fields.confirmPassword.placeholder")}
                type="password"
                {...register("confirmPassword")}
              />
              {confirmPasswordError ? (
                <p className="text-sm text-destructive" id="signup-confirm-password-error">
                  {confirmPasswordError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("auth.signup.wizard.review.nameLabel")}
              </p>
              <p className="font-semibold">
                {nameValue || t("auth.signup.wizard.review.emptyValue")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("auth.signup.wizard.review.emailLabel")}
              </p>
              <p className="font-semibold">
                {emailValue || t("auth.signup.wizard.review.emptyValue")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t("auth.signup.wizard.review.notice")}</p>
          </div>
        ) : null}

        {state.messageKey ? (
          <p className={cnMessageClass(state.success)} role="status">
            {t(state.messageKey)}
          </p>
        ) : null}

        {state.success ? null : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              disabled={isFirstStep || isPending}
              onClick={goToPreviousStep}
              type="button"
              variant="outline"
            >
              {t("auth.signup.wizard.previousLabel")}
            </Button>

            {isLastStep ? (
              <Button isLoading={isPending} onClick={completeSignup} type="button">
                {isPending ? t("auth.signup.pendingLabel") : t("auth.signup.submitLabel")}
              </Button>
            ) : (
              <Button
                disabled={isPending || isCheckingEmail}
                isLoading={isCheckingEmail}
                onClick={goToNextStep}
                type="button"
              >
                {isCheckingEmail
                  ? t("auth.signup.wizard.checkingEmailLabel")
                  : t("auth.signup.wizard.nextLabel")}
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-y-3 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.signup.alternativeLabel")}
          </p>

          <Button asChild type="button" variant="secondary">
            <Link href={routes.login}>{t("auth.signup.secondaryActionLabel")}</Link>
          </Button>
        </div>
      </form>
    </Wizard>
  );
}

async function checkEmailAvailability(emailValue: string) {
  const email = emailValue.trim().toLowerCase();

  if (!looksLikeEmail(email)) {
    return false;
  }

  const result = await checkSignupEmailAvailabilityAction(email);

  return result.isAvailable;
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getEmailDescriptionId(
  emailError: string | undefined,
  emailAvailabilityStatus: EmailAvailabilityStatus,
) {
  if (emailError) {
    return "signup-email-error";
  }

  if (emailAvailabilityStatus === "available") {
    return "signup-email-success";
  }

  return undefined;
}

function cnMessageClass(success: boolean) {
  return success
    ? "text-center text-sm text-muted-foreground"
    : "text-center text-sm text-destructive";
}

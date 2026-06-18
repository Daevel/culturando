"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { createLoanRequestAction } from "../actions/create-loan-request.action";
import type { LoanRequestFormState } from "../types/loan-request-form.types";

type LoanRequestFormProps = {
  bookId: string;
};

const initialState: LoanRequestFormState = {
  success: false,
  errors: {},
};

export function LoanRequestForm({ bookId }: LoanRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslation();
  const [state, formAction, isPending] = useActionState(
    createLoanRequestAction.bind(null, bookId),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("requests.form.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("requests.form.description")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-type">{t("requests.form.typeLabel")}</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          defaultValue="consultation"
          id="request-type"
          name="type"
        >
          <option value="consultation">{t("requests.type.consultation")}</option>
          <option value="loan">{t("requests.type.loan")}</option>
          <option value="info">{t("requests.type.info")}</option>
        </select>
        {state.errors.type ? <p className="text-sm text-destructive">{state.errors.type}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-message">{t("requests.form.messageLabel")}</Label>
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          id="request-message"
          maxLength={800}
          name="message"
          placeholder={t("requests.form.messagePlaceholder")}
        />
        {state.errors.message ? (
          <p className="text-sm text-destructive">{state.errors.message}</p>
        ) : null}
      </div>

      {state.messageKey ? (
        <p className={state.success ? "text-sm text-primary" : "text-sm text-destructive"}>
          {t(state.messageKey)}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? t("requests.form.pendingLabel") : t("requests.form.submitLabel")}
      </Button>
    </form>
  );
}

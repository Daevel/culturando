"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer, PageDescription, PageShell, PageTitle } from "@/components/ui/page";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import type { EmailVerificationResult } from "../actions/email-verification";

type EmailConfirmationStatus = EmailVerificationResult | "missing-token";

type EmailConfirmationPageProps = {
  status: EmailConfirmationStatus;
};

export function EmailConfirmationPage({ status }: EmailConfirmationPageProps) {
  const t = useTranslation();
  const content = statusContentKeys[status];

  return (
    <PageShell className="flex items-center">
      <PageContainer className="items-center text-center" size="sm">
        <div className="space-y-3">
          <PageTitle className="max-w-none lg:text-4xl">{t(content.title)}</PageTitle>
          <PageDescription className="max-w-xl">{t(content.description)}</PageDescription>
        </div>

        <Card className="w-full text-left">
          <CardHeader>
            <CardTitle>{t(content.cardTitle)}</CardTitle>
            <CardDescription>{t(content.cardDescription)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href={routes.login}>{t("auth.confirmEmail.loginLabel")}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

const statusContentKeys = {
  success: {
    title: "auth.confirmEmail.success.title",
    description: "auth.confirmEmail.success.description",
    cardTitle: "auth.confirmEmail.success.cardTitle",
    cardDescription: "auth.confirmEmail.success.cardDescription",
  },
  "missing-token": {
    title: "auth.confirmEmail.missing.title",
    description: "auth.confirmEmail.missing.description",
    cardTitle: "auth.confirmEmail.missing.cardTitle",
    cardDescription: "auth.confirmEmail.missing.cardDescription",
  },
  "invalid-token": {
    title: "auth.confirmEmail.invalid.title",
    description: "auth.confirmEmail.invalid.description",
    cardTitle: "auth.confirmEmail.invalid.cardTitle",
    cardDescription: "auth.confirmEmail.invalid.cardDescription",
  },
  "expired-token": {
    title: "auth.confirmEmail.expired.title",
    description: "auth.confirmEmail.expired.description",
    cardTitle: "auth.confirmEmail.expired.cardTitle",
    cardDescription: "auth.confirmEmail.expired.cardDescription",
  },
} as const;

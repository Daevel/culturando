"use client";

import type { Locale } from "@culturando/translation";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/hooks/useTranslation";

const localeOptions = [
  { label: "Italiano", value: "it" },
  { label: "English", value: "en" },
] satisfies Array<{ label: string; value: Locale }>;

export function SettingsPageContent() {
  const t = useTranslation();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { showToast } = useToast();

  function updateLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    showToast({
      title: t("settings.language.toastTitle"),
      description: t("settings.language.toastDescription"),
      variant: "success",
    });
    router.refresh();
  }

  return (
    <PageShell>
      <PageContainer size="sm">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("settings.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("settings.title")}</PageTitle>
            <PageDescription>{t("settings.description")}</PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language.title")}</CardTitle>
            <CardDescription>{t("settings.language.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              className="grid gap-3 sm:grid-cols-2"
              onValueChange={updateLocale}
              value={locale}
            >
              {localeOptions.map((option) => (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-4 text-sm font-medium transition hover:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                  htmlFor={`locale-${option.value}`}
                  key={option.value}
                >
                  <RadioGroupItem id={`locale-${option.value}`} value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => router.back()} type="button" variant="outline">
                {t("settings.backLabel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

"use client";

import type { Locale } from "@culturando/translation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { updateProfileVisibilityAction } from "../actions/update-profile-visibility.action";

const localeOptions = [
  { label: "Italiano", value: "it" },
  { label: "English", value: "en" },
] as const satisfies ReadonlyArray<{ label: string; value: Locale }>;

type SettingsPageContentProps = {
  isProfilePublic: boolean;
};

export function SettingsPageContent({ isProfilePublic }: SettingsPageContentProps) {
  const t = useTranslation();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { showToast } = useToast();
  const [profileVisible, setProfileVisible] = useState(isProfilePublic);
  const [isUpdatingVisibility, startVisibilityUpdate] = useTransition();

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

  function updateProfileVisibility(nextProfileVisible: boolean) {
    const previousProfileVisible = profileVisible;

    setProfileVisible(nextProfileVisible);
    startVisibilityUpdate(() => {
      void updateProfileVisibilityAction(nextProfileVisible).then((result) => {
        if (!result.success) {
          setProfileVisible(previousProfileVisible);
          showToast({
            title: t("settings.profileVisibility.toastErrorTitle"),
            description: t("settings.profileVisibility.toastErrorDescription"),
            variant: "destructive",
          });
          return;
        }

        showToast({
          title: t("settings.profileVisibility.toastTitle"),
          description: t("settings.profileVisibility.toastDescription"),
          variant: "success",
        });
        router.refresh();
      });
    });
  }

  return (
    <PageShell>
      <PageContainer size="xl">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("settings.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("settings.title")}</PageTitle>
            <PageDescription>{t("settings.description")}</PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <Card>
          <CardContent className="p-0">
            <div className="grid gap-4 border-b p-4 sm:grid-cols-[20rem_minmax(0,1fr)] sm:items-center sm:p-6">
              <div className="min-w-0 space-y-1">
                <h2 className="font-semibold leading-tight tracking-tight">
                  {t("settings.language.title")}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("settings.language.description")}
                </p>
              </div>
              <div className="flex justify-end">
                <DropdownSelect
                  className="w-full sm:w-44"
                  id="settings-language"
                  onValueChange={updateLocale}
                  options={localeOptions}
                  value={locale}
                />
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[20rem_minmax(0,1fr)] sm:items-center sm:p-6">
              <div className="min-w-0 space-y-1">
                <h2
                  className="font-semibold leading-tight tracking-tight"
                  id="settings-profile-visibility-title"
                >
                  {t("profile.form.fields.isProfilePublic.label")}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("profile.form.fields.isProfilePublic.description")}
                </p>
              </div>
              <div className="flex justify-end">
                <Switch
                  aria-labelledby="settings-profile-visibility-title"
                  checked={profileVisible}
                  disabled={isUpdatingVisibility}
                  id="settings-profile-visibility"
                  onCheckedChange={updateProfileVisibility}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

"use client";

import type { UserProfile } from "@culturando/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { updateProfileAction } from "../actions/update-profile.action";
import type { ProfileFormState } from "../types/profile-form.types";

type ProfileFormProps = {
  profile: UserProfile;
};

const initialState: ProfileFormState = {
  success: false,
  errors: {},
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslation();
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <PageShell>
      <PageContainer size="sm">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("profile.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("profile.title")}</PageTitle>
            <PageDescription>{t("profile.description")}</PageDescription>
          </PageHeaderContent>

          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href={routes.dashboard}>{t("profile.backToDashboardLabel")}</Link>
          </Button>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.form.title")}</CardTitle>
            <CardDescription>{t("profile.form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field error={state.errors.name} label={t("profile.form.fields.name.label")}>
                  <Input
                    defaultValue={profile.name ?? ""}
                    name="name"
                    placeholder={t("profile.form.fields.name.placeholder")}
                    required
                  />
                </Field>

                <Field label={t("profile.form.fields.email.label")}>
                  <Input defaultValue={profile.email} disabled type="email" />
                </Field>
              </div>

              <Field
                error={state.errors.avatarUrl}
                label={t("profile.form.fields.avatarUrl.label")}
              >
                <Input
                  defaultValue={profile.avatarUrl ?? ""}
                  name="avatarUrl"
                  placeholder={t("profile.form.fields.avatarUrl.placeholder")}
                  type="url"
                />
              </Field>

              <Field error={state.errors.bio} label={t("profile.form.fields.bio.label")}>
                <textarea
                  className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={profile.bio ?? ""}
                  maxLength={500}
                  name="bio"
                  placeholder={t("profile.form.fields.bio.placeholder")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field error={state.errors.city} label={t("profile.form.fields.city.label")}>
                  <Input
                    defaultValue={profile.city ?? ""}
                    name="city"
                    placeholder={t("profile.form.fields.city.placeholder")}
                  />
                </Field>
                <Field
                  error={state.errors.province}
                  label={t("profile.form.fields.province.label")}
                >
                  <Input
                    defaultValue={profile.province ?? ""}
                    name="province"
                    placeholder={t("profile.form.fields.province.placeholder")}
                  />
                </Field>
                <Field error={state.errors.region} label={t("profile.form.fields.region.label")}>
                  <Input
                    defaultValue={profile.region ?? ""}
                    name="region"
                    placeholder={t("profile.form.fields.region.placeholder")}
                  />
                </Field>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                <Checkbox
                  defaultChecked={profile.isProfilePublic}
                  id="isProfilePublic"
                  name="isProfilePublic"
                  value="on"
                />
                <div className="space-y-1">
                  <Label className="block text-sm font-medium" htmlFor="isProfilePublic">
                    {t("profile.form.fields.isProfilePublic.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.form.fields.isProfilePublic.description")}
                  </p>
                </div>
              </div>

              {state.messageKey ? (
                <p
                  className={state.success ? "text-sm text-green-700" : "text-sm text-destructive"}
                >
                  {t(state.messageKey)}
                </p>
              ) : null}

              <Button isLoading={isPending} type="submit">
                {isPending ? t("profile.form.pendingLabel") : t("profile.form.submitLabel")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

function Field({ children, error, label }: { children: ReactNode; error?: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

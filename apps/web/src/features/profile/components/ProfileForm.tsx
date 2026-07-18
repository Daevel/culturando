"use client";

import type { AddressSuggestion } from "@culturando/geo";
import type { UserProfile } from "@culturando/types";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { searchAddressSuggestions } from "@/features/location/actions/search-address-suggestions.action";
import { useTranslation } from "@/hooks/useTranslation";
import { checkProfileNicknameAvailabilityAction } from "../actions/check-profile-nickname.action";
import { updateProfileAction } from "../actions/update-profile.action";
import type { ProfileFormState } from "../types/profile-form.types";

type ProfileFormProps = {
  profile: UserProfile;
};

type NicknameAvailabilityStatus = "idle" | "checking" | "available" | "unavailable";

const initialState: ProfileFormState = {
  success: false,
  errors: {},
};

const BIO_MAX_LENGTH = 2000;
const NICKNAME_CHANGE_INTERVAL_DAYS = 90;

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslation();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const [isSearchingAddress, startAddressSearch] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl ?? "");
  const [addressQuery, setAddressQuery] = useState(getProfileLocationLabel(profile));
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [nicknameAvailabilityStatus, setNicknameAvailabilityStatus] =
    useState<NicknameAvailabilityStatus>("idle");
  const [selectedLocation, setSelectedLocation] = useState({
    addressLabel: profile.addressLabel ?? "",
    city: profile.city ?? "",
    postalCode: profile.postalCode ?? "",
    province: profile.province ?? "",
    region: profile.region ?? "",
  });
  const [hasInteractedWithAddress, setHasInteractedWithAddress] = useState(false);
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  const canEditNickname = canChangeNickname(profile.nicknameUpdatedAt);
  const nicknameLockedMessage = t("profile.form.fields.nickname.lockedDescription").replace(
    "{date}",
    getNextNicknameChangeDate(profile.nicknameUpdatedAt).toLocaleDateString("it-IT"),
  );
  const profileInitials = getProfileInitials(profile.name ?? profile.email);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  useEffect(() => {
    const normalizedNickname = nickname.trim().toLowerCase();
    const currentNickname = profile.nickname ?? "";

    setNicknameAvailabilityStatus("idle");

    if (
      !canEditNickname ||
      normalizedNickname === currentNickname ||
      !isNicknameCandidate(normalizedNickname)
    ) {
      return;
    }

    let isCurrent = true;
    setNicknameAvailabilityStatus("checking");

    const timeout = window.setTimeout(() => {
      void checkProfileNicknameAvailabilityAction(normalizedNickname).then((result) => {
        if (!isCurrent) {
          return;
        }

        setNicknameAvailabilityStatus(result.isAvailable ? "available" : "unavailable");
      });
    }, 450);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [canEditNickname, nickname, profile.nickname]);

  useEffect(() => {
    const normalizedQuery = addressQuery.trim();

    if (!hasInteractedWithAddress || normalizedQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      startAddressSearch(async () => {
        const suggestions = await searchAddressSuggestions(normalizedQuery);
        setAddressSuggestions(suggestions);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [addressQuery, hasInteractedWithAddress]);

  return (
    <PageShell>
      <PageContainer size="sm">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("profile.eyebrow")}</PageEyebrow>
            <PageTitle>{t("profile.title")}</PageTitle>
            <PageDescription>{t("profile.description")}</PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.form.title")}</CardTitle>
            <CardDescription>{t("profile.form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/20 p-6 text-center">
                <Label
                  className="group relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-background text-2xl font-semibold text-muted-foreground shadow-sm transition hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  htmlFor="avatarImage"
                >
                  {avatarPreview ? (
                    <Image
                      alt={t("profile.form.fields.avatarUrl.previewAlt")}
                      className="object-cover transition group-hover:scale-105"
                      fill
                      sizes="112px"
                      src={avatarPreview}
                      unoptimized
                    />
                  ) : (
                    profileInitials
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-background/90 px-2 py-2 text-xs font-medium text-foreground opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    {t("profile.form.fields.avatarUrl.actionLabel")}
                  </span>
                </Label>
                <Input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id="avatarImage"
                  name="avatarImage"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const reader = new FileReader();
                    reader.addEventListener("load", () => {
                      if (typeof reader.result === "string") {
                        setAvatarPreview(reader.result);
                      }
                    });
                    reader.readAsDataURL(file);
                  }}
                  type="file"
                />
                <input name="avatarUrl" type="hidden" value={profile.avatarUrl ?? ""} />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("profile.form.fields.avatarUrl.label")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.form.fields.avatarUrl.helpText")}
                  </p>
                  {state.errors.avatarUrl ? (
                    <p className="text-sm text-destructive">{state.errors.avatarUrl}</p>
                  ) : null}
                </div>
              </div>

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

              <Field error={state.errors.nickname} label={t("profile.form.fields.nickname.label")}>
                <div className="space-y-2">
                  <Input
                    autoCapitalize="none"
                    autoComplete="nickname"
                    onBlur={() => setIsNicknameFocused(false)}
                    onChange={(event) => setNickname(event.target.value.toLowerCase())}
                    onFocus={() => setIsNicknameFocused(true)}
                    placeholder={t("profile.form.fields.nickname.placeholder")}
                    readOnly={!canEditNickname}
                    value={nickname}
                  />
                  <input name="nickname" type="hidden" value={nickname} />
                  {canEditNickname ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.form.fields.nickname.description")}
                    </p>
                  ) : null}
                  {!canEditNickname && isNicknameFocused ? (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle aria-hidden="true" size={16} />
                      {nicknameLockedMessage}
                    </p>
                  ) : null}
                  {nicknameAvailabilityStatus === "checking" ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner aria-hidden="true" className="size-4" />
                      {t("profile.form.fields.nickname.checkingLabel")}
                    </p>
                  ) : null}
                  {nicknameAvailabilityStatus === "available" ? (
                    <p className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 aria-hidden="true" size={16} />
                      {t("profile.form.fields.nickname.availableMessage")}
                    </p>
                  ) : null}
                  {nicknameAvailabilityStatus === "unavailable" ? (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle aria-hidden="true" size={16} />
                      {t("profile.form.fields.nickname.unavailableMessage")}
                    </p>
                  ) : null}
                </div>
              </Field>

              <Field error={state.errors.bio} label={t("profile.form.fields.bio.label")}>
                <div className="space-y-1">
                  <textarea
                    className="min-h-40 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={BIO_MAX_LENGTH}
                    name="bio"
                    onChange={(event) => setBio(event.target.value)}
                    placeholder={t("profile.form.fields.bio.placeholder")}
                    value={bio}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {bio.length}/{BIO_MAX_LENGTH}
                  </p>
                </div>
              </Field>

              <Field
                error={getLocationError(state)}
                label={t("profile.form.fields.location.label")}
              >
                <div className="relative">
                  <Input
                    autoComplete="street-address"
                    onChange={(event) => {
                      setHasInteractedWithAddress(true);
                      setAddressQuery(event.target.value);
                      setSelectedLocation({
                        addressLabel: event.target.value,
                        city: "",
                        postalCode: "",
                        province: "",
                        region: "",
                      });
                    }}
                    placeholder={t("profile.form.fields.location.placeholder")}
                    value={addressQuery}
                  />
                  {addressSuggestions.length > 0 ? (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                      {addressSuggestions.map((suggestion) => (
                        <button
                          className="w-full rounded-sm px-3 py-2 text-left text-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                          key={suggestion.id}
                          onClick={() => {
                            setAddressQuery(suggestion.displayName);
                            setSelectedLocation({
                              addressLabel: suggestion.addressLabel,
                              city: suggestion.city,
                              postalCode: suggestion.postalCode,
                              province: suggestion.province,
                              region: suggestion.region,
                            });
                            setAddressSuggestions([]);
                          }}
                          type="button"
                        >
                          {suggestion.displayName}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <input name="addressLabel" type="hidden" value={selectedLocation.addressLabel} />
                <input name="city" type="hidden" value={selectedLocation.city} />
                <input name="postalCode" type="hidden" value={selectedLocation.postalCode} />
                <input name="province" type="hidden" value={selectedLocation.province} />
                <input name="region" type="hidden" value={selectedLocation.region} />
                {isSearchingAddress || hasInteractedWithAddress ? (
                  <p className="text-sm text-muted-foreground">
                    {isSearchingAddress
                      ? t("profile.form.fields.location.searchingLabel")
                      : t("profile.form.fields.location.description")}
                  </p>
                ) : null}
              </Field>

              <input
                name="isProfilePublic"
                type="hidden"
                value={profile.isProfilePublic ? "on" : "off"}
              />

              {state.messageKey ? (
                <p
                  className={state.success ? "text-sm text-green-700" : "text-sm text-destructive"}
                >
                  {t(state.messageKey)}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button isLoading={isPending} type="submit">
                  {isPending ? t("profile.form.pendingLabel") : t("profile.form.submitLabel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

function getProfileLocationLabel(profile: UserProfile) {
  return [profile.addressLabel, profile.postalCode, profile.city, profile.province, profile.region]
    .filter(Boolean)
    .join(", ");
}

function getLocationError(state: ProfileFormState) {
  return (
    state.errors.addressLabel ??
    state.errors.city ??
    state.errors.postalCode ??
    state.errors.province ??
    state.errors.region
  );
}

function isNicknameCandidate(value: string) {
  return value.length >= 3 && /^[a-z0-9_.]+$/.test(value);
}

function canChangeNickname(value: string | undefined) {
  if (!value) {
    return true;
  }

  return Date.now() >= getNextNicknameChangeDate(value).getTime();
}

function getNextNicknameChangeDate(value: string | undefined) {
  const lastChangedAt = value ? new Date(value) : new Date(0);

  return new Date(lastChangedAt.getTime() + NICKNAME_CHANGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
}

function getProfileInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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

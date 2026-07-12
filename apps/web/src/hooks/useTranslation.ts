"use client";

import { getTranslation, type TranslationKey } from "@culturando/translation";
import { useCallback } from "react";

import { useLocale } from "@/components/LocaleProvider";

export function useTranslation() {
  const { locale } = useLocale();

  return useCallback((key: TranslationKey) => getTranslation(key, locale), [locale]);
}

import { appConfig } from "@culturando/config";
import { getTranslation, type Locale, type TranslationKey } from "@culturando/translation";

const defaultLocale = appConfig.defaultLocale satisfies Locale;

export function useTranslation() {
  return (key: TranslationKey) => getTranslation(key, defaultLocale);
}

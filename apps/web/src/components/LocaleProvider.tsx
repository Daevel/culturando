"use client";

import type { Locale } from "@culturando/translation";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

const localeStorageKey = "culturando-locale";
const localeCookieName = "culturando-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState(initialLocale);

  useEffect(() => {
    const storedLocale = getStoredLocale();

    if (storedLocale && storedLocale !== locale) {
      setLocaleState(storedLocale);
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale(nextLocale: Locale) {
        setLocaleState(nextLocale);
        window.localStorage.setItem(localeStorageKey, nextLocale);
        // biome-ignore lint/suspicious/noDocumentCookie: fallback needed to persist locale for server-rendered routes.
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = nextLocale;
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}

function getStoredLocale(): Locale | undefined {
  const value = window.localStorage.getItem(localeStorageKey);

  return isLocale(value) ? value : undefined;
}

function isLocale(value: string | null): value is Locale {
  return value === "it" || value === "en";
}

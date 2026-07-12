import { appConfig } from "@culturando/config";
import type { Locale } from "@culturando/translation";
import { cookies } from "next/headers";

const localeCookieName = "culturando-locale";

export async function getCurrentLocale(): Promise<Locale> {
  const locale = (await cookies()).get(localeCookieName)?.value;

  return isLocale(locale) ? locale : appConfig.defaultLocale;
}

function isLocale(value: string | undefined): value is Locale {
  return value === "it" || value === "en";
}

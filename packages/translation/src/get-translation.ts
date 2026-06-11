import { en } from "./dictionaries/en";
import { it } from "./dictionaries/it";
import type { Locale, TranslationDictionary, TranslationKey } from "./types";

const dictionaries = {
  it,
  en,
} satisfies Record<Locale, TranslationDictionary>;

export function getTranslation(key: TranslationKey, locale: Locale = "it") {
  return (
    getDictionaryValue(dictionaries[locale], key) ?? getDictionaryValue(dictionaries.it, key) ?? key
  );
}

function getDictionaryValue(dictionary: TranslationDictionary, key: TranslationKey) {
  const value = key.split(".").reduce<unknown>((currentValue, keyPart) => {
    if (!isRecord(currentValue)) {
      return undefined;
    }

    return currentValue[keyPart];
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

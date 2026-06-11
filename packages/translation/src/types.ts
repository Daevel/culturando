import type { it } from "./dictionaries/it";

type Dictionary = typeof it;

type DotNestedKeys<TValue> = TValue extends string
  ? never
  : {
      [TKey in keyof TValue & string]: TValue[TKey] extends string
        ? TKey
        : `${TKey}.${DotNestedKeys<TValue[TKey]>}`;
    }[keyof TValue & string];

export type Locale = "it" | "en";

export type TranslationKey = DotNestedKeys<Dictionary>;

export type TranslationDictionary = Dictionary;

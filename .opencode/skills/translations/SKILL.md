---
name: translations
description: Translations, i18n, dictionaries, packages/translation. Use when editing or reviewing Culturando translation dictionaries and localized text keys.
---

# Translations Skill — Culturando

## Purpose of the skill

This skill defines the behavior to follow when working on the translations of **Culturando**.

The goal is to keep the dictionaries of the package synchronized:

```txt
packages/translation
```

The Italian dictionary is the source of truth:

```txt
packages/translation/src/dictionaries/it.ts
```

The English dictionary must keep the same structure:

```txt
packages/translation/src/dictionaries/en.ts
```

## Fundamental rule

Whenever the agent is asked to work on translations, it must:

```txt
1. read packages/translation/src/dictionaries/it.ts;
2. keep exactly the same structure in en.ts;
3. keep exactly the same keys;
4. keep the same object nesting;
5. translate only the textual values into English;
6. preserve technical values, placeholders, routes, emails and product names;
7. verify with TypeScript that en.ts satisfies the expected structure.
```

## Mandatory paths

Source file:

```txt
packages/translation/src/dictionaries/it.ts
```

Destination file:

```txt
packages/translation/src/dictionaries/en.ts
```

Do not create alternative paths such as:

```txt
packages/translations
packages/i18n
apps/web/src/translations
src/locales
```

unless explicitly requested by the user.

## Dictionary format

The dictionaries are TypeScript files, not JSON.

Correct format:

```ts
export const it = {
  auth: {
    login: {
      title: "Accedi a Culturando",
    },
  },
} as const;
```

```ts
export const en = {
  auth: {
    login: {
      title: "Sign in to Culturando",
    },
  },
} as const;
```

Do not use JSON, `export default`, comments inside the objects or translated keys.

## Rule on keys

Keys are technical identifiers and must never be translated.

Correct:

```ts
auth.login.title
```

Wrong:

```ts
autenticazione.accesso.titolo
```

## Rule on values

Only textual values must be translated.

Example:

```ts
submitLabel: "Accedi"
```

becomes:

```ts
submitLabel: "Sign in"
```

## Values not to translate

Do not translate values that represent:

```txt
- URL;
- email;
- technical names;
- technical placeholders;
- routes;
- keys;
- codes;
- variables;
- tokens;
- product names, if they must remain unchanged;
- strings with technical meaning.
```

The product name `Culturando` must remain unchanged.

## Rule on placeholders

If a string contains placeholders, variables or interpolations, they must remain identical.

Examples of placeholders:

```txt
{name}
{count}
{{name}}
{{count}}
%{name}
%s
%d
${name}
```

Correct:

```ts
welcome: "Hi {name}, welcome back to Culturando."
```

Wrong:

```ts
welcome: "Hi {nome}, welcome back to Culturando."
```

## Rule on arrays, booleans, numbers and null

If the dictionaries later contain arrays, `en.ts` must keep the same number of elements in the same order.

Booleans, numbers and `null` must not be modified.

## Structural check

After updating `en.ts`, the agent must verify that:

```txt
- every key present in it.ts is present in en.ts;
- no extra key has been added in en.ts;
- the depth of the objects is identical;
- the arrays have the same length;
- the placeholders are identical;
- pnpm build passes.
```

The structure is validated by the `TranslationDictionary` type, which enforces the same objects and the same keys but allows different textual values.

## Tone and terminology

Translations must use a tone that is:

```txt
- clear;
- professional;
- simple;
- suitable for a web app;
- not overly technical for the end user;
- consistent with a cultural and book-related product.
```

Recommended terminology:

```txt
Accedi -> Sign in
Registrati -> Sign up
Esci -> Sign out
Account -> Account
Profilo -> Profile
Libro -> Book
Libri -> Books
Collezione -> Collection
Biblioteca personale -> Personal library
Vicino a te -> Near you
Disponibile -> Available
Non disponibile -> Unavailable
Richiesta -> Request
Prestito -> Loan
Consultazione -> Consultation
Mappa -> Map
Posizione -> Location
Geolocalizzato -> Geolocated
```

Prefer sentence case in English.

## Operating procedure

When the agent must update the English dictionary:

```txt
1. Read packages/translation/src/dictionaries/it.ts.
2. Read packages/translation/src/dictionaries/en.ts.
3. Copy the missing structure from it.ts to en.ts.
4. Translate every Italian textual value into English.
5. Preserve keys, order, placeholders, arrays, booleans, numbers and null.
6. Run a targeted formatter on the translation files.
7. Run pnpm build to verify the TypeScript structure.
```

## Commit

When `en.ts` is updated, use the conventions of the `git-commits` skill.

Recommended scope:

```txt
translation
```

Examples:

```txt
feat(translation): add English dictionary
refactor(translation): sync English dictionary with Italian source
fix(translation): align dictionary types
```

## When to update this skill

Update this skill if the following change:

```txt
- the path of the translation files;
- the dictionary format;
- the i18n strategy;
- the source language;
- the placeholder rules;
- the terminology conventions;
- the way the app consumes translations.
```

## Final principle

`it.ts` is the source of truth.

`en.ts` must have the same structure, the same technical identifiers, the same logical order and the same placeholders, but with values translated into natural English that is consistent with the Culturando product.

---
name: project-scaffolding
description: Defines the required project structure, scaffolding rules and architectural boundaries for the Culturando Nx monorepo.
---

# Project Scaffolding — Culturando

## Purpose of the skill

This skill defines the structure, organization and scaffolding rules of the **Culturando** project.

Every agent working on the project must respect these rules when it:

* creates new pages;
* creates new features;
* creates new components;
* creates new hooks;
* creates new shared packages;
* performs architectural refactors;
* moves files between `apps/web` and `packages/*`;
* introduces new structural conventions.

The goal is to keep the project clean, readable, scalable and consistent with the chosen architecture.

Culturando uses an Nx monorepo with a Next.js web app in `apps/web` and shared packages under `packages/*`.

---

## General project structure

The main repository structure must follow this scheme:

```txt
culturando/
├── .opencode/
│   └── skills/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── config/
│   ├── types/
│   ├── db/
│   ├── geo/
│   ├── ai/
│   └── translation/
│
├── package.json
├── pnpm-workspace.yaml
├── nx.json
├── tsconfig.base.json
└── biome.json
```

Main responsibilities:

```txt
apps/web        → main Next.js application
packages/*      → code shareable across web, mobile, backend or scripts
.opencode       → operational skills for OpenCode agents
```

---

## Mandatory structure of `apps/web/src`

The structure of `apps/web/src` must follow this scheme:

```txt
apps/web/src/
├── app/
├── components/
├── config/
├── features/
├── hooks/
└── lib/
```

Each folder has a precise responsibility.

```txt
app/          → Next.js App Router routing
components/   → app-level shared components
config/       → web app-specific configurations
features/     → application features
hooks/        → app-level shared React hooks
lib/          → web app-specific technical utilities
```

Do not create unexpected parallel folders such as:

```txt
views/
screens/
pages/
modules/
shared/
common/
utils/
```

unless explicitly requested by the user or justified by an architectural refactor.

---

## Fundamental rule: separation between `apps/web` and `packages/*`

The most important distinction of the project is this:

```txt
apps/web    → web app-specific code
packages/*  → pure, shareable code independent of the web app
```

### Must be in `apps/web`

Put in `apps/web` everything that depends on:

```txt
- React;
- Next.js;
- App Router;
- DOM;
- Tailwind CSS;
- UI components;
- React hooks;
- web routes;
- web forms;
- web layouts;
- Next middleware;
- web app-specific server actions.
```

Examples:

```txt
LoginForm
SignupForm
useTranslation
routes.ts
layout.tsx
page.tsx
components/ui/Button
features/auth
features/books
```

### Must be in `packages/*`

Put in `packages/*` only code that is shareable, possibly pure and independent of the single app.

Examples:

```txt
appConfig
authConfig
User/Book/Loan types
pure geographic functions
translation dictionaries
database client
pure AI functions
```

### Practical rule

When the agent creates a file, it must ask itself:

```txt
Can this file also be used by mobile, backend or scripts?
```

If yes, it may stay in `packages/*`.

If no, it must stay in `apps/web`.

---

## Structure of `app/`

The folder:

```txt
apps/web/src/app/
```

is reserved for Next.js App Router routing.

Example:

```txt
apps/web/src/app/
├── layout.tsx
├── page.tsx
├── global.css
├── auth/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
└── dashboard/
    └── page.tsx
```

### Thin pages rule

The `page.tsx` files must remain thin.

They must mainly take care of:

```txt
- composing components;
- applying the page layout;
- managing metadata when necessary;
- delegating the logic to the features.
```

Correct example:

```tsx
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <LoginForm />
    </main>
  );
}
```

Wrong example:

```tsx
export default function LoginPage() {
  // 300 lines of form
  // validation
  // React states
  // API calls
  // complex markup
}
```

If a page becomes complex, the logic must be moved inside the corresponding feature.

---

## Structure of `features/`

Features must be under:

```txt
apps/web/src/features/
```

Recommended scheme:

```txt
features/<feature>/
├── actions/
├── components/
├── constants/
├── hooks/
├── mocks/
├── schemas/
├── types/
└── index.ts
```

The folders are not all mandatory.

Create a folder only when it is really needed.

Do not create empty folders.

---

## Responsibility of the feature folders

### `components/`

Contains feature-specific components.

Examples:

```txt
features/auth/components/LoginForm.tsx
features/auth/components/SignupForm.tsx
features/books/components/BookCard.tsx
features/books/components/BookGrid.tsx
```

### `actions/`

Contains asynchronous actions, server actions or operational functions related to the feature.

Examples:

```txt
features/auth/actions/login.action.ts
features/auth/actions/signup.action.ts
features/books/actions/create-book.action.ts
```

### `schemas/`

Contains feature-specific Zod schemas.

Examples:

```txt
features/auth/schemas/login.schema.ts
features/auth/schemas/signup.schema.ts
features/books/schemas/book.schema.ts
```

### `hooks/`

Contains feature-specific React hooks.

Examples:

```txt
features/auth/hooks/useLoginForm.ts
features/books/hooks/useBookFilters.ts
```

### `types/`

Contains feature-specific types, not globally shared.

Examples:

```txt
features/auth/types/auth-form.types.ts
features/books/types/book-form.types.ts
```

If a type is a domain type and is useful also outside the web app, it must be promoted to:

```txt
packages/types
```

### `constants/`

Contains feature-specific constants.

Examples:

```txt
features/auth/constants/auth-copy.ts
features/books/constants/book-filters.ts
```

When the `packages/translation` package is active, UI texts must not be hardcoded here, but moved into the dictionaries.

### `mocks/`

Contains feature-specific mock data.

Examples:

```txt
features/books/mocks/books.mock.ts
features/nearby/mocks/nearby.mock.ts
```

---

## Current and planned features

Current features:

```txt
features/auth
```

Planned features:

```txt
features/dashboard
features/books
features/nearby
features/profile
features/cataloging
```

Every new feature must be created inside:

```txt
apps/web/src/features/<feature>
```

Do not create features directly inside `src/`.

---

## Structure of `components/`

The folder:

```txt
apps/web/src/components/
```

contains components shared at the web app level.

Scheme:

```txt
components/
├── ui/
└── <any app-level components>
```

---

## Rule for `components/ui`

The folder:

```txt
apps/web/src/components/ui/
```

contains only primitive, generic and reusable components, inspired by shadcn/ui.

Correct examples:

```txt
button.tsx
input.tsx
label.tsx
card.tsx
badge.tsx
checkbox.tsx
textarea.tsx
dialog.tsx
select.tsx
form-message.tsx
```

These components must not know the Culturando domain.

Do not put components such as these in `components/ui`:

```txt
LoginForm
SignupForm
BookCard
BookGrid
UserProfileCard
NearbyMap
DashboardHeader
```

These components must stay inside their own feature.

---

## Rule for app-level components

If a component is shared between several features but is not a UI primitive, it may stay in:

```txt
apps/web/src/components/
```

Examples:

```txt
AppHeader
AppFooter
MainNavigation
ThemeToggle
UserMenu
```

Do not put them inside `components/ui`, because they are not UI primitives.

---

## Promotion rule

When a component, hook or utility is used by more consumers, it must be promoted to the proper level.

Scheme:

```txt
page/local → feature → app → packages
```

### Component example

```txt
Used only by LoginForm
→ features/auth/components

Used by LoginForm and SignupForm
→ features/auth/components

Used by auth and books
→ apps/web/src/components

It is a generic UI primitive
→ apps/web/src/components/ui
```

### Hook example

```txt
Used only by the books feature
→ features/books/hooks

Used by several web features
→ apps/web/src/hooks

It is a pure function without React
→ packages/*
```

### Type example

```txt
LoginForm-specific type
→ features/auth/types

Book, User, Loan, Location type
→ packages/types
```

### Translation example

```txt
Dictionaries and the pure getTranslation function
→ packages/translation

React hook useTranslation
→ apps/web/src/hooks/useTranslation.ts
```

---

## Ban on cross-feature imports

A feature must not import internal files of another feature directly.

Wrong example:

```ts
import { Something } from "@/features/books/components/BookCard";
```

inside:

```txt
features/auth
```

If a component or a function is needed by several features, it must be promoted to:

```txt
apps/web/src/components
apps/web/src/hooks
apps/web/src/lib
packages/*
```

depending on the case.

---

## Import rule

Prefer the configured aliases of the web app:

```ts
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { routes } from "@/config/routes";
```

Avoid long relative imports:

```ts
import { Button } from "../../../../components/ui/button";
```

Relative imports are acceptable only between very close files in the same feature.

---

## Rule on `index.ts` barrels

`index.ts` barrels are allowed, but not mandatory everywhere.

Use them when they improve import readability.

### Recommended barrels

```txt
features/<feature>/components/index.ts
features/<feature>/hooks/index.ts
packages/<package>/src/index.ts
```

### Optional barrels

```txt
features/<feature>/index.ts
apps/web/src/components/index.ts
apps/web/src/hooks/index.ts
```

### Barrels to avoid if useless

Do not create empty `index.ts` files or ones used only to satisfy an abstract convention.

Do not create barrels that generate circular imports.

Do not create barrels if the feature has a single file and the direct import is clearer.

---

## Rule on empty folders

Do not create empty folders.

Do not create orphan barrels.

Wrong example:

```txt
features/books/
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
└── schemas/
```

if real components, hooks or schemas do not exist yet.

Create the folders only when they contain at least one useful file.

---

## Rule on `config/`

The folder:

```txt
apps/web/src/config/
```

contains web app-specific configurations.

Examples:

```txt
routes.ts
navigation.ts
metadata.ts
```

The web routes must be here:

```txt
apps/web/src/config/routes.ts
```

Do not put them in:

```txt
packages/config
```

because they are specific to Next.js and to the web app.

---

## Rule on `packages/config`

The package:

```txt
packages/config
```

contains general, shareable configurations.

Examples:

```txt
app.config.ts
auth.config.ts
constants.ts
```

Correct contents:

```txt
app name
app description
default language
authors
publisher
minimum password length
shared constants
```

Wrong contents:

```txt
Next.js routes
metadata typed with Next's Metadata
Tailwind classes
React hooks
UI components
```

`packages/config` must not depend on Next.js.

---

## Rule on `packages/types`

The package:

```txt
packages/types
```

contains shared domain types.

Correct examples:

```txt
User
SessionUser
Book
Location
Coordinates
LoanRequest
BookVisibility
BookStatus
```

Wrong examples:

```txt
LoginFormValues
SignupFormValues
AuthFormState
```

The form types remain in the web feature until they actually become shared.

---

## Rule on `packages/translation`

The package:

```txt
packages/translation
```

contains the shared translation dictionaries.

Expected structure:

```txt
packages/translation/
└── src/
    ├── dictionaries/
    │   ├── it.ts
    │   └── en.ts
    ├── get-translation.ts
    ├── types.ts
    └── index.ts
```

Rules:

```txt
it.ts is the source of truth.
en.ts must keep the same structure as it.ts.
Keys must not be translated.
Only textual values must be translated.
```

The React translation logic must not live in the package.

Example:

```txt
packages/translation/src/dictionaries/it.ts
packages/translation/src/dictionaries/en.ts
apps/web/src/hooks/useTranslation.ts
```

---

## Rule on `packages/db`

The package:

```txt
packages/db
```

will contain the database logic.

Expected responsibilities:

```txt
Prisma Client
Prisma schema
shared queries
seed
migrations
PostgreSQL access
PostGIS support
```

Do not introduce database logic inside React features if it is reusable.

---

## Rule on `packages/geo`

The package:

```txt
packages/geo
```

contains pure geospatial logic.

Examples:

```txt
calculateDistance
approximateCoordinates
toGeoJsonFeature
normalizeCoordinates
```

It must not contain React map components.

React components with MapLibre must be in:

```txt
apps/web/src/features/nearby/components
```

or, if app-level:

```txt
apps/web/src/components
```

---

## Rule on `packages/ai`

The package:

```txt
packages/ai
```

contains the real AI code of the project.

Future examples:

```txt
extractIsbnFromText
normalizeBookMetadata
rankBookResults
suggestBookTags
```

OpenCode skills must not be in `packages/ai`.

Skills must be in:

```txt
.opencode/skills/<skill-name>/SKILL.md
```

---

## Rule on OpenCode skills

The operational skills of the agents must be in:

```txt
.opencode/skills/
```

Scheme:

```txt
.opencode/skills/
├── project-context/
│   └── SKILL.md
├── git-commits/
│   └── SKILL.md
├── pre-push-sync-knowledge/
│   └── SKILL.md
├── translations/
│   └── SKILL.md
└── project-scaffolding/
    └── SKILL.md
```

Every skill must have frontmatter:

```md
---
name: project-scaffolding
description: Defines the required project structure and scaffolding rules for the Culturando Nx monorepo.
---
```

The `name` field must match the name of the folder.

---

## Rule for new packages

When a new package is created under `packages/*`, it must have at least:

```txt
packages/<name>/
├── package.json
└── src/
    └── index.ts
```

The `package.json` must use consistent naming:

```json
{
  "name": "@culturando/<name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

---

## Rule on dependencies between packages

The dependencies between packages must remain clear.

Acceptable examples:

```txt
packages/ai       → may depend on packages/types and packages/config
packages/geo      → may depend on packages/types
packages/db       → may depend on packages/types and packages/config
apps/web          → may depend on all the packages it needs
```

Avoid inverse dependencies:

```txt
packages/types    → must not depend on apps/web
packages/config   → must not depend on Next.js
packages/geo      → must not depend on React components
packages/ai       → must not depend on components/ui
```

---

## Rule on React hooks

React hooks must be in:

```txt
apps/web/src/hooks
```

if they are shared between several features.

They must be in:

```txt
apps/web/src/features/<feature>/hooks
```

if they are specific to a feature.

Examples:

```txt
apps/web/src/hooks/useTranslation.ts
features/books/hooks/useBookFilters.ts
features/auth/hooks/useLoginForm.ts
```

Do not put React hooks in `packages/*`, unless a dedicated React package is explicitly created.

---

## Rule on utilities

The web app-specific utilities go in:

```txt
apps/web/src/lib
```

Examples:

```txt
cn
formatClassName
client-side helpers
```

The pure and shareable utilities go in:

```txt
packages/*
```

Examples:

```txt
calculateDistance      → packages/geo
getTranslation         → packages/translation
normalizeBookMetadata  → packages/ai
```

Do not create scattered `utils/` folders without reason.

---

## Rule on hardcoded texts

As long as the `packages/translation` package is not active, temporary texts may stay in:

```txt
features/<feature>/constants
```

Example:

```txt
features/auth/constants/auth-copy.ts
```

After the introduction of `packages/translation`, the UI texts must be moved into the dictionaries.

The components will have to use a hook such as:

```ts
const t = useTranslation();
```

and keys such as:

```ts
t("auth.login.title")
```

---

## Rule on refactors

Agents must not reorganize existing structures without an explicit request from the user.

Moving files is allowed only if:

```txt
- the user requested a refactor;
- the current task clearly requires it;
- the file is in the wrong place according to this skill;
- the change is small, safe and justified.
```

Do not perform broad architectural refactors "on your own initiative".

If the repo contains a legacy structure, respect it until the user explicitly asks to migrate it.

---

## Rule for new features

When a new feature is created, use this minimal scheme:

```txt
features/<feature>/
├── components/
└── index.ts    # optional
```

Add other folders only when needed.

Example for `books`:

```txt
features/books/
├── components/
│   ├── BookCard.tsx
│   └── BookGrid.tsx
├── mocks/
│   └── books.mock.ts
├── schemas/
│   └── book.schema.ts
├── types/
│   └── book-form.types.ts
└── index.ts
```

---

## Rule for new routes

When a new Next.js route is created:

```txt
apps/web/src/app/<route>/page.tsx
```

the page must import components from the feature.

Example:

```txt
apps/web/src/app/books/page.tsx
apps/web/src/features/books/components/BookGrid.tsx
```

The route must not become the main container of the logic.

---

## Rule for the dashboard

The dashboard will be a feature and a private route.

Expected structure:

```txt
apps/web/src/app/dashboard/page.tsx
apps/web/src/features/dashboard/
```

The `/dashboard` route must remain thin.

The dashboard logic must be in:

```txt
features/dashboard
```

---

## Rule for books

The books feature must be in:

```txt
apps/web/src/features/books
```

Expected routes:

```txt
apps/web/src/app/books/page.tsx
apps/web/src/app/books/[slug]/page.tsx
apps/web/src/app/dashboard/books/new/page.tsx
```

Expected components:

```txt
BookCard
BookGrid
BookForm
```

Domain types such as `Book` must be in:

```txt
packages/types
```

Form types such as `BookFormValues` must be in:

```txt
features/books/types
```

---

## Rule for nearby and maps

The nearby feature must be in:

```txt
apps/web/src/features/nearby
```

React components related to MapLibre:

```txt
features/nearby/components
```

Pure geographic functions:

```txt
packages/geo
```

Examples:

```txt
NearbyAvailabilityMap       → features/nearby/components
calculateDistance           → packages/geo
approximateCoordinates      → packages/geo
```

---

## Rule for AI cataloging

The UI feature for assisted cataloging must be in:

```txt
apps/web/src/features/cataloging
```

The pure AI logic must be in:

```txt
packages/ai
```

Examples:

```txt
CatalogingUploadForm        → features/cataloging/components
extractIsbnFromText         → packages/ai
normalizeBookMetadata       → packages/ai
```

---

## Quick decision scheme

When you must create a file, use this logic:

```txt
Is it a Next.js route?
→ apps/web/src/app

Is it a generic UI component?
→ apps/web/src/components/ui

Is it a component shared between several features but not primitives?
→ apps/web/src/components

Is it a feature-specific component?
→ apps/web/src/features/<feature>/components

Is it a React hook shared between several features?
→ apps/web/src/hooks

Is it a React hook specific to a feature?
→ apps/web/src/features/<feature>/hooks

Is it a web route or web-specific configuration?
→ apps/web/src/config

Is it a web-specific technical utility?
→ apps/web/src/lib

Is it a shared domain type?
→ packages/types

Is it a shared configuration?
→ packages/config

Is it a translation?
→ packages/translation

Is it a pure geographic function?
→ packages/geo

Is it database logic?
→ packages/db

Is it pure AI logic?
→ packages/ai

Is it an OpenCode skill?
→ .opencode/skills/<name>/SKILL.md
```

---

## Correct examples

### Auth

```txt
apps/web/src/app/auth/login/page.tsx
apps/web/src/app/auth/signup/page.tsx
apps/web/src/features/auth/components/LoginForm.tsx
apps/web/src/features/auth/components/SignupForm.tsx
apps/web/src/features/auth/schemas/login.schema.ts
apps/web/src/features/auth/schemas/signup.schema.ts
apps/web/src/features/auth/actions/login.action.ts
apps/web/src/features/auth/actions/signup.action.ts
```

### UI

```txt
apps/web/src/components/ui/button.tsx
apps/web/src/components/ui/input.tsx
apps/web/src/components/ui/label.tsx
apps/web/src/components/ui/checkbox.tsx
```

### Config

```txt
packages/config/src/app.config.ts
packages/config/src/auth.config.ts
apps/web/src/config/routes.ts
```

### Types

```txt
packages/types/src/user.types.ts
packages/types/src/book.types.ts
packages/types/src/geo.types.ts
features/auth/types/auth-form.types.ts
```

---

## Wrong examples

```txt
apps/web/src/features/LoginForm.tsx
apps/web/src/components/ui/BookCard.tsx
packages/config/src/routes.ts
packages/types/src/login-form.types.ts
packages/ai/skills/project-context.md
apps/web/src/utils/format.ts
apps/web/src/pages/auth/login.tsx
```

Reasons:

```txt
LoginForm must be in features/auth/components
BookCard is a books domain item, not a UI primitive
routes.ts is web-specific, not shared config
login-form.types.ts is web/form-specific
OpenCode skills must be in .opencode/skills
generic parallel utils is not expected
Next App Router uses app/, not pages/
```

---

## Final rule

Every structural change must keep this separation clear:

```txt
app/           → Next.js routes
features/      → application functionality
components/ui  → generic UI primitives
components/    → web app shared components
hooks/         → web app shared React hooks
lib/           → web app utilities
config/        → web app configuration
packages/*     → shareable code
.opencode/     → operational skills for agents
```

If a new structure does not clearly fit into these rules, the agent must stop and propose the architectural choice before creating files or moving code.

The project must remain simple, predictable and scalable.

---
name: project-context
description: Culturando project context, architecture, stack, packages, product behavior. Use when needing technical or functional context for this repository.
---

# Culturando — Technical and functional project context

## 1. General project description

Culturando is a geolocated web platform designed to enhance, catalog and make consultable the private book collections of users. The main goal of the project is to allow a person to publish their own book collection, make it searchable by other users and foster consultations, exchanges, loans or simply the discovery of volumes located nearby.

The project started as a bachelor's thesis application in Computer Science, but it is designed with a realistic, modular and scalable technical approach. Culturando does not want to be only a digital catalog, but a system that combines book management, geolocation, privacy, territorial search and, in the future, AI-assisted cataloging features.

The central idea is to turn home libraries, personal collections and small private book collections into consultable and valuable cultural resources, while keeping the protection of the user and their location at the center.

## 2. Main goals

The main goals of Culturando are:

- allow users to register and manage a personal profile;
- allow the publication of private books and collections;
- create complete, organized and searchable book records;
- display books, users or cultural points on a map;
- find book availability near a given area;
- foster consultation, loan or contact requests between users;
- protect privacy by not showing precise coordinates;
- introduce assisted cataloging via OCR, ISBN and AI in the future;
- prepare a technical base that is reusable also for a future mobile app.

## 3. Current technical stack

The project uses a monorepo structure based on Nx and pnpm.

Main stack:

- Nx Monorepo;
- pnpm as the package manager;
- Next.js as the main web framework;
- React;
- TypeScript;
- Tailwind CSS v3;
- UI components inspired by shadcn/ui;
- `embla-carousel-react` for the shadcn-style UI Carousel primitive;
- graphical theme generated through tweakcn;
- Auth.js through the `next-auth` beta;
- Zod for form validation;
- Prisma as ORM and local database schema;
- PostgreSQL with the PostGIS extension for persistence and geospatial queries;
- MapLibre GL JS for interactive 2D/3D maps;
- optional Geoapify as the main address geocoding/autocomplete provider, with Nominatim/OpenStreetMap fallback;
- Cloudflare R2, through an S3-compatible client, for persistent cover storage;
- Nodemailer with SMTP for sending transactional account confirmation emails;
- Sonner for application notifications and interactive confirmations;
- `@culturando/assets` to centralize the shared public asset paths;
- `@culturando/translation` for shared dictionaries and textual keys;
- Biome for linting and formatting;
- shared packages under `packages/*`.

Stack planned for the following phases:

- possible AI/OCR pipeline for assisted cataloging;
- future React Native/Expo mobile app, not included in the initial MVP.

## 4. General architecture

Culturando follows a monorepo architecture with separation between applications and shared packages.

The conceptual structure is:

```txt
culturando/
├── apps/
│   └── web/
│       └── main Next.js application
│
├── packages/
│   ├── config/
│   ├── types/
│   ├── db/
│   ├── geo/
│   ├── ai/
│   ├── assets/
│   └── translation/
│
├── package.json
├── pnpm-workspace.yaml
├── nx.json
├── tsconfig.base.json
└── biome.json
```

The main architectural rule is:

- `apps/web` contains web app-specific code: pages, routes, React components, UI features, forms, layouts and interactions.
- `packages/*` contains code that is shareable and independent of the single app: types, configurations, geographic utilities, database access, AI functions, translations.

This distinction helps avoid duplication and prepares the project for a future mobile extension.

## 5. Web application: `apps/web`

The web app is developed with Next.js and uses the App Router.

The recommended and current structure is feature-based:

```txt
apps/web/src/
├── app/
├── components/
├── config/
├── features/
├── hooks/
├── auth.ts
└── lib/
```

### 5.1 `app/`

The `app/` folder contains exclusively the Next.js routing.

Example:

```txt
apps/web/src/app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── layout.tsx
├── page.tsx
├── global.css
└── auth/
    ├── page.tsx
    ├── login/
    │   └── page.tsx
    └── signup/
        └── page.tsx
```

The pages inside `app/` must remain thin. They must not contain complex logic, validations, long forms or business logic. They must compose layouts and call components from the features.

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

### 5.2 `components/ui`

The `components/ui` folder contains generic and reusable components, inspired by the shadcn/ui pattern.

Examples:

```txt
apps/web/src/components/ui/
├── badge.tsx
├── button.tsx
├── card.tsx
├── carousel.tsx
├── checkbox.tsx
├── dropdown-menu.tsx
├── dropdown-select.tsx
├── input.tsx
├── page.tsx
├── pagination.tsx
├── progress.tsx
├── radio-group.tsx
├── theme-toggle.tsx
├── tooltip.tsx
├── wizard.tsx
└── label.tsx
```

These components must not know the Culturando domain. They must be generic.

Correct:

- `Button`;
- `Input`;
- `Label`;
- `Card`;
- `Carousel`, based on `embla-carousel-react`, for accessible image/content sliders;
- `Badge`;
- `Checkbox`;
- `DropdownMenu` and `DropdownSelect` for accessible menus and dropdowns based on Radix/shadcn;
- `PageShell`, `PageContainer`, `PageHeader`, `PageTitle` and responsive page primitives;
- `Pagination` and related primitives for shadcn-style pagination;
- `Progress`;
- `RadioGroup`;
- `ThemeToggle`;
- `Tooltip`;
- `Wizard` for guided flows with stepper and progress bar;
- future `Textarea`;
- future `Dialog`.

Not correct:

- `LoginForm`;
- `BookCard`;
- `NearbyAvailabilityMap`;
- `UserLibraryCard`.

The domain components must stay inside their respective features.

The web app-specific shared components that do not belong to the generic shadcn-like set may stay directly in `apps/web/src/components`. Current example: `BrandLogo`, which renders the light/dark variants of the Culturando logo using the paths centralized in `@culturando/assets`.

### 5.3 `features/`

The `features/` folder contains the application functionality of the web app.

Current features:

```txt
apps/web/src/features/auth/
├── actions/
│   ├── login.action.ts
│   └── signup.action.ts
├── components/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── schemas/
│   ├── login.schema.ts
│   └── signup.schema.ts
└── types/
    └── auth-form.types.ts

apps/web/src/features/books/
├── actions/
│   ├── books.repository.ts
│   └── create-book.action.ts
├── components/
│   ├── BookCard.tsx
│   ├── BookDetail.tsx
│   ├── BookForm.tsx
│   ├── BookGrid.tsx
│   ├── BooksCatalog.tsx
│   ├── NearbyBooks.tsx
│   ├── NearbyMap.tsx
│   └── NewBookPlaceholder.tsx
├── mocks/
│   └── books.mock.ts
├── schemas/
│   └── book.schema.ts
└── types/
    └── book-form.types.ts

apps/web/src/features/nearby/
└── components/
    └── NearbySearchPage.tsx

apps/web/src/features/location/
└── actions/
    └── search-address-suggestions.action.ts

apps/web/src/features/requests/
├── actions/
│   ├── create-loan-request.action.ts
│   ├── cancel-loan-request.action.ts
│   ├── loan-requests.repository.ts
│   └── update-loan-request-status.action.ts
├── components/
│   ├── LoanRequestForm.tsx
│   ├── ReceivedLoanRequests.tsx
│   └── SentLoanRequests.tsx
├── schemas/
│   └── loan-request.schema.ts
└── types/
    └── loan-request-form.types.ts
```

This subdivision allows isolating UI, validation, actions and types related to the same feature.
The reusable texts must not be duplicated in the features: when a key exists, they must go through `@culturando/translation` and the web `useTranslation` hook.

The `location` feature contains a server action wrapper towards `@culturando/geo` for address/autocomplete suggestions. The main provider is Geoapify when `GEOAPIFY_API_KEY` is configured, with Nominatim/OpenStreetMap fallback; the action is reused by the profile and by book publishing without cross-imports between features.

In the future, features such as the following will be planned:

```txt
features/cataloging/
```

Every feature must contain only the code specific to the functionality.

### 5.4 `config/routes.ts`

The routes of the web app are centralized in:

```txt
apps/web/src/config/routes.ts
```

Example:

```ts
export const routes = {
  home: "/",
  auth: "/auth",
  login: "/auth/login",
  signup: "/auth/signup",
  dashboard: "/dashboard",
  nearby: "/nearby",
  books: "/books",
  bookDetail: (bookId: string) => `/books/${bookId}`,
  nearbyBooks: (bookId: string) => `/books/${bookId}/nearby`,
  newBook: "/dashboard/books/new",
} as const;
```

The routes remain inside `apps/web` because they are specific to the Next.js web app. They must not be moved to `packages/config`, because a future mobile app will not necessarily use the same paths.

### 5.5 `lib/utils.ts`

Contains technical utilities shared in the web app.

Typical example:

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This utility is used by the UI components to compose Tailwind classes.

## 6. Shared packages

The shared packages are located under:

```txt
packages/
```

The goal is to write once the logic and definitions reusable in several contexts.

### 6.1 `packages/config`

Contains general configurations and shared constants.

Structure:

```txt
packages/config/
├── package.json
└── src/
    ├── app.config.ts
    ├── auth.config.ts
    ├── constants.ts
    └── index.ts
```

Responsibilities:

- application name;
- application description;
- default language;
- authors;
- publisher;
- generic auth rules, such as minimum password length;
- shared constants.

Example:

```ts
export const appConfig = {
  name: "Culturando",
  description:
    "Piattaforma web geolocalizzata per valorizzare e condividere patrimoni librari privati.",
  defaultLocale: "it",
  authors: [
    {
      name: "Luigi Avitabile",
    },
  ],
  publisher: "Culturando",
} as const;
```

The `config` package must not depend on Next.js. It must not import `Metadata` from `next`. The Next metadata are built in the web app layout using the `appConfig` values.

### 6.2 `packages/types`

Contains shared TypeScript domain types.

Structure:

```txt
packages/types/
├── package.json
└── src/
    ├── auth.types.ts
    ├── user.types.ts
    ├── book.types.ts
    ├── geo.types.ts
    ├── loan.types.ts
    └── index.ts
```

Responsibilities:

- user types;
- session types;
- book types;
- coordinate types;
- loan/consultation request types;
- types reusable also by the web app, mobile, database, API or scripts.

Examples:

```ts
export type UserRole = "user" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};
```

React form-specific types must not stay here, such as:

```ts
LoginFormValues
SignupFormValues
LoginFormState
```

These remain in the auth feature of the web app.

### 6.3 `packages/db`

Shared package for database management.

Current responsibilities:

- Prisma Client;
- Prisma schema;
- shared client exported as `prisma`;
- local PostgreSQL through Docker Compose with the PostGIS image;
- PostGIS extension initialized through the root `db:postgis` script;
- root scripts for `db:up`, `db:down`, `db:logs`, `db:postgis`, `db:generate`, `db:push`, `db:migrate:dev` and `db:studio`.

Future responsibilities:

- shared queries;
- seed;
- migrations.

Current structure:

```txt
packages/db/
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── client.ts
    └── index.ts
```

The current Prisma schema models `User`, `EmailVerificationToken`, `Book`, `BookStats`, `BookLocation`, `BookImage` and `LoanRequest`, with enums for user role, greeting preference, availability, visibility, physical condition and image source. `User.emailVerifiedAt` enables blocking login for unconfirmed accounts; `User.salutationPreference` stores the grammatical greeting preference (`masculine`, `feminine`, `neutral`) used by the dashboard to show `Benvenuto`, `Benvenuta` or `Benvenuto` without collecting unnecessary sensitive data. `EmailVerificationToken` stores the token hash and the expiry for the email link. The web app uses Prisma for the real persistence of the books: the books feature saves and reads `Book`, `BookLocation` and `BookImage` from the local PostgreSQL database. In development, PostgreSQL/PostGIS runs through Docker on the host port `5433`, to avoid conflicts with any local databases already active on `5432`. The `pnpm dev` script starts the PostgreSQL/PostGIS container, creates the PostGIS extension if needed and then starts the web app.

### 6.4 `packages/geo`

Shared package for pure geospatial logic.

Current responsibilities:

- coordinate normalization;
- coordinate approximation for privacy;
- address -> coordinate geocoding through the Geoapify adapter when `GEOAPIFY_API_KEY` is configured, with Nominatim/OpenStreetMap fallback;
- shared address autocomplete through `searchAddressSuggestions`, used by the profile and the book form;
- address normalization in the `via/corso civico, città, provincia` format through `formatStructuredAddress`;
- functions reusable by the web, API and mobile.

Future responsibilities:

- distance calculation;
- GeoJSON conversion;
- replacement or pairing of Nominatim with a more stable provider, cloud or self-hosted.

Current/future examples:

```ts
geocodeAddress()
calculateDistance()
approximateCoordinates()
normalizeCoordinates()
generatePublicLocation()
toGeoJsonFeature()
```

Nominatim is a temporary and pragmatic choice for the MVP: the code must remain isolated behind the `geocodeAddress` adapter, so the web app does not depend directly on the provider and will be able to switch to a cloud, commercial or self-hosted geocoder without changing the application domain.

### 6.5 `packages/ai`

Shared package for assisted cataloging and AI functions.

Current responsibilities:

- book metadata lookup by ISBN or title through the Open Library adapter;
- ISBN extraction from text with ISBN-10/ISBN-13 validation via check digit;
- provider-agnostic OCR adapter `extractTextFromImage` to send images to an external endpoint;
- support for the Cloudflare OCR flow through a Worker configurable by the web app;
- versioned reference file `packages/ai/cloudflare-ocr-worker.js`, to be kept aligned with the deployed Cloudflare Worker when the prompt or the OCR response contract changes.

Future responsibilities:

- advanced book metadata normalization;
- categories and tags suggestion;
- results ranking;
- possible support for alternative OCR providers or local OCR.

Current/future examples:

```ts
extractIsbnFromText()
extractIsbnsFromText()
lookupBookMetadataByIsbn()
lookupBookMetadataByTitle()
extractTextFromImage()
normalizeBookMetadata()
rankBookResults()
suggestBookTags()
```

### 6.6 `packages/assets`

Shared package to centralize the public paths of the static assets and uploads served by the web app.

Current structure:

```txt
packages/assets/
├── package.json
└── src/
    └── index.ts
```

Current responsibilities:

- expose `assets.favicon`;
- expose `assets.logo` with full and mark variants for the light/dark theme;
- expose `assets.icons` with light/dark SVG favicons based on `prefers-color-scheme`, apple touch icon, manifest and PWA icons;
- expose static images, such as `assets.images.loginPage`;
- expose URL builders for local public uploads, such as `assets.uploads.bookCover(fileName)`.

The package does not contain the binary files: the static assets continue to live under `apps/web/public`, while the package centralizes only reusable references and paths.

### 6.7 `packages/translation`

Shared package for i18n management.

Motivations:

- avoid hardcoded texts in the components;
- centralize translations;
- prepare future reuse in the mobile app;
- improve cleanliness and maintainability;
- make it easier to add English or other languages.

Current structure:

```txt
packages/translation/
├── package.json
└── src/
    ├── dictionaries/
    │   ├── it.ts
    │   └── en.ts
    ├── get-translation.ts
    ├── types.ts
    └── index.ts
```

The package must contain dictionaries and pure functions. The React hook `useTranslation` should not stay in the shared package, but in the web app:

```txt
apps/web/src/hooks/useTranslation.ts
```

Reason: `useTranslation` is React-specific, while `packages/translation` must remain independent of the UI.

Current responsibilities:

- centralize the `it` and `en` dictionaries;
- expose the `Locale` type;
- expose the `TranslationKey` type derived from the Italian dictionary;
- expose `getTranslation(key, locale)` as a pure function;
- fall back to Italian when needed.

The web app consumes the translations through:

```txt
apps/web/src/hooks/useTranslation.ts
```

The React components must use:

```tsx
const t = useTranslation();
```

and then keys such as:

```tsx
t("auth.login.title")
```

This way a future mobile app will be able to reuse the same dictionaries and the same pure function, keeping a separate React-specific hook.

Desired usage:

```tsx
const t = useTranslation();

<h1>{t("auth.login.title")}</h1>
<Button>{t("auth.login.submitLabel")}</Button>
```

## 7. Auth feature

The auth feature is the first concrete feature of the project.

### 7.1 Routes

The routes are:

```txt
/api/auth/[...nextauth]
/auth
/auth/confirm-email
/auth/login
/auth/signup
```

The `/auth` route may redirect to `/auth/login`.

Auth.js is configured in:

```txt
apps/web/src/config/auth.ts
```

The Auth.js API route exposes the handlers in:

```txt
apps/web/src/app/api/auth/[...nextauth]/route.ts
```

Current configuration:

- `next-auth` beta;
- JWT session strategy;
- custom login page on `/auth/login`;
- Credentials provider connected to the real users in the PostgreSQL database through Prisma;
- login allowed only for users with a populated `emailVerifiedAt`;
- session enriched with `session.user.id`, matching the real id of the `User` table;
- session enriched with `session.user.salutationPreference`, derived from `User.salutationPreference`;
- passwords stored as `scrypt` hashes with salt, through the server-side utility in `apps/web/src/lib/password.ts`.

Variables required by Auth.js:

```txt
AUTH_SECRET=
AUTH_URL=http://localhost:3000
```

### 7.2 Login

The login page is composed of:

```txt
apps/web/src/app/auth/login/page.tsx
apps/web/src/features/auth/components/LoginForm.tsx
apps/web/src/features/auth/schemas/login.schema.ts
apps/web/src/features/auth/actions/login.action.ts
```

Responsibilities:

- show the email/password form;
- handle remember me;
- validate input with Zod;
- call Auth.js through `signIn("credentials")`;
- show a translated error when the credentials are not valid;
- link to the signup.

### 7.3 Signup

The signup page is composed of:

```txt
apps/web/src/app/auth/signup/page.tsx
apps/web/src/features/auth/components/SignupForm.tsx
apps/web/src/features/auth/schemas/signup.schema.ts
apps/web/src/features/auth/actions/signup.action.ts
```

Responsibilities:

- show the name/email/password/confirm password form;
- collect the grammatical greeting preference through `RadioGroup` (`masculine`, `feminine`, `neutral`);
- guide the user through a `Wizard` with account data, security and summary steps;
- check email availability while the user types and block proceeding if it is already used;
- validate input with Zod;
- verify password match;
- create a real, not yet verified user in PostgreSQL through Prisma;
- save `salutationPreference` on the user record;
- generate an email confirmation token saved as a hash in `EmailVerificationToken`;
- send the confirmation email through Nodemailer and SMTP;
- show a Sonner notification confirming the email sending;
- save the password as a hash, never in clear text;
- link to the login.

The dashboard uses `session.user.salutationPreference` to choose the form of the welcome title. This information must be treated as a UI/language preference, not as sexual orientation or sensitive data.

The `/auth/verify-email?token=...` route confirms the token, populates `User.emailVerifiedAt`, deletes the residual tokens of the user and shows a thank-you page with a CTA towards the login. Without a valid token it shows a dedicated state for missing, invalid or expired token, so the success page is reachable only by going through the email link.

Supported email variables:

```txt
EMAIL_PROVIDER=console
RESEND_API_KEY=""
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASSWORD="$RESEND_API_KEY"
SMTP_FROM="Culturando <noreply@culturando.app>"
SMTP_SECURE="true"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In local development `EMAIL_PROVIDER=console` avoids SMTP sending and prints the verification link in the server logs. To send real transactional email through Resend, use `EMAIL_PROVIDER=resend` or leave it different from `console`; the app still sends through Nodemailer SMTP. When `SMTP_PASSWORD="$RESEND_API_KEY"`, the mailer resolves it from `RESEND_API_KEY` at runtime. Until `culturando.app` is verified in Resend, local manual testing can use `SMTP_FROM="Culturando <onboarding@resend.dev>"`.

### 7.4 Zod validation

Zod is used to validate login and signup.

Login:

- email required;
- valid email;
- password required;
- password with minimum length from `authConfig`;
- rememberMe converted through `z.coerce.boolean()`.

Signup:

- name required;
- email required and valid;
- password required;
- password with minimum and maximum length from `authConfig`;
- confirm password required;
- password/confirmPassword check through `.refine()`.

The schemas remain in the auth feature because today they are web form schemas. In the future, if some rules become shared between web, mobile and backend, they may be moved into a dedicated package such as `packages/validators`.

## 8. Global layout and metadata

The global layout is located in:

```txt
apps/web/src/app/layout.tsx
```

Responsibilities:

- import `global.css`;
- register global fonts with `next/font/google`;
- build the Next metadata starting from `appConfig`;
- set the HTML language using `appConfig.defaultLocale`;
- render the app body.

The layout must import the type:

```ts
import type { Metadata } from "next";
```

The metadata must be built in the web app, not in the config package.

Correct example:

```ts
export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  authors: appConfig.authors,
  publisher: appConfig.publisher,
};
```

## 9. Styling and UI

The project uses Tailwind CSS v3.

The global file is:

```txt
apps/web/src/app/global.css
```

It contains:

- Tailwind directives;
- theme CSS variables;
- dark mode support;
- colors generated by tweakcn;
- font variables, with Poppins as sans-serif and Lora as serif;
- global responsive tokens `--page-padding-x`, `--page-padding-y` and `--section-gap`;
- radius;
- shadow tokens;
- base layer.

The theme uses HSL variables compatible with Tailwind v3 and shadcn-like components. The homepage exposes a `ThemeToggle` that applies/removes the `.dark` class on `document.documentElement`, persists the choice in `localStorage` and uses the system preference when no saved choice exists.

The page layouts must prefer the responsive primitives in `components/ui/page.tsx` (`PageShell`, `PageContainer`, `PageHeader`, `PageTitle`, `ResponsiveActions`) instead of duplicating padding, max-width and headings in the single features.

The Tailwind configuration is:

```txt
apps/web/tailwind.config.js
```

It must include:

- `darkMode: ["class"]`;
- `content` pointing to `src/app`, `src/components`, `src/features`, `src/lib`;
- colors based on `hsl(var(--...))`;
- radius based on `--radius`;
- font families based on `--font-sans`, `--font-serif`, `--font-mono`;
- any shadow tokens;
- the `tailwindcss-animate` plugin, if installed.

## 10. Architectural conventions

### 10.1 `app/` rule

`app/` must contain only routes, layouts, metadata, loading/error/not-found and page composition.

It must not contain:

- complex forms;
- business logic;
- validations;
- utilities;
- long feature components.

### 10.2 `features/` rule

Every feature contains its own application logic:

```txt
components/
schemas/
actions/
types/
constants/
mocks/
```

The features must be autonomous and readable.

### 10.3 `components/ui` rule

It contains only generic UI components.

If a component knows the Culturando domain, it must not go in `components/ui`.

### 10.4 `packages/*` rule

The packages contain shareable code, not specific to the single app.

If something can be useful to the web, mobile, API or scripts, it may stay in `packages`.

If it is only useful to the web app, it remains in `apps/web`.

## 11. Main future features

### 11.1 Dashboard

The dashboard is the private area of the user and is protected through the Auth.js session.

Current structure:

```txt
apps/web/src/app/dashboard/page.tsx
apps/web/src/app/dashboard/admin/page.tsx
apps/web/src/app/dashboard/profile/page.tsx
apps/web/src/features/dashboard/components/DashboardOverview.tsx
apps/web/src/features/dashboard/actions/dashboard-stats.repository.ts
```

The `/dashboard` route uses `auth()` on the server side. If a valid session does not exist, it redirects to `/auth/login`.

Current responsibilities:

- verify the `login -> session -> dashboard -> logout` flow;
- show the base data of the Auth.js session;
- expose a CTA towards book creation;
- expose logout through `logoutAction`;
- show the requests received on the user's books;
- allow the owner to accept or reject requests still `pending`;
- show personal usage statistics on the user's books, including views, received requests, pending requests and most viewed books;
- show the books published by the user in the dashboard using the same cover-format cards as the catalog;
- expose access to profile editing;
- expose access to the administrative dashboard only when `session.user.role` is `admin`.

Planned functionality:

- adding new books;
- quick access to the cataloging functions.

Planned/current routes:

```txt
/dashboard                # current, protected placeholder
/dashboard/books/new      # current, protected book form
/dashboard/profile        # current, MVP user profile
/dashboard/admin          # current, protected administrative dashboard for admins
/dashboard/books          # planned
```

### 11.1.1 User profile

The profile feature allows the authenticated user to manage the descriptive data of their own profile without exposing sensitive information or precise coordinates.

Current structure:

```txt
apps/web/src/app/dashboard/profile/page.tsx
apps/web/src/features/profile/
├── actions/
│   ├── check-profile-nickname.action.ts
│   ├── profile-avatar-storage.ts
│   ├── profile.repository.ts
│   ├── search-address-suggestions.action.ts
│   └── update-profile.action.ts
├── components/
│   └── ProfileForm.tsx
├── schemas/
│   └── profile.schema.ts
└── types/
    └── profile-form.types.ts
```

Current functionality:

- protected route `/dashboard/profile`;
- profile reading through `getUserProfile`;
- update through the `updateProfileAction` server action;
- Zod validation of full name, nickname, avatar, biography, domicile and profile visibility;
- avatar upload from the device through `profile-avatar-storage`, with R2 when configured and local fallback in `apps/web/public/uploads/profile-avatars`;
- nickname unique at the DB level, checked live by the form and changeable every 90 days;
- domicile managed through the shared `@culturando/geo` autocomplete on a single input, with Geoapify when configured and Nominatim fallback, saving `addressLabel`, `postalCode`, `city`, `province` and `region`;
- profile fields saved directly on the `User` model: `name`, `nickname`, `nicknameUpdatedAt`, `avatarUrl`, `bio`, `addressLabel`, `postalCode`, `city`, `province`, `region`, `isProfilePublic`;
- email shown as an account data field not editable from the profile form;
- UI texts centralized in `@culturando/translation`.

### 11.1.2 User settings

The protected route `/dashboard/settings` contains the application preferences of the user.

Current functionality:

- settings page reachable from the user dropdown in the floating bar;
- app language selection between Italian and English;
- language persistence in `localStorage` and in the `culturando-locale` cookie;
- reactive update of the client texts through `LocaleProvider` and `useTranslation`;
- Sonner confirmation notification when the language changes.

### 11.1.3 Administrative dashboard

The administrative dashboard covers the requirement of the topic related to dashboard and aggregate metrics of the prototype.

Current structure:

```txt
apps/web/src/app/dashboard/admin/page.tsx
apps/web/src/features/admin/
├── actions/
│   └── admin-stats.repository.ts
└── components/
    └── AdminDashboard.tsx
```

Current functionality:

- protected route `/dashboard/admin`;
- access allowed only to users with role `admin` in the Auth.js session;
- `session.user.role` is populated through the JWT callback in `apps/web/src/config/auth.ts`;
- global statistics on users, books, requests and views;
- count of public and private books;
- count of `pending`, `accepted`, `rejected` and `cancelled` requests;
- list of the most recently registered users;
- list of the most recently published books with a link to the detail.

### 11.1.4 Requests / contact-loan requests

The requests feature completes the first interactive flow of the MVP: an authenticated user can send a request for an available public book and the owner can manage it from the dashboard.

Current functionality:

- `LoanRequestForm` form in the book detail `/books/[bookId]`;
- request types `consultation`, `loan`, `info`;
- optional message up to 800 characters;
- `createLoanRequestAction` server action with session check;
- sending blocked if the user is not authenticated, if the book is not public/requestable or if the user owns the book;
- real persistence through the Prisma `LoanRequest` model;
- `ReceivedLoanRequests` list in the dashboard;
- owner actions `Accetta` and `Rifiuta` through `updateLoanRequestStatusAction`;
- status update allowed only to the owner and only for `pending` requests;
- protected page `/dashboard/requests` to view the requests sent by the requester;
- `SentLoanRequests` list with book, owner, status, request type and sent message;
- cancellation of the sent requests still `pending` through `cancelLoanRequestAction`;
- UI texts centralized in `@culturando/translation`.

Still planned functionality:

- notifications/emails;
- messaging or contact exchange after acceptance.

### 11.2 Books

The books feature was introduced as the first functional flow after auth and dashboard.

Current functionality:

- public catalog `/books`;
- loading route `/books/loading.tsx` with a skeleton grid of book covers;
- public book detail `/books/[bookId]`;
- client-side search in the catalog by title, author, ISBN, publisher, city, category and description;
- client-side filters by status and visibility;
- book card with title, author, description, ISBN, status, visibility, language and main image when present;
- initial mock data in `features/books/mocks/books.mock.ts`;
- protected new book form in `/dashboard/books/new`;
- Zod validation in `features/books/schemas/book.schema.ts`;
- `createBookAction` server action;
- single book fetch through `getBookById`;
- real persistence of the books through Prisma and PostgreSQL in `features/books/actions/books.repository.ts`;
- association of the new books to `session.user.id`, that is to the real authenticated user;
- address geocoding during saving through `@culturando/geo`;
- saving of private coordinates (`latitude`, `longitude`) and approximate public coordinates (`publicLatitude`, `publicLongitude`);
- revalidation of the `/books` route after saving;
- dynamic `/books` route to read the updated catalog from the database;
- UI texts centralized in `@culturando/translation`;
- consolidated `Book` MVP domain with bibliographic fields, readable address and multiple images;
- the user enters an address, not manual coordinates; the system geocodes automatically when possible and keeps a silent fallback if the provider does not respond;
- cover and front/back image upload from the new book form through the `book-cover-storage` adapter, saving on Cloudflare R2 when the `R2_*` variables are configured and local fallback in `apps/web/public/uploads/book-covers`; the first uploaded image remains the primary image;
- support for additional image URLs in the book form;
- cover search by ISBN through Open Library directly in the form, with client-side preview and copy of the found cover into the configured storage when possible;
- server-side fallback towards Open Library during saving when the user does not upload images but provides an ISBN;
- additional manual image URLs kept as external references, without automatic copy into the storage;
- assisted cataloging in the new book form through Open Library metadata lookup by ISBN or OCR title, with data proposal and explicit/manual application when requested;
- ISBN extraction from pasted text or OCR text, through `@culturando/ai`;
- upload of one or two images for OCR in the new book form, through a server action that calls an optional Cloudflare OCR endpoint; the first step remains blocked until the external service finishes the recognition;
- view counter through `BookStats` when the detail page `/books/[bookId]` is opened;
- display of the number of views in the book detail card.

Still planned functionality:

- advanced availability status management;
- integration with geolocation and nearby availability.

Current structure:

```txt
features/books/
├── actions/
│   ├── book-cover-storage.ts
│   ├── books.repository.ts
│   └── create-book.action.ts
├── components/
│   ├── BookCard.tsx
│   ├── BookDetail.tsx
│   ├── BookGrid.tsx
│   ├── BooksCatalog.tsx
│   ├── BookForm.tsx
│   └── NewBookPlaceholder.tsx
├── mocks/
│   └── books.mock.ts
├── schemas/
│   └── book.schema.ts
└── types/
    └── book-form.types.ts
```

### 11.3 Nearby / nearby availability

The nearby feature allows searching for public books near an area or a specific book, using only approximate public coordinates to protect user privacy.

Current functionality:

- public route `/nearby` with a search form by city or address;
- geocoding of the searched area through `@culturando/geo`, with Geoapify when configured and Nominatim/OpenStreetMap fallback;
- search radius selection: 5 km, 10 km, 25 km, 50 km;
- `/books/[bookId]/nearby` route to find books near a specific book;
- accessible textual list ordered by approximate distance;
- interactive MapLibre map shared between territorial search and book detail;
- distinct markers for the searched area/starting book and the available books;
- nearby books rendered as a clustered GeoJSON source;
- clickable clusters with expansion zoom;
- nearby book popups with a CTA towards the detail;
- legend, popups and map controls optimized also for mobile;
- privacy respect through `publicLatitude` and `publicLongitude`.

Current routes:

```txt
/nearby
/books/[bookId]/nearby
```

### 11.4 MapLibre and geolocation

The map is based on MapLibre GL JS and is implemented in the `NearbyMap` component inside `features/books/components`, because it is reused both by the books feature and the nearby feature.

Current functions:

- WebGL rendering;
- zoom and pan;
- urban 3D view with pitch, bearing and high zoom;
- OpenFreeMap Liberty vector style;
- 3D buildings through the `fill-extrusion` layer when the style exposes compatible building layers;
- automatic camera rotation around the searched point or the starting book;
- rotation stop when the user interacts with the map;
- UI controls for pausing/resuming rotation, restoring the view and toggling 2D/3D;
- interactive markers;
- integrated legend;
- popups with title, distance/context and link to the book detail;
- clustered GeoJSON source for the nearby books;
- lighter mobile behavior: start in 2D, automatic rotation disabled on compact viewports and respect of `prefers-reduced-motion`.

Planned functions:

- future integration with OpenStreetMap/Overpass for libraries, bookstores and stationery shops;
- possible further optimizations for clustering and performance on larger datasets.

The verified availability will only be the one coming from Culturando users. External places will be potentially relevant places, but they will not guarantee the real availability of the book.

### 11.5 Database

The current database is PostgreSQL with the PostGIS extension, managed locally through Docker Compose. Prisma is the ORM used by the application and the schema lives in `packages/db/prisma/schema.prisma`.

Motivations:

- relational domain: users, books, requests, locations, statistics;
- need for consistent queries;
- geospatial support through PostGIS;
- possibility of using JSONB for AI metadata or responses from external APIs.

The territorial search uses raw SQL queries through Prisma with PostGIS functions such as `ST_DWithin` and `ST_Distance`, because Prisma does not natively expose all the necessary geospatial types and operators. The demo mocks remain supported with distance calculation in TypeScript as a fallback, but the persisted books are filtered and ordered by the database.

Current entities:

- User;
- EmailVerificationToken;
- Book;
- BookStats;
- BookLocation;
- BookImage;
- LoanRequest.

Planned entities:

- advanced geospatial Location;
- BookView;
- UserProfile.

Demo seed:

- `pnpm db:seed` script, defined in the root `package.json`;
- seed file in `packages/db/prisma/seed.mjs`;
- creates 1 admin user, 3 already verified normal users, demo books with private/approximate public coordinates, images, statistics and requests in different states;
- demo credentials: `admin@culturando.local` / `Culturando123!`;
- the demo users share the password `Culturando123!`.

### 11.6 AI cataloging

Assisted cataloging helps the user fill in a book record without automatically saving unconfirmed data.

Current functionality:

- metadata lookup by ISBN through the `lookupBookMetadataAction` server action and `@culturando/ai`;
- metadata lookup by OCR title when the image does not contain a recognizable ISBN but allows inferring a useful title;
- proposal of title, authors, publisher, year, language, categories, description and cover;
- selective application to the form through checkboxes, with empty fields preselected and already filled fields not selected by default; the data retrieved from the OCR flow are applied automatically only to the empty fields;
- ISBN extraction from pasted text or OCR text through the pure `extractIsbnFromText` function;
- upload of one or two front/back images for OCR through `extractIsbnFromImageAction`, with merging of the recognized text and metadata;
- OCR metadata fallback: if the Worker returns `metadata`, JSON embedded in the OCR text or a textual/Markdown list with fields such as ISBN, title, author, publisher, year, language, categories and description, the form can propose the data even when Open Library does not find the ISBN;
- more specific OCR diagnostics for timeout, HTTP Worker error, network, empty response and invalid format;
- optional integration with the Cloudflare OCR Worker using `CLOUDFLARE_OCR_ENDPOINT` and `CLOUDFLARE_OCR_TOKEN`;
- support for `CLOUDFLARE_OCR_MOCK_TEXT` for local tests without a real Worker.

Planned pipeline:

```txt
upload one or two cover/back images
→ OCR
→ text extraction
→ ISBN extraction or title inference
→ book metadata lookup by ISBN or title
→ results ranking
→ form pre-fill
→ user confirmation
```

Possible sources:

- Cloudflare Workers AI through the OCR Worker;
- Google Books API;
- Open Library API;
- local OCR or other alternative external services.

Important principle:

The AI must assist, but it must not save data automatically without user confirmation.

### 11.7 i18n / translation package

After finalizing login and signup, a shared translation module was introduced.

Goals:

- eliminate hardcoded text;
- centralize texts;
- facilitate the future mobile app;
- use keys such as `auth.login.title`;
- keep the React logic separate from the shared package.

Current structure:

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

Web hook:

```txt
apps/web/src/hooks/useTranslation.ts
```

## 12. Recommended roadmap

Status of the first steps:

1. finalize login/signup with Zod, actions and error display — completed;
2. add the missing UI components, especially Checkbox — completed;
3. create `packages/translation` — completed;
4. create `useTranslation` in the web app — completed;
5. replace `auth-copy.ts` with shared dictionaries — completed;
6. configure Auth.js with a demo Credentials provider — completed;
7. create a protected dashboard placeholder — completed;
8. start the books feature with mock data — completed;
9. transform the new book form into a real `BookForm` with Zod, server action and mock JSON persistence — completed;
10. complete the first catalog experience with book detail, search and filters — completed;
11. consolidate the `Book` MVP domain with address and images — completed;
12. introduce the local Prisma schema in `packages/db` — completed;
13. add local PostgreSQL through Docker — completed;
14. run `db:push` and generate the Prisma Client — completed;
15. migrate the mock JSON persistence of the books towards real CRUD with Prisma — completed;
16. connect Auth.js to real users through the database — completed;
17. introduce address -> private/approximate public coordinates geocoding — completed;
18. introduce the nearby feature with a nearby availability list — completed;
19. introduce MapLibre with 3D map, markers, controls and camera rotation — completed;
20. introduce geospatial queries with PostGIS and radius filter — completed;
21. introduce local cover upload and Open Library cover lookup by ISBN — completed;
22. introduce contact/loan requests with accept/reject management — completed;
23. show the requester the sent requests and allow cancelling `pending` requests — completed;
24. replace the local cover storage with persistent/cloud storage through Cloudflare R2 — completed;
25. improve the map with GeoJSON clusters/layers and mobile optimizations — completed;
26. introduce ISBN-assisted cataloging, ISBN extraction from text and provider-agnostic image OCR — completed;
27. introduce usage statistics with `BookStats`, book views and dashboard summary — completed;
28. introduce an editable MVP user profile from the dashboard — completed;
29. introduce a protected administrative dashboard for `admin` users — completed;
30. add a demo seed with users, books, locations, statistics and requests — completed;
31. introduce a responsive design system with page primitives, Wizard, Poppins/Lora and dark mode toggle — completed;
32. introduce the `@culturando/assets` package to centralize the public asset paths — completed;
33. introduce account email confirmation with Prisma token, activation page and SMTP sending with Nodemailer — completed;
34. introduce the user greeting preference and the personalized dashboard title — completed;
35. refine the dashboard and the book catalog with responsive floating bar, pagination, cover-type book card and prioritized quick actions — completed;
36. complete the books CRUD with ownership-protected edit/delete and deletion confirmation through the central Sonner notification — completed;
37. add real WebP thumbnails with Sharp and `BookImage.thumbnailUrl` — completed;
38. protect the nearby search and the nearby availability behind login, keeping the book catalog public — completed;
39. introduce breadcrumbs and previous/next navigation in the book detail — completed.

Order of the next steps:

1. refine advanced public SEO if required by the report;
2. evaluate the public profile page of the owner as a post-MVP refinement;
3. document in the technical report the CRUD flows, geospatial privacy and image/thumbnail management.

## 13. Principles to respect during development

Every agent or developer working on Culturando must respect these principles:

- keep `app/` light;
- do not insert hardcoded texts when a key exists in `@culturando/translation`;
- do not move web app-specific code into `packages`;
- do not put domain components inside `components/ui`;
- use TypeScript explicitly;
- use Zod for input validation;
- centralize shared configurations in `@culturando/config`;
- centralize domain types in `@culturando/types`;
- protect user privacy, especially regarding location;
- prefer mock data before introducing complex databases;
- introduce abstractions only when they are really needed;
- keep the project readable and scalable.

## 14. Final brief description

Culturando is a geolocated web app to share, discover and enhance private book collections. The project uses an Nx monorepo with Next.js for the web app and shared packages for configurations, types, translations, geolocation, database and AI. The architecture is feature-based: the routes remain in `app/`, the functionality in `features/`, the generic components in `components/ui` and the reusable code in `packages/*`. The technical goal is to build a clean, scalable platform, ready for authentication, book cataloging, geolocated maps, location privacy, i18n and future mobile extension.

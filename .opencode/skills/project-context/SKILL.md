---
name: project-context
description: Culturando project context, architecture, stack, packages, product behavior. Use when needing technical or functional context for this repository.
---

# Culturando — Contesto tecnico e funzionale del progetto

## 1. Descrizione generale del progetto

Culturando è una piattaforma web geolocalizzata pensata per valorizzare, catalogare e rendere consultabile il patrimonio librario privato degli utenti. L’obiettivo principale del progetto è permettere a una persona di pubblicare la propria collezione di libri, renderla ricercabile da altri utenti e favorire consultazioni, scambi, prestiti o semplicemente la scoperta di volumi presenti nelle vicinanze.

Il progetto nasce come applicazione per tesi triennale in Informatica, ma viene progettato con un’impostazione tecnica realistica, modulare e scalabile. Culturando non vuole essere soltanto un catalogo digitale, ma un sistema che unisce gestione libraria, geolocalizzazione, privacy, ricerca territoriale e, in futuro, funzioni di catalogazione assistita tramite AI.

L’idea centrale è trasformare biblioteche domestiche, collezioni personali e piccoli patrimoni librari privati in risorse culturali consultabili e valorizzabili, mantenendo al centro la tutela dell’utente e della sua posizione.

## 2. Obiettivi principali

Gli obiettivi principali di Culturando sono:

- consentire agli utenti di registrarsi e gestire un profilo personale;
- permettere la pubblicazione di libri e collezioni private;
- creare schede libro complete, ordinate e ricercabili;
- visualizzare libri, utenti o punti culturali su una mappa;
- trovare disponibilità librarie vicine a una determinata zona;
- favorire richieste di consultazione, prestito o contatto tra utenti;
- proteggere la privacy evitando di mostrare coordinate precise;
- introdurre in futuro catalogazione assistita tramite OCR, ISBN e AI;
- predisporre una base tecnica riutilizzabile anche per una futura app mobile.

## 3. Stack tecnico attuale

Il progetto utilizza una struttura monorepo basata su Nx e pnpm.

Stack principale:

- Nx Monorepo;
- pnpm come package manager;
- Next.js come framework web principale;
- React;
- TypeScript;
- Tailwind CSS v3;
- componenti UI ispirati a shadcn/ui;
- tema grafico generato tramite tweakcn;
- Auth.js tramite `next-auth` beta;
- Zod per validazione form;
- Prisma come ORM e schema database locale;
- PostgreSQL con estensione PostGIS per persistenza e query geospaziali;
- MapLibre GL JS per mappe interattive 2D/3D;
- Cloudflare R2, tramite client S3 compatibile, per storage persistente delle copertine;
- Resend per invio email transazionali di conferma account, con fallback console in sviluppo;
- `@culturando/assets` per centralizzare i path degli asset pubblici condivisi;
- `@culturando/translation` per dizionari e chiavi testuali condivise;
- Biome per linting e formatting;
- package condivisi sotto `packages/*`.

Stack previsto nelle fasi successive:

- eventuale pipeline AI/OCR per catalogazione assistita;
- futura app mobile React Native/Expo, non inclusa nell’MVP iniziale.

## 4. Architettura generale

Culturando segue un’architettura monorepo con separazione tra applicazioni e package condivisi.

La struttura concettuale è:

```txt
culturando/
├── apps/
│   └── web/
│       └── applicazione Next.js principale
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

La regola architetturale principale è:

- `apps/web` contiene codice specifico della web app: pagine, route, componenti React, feature UI, form, layout e interazioni.
- `packages/*` contiene codice condivisibile e indipendente dalla singola app: tipi, configurazioni, utility geografiche, accesso database, funzioni AI, traduzioni.

Questa distinzione permette di evitare duplicazione e prepara il progetto a una futura estensione mobile.

## 5. Applicazione web: `apps/web`

La web app è sviluppata con Next.js e usa App Router.

La struttura consigliata e attuale è basata su feature:

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

La cartella `app/` contiene esclusivamente il routing Next.js.

Esempio:

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

Le pagine dentro `app/` devono rimanere sottili. Non devono contenere logica complessa, validazioni, form lunghi o business logic. Devono comporre layout e richiamare componenti dalle feature.

Esempio corretto:

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

La cartella `components/ui` contiene componenti generici e riutilizzabili, ispirati al pattern shadcn/ui.

Esempi:

```txt
apps/web/src/components/ui/
├── badge.tsx
├── button.tsx
├── card.tsx
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

Questi componenti non devono conoscere il dominio Culturando. Devono essere generici.

Corretto:

- `Button`;
- `Input`;
- `Label`;
- `Card`;
- `Badge`;
- `Checkbox`;
- `DropdownMenu` e `DropdownSelect` per menu e dropdown accessibili basati su Radix/shadcn;
- `PageShell`, `PageContainer`, `PageHeader`, `PageTitle` e primitive pagina responsive;
- `Pagination` e primitive correlate per paginazione stile shadcn;
- `Progress`;
- `RadioGroup`;
- `ThemeToggle`;
- `Tooltip`;
- `Wizard` per flussi guidati con stepper e progress bar;
- futuro `Textarea`;
- futuro `Dialog`.

Non corretto:

- `LoginForm`;
- `BookCard`;
- `NearbyAvailabilityMap`;
- `UserLibraryCard`.

I componenti di dominio devono stare dentro le rispettive feature.

I componenti condivisi specifici della web app, ma non appartenenti al set generico shadcn-like, possono stare direttamente in `apps/web/src/components`. Esempio attuale: `BrandLogo`, che renderizza le varianti light/dark del logo Culturando usando i path centralizzati in `@culturando/assets`.

### 5.3 `features/`

La cartella `features/` contiene le funzionalità applicative della web app.

Feature attuali:

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

Questa suddivisione permette di isolare UI, validazione, azioni e tipi relativi alla stessa feature.
I testi riutilizzabili non devono essere duplicati nelle feature: quando esiste una chiave, devono passare da `@culturando/translation` e dall'hook web `useTranslation`.

In futuro saranno previste feature come:

```txt
features/cataloging/
features/profile/
```

Ogni feature deve contenere solo il codice specifico della funzionalità.

### 5.4 `config/routes.ts`

Le route della web app sono centralizzate in:

```txt
apps/web/src/config/routes.ts
```

Esempio:

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

Le route restano dentro `apps/web` perché sono specifiche della web app Next.js. Non devono essere spostate in `packages/config`, perché una futura app mobile non userà necessariamente gli stessi path.

### 5.5 `lib/utils.ts`

Contiene utility tecniche condivise nella web app.

Esempio tipico:

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Questa utility viene usata dai componenti UI per comporre classi Tailwind.

## 6. Package condivisi

I package condivisi si trovano sotto:

```txt
packages/
```

L’obiettivo è scrivere una sola volta logiche e definizioni riutilizzabili in più contesti.

### 6.1 `packages/config`

Contiene configurazioni generali e costanti condivise.

Struttura:

```txt
packages/config/
├── package.json
└── src/
    ├── app.config.ts
    ├── auth.config.ts
    ├── constants.ts
    └── index.ts
```

Responsabilità:

- nome applicazione;
- descrizione applicazione;
- lingua di default;
- autori;
- publisher;
- regole generiche auth, come lunghezza minima password;
- costanti condivise.

Esempio:

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

Il package `config` non deve dipendere da Next.js. Non deve importare `Metadata` da `next`. I metadata Next vengono costruiti nel layout della web app usando i valori di `appConfig`.

### 6.2 `packages/types`

Contiene tipi TypeScript condivisi di dominio.

Struttura:

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

Responsabilità:

- tipi utente;
- tipi sessione;
- tipi libro;
- tipi coordinate;
- tipi richieste prestito/consultazione;
- tipi riutilizzabili anche da web app, mobile, database, API o script.

Esempi:

```ts
export type UserRole = "user" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};
```

Non devono stare qui tipi specifici dei form React, come:

```ts
LoginFormValues
SignupFormValues
LoginFormState
```

Questi restano nella feature auth della web app.

### 6.3 `packages/db`

Package condiviso per la gestione database.

Responsabilità attuali:

- Prisma Client;
- schema Prisma;
- client condiviso esportato come `prisma`;
- PostgreSQL locale tramite Docker Compose con immagine PostGIS;
- estensione PostGIS inizializzata tramite script root `db:postgis`;
- script root per `db:up`, `db:down`, `db:logs`, `db:postgis`, `db:generate`, `db:push`, `db:migrate:dev` e `db:studio`.

Responsabilità future:

- query condivise;
- seed;
- migrazioni.

Struttura attuale:

```txt
packages/db/
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── client.ts
    └── index.ts
```

Lo schema Prisma attuale modella `User`, `EmailVerificationToken`, `Book`, `BookStats`, `BookLocation`, `BookImage` e `LoanRequest`, con enum per ruolo utente, preferenza di saluto, disponibilità, visibilità, condizione fisica e sorgente immagine. `User.emailVerifiedAt` abilita il blocco login per account non confermati; `User.salutationPreference` salva la preferenza grammaticale di saluto (`masculine`, `feminine`, `neutral`) usata dalla dashboard per mostrare `Benvenuto`, `Benvenuta` o `Benvenuto/a` senza raccogliere dati sensibili non necessari. `EmailVerificationToken` salva hash del token e scadenza per il link email. La web app usa Prisma per la persistenza reale dei libri: la feature books salva e legge `Book`, `BookLocation` e `BookImage` dal database PostgreSQL locale. In sviluppo PostgreSQL/PostGIS gira tramite Docker sulla porta host `5433`, per evitare conflitti con eventuali database locali già attivi su `5432`. Lo script `pnpm dev` avvia il container PostgreSQL/PostGIS, crea l'estensione PostGIS se necessario e poi avvia la web app.

### 6.4 `packages/geo`

Package condiviso per logiche geospaziali pure.

Responsabilità attuali:

- normalizzazione coordinate;
- approssimazione coordinate per privacy;
- geocoding indirizzo -> coordinate tramite adapter iniziale Nominatim/OpenStreetMap;
- funzioni riutilizzabili da web, API e mobile.

Responsabilità future:

- calcolo distanza;
- conversione in GeoJSON;
- sostituzione o affiancamento di Nominatim con provider più stabile, cloud o self-hosted.

Esempi attuali/futuri:

```ts
geocodeAddress()
calculateDistance()
approximateCoordinates()
normalizeCoordinates()
generatePublicLocation()
toGeoJsonFeature()
```

Nominatim è una scelta temporanea e pragmatica per l'MVP: il codice deve restare isolato dietro l'adapter `geocodeAddress`, così la web app non dipende direttamente dal provider e potrà passare a un geocoder cloud, commerciale o self-hosted senza cambiare il dominio applicativo.

### 6.5 `packages/ai`

Package condiviso per catalogazione assistita e funzioni AI.

Responsabilità attuali:

- lookup metadati libro da ISBN o titolo tramite adapter Open Library;
- estrazione ISBN da testo con validazione ISBN-10/ISBN-13 tramite check digit;
- adapter OCR provider-agnostic `extractTextFromImage` per inviare immagini a un endpoint esterno;
- supporto al flusso OCR Cloudflare tramite Worker configurabile dalla web app;
- file di riferimento versionato `packages/ai/cloudflare-ocr-worker.js`, da mantenere allineato al Worker Cloudflare deployato quando cambia il prompt o il contratto di risposta OCR.

Responsabilità future:

- normalizzazione avanzata metadati libro;
- suggerimento categorie e tag;
- ranking risultati;
- eventuale supporto a provider OCR alternativi o OCR locale.

Esempi attuali/futuri:

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

Package condiviso per centralizzare i path pubblici degli asset statici e degli upload serviti dalla web app.

Struttura attuale:

```txt
packages/assets/
├── package.json
└── src/
    └── index.ts
```

Responsabilità attuali:

- esporre `assets.favicon`;
- esporre `assets.logo` con varianti full e mark per tema light/dark;
- esporre `assets.icons` con favicon SVG light/dark basate su `prefers-color-scheme`, apple touch icon, manifest e icone PWA;
- esporre immagini statiche, come `assets.images.loginPage`;
- esporre builder URL per upload pubblici locali, come `assets.uploads.bookCover(fileName)`.

Il package non contiene i file binari: gli asset statici continuano a vivere sotto `apps/web/public`, mentre il package centralizza solo riferimenti e path riusabili.

### 6.7 `packages/translation`

Package condiviso per la gestione i18n.

Motivazioni:

- evitare testi hardcoded nei componenti;
- centralizzare le traduzioni;
- preparare riuso futuro in app mobile;
- migliorare pulizia e manutenibilità;
- rendere più semplice aggiungere inglese o altre lingue.

Struttura attuale:

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

Il package deve contenere dizionari e funzioni pure. L’hook React `useTranslation` non dovrebbe stare nel package condiviso, ma nella web app:

```txt
apps/web/src/hooks/useTranslation.ts
```

Motivo: `useTranslation` è React-specific, mentre `packages/translation` deve restare indipendente dalla UI.

Responsabilità attuali:

- centralizzare i dizionari `it` ed `en`;
- esporre il tipo `Locale`;
- esporre il tipo `TranslationKey` derivato dal dizionario italiano;
- esporre `getTranslation(key, locale)` come funzione pura;
- usare fallback su italiano quando serve.

La web app consuma le traduzioni tramite:

```txt
apps/web/src/hooks/useTranslation.ts
```

I componenti React devono usare:

```tsx
const t = useTranslation();
```

e poi chiavi come:

```tsx
t("auth.login.title")
```

In questo modo una futura app mobile potrà riutilizzare gli stessi dizionari e la stessa funzione pura, mantenendo un hook React-specific separato.

Uso desiderato:

```tsx
const t = useTranslation();

<h1>{t("auth.login.title")}</h1>
<Button>{t("auth.login.submitLabel")}</Button>
```

## 7. Feature Auth

La feature auth è la prima feature concreta del progetto.

### 7.1 Route

Le route sono:

```txt
/api/auth/[...nextauth]
/auth
/auth/confirm-email
/auth/login
/auth/signup
```

La route `/auth` può reindirizzare a `/auth/login`.

Auth.js è configurato in:

```txt
apps/web/src/config/auth.ts
```

La route API Auth.js espone gli handler in:

```txt
apps/web/src/app/api/auth/[...nextauth]/route.ts
```

Configurazione attuale:

- `next-auth` beta;
- session strategy JWT;
- pagina custom di login su `/auth/login`;
- Credentials provider collegato agli utenti reali nel database PostgreSQL tramite Prisma;
- login consentito solo agli utenti con `emailVerifiedAt` valorizzato;
- sessione arricchita con `session.user.id`, corrispondente all'id reale della tabella `User`;
- sessione arricchita con `session.user.salutationPreference`, derivata da `User.salutationPreference`;
- password salvate come hash `scrypt` con salt, tramite utility server-side in `apps/web/src/lib/password.ts`.

Variabili richieste per Auth.js:

```txt
AUTH_SECRET=
AUTH_URL=http://localhost:3000
```

### 7.2 Login

La pagina login è composta da:

```txt
apps/web/src/app/auth/login/page.tsx
apps/web/src/features/auth/components/LoginForm.tsx
apps/web/src/features/auth/schemas/login.schema.ts
apps/web/src/features/auth/actions/login.action.ts
```

Responsabilità:

- mostrare form email/password;
- gestire remember me;
- validare input con Zod;
- chiamare Auth.js tramite `signIn("credentials")`;
- mostrare errore tradotto quando le credenziali non sono valide;
- linkare alla signup.

### 7.3 Signup

La pagina signup è composta da:

```txt
apps/web/src/app/auth/signup/page.tsx
apps/web/src/features/auth/components/SignupForm.tsx
apps/web/src/features/auth/schemas/signup.schema.ts
apps/web/src/features/auth/actions/signup.action.ts
```

Responsabilità:

- mostrare form nome/email/password/conferma password;
- raccogliere la preferenza grammaticale di saluto tramite `RadioGroup` (`masculine`, `feminine`, `neutral`);
- guidare l’utente tramite `Wizard` con step dati account, sicurezza e riepilogo;
- controllare disponibilità email mentre l’utente digita e bloccare il proseguimento se già usata;
- validare input con Zod;
- verificare corrispondenza password;
- creare un utente reale non ancora verificato in PostgreSQL tramite Prisma;
- salvare `salutationPreference` sul record utente;
- generare un token di conferma email salvato come hash in `EmailVerificationToken`;
- inviare email di conferma tramite provider configurabile (`console`, `http` o `resend`);
- mostrare toast primary di conferma invio email;
- salvare la password come hash, mai in chiaro;
- linkare alla login.

La dashboard usa `session.user.salutationPreference` per scegliere la forma del titolo di benvenuto. Questa informazione va trattata come preferenza di UI/linguaggio, non come orientamento sessuale o dato sensibile.

La route `/auth/confirm-email?token=...` conferma il token, valorizza `User.emailVerifiedAt`, elimina i token residui dell’utente e mostra una pagina di ringraziamento con CTA verso la login. Senza token valido mostra uno stato non valido, quindi la pagina di successo è raggiungibile solo passando dal link email.

Variabili email supportate:

```txt
EMAIL_PROVIDER=console|http|resend
RESEND_API_KEY=
EMAIL_FROM="Culturando <onboarding@resend.dev>"
EMAIL_PROVIDER_ENDPOINT=
EMAIL_PROVIDER_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.4 Validazione Zod

Zod viene usato per validare login e signup.

Login:

- email obbligatoria;
- email valida;
- password obbligatoria;
- password con lunghezza minima da `authConfig`;
- rememberMe convertito tramite `z.coerce.boolean()`.

Signup:

- nome obbligatorio;
- email obbligatoria e valida;
- password obbligatoria;
- password con lunghezza minima e massima da `authConfig`;
- conferma password obbligatoria;
- controllo password/confirmPassword tramite `.refine()`.

Gli schema restano nella feature auth perché oggi sono schema di form web. In futuro, se alcune regole diventeranno condivise tra web, mobile e backend, potranno essere spostate in un package dedicato come `packages/validators`.

## 8. Layout globale e metadata

Il layout globale si trova in:

```txt
apps/web/src/app/layout.tsx
```

Responsabilità:

- importare `global.css`;
- registrare font globali con `next/font/google`;
- costruire i metadata Next a partire da `appConfig`;
- impostare la lingua HTML usando `appConfig.defaultLocale`;
- renderizzare il body dell’app.

Il layout deve importare il tipo:

```ts
import type { Metadata } from "next";
```

I metadata devono essere costruiti nella web app, non nel package config.

Esempio corretto:

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

## 9. Styling e UI

Il progetto usa Tailwind CSS v3.

Il file globale è:

```txt
apps/web/src/app/global.css
```

Contiene:

- direttive Tailwind;
- variabili CSS del tema;
- supporto dark mode;
- colori generati da tweakcn;
- font variables, con Poppins come sans-serif e Lora come serif;
- token responsive globali `--page-padding-x`, `--page-padding-y` e `--section-gap`;
- radius;
- shadow tokens;
- layer base.

Il tema usa variabili HSL compatibili con Tailwind v3 e shadcn-like components. La homepage espone un `ThemeToggle` che applica/rimuove la classe `.dark` su `document.documentElement`, persiste la scelta in `localStorage` e usa la preferenza di sistema quando non esiste una scelta salvata.

I layout pagina devono preferire le primitive responsive in `components/ui/page.tsx` (`PageShell`, `PageContainer`, `PageHeader`, `PageTitle`, `ResponsiveActions`) invece di duplicare padding, max-width e heading nelle singole feature.

La configurazione Tailwind è:

```txt
apps/web/tailwind.config.js
```

Deve includere:

- `darkMode: ["class"]`;
- `content` che punta a `src/app`, `src/components`, `src/features`, `src/lib`;
- colori basati su `hsl(var(--...))`;
- radius basati su `--radius`;
- font family basate su `--font-sans`, `--font-serif`, `--font-mono`;
- eventuali shadow tokens;
- plugin `tailwindcss-animate`, se installato.

## 10. Convenzioni architetturali

### 10.1 Regola `app/`

`app/` deve contenere solo route, layout, metadata, loading/error/not-found e composizione di pagina.

Non deve contenere:

- form complessi;
- business logic;
- validazioni;
- utility;
- componenti lunghi di feature.

### 10.2 Regola `features/`

Ogni feature contiene la propria logica applicativa:

```txt
components/
schemas/
actions/
types/
constants/
mocks/
```

Le feature devono essere autonome e leggibili.

### 10.3 Regola `components/ui`

Contiene solo componenti UI generici.

Se un componente conosce il dominio Culturando, non va in `components/ui`.

### 10.4 Regola `packages/*`

I package contengono codice condivisibile, non specifico della singola app.

Se una cosa può servire a web, mobile, API o script, può stare in `packages`.

Se serve solo alla web app, resta in `apps/web`.

## 11. Feature future principali

### 11.1 Dashboard

La dashboard è l’area privata dell’utente ed è protetta tramite sessione Auth.js.

Struttura attuale:

```txt
apps/web/src/app/dashboard/page.tsx
apps/web/src/app/dashboard/admin/page.tsx
apps/web/src/app/dashboard/profile/page.tsx
apps/web/src/features/dashboard/components/DashboardOverview.tsx
apps/web/src/features/dashboard/actions/dashboard-stats.repository.ts
```

La route `/dashboard` usa `auth()` lato server. Se non esiste una sessione valida, reindirizza a `/auth/login`.

Responsabilità attuali:

- verificare il flusso `login -> sessione -> dashboard -> logout`;
- mostrare i dati base della sessione Auth.js;
- esporre una CTA verso la creazione libro;
- esporre logout tramite `logoutAction`;
- mostrare le richieste ricevute sui libri dell'utente;
- permettere al proprietario di accettare o rifiutare richieste ancora `pending`;
- mostrare statistiche d'uso personali sui libri dell'utente, incluse visualizzazioni, richieste ricevute, richieste in attesa e libri più visualizzati;
- mostrare i libri pubblicati dall'utente nella dashboard usando le stesse card formato copertina del catalogo;
- esporre accesso alla modifica del profilo;
- esporre accesso alla dashboard amministrativa solo quando `session.user.role` è `admin`.

Funzionalità previste:

- aggiunta nuovi libri;
- accesso rapido alle funzioni di catalogazione.

Route previste/attuali:

```txt
/dashboard                # attuale, placeholder protetto
/dashboard/books/new      # attuale, form libro protetto
/dashboard/profile        # attuale, profilo utente MVP
/dashboard/admin          # attuale, dashboard amministrativa protetta per admin
/dashboard/books          # previsto
```

### 11.1.1 Profilo utente

La feature profile permette all'utente autenticato di gestire i dati descrittivi del proprio profilo senza esporre informazioni sensibili o coordinate precise.

Struttura attuale:

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

Funzionalità attuali:

- route protetta `/dashboard/profile`;
- lettura profilo tramite `getUserProfile`;
- aggiornamento tramite server action `updateProfileAction`;
- validazione Zod di nome completo, nickname, avatar, biografia, domicilio e visibilità profilo;
- upload avatar dal dispositivo tramite `profile-avatar-storage`, con R2 quando configurato e fallback locale in `apps/web/public/uploads/profile-avatars`;
- nickname univoco a livello DB, controllato live dal form e modificabile ogni 90 giorni;
- domicilio gestito tramite autocomplete Nominatim su un solo input, salvando `addressLabel`, `postalCode`, `city`, `province` e `region`;
- campi profilo salvati direttamente sul modello `User`: `name`, `nickname`, `nicknameUpdatedAt`, `avatarUrl`, `bio`, `addressLabel`, `postalCode`, `city`, `province`, `region`, `isProfilePublic`;
- email mostrata come dato account non modificabile dal form profilo;
- testi UI centralizzati in `@culturando/translation`.

### 11.1.2 Impostazioni utente

La route protetta `/dashboard/settings` contiene preferenze applicative dell'utente.

Funzionalità attuali:

- pagina impostazioni raggiungibile dalla dropdown utente nella floating bar;
- selezione lingua app tra italiano e inglese;
- persistenza lingua in `localStorage` e cookie `culturando-locale`;
- aggiornamento reattivo dei testi client tramite `LocaleProvider` e `useTranslation`;
- toast di conferma al cambio lingua.

### 11.1.3 Dashboard amministrativa

La dashboard amministrativa copre il requisito della traccia relativo a dashboard e metriche aggregate del prototipo.

Struttura attuale:

```txt
apps/web/src/app/dashboard/admin/page.tsx
apps/web/src/features/admin/
├── actions/
│   └── admin-stats.repository.ts
└── components/
    └── AdminDashboard.tsx
```

Funzionalità attuali:

- route protetta `/dashboard/admin`;
- accesso consentito solo a utenti con ruolo `admin` nella sessione Auth.js;
- `session.user.role` viene popolato tramite JWT callback in `apps/web/src/config/auth.ts`;
- statistiche globali su utenti, libri, richieste e visualizzazioni;
- conteggio libri pubblici e privati;
- conteggio richieste `pending`, `accepted`, `rejected` e `cancelled`;
- lista ultimi utenti registrati;
- lista ultimi libri pubblicati con link al dettaglio.

### 11.1.4 Requests / richieste contatto-prestito

La feature requests completa il primo flusso interattivo dell'MVP: un utente autenticato può inviare una richiesta per un libro pubblico disponibile e il proprietario può gestirla dalla dashboard.

Funzionalità attuali:

- form `LoanRequestForm` nel dettaglio libro `/books/[bookId]`;
- tipi richiesta `consultation`, `loan`, `info`;
- messaggio opzionale fino a 800 caratteri;
- server action `createLoanRequestAction` con controllo sessione;
- blocco invio se l'utente non è autenticato, se il libro non è pubblico/richiedibile o se l'utente è proprietario del libro;
- persistenza reale tramite modello Prisma `LoanRequest`;
- lista `ReceivedLoanRequests` nella dashboard;
- azioni proprietario `Accetta` e `Rifiuta` tramite `updateLoanRequestStatusAction`;
- aggiornamento stato consentito solo al proprietario e solo per richieste `pending`;
- pagina protetta `/dashboard/requests` per visualizzare le richieste inviate dal richiedente;
- lista `SentLoanRequests` con libro, proprietario, stato, tipo richiesta e messaggio inviato;
- annullamento delle richieste inviate ancora `pending` tramite `cancelLoanRequestAction`;
- testi UI centralizzati in `@culturando/translation`.

Funzionalità ancora previste:

- notifiche/email;
- messaggistica o scambio contatti dopo accettazione.

### 11.2 Books

La feature books è stata introdotta come primo flusso funzionale dopo auth e dashboard.

Funzionalità attuali:

- catalogo pubblico `/books`;
- loading route `/books/loading.tsx` con griglia skeleton di copertine libro;
- dettaglio libro pubblico `/books/[bookId]`;
- ricerca client-side nel catalogo per titolo, autore, ISBN, editore, città, categoria e descrizione;
- filtri client-side per stato e visibilità;
- card libro con titolo, autore, descrizione, ISBN, stato, visibilità, lingua e immagine principale quando presente;
- mock data iniziali in `features/books/mocks/books.mock.ts`;
- form nuovo libro protetto in `/dashboard/books/new`;
- validazione Zod in `features/books/schemas/book.schema.ts`;
- server action `createBookAction`;
- recupero singolo libro tramite `getBookById`;
- persistenza reale dei libri tramite Prisma e PostgreSQL in `features/books/actions/books.repository.ts`;
- associazione dei nuovi libri a `session.user.id`, cioè all'utente reale autenticato;
- geocoding dell'indirizzo durante il salvataggio tramite `@culturando/geo`;
- salvataggio di coordinate private (`latitude`, `longitude`) e coordinate pubbliche approssimate (`publicLatitude`, `publicLongitude`);
- revalidazione della route `/books` dopo il salvataggio;
- route `/books` dinamica per leggere il catalogo aggiornato dal database;
- testi UI centralizzati in `@culturando/translation`;
- dominio `Book` MVP consolidato con campi bibliografici, indirizzo leggibile e immagini multiple;
- l'utente inserisce un indirizzo, non coordinate manuali; il sistema geocodifica automaticamente quando possibile e mantiene fallback silenzioso se il provider non risponde;
- upload copertina e immagini fronte/retro dal form nuovo libro tramite adapter `book-cover-storage`, con salvataggio su Cloudflare R2 quando le variabili `R2_*` sono configurate e fallback locale in `apps/web/public/uploads/book-covers`; la prima immagine caricata resta l'immagine primaria;
- supporto a URL immagini aggiuntive nel form libro;
- ricerca copertina da ISBN tramite Open Library direttamente nel form, con anteprima client-side e copia della cover trovata nello storage configurato quando possibile;
- fallback server-side verso Open Library durante il salvataggio quando l'utente non carica immagini ma fornisce un ISBN;
- URL immagini aggiuntive manuali mantenuti come riferimenti esterni, senza copia automatica nello storage;
- catalogazione assistita nel form nuovo libro tramite lookup metadati Open Library da ISBN o titolo OCR, con proposta dati e applicazione esplicita/manuale quando richiesta;
- estrazione ISBN da testo incollato o testo OCR, tramite `@culturando/ai`;
- upload di una o due immagini per OCR nel form nuovo libro, tramite server action che chiama un endpoint Cloudflare OCR opzionale; il primo step resta bloccato finché il servizio esterno non termina il riconoscimento.
- conteggio visualizzazioni tramite `BookStats` quando viene aperta la pagina dettaglio `/books/[bookId]`;
- visualizzazione del numero di viste nella scheda dettaglio libro.

Funzionalità ancora previste:

- gestione avanzata stato disponibilità;
- integrazione con geolocalizzazione e disponibilità vicine.

Struttura attuale:

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

### 11.3 Nearby / disponibilità vicine

La feature nearby permette di cercare libri pubblici vicini a una zona o a un libro specifico, usando solo coordinate pubbliche approssimate per proteggere la privacy degli utenti.

Funzionalità attuali:

- route pubblica `/nearby` con form di ricerca per città o indirizzo;
- geocoding della zona cercata tramite `@culturando/geo` e Nominatim/OpenStreetMap;
- selezione raggio ricerca: 5 km, 10 km, 25 km, 50 km;
- route `/books/[bookId]/nearby` per trovare libri vicini a un libro specifico;
- lista testuale accessibile ordinata per distanza approssimata;
- mappa interattiva MapLibre condivisa tra ricerca territoriale e dettaglio libro;
- marker distinti per area cercata/libro di partenza e libri disponibili;
- libri vicini renderizzati come source GeoJSON clusterizzata;
- cluster cliccabili con zoom di espansione;
- popup dei libri vicini con CTA verso il dettaglio;
- legenda, popup e controlli mappa ottimizzati anche per mobile;
- rispetto della privacy tramite `publicLatitude` e `publicLongitude`.

Route attuali:

```txt
/nearby
/books/[bookId]/nearby
```

### 11.4 MapLibre e geolocalizzazione

La mappa è basata su MapLibre GL JS e viene implementata nel componente `NearbyMap` dentro `features/books/components`, perché viene riutilizzata sia dalla feature books sia dalla feature nearby.

Funzioni attuali:

- rendering WebGL;
- zoom e pan;
- vista urbana 3D con pitch, bearing e zoom alto;
- stile vettoriale OpenFreeMap Liberty;
- edifici 3D tramite layer `fill-extrusion` quando lo stile espone layer building compatibili;
- rotazione automatica della camera attorno al punto cercato o al libro di partenza;
- stop della rotazione quando l'utente interagisce con la mappa;
- controlli UI per pausa/riprendi rotazione, ripristino vista e toggle 2D/3D;
- marker interattivi;
- legenda integrata;
- popup con titolo, distanza/contesto e link al dettaglio libro;
- source GeoJSON clusterizzata per i libri vicini;
- comportamento mobile più leggero: partenza in 2D, rotazione automatica disabilitata su viewport compatti e rispetto di `prefers-reduced-motion`.

Funzioni previste:

- integrazione futura con OpenStreetMap/Overpass per biblioteche, librerie e cartolerie;
- eventuali ottimizzazioni ulteriori per clustering e performance su dataset più grandi.

La disponibilità verificata sarà solo quella proveniente dagli utenti Culturando. I luoghi esterni saranno luoghi potenzialmente rilevanti, ma non garantiranno la disponibilità reale del libro.

### 11.5 Database

Il database attuale è PostgreSQL con estensione PostGIS, gestito in locale tramite Docker Compose. Prisma è l'ORM usato dall'applicazione e lo schema vive in `packages/db/prisma/schema.prisma`.

Motivazioni:

- dominio relazionale: utenti, libri, richieste, posizioni, statistiche;
- necessità di query consistenti;
- supporto geospaziale tramite PostGIS;
- possibilità di usare JSONB per metadati AI o risposte da API esterne.

La ricerca territoriale usa query SQL raw tramite Prisma con funzioni PostGIS come `ST_DWithin` e `ST_Distance`, perché Prisma non espone nativamente tutti i tipi e operatori geospaziali necessari. I mock demo restano supportati con calcolo distanza in TypeScript come fallback, ma i libri persistiti vengono filtrati e ordinati dal database.

Entità attuali:

- User;
- EmailVerificationToken;
- Book;
- BookStats;
- BookLocation;
- BookImage;
- LoanRequest.

Entità previste:

- Location geospaziale avanzata;
- BookView;
- UserProfile.

Seed demo:

- script `pnpm db:seed`, definito nel `package.json` root;
- file seed in `packages/db/prisma/seed.mjs`;
- crea 1 utente admin, 3 utenti normali già verificati, libri demo con coordinate private/pubbliche approssimate, immagini, statistiche e richieste in stati diversi;
- credenziali demo: `admin@culturando.local` / `Culturando123!`;
- gli utenti demo condividono la password `Culturando123!`.

### 11.6 AI catalogazione

La catalogazione assistita aiuta l’utente a compilare una scheda libro senza salvare automaticamente dati non confermati.

Funzionalità attuali:

- lookup metadati da ISBN tramite server action `lookupBookMetadataAction` e `@culturando/ai`;
- lookup metadati da titolo OCR quando l'immagine non contiene un ISBN riconoscibile ma permette di inferire un titolo utile;
- proposta di titolo, autori, editore, anno, lingua, categorie, descrizione e copertina;
- applicazione selettiva al form tramite checkbox, con campi vuoti preselezionati e campi già compilati non selezionati di default; i dati recuperati dal flusso OCR vengono applicati automaticamente solo sui campi vuoti;
- estrazione ISBN da testo incollato o testo OCR tramite funzione pura `extractIsbnFromText`;
- upload di una o due immagini fronte/retro per OCR tramite `extractIsbnFromImageAction`, con merge del testo riconosciuto e dei metadati;
- fallback metadati da OCR: se la Worker restituisce `metadata`, JSON incorporato nel testo OCR o un elenco testuale/Markdown con campi come ISBN, titolo, autore, editore, anno, lingua, categorie e descrizione, il form può proporre i dati anche quando Open Library non trova l'ISBN;
- diagnostica OCR più specifica per timeout, errore HTTP Worker, rete, risposta vuota e formato non valido;
- integrazione opzionale con Worker Cloudflare OCR usando `CLOUDFLARE_OCR_ENDPOINT` e `CLOUDFLARE_OCR_TOKEN`;
- supporto a `CLOUDFLARE_OCR_MOCK_TEXT` per test locali senza Worker reale.

Pipeline prevista:

```txt
upload una o due immagini copertina/retro
→ OCR
→ estrazione testo
→ estrazione ISBN o inferenza titolo
→ lookup metadati libro da ISBN o titolo
→ ranking risultati
→ precompilazione form
→ conferma utente
```

Fonti possibili:

- Cloudflare Workers AI tramite Worker OCR;
- Google Books API;
- Open Library API;
- OCR locale o altri servizi esterni alternativi.

Principio importante:

L’AI deve assistere, ma non deve salvare automaticamente dati senza conferma dell’utente.

### 11.7 i18n / translation package

Dopo aver finalizzato login e signup, è stato introdotto un modulo di traduzione condiviso.

Obiettivi:

- eliminare hardcoded text;
- centralizzare testi;
- facilitare futura app mobile;
- usare chiavi tipo `auth.login.title`;
- mantenere la logica React separata dal package condiviso.

Struttura attuale:

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

Hook web:

```txt
apps/web/src/hooks/useTranslation.ts
```

## 12. Roadmap consigliata

Stato dei primi step:

1. finalizzare login/signup con Zod, action e visualizzazione errori — completato;
2. aggiungere componenti UI mancanti, soprattutto Checkbox — completato;
3. creare `packages/translation` — completato;
4. creare `useTranslation` nella web app — completato;
5. sostituire `auth-copy.ts` con dizionari condivisi — completato;
6. configurare Auth.js con Credentials provider demo — completato;
7. creare dashboard placeholder protetta — completato;
8. iniziare feature books con mock data — completato;
9. trasformare il form nuovo libro in `BookForm` reale con Zod, server action e persistenza mock JSON — completato;
10. completare la prima esperienza catalogo con dettaglio libro, ricerca e filtri — completato;
11. consolidare il dominio `Book` MVP con indirizzo e immagini — completato;
12. introdurre schema Prisma locale in `packages/db` — completato;
13. aggiungere PostgreSQL locale tramite Docker — completato;
14. eseguire `db:push` e generare Prisma Client — completato;
15. migrare la persistenza mock JSON dei libri verso CRUD reale con Prisma — completato;
16. collegare Auth.js a utenti reali tramite database — completato;
17. introdurre geocoding indirizzo -> coordinate private/pubbliche approssimate — completato;
18. introdurre feature nearby con lista disponibilità vicine — completato;
19. introdurre MapLibre con mappa 3D, marker, controlli e rotazione camera — completato;
20. introdurre query geospaziali con PostGIS e filtro raggio — completato;
21. introdurre upload copertina locale e lookup copertina Open Library da ISBN — completato;
22. introdurre richieste di contatto/prestito con gestione accetta/rifiuta — completato;
23. mostrare al richiedente le richieste inviate e consentire annullamento delle richieste `pending` — completato;
24. sostituire lo storage locale delle copertine con storage persistente/cloud tramite Cloudflare R2 — completato;
25. migliorare la mappa con cluster/layer GeoJSON e ottimizzazioni mobile — completato;
26. introdurre catalogazione assistita da ISBN, estrazione ISBN da testo e OCR immagine provider-agnostic — completato;
27. introdurre statistiche d'uso con `BookStats`, visualizzazioni libro e riepilogo dashboard — completato;
28. introdurre profilo utente MVP modificabile da dashboard — completato;
29. introdurre dashboard amministrativa protetta per utenti `admin` — completato;
30. aggiungere seed demo con utenti, libri, posizioni, statistiche e richieste — completato;
31. introdurre design system responsive con primitive pagina, Wizard, Poppins/Lora e dark mode toggle — completato;
32. introdurre package `@culturando/assets` per centralizzare i path degli asset pubblici — completato;
33. introdurre conferma email account con token Prisma, pagina di attivazione e provider Resend — completato;
34. introdurre preferenza di saluto utente e titolo dashboard personalizzato — completato;
35. rifinire dashboard e catalogo libri con floating bar responsive, pagination, card libro tipo copertina e azioni rapide prioritarizzate — completato.

Ordine dei prossimi step:

1. iniziare la stesura della relazione tecnica della tesi;
2. documentare requisiti funzionali/non funzionali, modello dati, UX/accessibilità, privacy e architettura;
3. valutare pagina profilo pubblico e miniature reali come rifiniture post-MVP.

## 13. Principi da rispettare durante lo sviluppo

Ogni agente o sviluppatore che lavora su Culturando deve rispettare questi principi:

- mantenere `app/` leggero;
- non inserire testi hardcoded quando esiste una chiave in `@culturando/translation`;
- non spostare in `packages` codice specifico della web app;
- non mettere componenti di dominio dentro `components/ui`;
- usare TypeScript in modo esplicito;
- usare Zod per validazione input;
- centralizzare configurazioni condivise in `@culturando/config`;
- centralizzare tipi di dominio in `@culturando/types`;
- proteggere la privacy degli utenti, soprattutto sulla posizione;
- preferire mock data prima di introdurre database complessi;
- introdurre astrazioni solo quando servono realmente;
- mantenere il progetto leggibile e scalabile.

## 14. Descrizione breve finale

Culturando è una web app geolocalizzata per condividere, scoprire e valorizzare patrimoni librari privati. Il progetto usa un monorepo Nx con Next.js per la web app e package condivisi per configurazioni, tipi, traduzioni, geolocalizzazione, database e AI. L’architettura è feature-based: le route restano in `app/`, le funzionalità in `features/`, i componenti generici in `components/ui` e il codice riusabile in `packages/*`. L’obiettivo tecnico è costruire una piattaforma pulita, scalabile, pronta per autenticazione, catalogazione libri, mappe geolocalizzate, privacy della posizione, i18n e futura estensione mobile.

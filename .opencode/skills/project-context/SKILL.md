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
- `@culturando/translation` per dizionari e chiavi testuali condivise;
- Biome per linting e formatting;
- package condivisi sotto `packages/*`.

Stack previsto nelle fasi successive:

- PostgreSQL come database relazionale;
- PostGIS per funzionalità geospaziali;
- Prisma come ORM;
- MapLibre GL JS per mappe interattive 2D/3D;
- eventuale pipeline AI/OCR per catalogazione assistita;
- package di traduzione condiviso per i18n;
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
├── input.tsx
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
- futuro `Textarea`;
- futuro `Dialog`.

Non corretto:

- `LoginForm`;
- `BookCard`;
- `NearbyAvailabilityMap`;
- `UserLibraryCard`.

I componenti di dominio devono stare dentro le rispettive feature.

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
│   └── create-book.action.ts
├── components/
│   ├── BookCard.tsx
│   ├── BookForm.tsx
│   ├── BookGrid.tsx
│   ├── BooksCatalog.tsx
│   └── NewBookPlaceholder.tsx
├── data/
│   └── books.repository.ts
├── mocks/
│   └── books.mock.ts
├── schemas/
│   └── book.schema.ts
└── types/
    └── book-form.types.ts
```

Questa suddivisione permette di isolare UI, validazione, azioni e tipi relativi alla stessa feature.
I testi riutilizzabili non devono essere duplicati nelle feature: quando esiste una chiave, devono passare da `@culturando/translation` e dall'hook web `useTranslation`.

In futuro saranno previste feature come:

```txt
features/nearby/
features/dashboard/
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
  books: "/books",
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

Package previsto per la gestione database.

Responsabilità future:

- Prisma Client;
- schema Prisma;
- query condivise;
- seed;
- migrazioni;
- accesso a PostgreSQL;
- supporto futuro a PostGIS.

Struttura futura prevista:

```txt
packages/db/
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── client.ts
    ├── queries/
    │   ├── users.queries.ts
    │   └── books.queries.ts
    └── index.ts
```

Non deve essere riempito prima che il dominio dati sia sufficientemente chiaro.

### 6.4 `packages/geo`

Package previsto per logiche geospaziali pure.

Responsabilità future:

- calcolo distanza;
- normalizzazione coordinate;
- approssimazione coordinate per privacy;
- conversione in GeoJSON;
- funzioni riutilizzabili da web, API e mobile.

Esempi futuri:

```ts
calculateDistance()
approximateCoordinates()
generatePublicLocation()
toGeoJsonFeature()
```

Questo package è importante per la natura geolocalizzata di Culturando.

### 6.5 `packages/ai`

Package previsto per catalogazione assistita e funzioni AI.

Responsabilità future:

- estrazione ISBN da testo;
- OCR su immagini copertina/retro;
- normalizzazione metadati libro;
- lookup su fonti bibliografiche esterne;
- suggerimento categorie e tag;
- ranking risultati.

Esempi futuri:

```ts
extractIsbnFromText()
normalizeBookMetadata()
rankBookResults()
suggestBookTags()
```

### 6.6 `packages/translation`

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
- Credentials provider temporaneo basato su variabili demo;
- nessun adapter database finché Prisma/PostgreSQL non saranno introdotti.

Variabili richieste per provare il login demo:

```txt
AUTH_SECRET=
AUTH_URL=http://localhost:3000
AUTH_DEMO_EMAIL=
AUTH_DEMO_PASSWORD=
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
- mostrare errore tradotto quando le credenziali non sono valide o l'utente demo non è configurato;
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
- validare input con Zod;
- verificare corrispondenza password;
- preparare futura registrazione utente;
- linkare alla login.

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
- font variables;
- radius;
- shadow tokens;
- layer base.

Il tema usa variabili HSL compatibili con Tailwind v3 e shadcn-like components.

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

La dashboard è l’area privata dell’utente ed è stata introdotta come placeholder protetto.

Struttura attuale:

```txt
apps/web/src/app/dashboard/page.tsx
apps/web/src/features/dashboard/components/DashboardOverview.tsx
```

La route `/dashboard` usa `auth()` lato server. Se non esiste una sessione valida, reindirizza a `/auth/login`.

Responsabilità attuali:

- verificare il flusso `login -> sessione -> dashboard -> logout`;
- mostrare i dati base della sessione Auth.js;
- esporre una CTA verso la creazione libro;
- esporre logout tramite `logoutAction`.

Funzionalità previste:

- visualizzazione libri pubblicati;
- aggiunta nuovi libri;
- gestione profilo;
- gestione richieste ricevute;
- statistiche base;
- accesso rapido alle funzioni di catalogazione.

Route previste/attuali:

```txt
/dashboard                # attuale, placeholder protetto
/dashboard/books/new      # attuale, form libro protetto
/dashboard/books          # previsto
```

### 11.2 Books

La feature books è stata introdotta come primo flusso funzionale dopo auth e dashboard.

Funzionalità attuali:

- catalogo pubblico `/books`;
- dettaglio libro pubblico `/books/[bookId]`;
- ricerca client-side nel catalogo per titolo, autore, ISBN e descrizione;
- filtri client-side per stato e visibilità;
- card libro con titolo, autore, descrizione, ISBN, stato e visibilità;
- mock data iniziali in `features/books/mocks/books.mock.ts`;
- form nuovo libro protetto in `/dashboard/books/new`;
- validazione Zod in `features/books/schemas/book.schema.ts`;
- server action `createBookAction`;
- recupero singolo libro tramite `getBookById`;
- persistenza mock JSON locale in `apps/web/data/books.json` tramite `features/books/actions/books.repository.ts`;
- revalidazione della route `/books` dopo il salvataggio;
- testi UI centralizzati in `@culturando/translation`.

Funzionalità ancora previste:

- CRUD reale tramite database;
- upload copertine;
- gestione avanzata stato disponibilità;
- integrazione con geolocalizzazione e disponibilità vicine.

Struttura attuale:

```txt
features/books/
├── actions/
│   └── create-book.action.ts
├── components/
│   ├── BookCard.tsx
│   ├── BookDetail.tsx
│   ├── BookGrid.tsx
│   ├── BooksCatalog.tsx
│   ├── BookForm.tsx
│   └── NewBookPlaceholder.tsx
├── data/
│   └── books.repository.ts
├── mocks/
│   └── books.mock.ts
├── schemas/
│   └── book.schema.ts
└── types/
    └── book-form.types.ts
```

### 11.3 Nearby / disponibilità vicine

La feature nearby permetterà di cercare libri o luoghi culturali vicini a una zona.

Funzionalità previste:

- ricerca disponibilità vicine;
- mappa interattiva;
- lista alternativa testuale;
- marker per utenti, biblioteche, librerie, cartolerie;
- distinzione tra disponibilità verificata e luoghi non verificati;
- rispetto della privacy tramite coordinate approssimate.

Route prevista:

```txt
/books/[slug]/nearby
```

### 11.4 MapLibre e geolocalizzazione

La mappa sarà basata su MapLibre GL JS.

Funzioni previste:

- rendering WebGL;
- zoom e pan;
- vista urbana;
- possibile effetto 3D;
- layer GeoJSON;
- marker interattivi;
- integrazione futura con OpenStreetMap/Overpass per biblioteche, librerie e cartolerie.

La disponibilità verificata sarà solo quella proveniente dagli utenti Culturando. I luoghi esterni saranno luoghi potenzialmente rilevanti, ma non garantiranno la disponibilità reale del libro.

### 11.5 Database

Il database previsto è PostgreSQL con PostGIS.

Motivazioni:

- dominio relazionale: utenti, libri, richieste, posizioni, statistiche;
- necessità di query consistenti;
- supporto geospaziale tramite PostGIS;
- possibilità di usare JSONB per metadati AI o risposte da API esterne.

Entità previste:

- User;
- Book;
- Location;
- LoanRequest;
- BookStats;
- BookView;
- UserProfile.

### 11.6 AI catalogazione

Funzione futura per aiutare l’utente a compilare una scheda libro.

Pipeline prevista:

```txt
upload immagine copertina/retro
→ OCR
→ estrazione testo
→ estrazione ISBN
→ lookup metadati libro
→ ranking risultati
→ precompilazione form
→ conferma utente
```

Fonti possibili:

- Google Books API;
- Open Library API;
- OCR locale o servizio esterno.

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
10. completare la prima esperienza catalogo con dettaglio libro, ricerca e filtri — completato.

Ordine dei prossimi step:

1. consolidare il dominio `Book` MVP con campi bibliografici e disponibilità necessari;
2. aggiornare form, card, dettaglio e filtri in base al dominio `Book` consolidato;
3. collegare Auth.js a utenti reali quando sarà disponibile il database;
4. configurare database con Prisma/PostgreSQL/PostGIS;
5. migrare la persistenza mock JSON dei libri verso CRUD reale;
6. introdurre feature nearby con MapLibre;
7. introdurre AI catalogazione.

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

---
name: project-scaffolding
description: Defines the required project structure, scaffolding rules and architectural boundaries for the Culturando Nx monorepo.
---

# Project Scaffolding — Culturando

## Scopo della skill

Questa skill definisce le regole di struttura, organizzazione e scaffolding del progetto **Culturando**.

Ogni agente che lavora sul progetto deve rispettare queste regole quando:

* crea nuove pagine;
* crea nuove feature;
* crea nuovi componenti;
* crea nuovi hook;
* crea nuovi package condivisi;
* effettua refactor architetturali;
* sposta file tra `apps/web` e `packages/*`;
* introduce nuove convenzioni strutturali.

L’obiettivo è mantenere il progetto pulito, leggibile, scalabile e coerente con l’architettura scelta.

Culturando usa un monorepo Nx con una web app Next.js in `apps/web` e package condivisi sotto `packages/*`.

---

## Struttura generale del progetto

La struttura principale del repository deve seguire questo schema:

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

Responsabilità principali:

```txt
apps/web        → applicazione Next.js principale
packages/*      → codice condivisibile tra web, mobile, backend o script
.opencode       → skill operative per agenti OpenCode
```

---

## Struttura obbligatoria di `apps/web/src`

La struttura di `apps/web/src` deve seguire questo schema:

```txt
apps/web/src/
├── app/
├── components/
├── config/
├── features/
├── hooks/
└── lib/
```

Ogni cartella ha una responsabilità precisa.

```txt
app/          → routing Next.js App Router
components/   → componenti condivisi a livello app
config/       → configurazioni specifiche della web app
features/     → feature applicative
hooks/        → hook React condivisi a livello app
lib/          → utility tecniche specifiche della web app
```

Non creare cartelle parallele non previste come:

```txt
views/
screens/
pages/
modules/
shared/
common/
utils/
```

salvo esplicita richiesta dell’utente o refactor architetturale motivato.

---

## Regola fondamentale: separazione tra `apps/web` e `packages/*`

La distinzione più importante del progetto è questa:

```txt
apps/web    → codice specifico della web app
packages/*  → codice puro, condivisibile e indipendente dalla web app
```

### Deve stare in `apps/web`

Mettere in `apps/web` tutto ciò che dipende da:

```txt
- React;
- Next.js;
- App Router;
- DOM;
- Tailwind CSS;
- componenti UI;
- hook React;
- route web;
- form web;
- layout web;
- middleware Next;
- server actions specifiche della web app.
```

Esempi:

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

### Deve stare in `packages/*`

Mettere in `packages/*` solo codice condivisibile, possibilmente puro e indipendente dalla singola app.

Esempi:

```txt
appConfig
authConfig
tipi User/Book/Loan
funzioni geografiche pure
dizionari di traduzione
client database
funzioni AI pure
```

### Regola pratica

Quando l’agente crea un file deve chiedersi:

```txt
Questo file può essere usato anche da mobile, backend o script?
```

Se sì, può stare in `packages/*`.

Se no, deve stare in `apps/web`.

---

## Struttura di `app/`

La cartella:

```txt
apps/web/src/app/
```

è riservata al routing Next.js App Router.

Esempio:

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

### Regola delle pagine sottili

I file `page.tsx` devono rimanere sottili.

Devono occuparsi principalmente di:

```txt
- comporre componenti;
- applicare layout di pagina;
- gestire metadata quando necessario;
- delegare la logica alle feature.
```

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

Esempio sbagliato:

```tsx
export default function LoginPage() {
  // 300 righe di form
  // validazione
  // stati React
  // chiamate API
  // markup complesso
}
```

Se una pagina diventa complessa, la logica deve essere spostata dentro la feature corrispondente.

---

## Struttura di `features/`

Le feature devono stare sotto:

```txt
apps/web/src/features/
```

Schema consigliato:

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

Le cartelle non sono tutte obbligatorie.

Creare una cartella solo quando serve davvero.

Non creare folder vuote.

---

## Responsabilità delle cartelle feature

### `components/`

Contiene componenti specifici della feature.

Esempi:

```txt
features/auth/components/LoginForm.tsx
features/auth/components/SignupForm.tsx
features/books/components/BookCard.tsx
features/books/components/BookGrid.tsx
```

### `actions/`

Contiene azioni asincrone, server actions o funzioni operative legate alla feature.

Esempi:

```txt
features/auth/actions/login.action.ts
features/auth/actions/signup.action.ts
features/books/actions/create-book.action.ts
```

### `schemas/`

Contiene schema Zod specifici della feature.

Esempi:

```txt
features/auth/schemas/login.schema.ts
features/auth/schemas/signup.schema.ts
features/books/schemas/book.schema.ts
```

### `hooks/`

Contiene hook React specifici della feature.

Esempi:

```txt
features/auth/hooks/useLoginForm.ts
features/books/hooks/useBookFilters.ts
```

### `types/`

Contiene tipi specifici della feature, non condivisi globalmente.

Esempi:

```txt
features/auth/types/auth-form.types.ts
features/books/types/book-form.types.ts
```

Se un tipo è di dominio ed è utile anche fuori dalla web app, deve essere promosso in:

```txt
packages/types
```

### `constants/`

Contiene costanti specifiche della feature.

Esempi:

```txt
features/auth/constants/auth-copy.ts
features/books/constants/book-filters.ts
```

Quando è attivo il package `packages/translation`, i testi UI non devono essere hardcoded qui, ma spostati nei dizionari.

### `mocks/`

Contiene mock data specifici della feature.

Esempi:

```txt
features/books/mocks/books.mock.ts
features/nearby/mocks/nearby.mock.ts
```

---

## Feature attuali e previste

Feature attuali:

```txt
features/auth
```

Feature previste:

```txt
features/dashboard
features/books
features/nearby
features/profile
features/cataloging
```

Ogni nuova feature deve essere creata dentro:

```txt
apps/web/src/features/<feature>
```

Non creare feature direttamente dentro `src/`.

---

## Struttura di `components/`

La cartella:

```txt
apps/web/src/components/
```

contiene componenti condivisi a livello web app.

Schema:

```txt
components/
├── ui/
└── <eventuali componenti app-level>
```

---

## Regola per `components/ui`

La cartella:

```txt
apps/web/src/components/ui/
```

contiene solo componenti primitivi, generici e riutilizzabili, ispirati a shadcn/ui.

Esempi corretti:

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

Questi componenti non devono conoscere il dominio Culturando.

Non inserire in `components/ui` componenti come:

```txt
LoginForm
SignupForm
BookCard
BookGrid
UserProfileCard
NearbyMap
DashboardHeader
```

Questi componenti devono stare dentro la feature di appartenenza.

---

## Regola per componenti app-level

Se un componente è condiviso tra più feature ma non è un primitivo UI, può stare in:

```txt
apps/web/src/components/
```

Esempi:

```txt
AppHeader
AppFooter
MainNavigation
ThemeToggle
UserMenu
```

Non metterli dentro `components/ui`, perché non sono primitivi UI.

---

## Regola di promozione

Quando un componente, hook o utility viene usato da più consumer, deve essere promosso al livello corretto.

Schema:

```txt
page/local → feature → app → packages
```

### Esempio componente

```txt
Usato solo da LoginForm
→ features/auth/components

Usato da LoginForm e SignupForm
→ features/auth/components

Usato da auth e books
→ apps/web/src/components

È un primitivo UI generico
→ apps/web/src/components/ui
```

### Esempio hook

```txt
Usato solo dalla feature books
→ features/books/hooks

Usato da più feature web
→ apps/web/src/hooks

È una funzione pura senza React
→ packages/*
```

### Esempio tipo

```txt
Tipo specifico di LoginForm
→ features/auth/types

Tipo Book, User, Loan, Location
→ packages/types
```

### Esempio traduzione

```txt
Dizionari e funzione pura getTranslation
→ packages/translation

Hook React useTranslation
→ apps/web/src/hooks/useTranslation.ts
```

---

## Divieto di import trasversali tra feature

Una feature non deve importare direttamente file interni di un’altra feature.

Esempio sbagliato:

```ts
import { Something } from "@/features/books/components/BookCard";
```

dentro:

```txt
features/auth
```

Se un componente o una funzione serve a più feature, deve essere promosso a:

```txt
apps/web/src/components
apps/web/src/hooks
apps/web/src/lib
packages/*
```

a seconda del caso.

---

## Regola sugli import

Usare preferibilmente gli alias configurati della web app:

```ts
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { routes } from "@/config/routes";
```

Evitare import relativi lunghi:

```ts
import { Button } from "../../../../components/ui/button";
```

Gli import relativi sono accettabili solo tra file molto vicini nella stessa feature.

---

## Regola sui barrel `index.ts`

I barrel `index.ts` sono consentiti, ma non obbligatori ovunque.

Usarli quando migliorano la leggibilità degli import.

### Barrel consigliati

```txt
features/<feature>/components/index.ts
features/<feature>/hooks/index.ts
packages/<package>/src/index.ts
```

### Barrel opzionali

```txt
features/<feature>/index.ts
apps/web/src/components/index.ts
apps/web/src/hooks/index.ts
```

### Barrel da evitare se inutili

Non creare `index.ts` vuoti o usati solo per rispettare una forma astratta.

Non creare barrel che generano import circolari.

Non creare barrel se la feature ha un solo file e l’import diretto è più chiaro.

---

## Regola sulle cartelle vuote

Non creare cartelle vuote.

Non creare barrel orfani.

Esempio sbagliato:

```txt
features/books/
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
└── schemas/
```

se non esistono ancora componenti, hook o schema reali.

Creare le cartelle solo quando contengono almeno un file utile.

---

## Regola su `config/`

La cartella:

```txt
apps/web/src/config/
```

contiene configurazioni specifiche della web app.

Esempi:

```txt
routes.ts
navigation.ts
metadata.ts
```

Le route web devono stare qui:

```txt
apps/web/src/config/routes.ts
```

Non metterle in:

```txt
packages/config
```

perché sono specifiche di Next.js e della web app.

---

## Regola su `packages/config`

Il package:

```txt
packages/config
```

contiene configurazioni generali condivisibili.

Esempi:

```txt
app.config.ts
auth.config.ts
constants.ts
```

Contenuti corretti:

```txt
nome app
descrizione app
lingua di default
autori
publisher
lunghezza minima password
costanti condivise
```

Contenuti sbagliati:

```txt
route Next.js
metadata tipizzati con Metadata di next
classi Tailwind
hook React
componenti UI
```

`packages/config` non deve dipendere da Next.js.

---

## Regola su `packages/types`

Il package:

```txt
packages/types
```

contiene tipi di dominio condivisi.

Esempi corretti:

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

Esempi sbagliati:

```txt
LoginFormValues
SignupFormValues
AuthFormState
```

I tipi dei form restano nella feature web finché non diventano realmente condivisi.

---

## Regola su `packages/translation`

Il package:

```txt
packages/translation
```

contiene i dizionari di traduzione condivisi.

Struttura attesa:

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

Regole:

```txt
it.ts è la fonte di verità.
en.ts deve mantenere la stessa struttura di it.ts.
Le chiavi non devono essere tradotte.
Solo i valori testuali devono essere tradotti.
```

La logica React di traduzione non deve stare nel package.

Esempio:

```txt
packages/translation/src/dictionaries/it.ts
packages/translation/src/dictionaries/en.ts
apps/web/src/hooks/useTranslation.ts
```

---

## Regola su `packages/db`

Il package:

```txt
packages/db
```

conterrà la logica database.

Responsabilità previste:

```txt
Prisma Client
schema Prisma
query condivise
seed
migrazioni
accesso a PostgreSQL
supporto PostGIS
```

Non introdurre database logic dentro feature React se è riutilizzabile.

---

## Regola su `packages/geo`

Il package:

```txt
packages/geo
```

contiene logiche geospaziali pure.

Esempi:

```txt
calculateDistance
approximateCoordinates
toGeoJsonFeature
normalizeCoordinates
```

Non deve contenere componenti mappa React.

Componenti React con MapLibre devono stare in:

```txt
apps/web/src/features/nearby/components
```

oppure, se app-level:

```txt
apps/web/src/components
```

---

## Regola su `packages/ai`

Il package:

```txt
packages/ai
```

contiene codice AI reale del progetto.

Esempi futuri:

```txt
extractIsbnFromText
normalizeBookMetadata
rankBookResults
suggestBookTags
```

Le skill OpenCode non devono stare in `packages/ai`.

Le skill devono stare in:

```txt
.opencode/skills/<skill-name>/SKILL.md
```

---

## Regola sulle skill OpenCode

Le skill operative degli agenti devono stare in:

```txt
.opencode/skills/
```

Schema:

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

Ogni skill deve avere frontmatter:

```md
---
name: project-scaffolding
description: Defines the required project structure and scaffolding rules for the Culturando Nx monorepo.
---
```

Il campo `name` deve coincidere con il nome della cartella.

---

## Regola per nuovi package

Quando viene creato un nuovo package sotto `packages/*`, deve avere almeno:

```txt
packages/<name>/
├── package.json
└── src/
    └── index.ts
```

Il `package.json` deve usare naming coerente:

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

## Regola sulle dipendenze tra package

Le dipendenze tra package devono rimanere chiare.

Esempi accettabili:

```txt
packages/ai       → può dipendere da packages/types e packages/config
packages/geo      → può dipendere da packages/types
packages/db       → può dipendere da packages/types e packages/config
apps/web          → può dipendere da tutti i package necessari
```

Evitare dipendenze inverse:

```txt
packages/types    → non deve dipendere da apps/web
packages/config   → non deve dipendere da Next.js
packages/geo      → non deve dipendere da componenti React
packages/ai       → non deve dipendere da components/ui
```

---

## Regola su hook React

Gli hook React devono stare in:

```txt
apps/web/src/hooks
```

se sono condivisi tra più feature.

Devono stare in:

```txt
apps/web/src/features/<feature>/hooks
```

se sono specifici di una feature.

Esempi:

```txt
apps/web/src/hooks/useTranslation.ts
features/books/hooks/useBookFilters.ts
features/auth/hooks/useLoginForm.ts
```

Non mettere hook React in `packages/*`, salvo creazione esplicita di un package React dedicato.

---

## Regola su utility

Le utility specifiche della web app vanno in:

```txt
apps/web/src/lib
```

Esempi:

```txt
cn
formatClassName
client-side helpers
```

Le utility pure e condivisibili vanno in:

```txt
packages/*
```

Esempi:

```txt
calculateDistance      → packages/geo
getTranslation         → packages/translation
normalizeBookMetadata  → packages/ai
```

Non creare cartelle `utils/` sparse senza motivo.

---

## Regola su testi hardcoded

Finché il package `packages/translation` non è attivo, i testi temporanei possono stare in:

```txt
features/<feature>/constants
```

Esempio:

```txt
features/auth/constants/auth-copy.ts
```

Dopo l’introduzione di `packages/translation`, i testi UI devono essere spostati nei dizionari.

I componenti dovranno usare un hook come:

```ts
const t = useTranslation();
```

e chiavi come:

```ts
t("auth.login.title")
```

---

## Regola sui refactor

Gli agenti non devono riorganizzare strutture esistenti senza richiesta esplicita dell’utente.

È consentito spostare file solo se:

```txt
- l’utente ha chiesto un refactor;
- il task corrente lo richiede chiaramente;
- il file è nel posto sbagliato secondo questa skill;
- la modifica è piccola, sicura e motivata.
```

Non effettuare refactor architetturali ampi “di iniziativa”.

Se il repo contiene una struttura legacy, rispettarla finché l’utente non chiede esplicitamente di migrarla.

---

## Regola per nuove feature

Quando viene creata una nuova feature, usare questo schema minimo:

```txt
features/<feature>/
├── components/
└── index.ts    # opzionale
```

Aggiungere altre cartelle solo quando servono.

Esempio per `books`:

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

## Regola per nuove route

Quando viene creata una nuova route Next.js:

```txt
apps/web/src/app/<route>/page.tsx
```

la pagina deve importare componenti dalla feature.

Esempio:

```txt
apps/web/src/app/books/page.tsx
apps/web/src/features/books/components/BookGrid.tsx
```

La route non deve diventare il contenitore principale della logica.

---

## Regola per dashboard

La dashboard sarà una feature e una route privata.

Struttura prevista:

```txt
apps/web/src/app/dashboard/page.tsx
apps/web/src/features/dashboard/
```

La route `/dashboard` deve restare sottile.

La logica dashboard deve stare in:

```txt
features/dashboard
```

---

## Regola per books

La feature books deve stare in:

```txt
apps/web/src/features/books
```

Route previste:

```txt
apps/web/src/app/books/page.tsx
apps/web/src/app/books/[slug]/page.tsx
apps/web/src/app/dashboard/books/new/page.tsx
```

Componenti previsti:

```txt
BookCard
BookGrid
BookForm
```

Tipi di dominio come `Book` devono stare in:

```txt
packages/types
```

Tipi di form come `BookFormValues` devono stare in:

```txt
features/books/types
```

---

## Regola per nearby e mappe

La feature nearby deve stare in:

```txt
apps/web/src/features/nearby
```

Componenti React legati a MapLibre:

```txt
features/nearby/components
```

Funzioni pure geografiche:

```txt
packages/geo
```

Esempi:

```txt
NearbyAvailabilityMap       → features/nearby/components
calculateDistance           → packages/geo
approximateCoordinates      → packages/geo
```

---

## Regola per AI catalogazione

La feature UI di catalogazione assistita deve stare in:

```txt
apps/web/src/features/cataloging
```

La logica AI pura deve stare in:

```txt
packages/ai
```

Esempi:

```txt
CatalogingUploadForm        → features/cataloging/components
extractIsbnFromText         → packages/ai
normalizeBookMetadata       → packages/ai
```

---

## Schema decisionale rapido

Quando devi creare un file, usa questa logica:

```txt
È una route Next.js?
→ apps/web/src/app

È un componente generico UI?
→ apps/web/src/components/ui

È un componente condiviso tra più feature ma non primitivo?
→ apps/web/src/components

È un componente specifico di una feature?
→ apps/web/src/features/<feature>/components

È un hook React condiviso tra più feature?
→ apps/web/src/hooks

È un hook React specifico di una feature?
→ apps/web/src/features/<feature>/hooks

È una route web o configurazione web-specific?
→ apps/web/src/config

È una utility tecnica web-specific?
→ apps/web/src/lib

È un tipo di dominio condiviso?
→ packages/types

È una configurazione condivisa?
→ packages/config

È una traduzione?
→ packages/translation

È una funzione geografica pura?
→ packages/geo

È logica database?
→ packages/db

È logica AI pura?
→ packages/ai

È una skill OpenCode?
→ .opencode/skills/<name>/SKILL.md
```

---

## Esempi corretti

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

## Esempi sbagliati

```txt
apps/web/src/features/LoginForm.tsx
apps/web/src/components/ui/BookCard.tsx
packages/config/src/routes.ts
packages/types/src/login-form.types.ts
packages/ai/skills/project-context.md
apps/web/src/utils/format.ts
apps/web/src/pages/auth/login.tsx
```

Motivi:

```txt
LoginForm deve stare in features/auth/components
BookCard è dominio books, non UI primitiva
routes.ts è specifico web, non config condivisa
login-form.types.ts è specifico web/form
skill OpenCode devono stare in .opencode/skills
utils generico parallelo non previsto
Next App Router usa app/, non pages/
```

---

## Regola finale

Ogni modifica strutturale deve mantenere chiara questa separazione:

```txt
app/           → route Next.js
features/      → funzionalità applicative
components/ui  → primitivi UI generici
components/    → componenti condivisi web app
hooks/         → hook React condivisi web app
lib/           → utility web app
config/        → configurazione web app
packages/*     → codice condivisibile
.opencode/     → skill operative per agenti
```

Se una nuova struttura non rientra chiaramente in queste regole, l’agente deve fermarsi e proporre la scelta architetturale prima di creare file o spostare codice.

Il progetto deve restare semplice, prevedibile e scalabile.

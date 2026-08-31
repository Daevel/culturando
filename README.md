# Culturando <img src="./apps/web/public/logo/favicon-light.svg" alt="Culturando Favicon" width="24" style="vertical-align: middle; margin-bottom: 0.15em;" />

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-green)

<p align="center">
  <img src="./apps/web/public/logo/logo-full-light.svg" alt="Culturando Hero" width="100%" />
</p>

## Project Overview

Culturando is a geolocated web platform that lets private users publish, search and showcase their own book collections.

- **Problem.** Private book collections are scattered and invisible. Owners have no easy way to share them, and readers have no way to discover nearby books that are not in a public library.
- **Solution.** Users create a profile, publish the books in their collection, attach each entry to an approximate location, and let others find them by text or by distance.
- **Audience.** Private book owners and readers interested in discovering, borrowing or consulting books from people nearby.
- **Vision.** Combine cultural geolocation with privacy-safe sharing, so private collections become a discoverable resource without exposing precise personal data or contact details in public.

The project was developed as a Project Work for the Digital Business Computer Science (L-31) degree program, on the topic **"Development of a cultural geolocation software to share the book collections of private users"**.

## Key Features

- **Users** — registration, login, email confirmation, editable profile with a greeting preference, configurable profile visibility, protected user dashboard and admin role.
- **Books** — publish books from the collection with bibliographic metadata (title, author, year, categories, ISBN, publisher, language, description); upload covers and multiple images; assisted cataloging via OCR/ISBN; cover and metadata lookup from Open Library; public catalog with book detail and view counter.
- **Search and geolocation** — textual search by title, author, ISBN, publisher, city, category and description; filter by availability and visibility; geocoding with an address adapter (`@culturando/geo`); nearby search by radius; PostGIS geospatial queries (`ST_DWithin`, `ST_Distance`); MapLibre map with markers, clustering, popups, legend and 2D/3D view.
- **Requests** — consultation, loan or information requests; blocking of invalid or unfulfillable requests; acceptance/rejection by the owner; history of sent requests and cancellation of pending ones.
- **Statistics** — book views, public/private book counts, received and pending requests, most-viewed books, and an admin dashboard with aggregate metrics served through responsive CSS charts.

## Tech Stack

- **Workspace** — Nx monorepo with pnpm.
- **Frontend** — Next.js (App Router), React 19, TypeScript, Tailwind CSS with shadcn-like components.
- **Authentication** — Auth.js; **validation** — Zod.
- **Database** — PostgreSQL with the PostGIS extension, managed through Prisma.
- **Maps** — MapLibre GL JS.
- **Media** — Sharp for WebP thumbnail generation; optional Cloudflare R2 for image storage.
- **Email** — Nodemailer with SMTP for transactional email.
- **Optional services** — Geoapify (geocoding/autocomplete) and a Cloudflare OCR Worker (assisted cataloging), each with a local fallback.

## Getting Started

### Prerequisites

- Node.js
- pnpm (enable it through Corepack if needed)

```bash
corepack enable
```

- Docker Desktop, running (used for the local PostgreSQL/PostGIS container).

### Quick start

From the repository root, start Docker Desktop and run:

```bash
pnpm dev:fresh
```

This one command:

- creates `.env` from `.env.example` if it does not exist;
- installs dependencies;
- starts PostgreSQL with PostGIS via Docker Compose;
- enables the PostGIS extension;
- generates the Prisma Client and applies migrations (or syncs the schema, then seeds demo data);
- starts the Next.js web app.

The app is then available at:

```txt
http://localhost:3000
```

### Environment variables

The local setup copies `.env.example` to `.env`. All variables are pre-filled for local development with sensible defaults. The remaining groups are optional and each falls back to a local equivalent when not configured:

- **Email** — `EMAIL_PROVIDER=console` prints verification links in the server logs (recommended in development); leave it empty to send real email via the `SMTP_*` variables.
- **Cloudflare R2** — `R2_*` enable cloud image storage; if incomplete, images are stored locally.
- **Cloudflare OCR** — `CLOUDFLARE_OCR_*` enable external OCR-assisted cataloging; if unset, a mock is used.
- **Geoapify** — `GEOAPIFY_API_KEY` enables more accurate geocoding/autocomplete; otherwise the app falls back to Nominatim/OpenStreetMap.

### Daily development

After the first setup, start the app with:

```bash
pnpm dev
```

Re-run the full setup and start the app again with:

```bash
pnpm dev:fresh
```

### Database management

Reset the local database and re-seed it:

```bash
pnpm db:reset
```

Open the Prisma Studio GUI:

```bash
pnpm db:studio
```

## Available Commands

Root scripts from `package.json`:

| Command | Description |
| --- | --- |
| `pnpm dev:fresh` | Full setup (env, deps, database, Prisma, seed) and web app startup. |
| `pnpm setup:dev` | Prepare environment, database and Prisma without starting the app. |
| `pnpm dev` | Start PostgreSQL/PostGIS and the web app (Nx). |
| `pnpm build` | Build the web app. |
| `pnpm start` | Start the built web app. |
| `pnpm lint` | Run Nx ESLint for the web app. |
| `pnpm biome:check` | Run Biome checks. |
| `pnpm biome:write` | Auto-fix formatting/lint with Biome. |
| `pnpm biome:format` | Format files with Biome. |
| `pnpm biome:lint` | Run Biome linter. |
| `pnpm docker:up` | Start the PostgreSQL/PostGIS container. |
| `pnpm docker:down` | Stop the containers. |
| `pnpm docker:reset` | Stop the containers and remove their volumes. |
| `pnpm db:generate` | Generate the Prisma Client. |
| `pnpm db:migrate` | Create/apply local Prisma migrations (dev). |
| `pnpm db:push` | Sync the Prisma schema to the database. |
| `pnpm db:seed` | Populate demo data. |
| `pnpm db:reset` | Full reset of the local database. |
| `pnpm db:studio` | Open Prisma Studio. |
| `pnpm db:logs` | Stream PostgreSQL container logs. |
| `pnpm graph` | Open the Nx project graph. |

## Project Structure

```txt
culturando/
├── apps/
│   └── web/                  # Next.js web application
├── packages/
│   ├── ai/                   # OCR, ISBN and book metadata
│   ├── assets/               # public asset paths
│   ├── config/               # shared configurations
│   ├── db/                   # Prisma schema/client/seed
│   ├── geo/                  # geocoding and privacy-safe coordinates
│   ├── translation/          # i18n dictionaries
│   └── types/                # shared domain types
├── thesis/                   # Project Work materials
├── scripts/                  # setup and database helper scripts
├── docker-compose.yml
├── nx.json
├── package.json
└── pnpm-workspace.yaml
```

## Thesis

The repository includes the university thesis as a LaTeX project under `thesis/thesis_latex/`.

### Prerequisites

- A TeX distribution with `latexmk` and `biber`:
  - **macOS** — MacTeX (`brew install --cask mactex`)
  - **Linux** — TeX Live (`sudo apt install texlive-full`)
  - **Windows** — MiKTeX or TeX Live

### Build

From the thesis directory:

```bash
cd thesis/thesis_latex
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

The compiled PDF is output as `thesis/thesis_latex/main.pdf`.

### Editor alternatives

- **VS Code** — install the [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) extension.
- **TeXstudio** — open `main.tex` directly.
- **Overleaf** — upload the `thesis/thesis_latex/` contents as a new project.

## Additional Information

### Database

The database uses PostgreSQL with the PostGIS extension. The Prisma schema lives at `packages/db/prisma/schema.prisma` and the demo seed at `packages/db/prisma/seed.mjs`.

Main entities: `User`, `EmailVerificationToken`, `Book`, `BookLocation`, `BookImage`, `BookStats`, `LoanRequest`.

Demo credentials:

```txt
admin@culturando.local / Culturando123!
```

Demo users share the password:

```txt
Culturando123!
```

### Privacy

Culturando never displays precise coordinates publicly. Precise coordinates are stored internally when available, while approximate public coordinates are generated and used for the map and spatial search. No email is shown in the contact flow: requests are handled internally (consultation/loan) and profile visibility is configurable.

### Status

The project is a functional prototype. Post-MVP extensions include advanced book editing/deletion, dedicated public profiles, notifications, internal chat, integration with real library catalogs and a mobile application.

### License

The project is released under the [MIT License](./LICENSE).

## Author

Luigi Avitabile

Project Work - Digital Business Computer Science degree program (L-31)

# Culturando <img src="./apps/web/public/logo/favicon-light.svg" alt="Culturando Favicon" width="24" style="vertical-align: middle; margin-bottom: 0.15em;" />

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-green)

**Culturando** is a geolocated web platform for publishing, searching and showcasing private book collections.

The project started as a Project Work for the Digital Business Computer Science (L-31) degree program, on the topic **"Development of a cultural geolocation software to share the book collections of private users"**.

<p align="center">
  <img src="./apps/web/public/logo/logo-full-light.svg" alt="Culturando Hero" width="100%" />
</p>

## Goal

The prototype allows private users to create a profile, publish books from their collection, associate content with an approximate location, search for books by text or distance, and send consultation or loan requests.

The system prioritizes:

- usability and accessibility of the interface;
- protection of personal data;
- privacy-safe geolocation;
- management of covers, thumbnails and previews;
- simple usage statistics;
- modular and documentable architecture.

## Project Work Requirements

The official Project Work template is kept at:

```txt
thesis/Project Work - Luigi Avitabile.docx.pdf
```

The repository covers the main requested artifacts:

- prototype web application;
- registration, login, email confirmation and user profile;
- publication of the book collection;
- book metadata entry: title, author, year, categories, ISBN, publisher, language and description;
- cover image upload with previews and persisted thumbnail URLs;
- textual search in the catalog;
- spatial search by area and distance;
- MapLibre map display;
- book detail with images and simulated loan/consultation request;
- user dashboard with metrics and basic charts;
- administrative dashboard with aggregate metrics;
- PostgreSQL/PostGIS database with Prisma schema and demo seed;
- structured front-end components and targeted comments on the less obvious choices.

The technical thesis report is maintained as a separate file outside the README.

## Technology Stack

- Nx monorepo;
- pnpm;
- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn-like UI components;
- Auth.js;
- Zod;
- Prisma;
- PostgreSQL with PostGIS;
- MapLibre GL JS;
- optional Geoapify for geocoding and address autocomplete;
- optional Cloudflare R2 for image storage;
- Sharp for WebP thumbnail generation;
- Nodemailer with SMTP for transactional emails;
- Sonner for application notifications;
- Biome;
- shared packages for config, types, database, geolocation, AI, assets and translations.

## Structure

```txt
culturando/
├── apps/
│   └── web/                  # Next.js application
├── packages/
│   ├── ai/                   # OCR, ISBN and book metadata
│   ├── assets/               # public asset paths
│   ├── config/               # shared configurations
│   ├── db/                   # Prisma schema/client/seed
│   ├── geo/                  # geocoding and privacy-safe coordinates
│   ├── translation/          # i18n dictionaries
│   └── types/                # shared domain types
├── thesis/                   # Project Work materials
├── docker-compose.yml
├── nx.json
├── package.json
└── pnpm-workspace.yaml
```

## Implemented Features

### Users

- registration and login;
- email confirmation via token;
- editable personal profile;
- greeting preference;
- profile visibility management;
- protected dashboard;
- admin role.

### Books

- book creation from the private area;
- form validation with Zod;
- main bibliographic metadata;
- cover and multiple image upload;
- local or Cloudflare R2 image storage;
- persisted thumbnail URL for thumbnails and previews;
- cover and metadata search from Open Library;
- OCR/ISBN-assisted cataloging;
- public catalog;
- book detail;
- view counter.

### Search And Geolocation

- textual search by title, author, ISBN, publisher, city, category and description;
- filters by availability and visibility;
- address geocoding through the adapter in `@culturando/geo`;
- Geoapify as the main provider when configured, with Nominatim/OpenStreetMap fallback;
- address normalization in the `street/civic number, city, province` format;
- private coordinates stored separately from approximate public coordinates;
- nearby book search by radius;
- PostGIS geospatial queries with `ST_DWithin` and `ST_Distance`;
- MapLibre map with markers, clustering, popups, legend and 2D/3D view.

### Requests

- consultation, loan or information request;
- blocking of invalid requests or requests toward unavailable books;
- management of received requests;
- acceptance/rejection by the owner;
- history of sent requests;
- cancellation of requests still pending.

### Statistics

- book views;
- count of public/private books;
- received and pending requests;
- most viewed books;
- admin dashboard with users, books, requests and views;
- basic charts via responsive CSS bars.

## Database

The database uses PostgreSQL with the PostGIS extension. The schema lives at:

```txt
packages/db/prisma/schema.prisma
```

Main entities:

- `User`;
- `EmailVerificationToken`;
- `Book`;
- `BookLocation`;
- `BookImage`;
- `BookStats`;
- `LoanRequest`.

The demo seed lives at:

```txt
packages/db/prisma/seed.mjs
```

Demo credentials:

```txt
admin@culturando.local / Culturando123!
```

Demo users share the password:

```txt
Culturando123!
```

## Local development setup

### Prerequisites

Make sure you have installed:

- Node.js
- pnpm
- Docker Desktop

Enable pnpm through Corepack if needed:

```bash
corepack enable
```

### Start the project from scratch

After cloning the repository, start Docker Desktop and run:

```bash
pnpm dev:fresh
```

This single command will:

* install dependencies;
* create `.env` from `.env.example` if missing;
* start PostgreSQL with PostGIS through Docker Compose;
* wait for the database to be ready;
* generate Prisma Client when Prisma is configured;
* apply local database migrations when Prisma is configured;
* run the seed script when available;
* start the Next.js web app.

The web app will be available at:

```txt
http://localhost:3000
```

### Daily development

After the first setup, you can usually start the app with:

```bash
pnpm dev
```

If you want to re-run the full setup and start the app again:

```bash
pnpm dev:fresh
```

### Reset local database

```bash
pnpm db:reset
```

### Prisma Studio

```bash
pnpm db:studio
```

The variables `R2_*`, `SMTP_*`, `CLOUDFLARE_OCR_*` and `GEOAPIFY_API_KEY` are optional or environment-specific and are used for cloud storage, real email sending via SMTP, external OCR and more accurate geocoding/autocomplete.

## Scripts

```bash
pnpm dev:fresh        # full setup and web app startup
pnpm setup:dev        # prepares environment, database and Prisma without starting the app
pnpm dev              # starts database, PostGIS and web app
pnpm build            # build the web app
pnpm lint             # Nx lint for web
pnpm biome:check      # Biome check
pnpm biome:write      # format/lint auto-fix
pnpm docker:up        # starts PostgreSQL/PostGIS
pnpm docker:down      # stops the containers
pnpm docker:reset     # stops the containers and removes the volumes
pnpm db:generate      # generates Prisma Client
pnpm db:migrate       # applies local Prisma migrations
pnpm db:push          # syncs Prisma schema
pnpm db:seed          # populates demo data
pnpm db:reset         # full local database reset
pnpm db:studio        # opens Prisma Studio
```

## Privacy

Culturando does not publicly display precise coordinates.

The adopted strategy is:

- internal storage of precise coordinates when available;
- generation of approximate public coordinates;
- use of public coordinates for map and spatial search;
- no public email in the contact flow;
- internal requests for consultation or loan;
- configurable profile visibility.

## Status

The project is a functional prototype consistent with the Project Work topic. Natural post-MVP extensions are advanced book editing/deletion, dedicated public profiles, notifications, internal chat, integration with real library catalogs and a mobile application.

## Author

Luigi Avitabile

Project Work - Digital Business Computer Science degree program (L-31)

# Culturando

**Culturando** è una piattaforma web geolocalizzata per pubblicare, cercare e valorizzare patrimoni librari privati.

Il progetto nasce come Project Work per il CdS Informatica per le Aziende Digitali (L-31), traccia **"Sviluppo di un software di geolocalizzazione culturale per condividere il patrimonio librario degli utenti privati"**.

## Obiettivo

Il prototipo permette a utenti privati di creare un profilo, pubblicare libri della propria raccolta, associare i contenuti a una posizione approssimata, cercare libri per testo o distanza e inviare richieste di consultazione o prestito.

Il sistema privilegia:

- usabilità e accessibilità dell'interfaccia;
- protezione dei dati personali;
- geolocalizzazione privacy-safe;
- gestione di copertine, miniature e anteprime;
- statistiche d'uso semplici;
- architettura modulare e documentabile.

## Requisiti Del Project Work

Il template ufficiale del Project Work è conservato in:

```txt
thesis/Project Work - Luigi Avitabile.docx.pdf
```

Il repository copre i principali artefatti richiesti:

- applicazione web prototipo;
- registrazione, login, conferma email e profilo utente;
- pubblicazione del patrimonio librario;
- inserimento metadati libro: titolo, autore, anno, categorie, ISBN, editore, lingua e descrizione;
- upload immagini di copertina con anteprime e URL thumbnail persistite;
- ricerca testuale nel catalogo;
- ricerca spaziale per area e distanza;
- visualizzazione su mappa MapLibre;
- dettaglio libro con immagini e richiesta prestito/consultazione simulata;
- dashboard utente con metriche e grafici base;
- dashboard amministrativa con metriche aggregate;
- database PostgreSQL/PostGIS con schema Prisma e seed demo;
- componenti front-end strutturati e commenti mirati sulle scelte meno ovvie.

Il rapporto tecnico della tesi è mantenuto come file separato fuori dal README.

## Stack Tecnologico

- Nx monorepo;
- pnpm;
- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- componenti UI shadcn-like;
- Auth.js;
- Zod;
- Prisma;
- PostgreSQL con PostGIS;
- MapLibre GL JS;
- Geoapify opzionale per geocoding e autocomplete indirizzi;
- Cloudflare R2 opzionale per storage immagini;
- Sharp per generazione miniature WebP;
- Nodemailer con SMTP per email transazionali;
- Sonner per notifiche applicative;
- Biome;
- package condivisi per config, tipi, database, geolocalizzazione, AI, asset e traduzioni.

## Struttura

```txt
culturando/
├── apps/
│   └── web/                  # applicazione Next.js
├── packages/
│   ├── ai/                   # OCR, ISBN e metadati libro
│   ├── assets/               # path asset pubblici
│   ├── config/               # configurazioni condivise
│   ├── db/                   # Prisma schema/client/seed
│   ├── geo/                  # geocoding e coordinate privacy-safe
│   ├── translation/          # dizionari i18n
│   └── types/                # tipi di dominio condivisi
├── thesis/                   # materiali del Project Work
├── docker-compose.yml
├── nx.json
├── package.json
└── pnpm-workspace.yaml
```

## Funzionalità Implementate

### Utenti

- registrazione e login;
- conferma email tramite token;
- profilo personale modificabile;
- preferenza di saluto;
- gestione visibilità profilo;
- dashboard protetta;
- ruolo admin.

### Libri

- creazione libro da area privata;
- validazione form con Zod;
- metadati bibliografici principali;
- upload copertine e immagini multiple;
- salvataggio immagini locale o su Cloudflare R2;
- URL thumbnail persistita per miniature e anteprime;
- ricerca copertina e metadati da Open Library;
- catalogazione assistita da OCR/ISBN;
- catalogo pubblico;
- dettaglio libro;
- conteggio visualizzazioni.

### Ricerca E Geolocalizzazione

- ricerca testuale per titolo, autore, ISBN, editore, città, categoria e descrizione;
- filtri per disponibilità e visibilità;
- geocoding indirizzo tramite adapter in `@culturando/geo`;
- Geoapify come provider principale quando configurato, con fallback Nominatim/OpenStreetMap;
- normalizzazione indirizzi nel formato `via/corso civico, città, provincia`;
- coordinate private salvate separatamente dalle coordinate pubbliche approssimate;
- ricerca libri vicini per raggio;
- query geospaziali PostGIS con `ST_DWithin` e `ST_Distance`;
- mappa MapLibre con marker, cluster, popup, legenda e vista 2D/3D.

### Richieste

- richiesta di consultazione, prestito o informazioni;
- blocco richieste non valide o verso libri non disponibili;
- gestione richieste ricevute;
- accettazione/rifiuto da parte del proprietario;
- storico richieste inviate;
- annullamento richieste ancora in attesa.

### Statistiche

- visualizzazioni libro;
- conteggio libri pubblici/privati;
- richieste ricevute e in attesa;
- libri più visualizzati;
- dashboard admin con utenti, libri, richieste e visualizzazioni;
- grafici base tramite barre CSS responsive.

## Database

Il database usa PostgreSQL con estensione PostGIS. Lo schema vive in:

```txt
packages/db/prisma/schema.prisma
```

Entità principali:

- `User`;
- `EmailVerificationToken`;
- `Book`;
- `BookLocation`;
- `BookImage`;
- `BookStats`;
- `LoanRequest`.

Il seed demo vive in:

```txt
packages/db/prisma/seed.mjs
```

Credenziali demo:

```txt
admin@culturando.local / Culturando123!
```

Gli utenti demo condividono la password:

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

Le variabili `R2_*`, `SMTP_*`, `CLOUDFLARE_OCR_*` e `GEOAPIFY_API_KEY` sono opzionali o ambientali e servono per storage cloud, invio email reale via SMTP, OCR esterno e geocoding/autocomplete più accurato.

## Script

```bash
pnpm dev:fresh        # setup completo e avvio web app
pnpm setup:dev        # prepara ambiente, database e Prisma senza avviare l'app
pnpm dev              # avvia database, PostGIS e web app
pnpm build            # build web app
pnpm lint             # lint Nx per web
pnpm biome:check      # controllo Biome
pnpm biome:write      # format/lint auto-fix
pnpm docker:up        # avvia PostgreSQL/PostGIS
pnpm docker:down      # ferma i container
pnpm docker:reset     # ferma i container e rimuove i volumi
pnpm db:generate      # genera Prisma Client
pnpm db:migrate       # applica migration Prisma locali
pnpm db:push          # sincronizza schema Prisma
pnpm db:seed          # popola dati demo
pnpm db:reset         # reset completo database locale
pnpm db:studio        # apre Prisma Studio
```

## Privacy

Culturando non mostra pubblicamente coordinate precise.

La strategia adottata è:

- salvataggio interno di coordinate precise quando disponibili;
- generazione di coordinate pubbliche approssimate;
- uso delle coordinate pubbliche per mappa e ricerca spaziale;
- nessuna email pubblica nel flusso di contatto;
- richieste interne per consultazione o prestito;
- visibilità profilo configurabile.

## Stato

Il progetto è un prototipo funzionale coerente con la traccia del Project Work. Le estensioni naturali post-MVP sono modifica/eliminazione avanzata dei libri, profili pubblici dedicati, notifiche, chat interna, integrazione con cataloghi bibliotecari reali e applicazione mobile.

## Autore

Luigi Avitabile

Project Work - CdS Informatica per le Aziende Digitali (L-31)

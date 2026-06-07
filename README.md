# Culturando

**Culturando** è una piattaforma web geolocalizzata per la valorizzazione e la condivisione del patrimonio librario privato.
Il progetto nasce come tesi triennale e ha l’obiettivo di rendere più visibili collezioni, biblioteche domestiche e raccolte tematiche, permettendo agli utenti di pubblicare libri, cercare volumi nelle vicinanze e richiedere consultazioni o prestiti.

## Descrizione

Culturando consente agli utenti di creare un profilo personale, pubblicare libri della propria raccolta privata, associare i contenuti a una posizione approssimata e scoprire libri disponibili nel territorio tramite una mappa interattiva.

La piattaforma integra funzionalità di geolocalizzazione, visualizzazione 3D della mappa, gestione delle immagini di copertina, statistiche d’uso e una componente di catalogazione assistita tramite AI, basata su OCR, riconoscimento ISBN e recupero di metadati bibliografici.

Particolare attenzione viene dedicata a:

* usabilità;
* accessibilità;
* privacy;
* protezione della posizione degli utenti;
* SEO delle pagine pubbliche;
* valorizzazione culturale del patrimonio librario privato.

## Obiettivi del progetto

Gli obiettivi principali di Culturando sono:

* permettere agli utenti di pubblicare e gestire libri appartenenti a patrimoni librari privati;
* consentire la ricerca di libri per titolo, autore, categoria, disponibilità e distanza;
* visualizzare su mappa i libri e gli utenti vicini tramite dati geospaziali;
* mostrare una mappa interattiva con vista 3D, edifici estrusi e animazione della camera;
* distinguere tra disponibilità verificate su Culturando e luoghi esterni potenzialmente rilevanti;
* gestire immagini di copertina e miniature;
* supportare la catalogazione assistita tramite immagine, OCR e ISBN;
* raccogliere statistiche semplici come visualizzazioni e richieste;
* proteggere i dati personali e la posizione precisa degli utenti;
* ottimizzare le pagine pubbliche per la SEO.

## Stack tecnologico

### Architettura

* **Nx Monorepo**
* **pnpm**
* **Node.js v24 LTS — Krypton**
* **Next.js**
* **TypeScript**
* **Auth.js**
* **PostgreSQL**
* **PostGIS**
* **Prisma**
* **Biome**
* **Tailwind CSS**
* **shadcn/ui**

### Mappe e geospazialità

* **MapLibre GL JS**
* **WebGL**
* **Vector tiles**
* **Vista 3D con pitch, bearing e buildings extrusion**
* **Animazione camera con `flyTo`, `rotateTo` e `requestAnimationFrame`**
* **GeoJSON dinamico da API**
* **OpenStreetMap / Overpass API**
* **PMTiles**, opzionale per layer statici
* **deck.gl**, opzionale per heatmap, colonne 3D e statistiche avanzate

### AI

La componente AI principale riguarda la **catalogazione assistita dei libri**.

Pipeline prevista:

1. upload immagine della copertina o del retro del libro;
2. estrazione del testo tramite OCR;
3. rilevamento di eventuale ISBN;
4. lookup dei metadati bibliografici;
5. ranking dei risultati;
6. precompilazione del form libro;
7. conferma o correzione manuale da parte dell’utente.

## Struttura del monorepo

```txt
culturando/
  apps/
    web/

  packages/
    db/
    types/
    geo/
    ai/
    config/
```

### `apps/web`

Contiene l’applicazione principale sviluppata con Next.js.

Include:

* homepage;
* catalogo libri;
* pagine dettaglio libro;
* profili pubblici;
* dashboard utente;
* gestione libri;
* gestione richieste;
* mappa interattiva;
* SEO;
* interfaccia utente.

### `packages/db`

Contiene la logica relativa al database.

Include:

* schema Prisma;
* client database;
* migrazioni;
* seed demo;
* query comuni.

### `packages/types`

Contiene i tipi TypeScript condivisi tra le varie parti del progetto.

Esempi:

* `BookDTO`;
* `UserDTO`;
* `LocationDTO`;
* `BookCategory`;
* `LoanRequestStatus`;
* `SearchFilters`.

### `packages/geo`

Contiene le funzioni geospaziali e privacy-safe.

Esempi:

* calcolo della distanza;
* approssimazione delle coordinate;
* generazione della posizione pubblica;
* normalizzazione delle posizioni.

### `packages/ai`

Contiene la logica relativa alla catalogazione assistita.

Esempi:

* OCR;
* estrazione ISBN;
* lookup metadati;
* ranking risultati;
* suggerimento categoria;
* suggerimento tag.

### `packages/config`

Contiene configurazioni condivise.

Esempi:

* configurazione TypeScript;
* configurazione Biome;
* utility per environment variables.

## Funzionalità principali

### Utenti

* registrazione;
* login;
* logout;
* profilo personale;
* profilo pubblico;
* gestione privacy;
* gestione posizione.

### Libri

* creazione libro;
* modifica libro;
* eliminazione libro;
* upload copertina;
* categorie;
* tag;
* disponibilità per consultazione;
* disponibilità per prestito;
* visibilità pubblica o privata.

### Ricerca

* ricerca per titolo;
* ricerca per autore;
* ricerca per ISBN;
* ricerca per categoria;
* filtri per disponibilità;
* filtri per distanza;
* ordinamento per più recenti o più visualizzati.

### Mappe

* mappa interattiva con MapLibre GL JS;
* basemap vettoriale tiled;
* vista 3D urbana;
* edifici 3D tramite `fill-extrusion`;
* marker per risultati Culturando;
* marker per biblioteche, librerie e cartolerie;
* raggio di ricerca;
* animazione della camera intorno a una zona scelta;
* lista alternativa accessibile ai risultati.

### Disponibilità vicine

Culturando distingue tra:

* **disponibilità verificata**, cioè libri pubblicati dagli utenti della piattaforma;
* **luoghi esterni non verificati**, come biblioteche, librerie e cartolerie ottenute tramite OpenStreetMap / Overpass API.

La disponibilità effettiva di un libro presso biblioteche o librerie esterne non viene garantita senza integrazioni con cataloghi o inventari reali.

### Richieste

* invio richiesta di consultazione o prestito;
* gestione richieste ricevute;
* accettazione o rifiuto richiesta;
* storico delle richieste inviate.

### Statistiche

* visualizzazioni libro;
* numero richieste ricevute;
* libri più visualizzati;
* statistiche base del profilo;
* statistiche aggregate per zona, opzionali.

### SEO

Le pagine pubbliche saranno ottimizzate tramite:

* metadata globali;
* title dinamici;
* description dinamiche;
* slug leggibili;
* canonical URL;
* Open Graph metadata;
* sitemap;
* robots.txt;
* Schema.org `Book`;
* ottimizzazione immagini;
* Core Web Vitals.

Le pagine private, la dashboard e i dati personali non saranno indicizzati.

### Privacy

Culturando non mostra pubblicamente la posizione precisa degli utenti.

Strategia prevista:

* coordinate precise usate solo internamente, se necessario;
* coordinate pubbliche approssimate;
* visualizzazione tramite città, quartiere o zona indicativa;
* raggio di visibilità configurabile;
* possibilità di nascondere la posizione;
* nessuna email pubblica;
* contatto tramite richieste interne.

## Requisiti

* Node.js v24 LTS — Krypton
* pnpm
* PostgreSQL
* PostGIS
* nvm, consigliato

## Setup locale

### 1. Clonare il repository

```bash
git clone https://github.com/username/culturando.git
cd culturando
```

### 2. Usare la versione corretta di Node.js

```bash
nvm use
```

Se la versione non è installata:

```bash
nvm install lts/krypton
nvm use lts/krypton
```

### 3. Installare le dipendenze

```bash
pnpm install
```

### 4. Configurare le variabili ambiente

Creare un file `.env` partendo da `.env.example`:

```bash
cp .env.example .env
```

Variabili previste:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
NEXT_PUBLIC_APP_URL=
```

Altre variabili saranno aggiunte in base ai servizi scelti per storage immagini, geocoding, OCR e API bibliografiche.

### 5. Avviare il database

Il progetto richiede PostgreSQL con estensione PostGIS attiva.

### 6. Eseguire le migrazioni

```bash
pnpm db:migrate
```

### 7. Avviare il progetto

```bash
pnpm dev
```

L’app sarà disponibile su:

```txt
http://localhost:3000
```

## Script principali

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm check
```

## Roadmap MVP

* [ ] setup Nx monorepo;
* [ ] setup Next.js + TypeScript;
* [ ] setup Biome;
* [ ] setup Tailwind CSS + shadcn/ui;
* [ ] setup PostgreSQL + PostGIS + Prisma;
* [ ] autenticazione con Auth.js;
* [ ] CRUD libri;
* [ ] upload copertine;
* [ ] profili utente;
* [ ] ricerca e filtri;
* [ ] geolocalizzazione base;
* [ ] posizione approssimata;
* [ ] mappa MapLibre;
* [ ] vista 3D base;
* [ ] disponibilità vicine Culturando;
* [ ] POI esterni non verificati;
* [ ] richieste consultazione/prestito;
* [ ] statistiche base;
* [ ] SEO base;
* [ ] accessibilità base;
* [ ] deploy.

## Sviluppi futuri

* app mobile con React Native / Expo;
* integrazione deck.gl;
* heatmap;
* colonne 3D;
* vector tiles custom da PostGIS;
* PMTiles;
* ricerca semantica;
* raccomandazioni personalizzate;
* notifiche;
* chat interna;
* integrazione con cataloghi bibliotecari reali;
* integrazione con inventari di librerie.

## Stato del progetto

Il progetto è attualmente in fase di progettazione e setup iniziale.

## Licenza

Da definire.

## Autore

Progetto sviluppato come tesi triennale.

**Culturando** — piattaforma web geolocalizzata per la valorizzazione del patrimonio librario privato.
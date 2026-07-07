# Punto 2 - Applicazione web prototipo

## Repository pubblico

Il codice sorgente dell'applicazione web prototipo e' disponibile nel repository GitHub pubblico:

```txt
https://github.com/daevel/culturando
```

Il repository contiene il progetto Culturando, una web app geolocalizzata per la pubblicazione, consultazione e ricerca di patrimoni librari privati. Il prototipo include registrazione e login utente, gestione profilo, inserimento libri con metadati bibliografici, upload copertina, ricerca testuale, ricerca per distanza, visualizzazione su mappa, pagine dettaglio libro, richieste di consultazione/prestito simulate, statistiche utente e dashboard amministrativa.

## Requisiti locali

Per eseguire il progetto in locale sono necessari:

- Node.js v24 LTS;
- pnpm;
- Docker e Docker Compose;
- Git.

Il database locale viene avviato tramite Docker Compose usando PostgreSQL con estensione PostGIS.

## Avvio in locale

Clonare il repository:

```bash
git clone https://github.com/daevel/culturando.git
cd culturando
```

Installare le dipendenze:

```bash
pnpm install
```

Creare il file di configurazione ambiente:

```bash
cp .env.example .env
```

Il file `.env.example` contiene gia' valori locali utilizzabili per database, Auth.js e URL applicazione. Le variabili Cloudflare R2 sono opzionali: se non configurate, l'upload delle copertine usa lo storage locale in `apps/web/public/uploads/book-covers`.

Avviare il database e creare lo schema:

```bash
pnpm db:up
pnpm db:postgis
pnpm db:push
pnpm db:seed
```

Avviare l'applicazione web:

```bash
pnpm dev
```

L'applicazione sara' disponibile all'indirizzo:

```txt
http://localhost:3000
```

## Credenziali demo

Dopo l'esecuzione del seed, e' disponibile un account amministratore demo:

```txt
Email: admin@culturando.local
Password: Culturando123!
```

Gli altri utenti demo creati dal seed usano la stessa password `Culturando123!`.

## Script utili

```bash
pnpm lint
pnpm build
pnpm db:studio
```

`pnpm lint` verifica la qualita' del codice della web app, `pnpm build` compila il prototipo in modalita' produzione e `pnpm db:studio` apre Prisma Studio per ispezionare i dati del database.

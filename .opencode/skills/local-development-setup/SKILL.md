# Local Development Setup — Culturando

## Scopo

Questa skill definisce le regole per gestire il setup locale del progetto Culturando.

Un nuovo sviluppatore deve poter clonare la repository e avviare tutto con un solo comando:

```bash
pnpm dev:fresh
```

## Regole

* usare pnpm, mai npm o yarn;
* usare Docker Compose per PostgreSQL/PostGIS;
* non containerizzare la web app per lo sviluppo locale, salvo richiesta esplicita;
* mantenere `.env.example` aggiornato;
* non committare `.env`;
* mantenere gli script di setup dentro `scripts/`;
* `setup-dev.sh` prepara ambiente, Docker, database e Prisma;
* `dev-fresh.sh` esegue `setup-dev.sh` e poi avvia l’app con `pnpm dev`;
* attendere sempre il database prima di eseguire comandi Prisma;
* mantenere Prisma dentro `packages/db/prisma`;
* non hardcodare credenziali fuori da `.env.example` e `docker-compose.yml`;
* aggiornare README quando cambia il setup locale.

## Comando principale

```bash
pnpm dev:fresh
```

Questo comando deve:

1. installare dipendenze;
2. creare `.env` se mancante;
3. avviare PostgreSQL/PostGIS;
4. attendere il database;
5. eseguire Prisma generate/migrate/seed se configurati;
6. avviare automaticamente l’app.

# Local Development Setup — Culturando

## Purpose

This skill defines the rules for managing the local setup of the Culturando project.

A new developer must be able to clone the repository and start everything with a single command:

```bash
pnpm dev:fresh
```

## Rules

* use pnpm, never npm or yarn;
* use Docker Compose for PostgreSQL/PostGIS;
* do not containerize the web app for local development, unless explicitly requested;
* keep `.env.example` up to date;
* do not commit `.env`;
* keep the setup scripts inside `scripts/`;
* `setup-dev.sh` prepares the environment, Docker, the database and Prisma;
* `dev-fresh.sh` runs `setup-dev.sh` and then starts the app with `pnpm dev`;
* always wait for the database before running Prisma commands;
* keep Prisma inside `packages/db/prisma`;
* do not hardcode credentials outside `.env.example` and `docker-compose.yml`;
* update the README when the local setup changes.

## Main command

```bash
pnpm dev:fresh
```

This command must:

1. install dependencies;
2. create `.env` if missing;
3. start PostgreSQL/PostGIS;
4. wait for the database;
5. run Prisma generate/migrate/seed if configured;
6. start the app automatically.

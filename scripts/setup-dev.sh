#!/usr/bin/env bash

set -e

PRISMA_SCHEMA="packages/db/prisma/schema.prisma"
PRISMA_MIGRATIONS_DIR="packages/db/prisma/migrations"
PRISMA_SEED="packages/db/prisma/seed.mjs"

echo "🔎 Checking pnpm..."
if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm is required. Enable it with: corepack enable"
  exit 1
fi

echo "🔎 Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is required. Install Docker Desktop and start it before running this command."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
  else
    echo "⚠️ .env.example not found. Skipping .env creation."
  fi
else
  echo "📄 .env already exists."
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐘 Starting PostgreSQL/PostGIS..."
docker compose up -d postgres

bash scripts/wait-for-db.sh

echo "🧩 Ensuring PostGIS extension is enabled..."
docker compose exec -T postgres psql -U culturando -d culturando -c "CREATE EXTENSION IF NOT EXISTS postgis;"

if [ -f "$PRISMA_SCHEMA" ]; then
  echo "🔧 Generating Prisma Client..."
  pnpm db:generate

  if [ -d "$PRISMA_MIGRATIONS_DIR" ] && [ -n "$(ls -A "$PRISMA_MIGRATIONS_DIR")" ]; then
    echo "🗄️ Applying Prisma migrations..."
    pnpm db:migrate
  else
    echo "🗄️ No Prisma migrations found. Synchronizing schema with db push..."
    pnpm db:push
  fi

  if [ -f "$PRISMA_SEED" ]; then
    echo "🌱 Running database seed..."
    pnpm db:seed
  else
    echo "🌱 No Prisma seed found. Skipping seed."
  fi
else
  echo "⚠️ Prisma schema not found at $PRISMA_SCHEMA. Skipping Prisma setup."
fi

echo "✅ Setup completed successfully."
echo ""
echo "You can now start the app with:"
echo "pnpm dev"

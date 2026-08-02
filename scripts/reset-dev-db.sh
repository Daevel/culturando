#!/usr/bin/env bash

set -e

echo "🧨 Resetting local development database..."

docker compose down -v
docker compose up -d postgres

bash scripts/wait-for-db.sh

echo "🧩 Ensuring PostGIS extension is enabled..."
docker compose exec -T postgres psql -U culturando -d culturando -c "CREATE EXTENSION IF NOT EXISTS postgis;"

if [ -f "packages/db/prisma/schema.prisma" ]; then
  pnpm db:generate

  if [ -d "packages/db/prisma/migrations" ] && [ -n "$(ls -A "packages/db/prisma/migrations")" ]; then
    pnpm db:migrate
  else
    pnpm db:push
  fi

  if [ -f "packages/db/prisma/seed.mjs" ]; then
    pnpm db:seed
  fi
fi

echo "✅ Local development database reset completed."

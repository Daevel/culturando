#!/usr/bin/env bash

set -e

MAX_ATTEMPTS="${DB_WAIT_ATTEMPTS:-30}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"

echo "⏳ Waiting for PostgreSQL to be ready..."

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  if docker compose exec -T postgres pg_isready -U culturando -d culturando >/dev/null 2>&1; then
    echo "✅ PostgreSQL is ready."
    exit 0
  fi

  echo "Waiting for database... ($attempt/$MAX_ATTEMPTS)"
  sleep "$SLEEP_SECONDS"
done

echo "❌ PostgreSQL did not become ready in time."
docker compose logs postgres
exit 1

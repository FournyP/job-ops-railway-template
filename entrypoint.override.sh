#!/bin/sh
set -eu

: "${PORT:=3001}"
: "${DATA_DIR:=/app/data}"
: "${RUN_MIGRATIONS:=true}"

mkdir -p "${DATA_DIR}/pdfs"

cd /app/orchestrator

if [ "${RUN_MIGRATIONS}" = "true" ] || [ "${RUN_MIGRATIONS}" = "1" ]; then
  npx tsx src/server/db/migrate.ts
fi

exec npm run start

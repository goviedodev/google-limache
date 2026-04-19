#!/bin/bash
# Google Limache - Script de desarrollo local

cd /home/goviedo/proyectos/limache/google-limache

PERSIST_DIR=".wrangler/state"

echo "🧹 Limpiando cache..."
rm -rf .wrangler
rm -f public/_worker.js

echo "🗄️ Creando tablas en D1 local..."
grep -v "^--" schema.sql | grep -v "^$" > /tmp/schema_clean.sql
npx wrangler d1 execute locales-limache --local --persist-to "$PERSIST_DIR" --file=/tmp/schema_clean.sql

echo "📥 Insertando datos..."
npx wrangler d1 execute locales-limache --local --persist-to "$PERSIST_DIR" --file=scripts/insert_locales.sql

echo "📦 Verificando datos..."
npx wrangler d1 execute locales-limache --local --persist-to "$PERSIST_DIR" --command "SELECT COUNT(*) FROM locales"

echo "🚀 Iniciando servidor..."
npx wrangler pages dev public --port 8787 --d1 locales --ip 0.0.0.0 --persist-to "$PERSIST_DIR"
#!/bin/bash
# Google Limache - Script de deployment a producción
#⚠️ IMPORTANTE: Este script evita el bug del _worker.js en dist/

set -e

cd /home/goviedo/proyectos/limache/google-limache

echo "🔨 Building..."
rm -rf dist
npm run build

echo "🧹 Limpiando archivos problemáticos..."
rm -f dist/_worker.js  # ⚠️ CRÍTICO: esto causa 404 si existe

echo "📦 Verificando dist/"
ls -la dist/ | grep -v "^d"

echo "🚀 Deploying frontend a Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=google-limache --branch=main --commit-dirty=true

echo "✅ Deployment completado!"
echo ""
echo "URLs:"
echo "- Frontend: https://google-limache.pages.dev"
echo "- API: https://google-limache-api.gonzalo-oviedo-dev.workers.dev"
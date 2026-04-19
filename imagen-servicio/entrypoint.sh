#!/bin/sh
set -e

echo "🚀 Iniciando Image Service + Cloudflare Tunnel..."

# Verificar que tenemos el token
if [ -z "$CLOUDFLARED_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARED_TOKEN no está configurado"
    exit 1
fi

# Iniciar cloudflared con el token
# El servicio Go queda accesible solo a través del tunnel
echo "📡 Iniciando Cloudflare Tunnel..."
exec cloudflared tunnel run --token "$CLOUDFLARED_TOKEN" &
CLOUDFLARED_PID=$!

# Esperar a que cloudflared conecte
sleep 3

# Iniciar el servicio Go (solo accesible localmente, cloudflared hace proxy)
echo "🖼️ Iniciando Image Service..."
exec ./imaglim-go
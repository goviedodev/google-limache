# Image Service - google-limache 🖼️

Servicio en **Go** para obtener y almacenar en cache las fotos de Google Places API, conectado via **Cloudflare Tunnel (Zero Trust)**.

## Propósito

**Google Places API** tiene una limitación: las URLs de fotos expiran después de un tiempo (~30 días). Este servicio:

1. **Descarga las fotos** de Google Places cuando se soliciten
2. **Las almacenan en cache** localmente en el directorio `./photos`
3. **Las sirve** desde el cache local, evitando llamadas repetidas a Google
4. **Solo accesible via Cloudflare Tunnel** - ningún puerto expuesto a internet

## Arquitectura

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Cloudflare Zero Trust                                      │
│  ──────────────────────────────────────────────────────── │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────┐     │
│  │  Frontend  │────▶│  API Worker           │     │
│  │  (Pages)  │     │  (workers.dev)       │     │
│  └───────────┘     └──────────┬───────────┘     │
│                              │                 │
│     ┌───────────────────────┼─────────────────┘
│     │                     │
│     ▼                     ▼ Tunnel (cloudflared)
│  ┌──────────────────────────────────────────────────────┐
│  │  imagenes.limachelocales.cl                        │
│  │  (Cloudflare Tunnel - sin exposición internet)     │
│  │                                                      │
│  │  ┌─────────────────────────────────────────┐       │
│  │  │  Contenedor Docker                    │       │
│  │  │  ┌───────────────────────────────┐   │       │
│  │  │  │  cloudflared (tunnel)    │   │       │
│  │  │  │         │            │   │       │       │
│  │  │  │  ┌──────┴──────┐  │   │       │       │
│  │  │  │  │ Go Service │  │──┼───────┼───────┼───▶ Google Places API
│  │  │  │  │ :5000     │  │   │       │       │
│  │  │  │  └──────────┘   │   │       │       │
│  │  │  └───────────────────────────────┘   │       │
│  │  └─────────────────────────────────────────┘       │
│  │            │                                    │
│  │            ▼                                    │
│  │      ./photos/ (cache local)                       │
│  └───────────────────────────────────────────���──────────┘
└──────────────────────────────────────────────────────┘
```

### Flujo de una petición

```
1. Usuario visita google-limache.pages.dev
2. Frontend carga datos del Worker (workers.dev)
3. Worker detecta /api/photo/{ref}
4. Worker hace fetch → https://imagenes.limachelocales.cl/photo/{ref}
5. Cloudflare Tunnel rutea al contenedor Docker
6. Go Service verifica cache ./photos/
   - Si no existe: descarga de Google y guarda
   - Si existe: sirve directamente
7. Respuesta retorna al Worker → Frontend
```

## Seguridad

| Aspecto | Valor |
|---------|-------|
| **Exposición a internet** | ❌ Ninguna |
| **Puerto expuesto** | ❌ Ninguno |
| **Acceso** | Solo Cloudflare (via Tunnel) |
| **Autenticación** | Cloudflare Zero Trust |

## URLs de Producción

| Servicio | URL | Estado |
|----------|-----|--------|
| Image Service | `https://imagenes.limachelocales.cl` | ✅ Activo |
| API Worker | `https://google-limache-api.gonzalo-oviedo-dev.workers.dev` | ✅ Activo |
| Frontend | `https://google-limache.pages.dev` | ✅ Activo |

## Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Información del servicio |
| `GET /list` | Lista fotos en cache |
| `GET /photo/<photo_ref>` | Obtiene foto por reference (descarga si no existe) |
| `GET /download?ref=<photo_ref>` | Descarga foto de Google explícitamente |

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|------------|----------|
| `CLOUDFLARED_TOKEN` | Token del Cloudflare Tunnel | ✅ Sí |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps | No (usa default) |
| `PORT` | Puerto del servicio interno | No (5000) |

## Estructura de Archivos

```
imagen-servicio/
├── main.go              # Código fuente Go
├── go.mod              # Módulos Go
├── go.sum              # Checksums
├── Dockerfile          # Imagen Docker (incluye cloudflared)
├── docker-compose.yml   # Orquestación
├── entrypoint.sh      # Inicia cloudflared + Go
├── photos/           # Cache de fotos (se crea automáticamente)
└── README.md        # Este archivo
```

## Despliegue

### Prerequisites

- Docker + Docker Compose instalados
- Token de Cloudflare Tunnel creado

### 1. Obtener el token

```bash
# Crear tunnel (si no existe)
cloudflared tunnel create imagen-service

# Generar token
cloudflared tunnel token imagen-service
```

### 2. Configurar Cloudflare Dashboard

Ir a **Zero Trust → Network → Tunnels** y agregar:

| Campo | Valor |
|-------|-------|
| **Hostname** | `imagenes.limachelocales.cl` |
| **Service** | `http://localhost:5000` |
| **Port** | `5000` |

### 3. Build y ejecutar

```bash
cd imagen-servicio

# Build
docker compose build

# Run con token
CLOUDFLARED_TOKEN="tu_token_aqui" docker compose up -d

# Ver logs
docker compose logs -f
```

### 4. Verificar

```bash
# healthcheck
curl https://imagenes.limachelocales.cl/

# listar cache
curl https://imagenes.limachelocales.cl/list
```

## Desarrollo Local

### Sin Docker

```bash
cd imagen-servicio

# Ejecutar servicio Go (solo para testing local)
go run main.go
```

### Con Docker (modo desarrollo)

```bash
# Build sin tunnel
docker build -t imaglim-dev .

# Run local (sin cloudflared)
docker run -p 5000:5000 \
  -v $(pwd)/photos:/app/photos \
  -e GOOGLE_MAPS_API_KEY=tu_api_key \
  imaglim-dev
```

## Troubleshooting

### Error: Tunnel no conecta

```bash
# Ver logs de cloudflared
docker compose logs

# Verificar token
echo $CLOUDFLARED_TOKEN
```

### Error 400 en foto

- El `photo_reference` puede haber expirado (~30 días)
- Obtener nuevos references de Google Places API

### Verificar estado del tunnel

```bash
# Desde el contenedor
docker exec -it imaglim cloudflared tunnel info

# Ver conexiones
docker exec -it imaglim cloudflared tunnel list
```

## Mantenimiento

### Ver fotos en cache

```bash
# Via API
curl https://imagenes.limachelocales.cl/list

# Directamente en el volumen
ls -la imagen-servicio/photos/
```

### Limpiar cache

```bash
# Borrar todas las fotos
rm imagen-servicio/photos/*

# O via API (futuro implemento)
curl -X DELETE https://imagenes.limachelocales.cl/clear
```

### Restart del servicio

```bash
docker compose restart
docker compose logs -f
```

## Tecnologías

- **Lenguaje**: Go 1.21+
- **Web**: stdlib `net/http`
- **Container**: Docker + Alpine
- **Tunnel**: Cloudflare Tunnel (cloudflared)
- **API Externa**: Google Places Photo API

---

*Actualizado: 2026-04-19*
*Proyecto: google-limache*
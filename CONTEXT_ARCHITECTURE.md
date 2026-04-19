# Google Limache - Arquitectura y Configuración

## 📍 Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | google-limache |
| **Tipo** | Cloudflare Pages + Cloudflare Workers (API) + D1 Database + Image Service |
| **Ubicación** | `/home/goviedo/proyectos/limache/google-limache` |
| **URL Producción** | https://google-limache.pages.dev |
| **URL API** | https://google-limache-api.gonzalo-oviedo-dev.workers.dev |
| **URL Image Service** | https://imagenes.limachelocales.cl |

---

## 🔐 Cuentas Cloudflare

### Cuenta Principal
| Campo | Valor |
|-------|-------|
| **Email** | gonzalo.oviedo.dev@gmail.com |
| **Account ID** | `0e7c015c16da16f0cebace036c8495c8` |
| **Account** | gonzalo.oviedo.dev@gmail.com's Account |

### D1 Database
| Campo | Valor |
|-------|-------|
| **Nombre** | locales-limache |
| **Database ID** | `e31afcac-2816-4ee0-aa02-1c009830cb4a` |
| **Región** | ENAM (East North America) |

### Cloudflare Tunnel
| Campo | Valor |
|-------|-------|
| **Nombre** | imagen-service |
| **Dominio** | imagenes.limachelocales.cl |
| **Puerto interno** | 5000 |
| **Tipo** | Zero Trust (sin exposición a internet) |

---

## 🏗️ Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Cloudflare Zero Trust                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐     ┌──────────────────────────┐ │
│  │  Frontend          │     │  API (Worker)            │     │
│  │  pages.dev        │────▶│  workers.dev            │     │
│  │  (React + Vite)   │     │  (D1 + Photo Proxy)      │     │
│  └─────────────────────┘     └───────────┬──────────────┘ │
│                                              │               │
├──────────────────────────────────────────────┼───────────────┤
│                                              │               │
│     ┌────────────────────────────────────────┼────────────────┤
│     │                                        ▼                │
│     │     ┌─────────────────────────────────────────┐        │
│     │     │  imagenes.limachelocales.cl            │        │
│     │     │  (Cloudflare Tunnel - Zero Trust)     │        │
│     │     │                                         │        │
│     │     │  ┌─────────────────────────────────┐  │        │
│     │     │  │  Contenedor Docker (VPS)        │  │        │
│     │     │  │  ┌─────────────────────────┐   │  ��        │
│     │     │  │  │ cloudflared (tunnel)│   │  │        │
│     │     │  │  │         │          │   │  │        │
│     │     │  │  │  ┌──────┴──────┐│   │  │        │
│     │     │  │  │  │ Go Service ││   │──┼────┼───▶ Google Places API
│     │     │  │  │  │ :5000    ││   │  │    │        │
│     │     │  │  │  └──────────┘   │  │    │        │
│     │     │  │  └─────────────────────────┘   │        │
│     │     │  │         │                        │        │
│     │     │  │         ▼                        │        │
│     │     │  │  ./photos/ (storage 57 fotos)   │        │
│     │     │  └─────────────────────────────────┘        │
│     │     └─────────────────────────────────────────────┘
│     │                                                        │
│     └────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
google-limache/
├── public/                    # Archivos compilados para deploy (copia de dist/)
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
│
├── src/                       # Código fuente React
│   ├── App.tsx               # Componente principal
│   ├── types.ts              # Interfaces TypeScript
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos
│
├── functions/                 # Cloudflare Pages Functions (deprecated)
│   └── api/
│       └── locales/
│           └── index.js
│
├── workers/                   # Cloudflare Worker API
│   └── worker.js            # API con D1 + proxy de fotos
│
├── imagen-servicio/           # Image Service (Go + Cloudflare Tunnel)
│   ├── main.go              # Código fuente Go
│   ├── Dockerfile          # Imagen Docker
│   ├── docker-compose.yml   # Orquestación
│   ├── entrypoint.sh       # Inicia cloudflared + Go
│   ├── photos/            # Storage de fotos (57 fotos cacheadas)
│   └── README.md          # Documentación
│
├── scripts/
│   ├── dev.sh             # Script de desarrollo local
│   ├── preload_photos.py  # Script para pre-cargar fotos
│   └── insert_locales.sql  # SQL con 69 registros
│
├── schema.sql               # Schema D1
├── wrangler.toml           # Configuración Cloudflare
├── vite.config.ts          # Configuración Vite
└── package.json
```

---

## 🌐 API Endpoints

### Worker: GET /api/locales
Busca locales en D1 con filtros.

**Query Parameters:**
- `q` - Término de búsqueda
- `categoria` - Filtrar por categoría

**Ejemplo:**
```bash
curl "https://google-limache-api.gonzalo-oviedo-dev.workers.dev/api/locales?q=cafe"
```

### Worker: GET /api/photo/{photo_reference}
Proxy de fotos que rutea al image-service.

**Ejemplo:**
```bash
curl "https://google-limache-api.gonzalo-oviedo-dev.workers.dev/api/photo/AU_ZVEH..."
```

---

## 🖼️ Image Service

### Endpoints locales (dentro del contenedor)

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Información del servicio |
| `GET /list` | Lista fotos en storage |
| `GET /photo/<ref>` | Obtiene foto (descarga si no existe) |
| `GET /download?ref=<ref>` | Descarga explícitamente desde Google |

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `CLOUDFLARED_TOKEN` | Token del Cloudflare Tunnel |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps |
| `PORT` | Puerto interno (5000) |

### Despliegue del Image Service

```bash
# En VPS
cd ~/servicios/limache/google-limache/imagen-servicio

# Corregir permisos del directorio photos/
sudo chown -R $(id -u):$(id -g) ./photos/

# Build y run
docker compose build
CLOUDFLARED_TOKEN="tu_token" docker compose up -d
```

### Configuración del Tunnel

En **Cloudflare Dashboard → Zero Trust → Network → Tunnels**:

| Campo | Valor |
|-------|-------|
| **Hostname** | `imagenes.limachelocales.cl` |
| **Service** | `http://localhost:5000` |
| **Port** | `5000` |

---

## 📊 Base de Datos D1

### Tabla: `locales` (69 registros)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PRIMARY KEY | Identificador (loc-001 a loc-069) |
| nombre | TEXT | Nombre del negocio |
| descripcion | TEXT | Descripción |
| categoria | TEXT | Categoría |
| imagen_url | TEXT | URL de Google Photos (57 tienen foto) |
| imagen_titulo | TEXT | Título de imagen |
| imagen_alt | TEXT | Alt text de imagen |
| indicaciones | TEXT | Indicaciones Google Maps |
| plus_code | TEXT | Plus Code de ubicación |
| celular | TEXT | Teléfono |
| correo | TEXT | Email |
| direccion | TEXT | Dirección |
| rating | REAL | Calificación (estrellas) |
| horario | TEXT | Horario de atención |
| website | TEXT | Sitio web |

---

## 📋 Scripts Útiles

### Pre-cargar fotos al storage

```bash
# Ejecutar script
python3 scripts/preload_photos.py

# Output típico:
# ✅ Total locales: 69
# 🖼️ Con foto: 57
# 📥 Descargando fotos al storage...
# ✅ Descargadas: 57
# ❌ Errores: 0
```

---

## 🚀 Comandos de Deploy

### Frontend + Worker
```bash
cd /home/goviedo/proyectos/limache/google-limache

# 1. Build frontend
npx vite build

# 2. Copiar a public
rm -rf public && cp -r dist public

# 3. Deploy a Production
npx wrangler pages deploy public --project-name=google-limache --branch=main

# 4. Deploy Worker API
npx wrangler deploy workers/worker.js --name google-limache-api
```

### Image Service (VPS)
```bash
# En el VPS
cd ~/servicios/limache/google-limache/imagen-servicio

# Build y run
docker compose build
CLOUDFLARED_TOKEN="..." docker compose up -d

# Verificar
curl https://imagenes.limachelocales.cl/
curl https://imagenes.limachelocales.cl/list
```

---

## 🔧 Troubleshooting

### Fotos no se guardan en storage

**Síntoma:** `count: 0` en `/list`

**Causa:** Permisos del directorio `photos/` son de root

**Solución:**
```bash
sudo chown -R $(id -u):$(id -g) ./photos/
```

### Tunnel no conecta

**Síntoma:** Error de conexión al dominio

**Solución:**
1. Verificar que el token esté configurado
2. Revisar logs: `docker compose logs`
3. Verificar Cloudflare Dashboard → Tunnels

### Worker no puede reaching image-service

**Síntoma:** Error 500 al pedir fotos

**Solución:**
1. Verificar que el tunnel tenga el hostname configurado
2. Probar: `curl https://imagenes.limachelocales.cl/`

---

## 📅 Historial

| Fecha | Acción |
|-------|--------|
| 2026-04-18 | Creación del proyecto |
| 2026-04-18 | Deploy inicial a google-limache.pages.dev |
| 2026-04-18 | Creación D1 locales-limache con 69 registros |
| 2026-04-19 | Agregar Image Service con Cloudflare Tunnel |
| 2026-04-19 | Pre-cargar 57 fotos al storage |

---

## 🔗 Recursos

- [Cloudflare Pages](https://pages.cloudflare.com)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)

---

*Documento generado: 2026-04-18*
*Última actualización: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*
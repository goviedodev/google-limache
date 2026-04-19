# Image Service - google-limache 🖼️

Servicio en **Go** para obtener y almacenar en cache las fotos de Google Places API.

## Propósito

**Google Places API** tiene una limitación: las URLs de fotos expiran después de un tiempo (~30 días). Este servicio:

1. **Descarga las fotos** de Google Places cuando se soliciten
2. **Las almacenan en cache** localmente en el directorio `./photos`
3. **Las sirve** desde el cache local, evitando llamadas repetidas a Google

## Arquitectura

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Frontend    │────▶│  Image Service  │────▶│ Google API  │
│  (App.tsx)   │     │  (Go :14771)    │     │ (fotos)     │
└──────────────┘     └────────┬────────┘     └──────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  ./photos/   │
                      │  (cache)     │
                      └──────────────┘
```

## Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Información del servicio |
| `GET /list` | Lista fotos en cache |
| `GET /photo/<photo_ref>` | Obtiene foto por reference (descarga si no existe) |
| `GET /download?ref=<photo_ref>` | Descarga foto de Google explícitamente |

## Variables de Entorno

| Variable | Descripción | Default |
|----------|------------|---------|
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps | `AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs` |
| `PORT` | Puerto del servicio | `14771` |

## Uso Local (sin Docker)

```bash
cd imagen-servicio

# Ejecutar
go run main.go

# O usar el binario compilado
./image-proxy
```

## Uso con Docker

```bash
# Build
docker build -t imaglim-go .

# Run
docker run -p 14771:14771 \
  -v $(pwd)/photos:/app/photos \
  -e GOOGLE_MAPS_API_KEY=tu_api_key \
  imaglim-go
```

## Uso con Docker Compose

```bash
# Iniciar servicio
docker compose up --build

# Detener servicio
docker compose down

# Ver logs
docker compose logs -f
```

## Ejemplos de Uso

### Descargar una foto

```bash
# Por reference direct
curl "http://localhost:14771/download?ref=Aap_uEAo..." -o foto.jpg

# O obtenerla (la descarga automáticamente si no existe)
curl "http://localhost:14771/photo/Aap_uEAo..." -o foto.jpg
```

### Listar fotos en cache

```bash
curl "http://localhost:14771/list"
# Output: {"count": 3, "files": ["abc123.jpg", "def456.jpg", ...]}
```

### Ver información del servicio

```bash
curl "http://localhost:14771/"
```

## Estructura de Archivos

```
imagen-servicio/
├── main.go           # Código fuente Go
├── go.mod            # Módulos Go
├── go.sum            # Checksums
├── Dockerfile        # Imagen Docker
├── docker-compose.yml # Orquestación
├── photos/          # Directorio de cache (se crea automáticamente)
└── README.md       # Este archivo
```

## Tecnologías

- **Lenguaje**: Go 1.21+
- **Web**: stdlib `net/http`
- **API Externa**: Google Places Photo API
- **Container**: Docker + Alpine

## Notas

- Las fotos se almacenan con nombre hash UUID (basado en el photo_reference)
- El cache es persistente (se mantiene entre reinicios)
- El directorio `./photos` debe estar mounted como volumen para persistencia
- No hay límite de storage (depende del disco)

## Troubleshooting

### Error 400 en foto
- El `photo_reference` puede haber expirado (vence ~30 días)
- Obtener nuevos references de Google Places API

###Puerto en uso
```bash
# Matar proceso en el puerto
lsof -i :14771 | kill -9 $(lsof -t -i :14771)
```

### Error al crear directorio
- Verificar permisos de escritura en `./photos`

---

*Creado: 2026-04-18*
*Proyecto: google-limache*
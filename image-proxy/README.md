# Image Proxy Service - google-limache

Servicio para descargar y servir fotos de Google Places Photo API.

## Puerto
**14771**

## Quick Start

```bash
# Construir imagen
docker build -t imaglim-image-proxy .

# Run con docker
docker run -d \
  -p 14771:14771 \
  -v $(pwd)/photos:/app/photos \
  -e GOOGLE_MAPS_API_KEY="TU_API_KEY" \
  imaglim-image-proxy
```

## O con docker-compose

```bash
# Editar docker-compose.yml con tu API key
export GOOGLE_MAPS_API_KEY="TU_API_KEY"
docker-compose up -d --build
```

## Endpoints

| Endpoint | Descripción |
|---------|-------------|
| `GET /` | Info del servicio |
| `GET /photo/<photo_ref>` | Obtiene foto por referencia de Google |
| `GET /serve/<archivo>` | Sirve archivo del cache |
| `GET /download?ref=<ref>` | Descarga foto manualmente |
| `GET /list` | Lista fotos en cache |

## Ejemplo de uso

```


GET https://imaglim.tellevoapp.cl:14771/photo/AU_ZVEH...
```

## Desplegar en servidor

1. Subir la imagen al servidor:
```bash
# Opción 1: Build directo en servidor
scp -r image-proxy/ usuario@servidor:
cd image-proxy
docker build -t imaglim-image-proxy .
docker run -d -p 14771:14771 -v ./photos:/app/photos imaglim-image-proxy
```

2. O usar registry:
```bash
docker build -t imaglim-image-proxy .
docker tag imaglim-image-proxy registry.servidor.com/imaglim:latest
docker push registry.servidor.com/imaglim:latest
# En el servidor:
docker pull registry.servidor.com/imaglim:latest
docker run -d -p 14771:14771 ...
```

## Estructura

```
image-proxy/
├── app.py              # Aplicación Flask
├── Dockerfile         # Imagen Docker
├── docker-compose.yml  # Compose para desarrollo
├── photos/           # Fotos descargadas (volumen)
│   └── downloads/   # Cache de fotos
└── README.md        # Este archivo
```
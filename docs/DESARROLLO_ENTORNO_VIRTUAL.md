# Manual de Desarrollo - Entorno Virtual Python

Este documento explica cómo configurar y usar el entorno virtual Python del proyecto.

## Requisitos

- Python 3.x instalado en el sistema
- Archivo `requirements.txt` con las dependencias del proyecto

## Crear el Entorno Virtual

El proyecto ya incluye un entorno virtual en la carpeta `venv/`. Si necesitas recrearlo:

```bash
# Crear entorno virtual
cd /home/goviedo/proyectos/limache/google-limache
python3 -m venv venv

# Instalar dependencias
./venv/bin/pip install -r requirements.txt
```

## Activar el Entorno Virtual

### Opción 1: Activar y ejecutar

```bash
cd /home/goviedo/proyectos/limache/google-limache

# Activar entorno
source venv/bin/activate

# Ahora python usa el entorno
python --version
python scripts/obtener_google_places.py
```

### Opción 2: Ejecutar directamente con el binario

```bash
cd /home/goviedo/proyectos/limache/google-limache

# Ejecutar con el python del venv
./venv/bin/python scripts/obtener_google_places.py
```

## Dependencias del Proyecto

El archivo `requirements.txt` incluye:

```
googlemaps
```

Esta librería se usa para conectar con Google Maps Places API y obtener los negocios de Limache.

## Ejecutar Script de Google Places

Para obtener los locales desde Google Maps:

```bash
cd /home/goviedo/proyectos/limache/google-limache

# Configurar API key (opcional si ya está en .env)
export GOOGLE_MAPS_API_KEY='AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs'

# Ejecutar script
./venv/bin/python scripts/obtener_google_places.py
```

El script:
1. Busca negocios en un radio de 2000m desde la Plaza de Armas de Limache
2. Obtiene detalles (nombre, dirección, teléfono, rating, horario, website, fotos)
3. Genera el archivo `scripts/insert_locales.sql`

## Estructura del Proyecto

```
google-limache/
├── venv/                      # Entorno virtual Python
│   ├── bin/
│   │   ├── python            # Python del entorno
│   │   └── pip              # Pip del entorno
│   └── lib/python3.x/site-packages/  # Paquetes instalados
├── requirements.txt          # Dependencias del proyecto
└── scripts/
    └── obtener_google_places.py  # Script para obtener locales
```

## Notas

- **NO usar system python**: Puede tener paquetes diferentes o no tener `googlemaps`
- **Siempre usar `./venv/bin/python`** o activar el venv antes de ejecutar scripts Python
- El entorno virtual es portable: se puede eliminar y recrear con `python3 -m venv venv`

## Solución de Problemas

### "ModuleNotFoundError: No module named 'googlemaps'"

```bash
# Asegúrate de usar el python del venv
./venv/bin/python scripts/obtener_google_places.py
```

### "python3: command not found"

```bash
# Verificar instalación de python
which python3
python3 --version
```

### Reinstallar dependencias

```bash
cd /home/goviedo/proyectos/limache/google-limache
rm -rf venv
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

---

## Ver También

- [ACTUALIZAR_LOCALES.md](../scripts/ACTUALIZAR_LOCALES.md) - Manual para actualizar locales en D1
- [CONTEXT_ARCHITECTURE.md](../CONTEXT_ARCHITECTURE.md) - Arquitectura del proyecto
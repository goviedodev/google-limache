# Manual: Actualizar Locales desde Google Maps

Este manual explica cómo obtener los negocios actualizados de Google Maps y guardarlos en la base de datos D1.

## Requisitos Previos

1. Tener configurada la variable de entorno `GOOGLE_MAPS_API_KEY`
2.Tener acceso al proyecto Cloudflare

## Pasos

### 1. Configurar API Key

En terminal, ejecutar:

```bash
export GOOGLE_MAPS_API_KEY='AIzaSy...'
```

> ⚠️ Reemplazar `AIzaSy...` con la API key real de Google Maps

### 2. Ejecutar el Script

```bash
cd /home/goviedo/proyectos/limache/google-limache
python3 scripts/obtener_google_places.py
```

El script:
- Busca negocios en un radio de 2000m desde la Plaza de Armas de Limache
- Obtiene detalles (nombre, dirección, teléfono, rating, horario, fotos, website)
- Genera el archivo `scripts/insert_locales.sql`

### 3. Insertar en D1 (Local)

```bash
cd /home/goviedo/proyectos/limache/google-limache

# Verificar que wrangler esté instalado
npx wrangler --version

# Insertar los locales en la base de datos local
npx wrangler d1 execute locales-limache --local --file=scripts/insert_locales.sql
```

### 4. Verificar Datos

```bash
# Contar registros
npx wrangler d1 execute locales-limache --local --command="SELECT COUNT(*) as total FROM locales;"

# Ver algunos registros
npx wrangler d1 execute locales-limache --local --command="SELECT id, nombre, categoria FROM locales LIMIT 10;"
```

### 5. Deploy a Producción (Opcional)

Si querés subir los nuevos datos a la base de datos remota:

```bash
# WARNING: Esto reemplaza todos los datos en producción
npx wrangler d1 execute locales-limache --remote --file=scripts/insert_locales.sql
```

> ⚠️ **ADVERTENCIA**: Esto borra todos los locales existentes y los reemplaza con los nuevos.

---

## Configuración del Script

El script `obtener_google_places.py` tiene estas constantes configurables:

| Constante | Valor Actual | Descripción |
|-----------|--------------|-------------|
| `CENTER` | `(-32.99097137380414, -71.2756202276518)` | Coordenadas centro (Plaza de Armas) |
| `RADIO` | `2000` | Radio de búsqueda en metros |
| `TIPOS` | `['restaurant', 'cafe', 'bar', 'supermarket', 'pharmacy', 'bank', 'store']` | Tipos de lugares a buscar |

Para modificar el área de búsqueda, editar las constantes en el script:

```python
# Centro de Limache (Plaza de Armas)
CENTER = (-32.99097137380414, -71.2756202276518)

# Radio de búsqueda en metros
RADIO = 2000
```

---

## Agregar Nuevos Tipos de Lugares

El script busca por tipos de Google Places. Para agregar más tipos, editar la lista `TIPOS`:

```python
# Tipos de lugares a buscar
TIPOS = [
    'restaurant',
    'cafe',
    'bar',
    'supermarket',
    'pharmacy',
    'bank',
    'store',
    'gas_station',      # Agregar
    'parking',         # estos
    'gym',            # tipos
    'hospital',
    'school',
]
```

Ver [Google Places Types](https://developers.google.com/maps/documentation/places/web-service/place_search) para lista completa.

---

## Solución de Problemas

### "GOOGLE_MAPS_API_KEY no está configurada"

```bash
export GOOGLE_MAPS_API_KEY='tu_api_key_aqui'
```

### Error de timeout

El script puede fallar si hay muchos lugares. Reducir el radio o los tipos:

```python
RADIO = 1500  # Reducir de 2000 a 1500 metros
```

### SQL no se inserta

Verificar el archivo SQL generado:

```bash
head -20 scripts/insert_locales.sql
```

---

## Archivo Generado

El script crea `scripts/insert_locales.sql` con el siguiente formato:

```sql
DELETE FROM locales;

INSERT INTO locales (id, nombre, ...) VALUES ('loc-001', 'Negocio 1', ...);
INSERT INTO locales (id, nombre, ...) VALUES ('loc-002', 'Negocio 2', ...);
-- etc.
```

---

## Referencias

- [Google Maps Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/)
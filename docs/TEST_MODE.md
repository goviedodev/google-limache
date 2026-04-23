# Manual: Modo de Prueba (TEST_MODE)

Documentación para usar `TEST_MODE` en `obtener_google_places.py`.

## ¿Qué es TEST_MODE?

Modo que limita la búsqueda a pocos puntos/lugares para verificar que el proceso funciona correctamente **sin gastar la cuota completa** de la API de Google Maps.

## Costo Comparativo

| Modo | Puntos Grilla | Locales | Requests | Costo Estimado |
|------|--------------|---------|----------|----------------|
| TEST_MODE=1 | 1 | ~3 | ~10 | ~$0.32 |
| TEST_MODE=3 | 3 | ~10 | ~25 | ~$0.80 |
| Normal | 45 | ~150 | ~315 | ~$10 |

## Uso

### Modo de Prueba (recomendado primero)

```bash
cd /home/goviedo/proyectos/limache/google-limache
export GOOGLE_MAPS_API_KEY='AIzaSy...'
export TEST_MODE=1
export DELETE_EXISTING=1
export START_ID=1
./venv/bin/python scripts/obtener_google_places.py
```

### Modo Completo

```bash
cd /home/goviedo/proyectos/limache/google-limache
export GOOGLE_MAPS_API_KEY='AIzaSy...'
export DELETE_EXISTING=1
export START_ID=1
./venv/bin/python scripts/obtener_google_places.py
```

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | (requerida) | API Key de Google Maps |
| `TEST_MODE` | `0` | Número de puntos a buscar (0 = todos) |
| `DELETE_EXISTING` | `0` | Borrar registros antes de insertar |
| `START_ID` | `1` | ID inicial para los registros |

## Flujo de Verificación

```
1. Probar API Key
   ↓
   ./venv/bin/python scripts/test_api_key.py <KEY>

2. Modo de prueba (3 locales)
   ↓
   TEST_MODE=1 ./venv/bin/python scripts/obtener_google_places.py

3. Verificar SQL generado
   ↓
   head scripts/insert_locales.sql

4. Insertar en D1 local
   ↓
   npx wrangler d1 execute locales-limache --local --file=scripts/insert_locales.sql

5. Verificar en D1
   ↓
   npx wrangler d1 execute locales-limache --local --command="SELECT COUNT(*) FROM locales;"

6. Ejecutar completo (si todo funciona)
   ↓
   TEST_MODE=0 ./venv/bin/python scripts/obtener_google_places.py
```

## Ejemplo de Output

```
⚠️ TEST MODE: Limitado a 1 punto(s)
   Grilla: 1 puntos de búsqueda

  [1/1] Punto: (-33.0148, -71.2681)
    📥 Buscando restaurant...
      ✓ Restaurant 1
      ✓ Restaurant 2
    📥 Buscando cafe...
      ✓ Café 1

⚠️ TEST MODE: Limitado a 3 locales

📊 Total de lugares encontrados (sin duplicados): 3

🔎 Obteniendo detalles de cada lugar...

  [1/3] Restaurant 1...
    ✓ Tel: +56 2 XXXX XXXX
  [2/3] Restaurant 2...
    ✓ Tel: +56 2 XXXX XXXX
  [3/3] Café 1...
    ✓ Tel: +56 2 XXXX XXXX

✅ Negocios con detalles: 3

📝 Generando SQL...

✅ SQL guardado en: scripts/insert_locales.sql
   Total de inserciones: 3
   Rango de IDs: loc-001 a loc-003
```

## Errores Comunes

### "API key no configurada"

```bash
export GOOGLE_MAPS_API_KEY='AIzaSy...'
```

### "Sin resultados"

- Verificar que la API key tenga Places API habilitado
- Ejecutar `test_api_key.py` primero

## Ver También

- [BUSCAR_LUGARES.md](BUSCAR_LUGARES.md) - Manual principal
- [VERIFICAR_LOCAL.md](VERIFICAR_LOCAL.md) - Verificar en local
- [test_api_key.py](../scripts/test_api_key.py) - Probar API key

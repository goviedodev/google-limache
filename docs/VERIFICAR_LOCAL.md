# Manual: Verificar Búsqueda de Lugares en Local

Este documento explica cómo ejecutar el script de búsqueda y verificar los resultados en el entorno local.

## Flujo Completo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. Ejecutar    │ →  │ 2. Verificar  │ →  │ 3. Insertar    │ →  │ 4. Verificar   │
│ search_places  │    │ SQL generado │    │ en D1 local   │    │ en D1 local    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Paso 1: Ejecutar el Script

### Opción A: Con script helper

```bash
cd /home/goviedo/proyectos/limache/google-limache
./scripts/search_places.sh
```

### Opción B: Manual con variables

```bash
cd /home/goviedo/proyectos/limache/google-limache
export GOOGLE_MAPS_API_KEY='AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs'
export DELETE_EXISTING=1
export START_ID=1
./venv/bin/python scripts/obtener_google_places.py
```

### Qué pasa al ejecutar

1. 🔍 Busca lugares en las zonas configuradas (`LIMACHE_CENTRO` + `LIMACHE_VIEJO`)
2. 📥 Obtiene detalles de cada lugar (nombre, dirección, teléfono, rating, horario, website, fotos)
3. 📝 Genera el archivo `scripts/insert_locales.sql`
4. Muestra resumen por categoría

### Output esperado

```
🔍 BUSCADOR DE NEGOCIOS - GOOGLE MAPS
==================================================

📍 Zonas a buscar: LIMACHE_CENTRO, LIMACHE_VIEJO
🔢 Starting ID: 1

==================================================
FASE 1: Buscando lugares en zonas
==================================================

📍 Zona: LIMACHE_CENTRO
   Coordenadas: (-32.990971..., -71.2756...)
   Radio: 2000m
  📥 Buscando restaurant...
    ✓ Restaurant 1
    ✓ Restaurant 2
  📥 Buscando cafe...
    ✓ Café 1
...
📊 Total de lugares encontrados (sin duplicados): 150

🔎 Obteniendo detalles de cada lugar...

  [1/150] Restaurant 1...
    ✓ Tel: +56 2 XXXX XXXX
...
✅ Negocios con detalles: 140

📝 Generando SQL...

✅ SQL guardado en: scripts/insert_locales.sql
   Total de inserciones: 140
   Rango de IDs: loc-001 a loc-140
   ⚠️ Modo: REEMPLAZAR TODO (DELETE incluido)

📊 Resumen por categoría:
  restaurante: 80
  cafe: 30
  tienda: 20
  salud: 10
```

---

## Paso 2: Verificar SQL Generado

### Ver primeras líneas

```bash
head -20 scripts/insert_locales.sql
```

**Output esperado:**
```sql
-- SQL para insertar negocios de Limache desde Google Maps Places API
-- Generado automáticamente (START_ID=1)
-- ⚠️ BORRÓ todos los registros existentes

DELETE FROM locales;
INSERT INTO locales (id, nombre, ...) VALUES ('loc-001', 'Restaurante 1', ...);
INSERT INTO locales (id, nombre, ...) VALUES ('loc-002', 'Restaurante 2', ...);
```

### Contar líneas/registros

```bash
wc -l scripts/insert_locales.sql
grep -c "INSERT" scripts/insert_locales.sql
```

### Ver últimos registros

```bash
tail -10 scripts/insert_locales.sql
```

---

## Paso 3: Insertar en D1 Local

```bash
cd /home/goviedo/proyectos/limache/google-limache
npx wrangler d1 execute locales-limache --local --file=scripts/insert_locales.sql
```

### Output esperado:

```
🌀 Executing on local database locales-limache (e31afcac-2816-4ee0-aa02-1c009830cb4a) from .wrangler/state/v3/d1:
🚀 1 command executed successfully (ran 140 statements)
```

---

## Paso 4: Verificar en D1 Local

### Contar todos los registros

```bash
npx wrangler d1 execute locales-limache --local --command="SELECT COUNT(*) as total FROM locales;"
```

### Ver registros recientes

```bash
npx wrangler d1 execute locales-limache --local --command="SELECT id, nombre, categoria, rating FROM locales ORDER BY id DESC LIMIT 10;"
```

### Ver por categoría

```bash
npx wrangler d1 execute locales-limache --local --command="SELECT categoria, COUNT(*) as total FROM locales GROUP BY categoria;"
```

### Ver registros con rating

```bash
npx wrangler d1 execute locales-limache --local --command="SELECT nombre, rating FROM locales WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 10;"
```

---

## Comandos Rápidos de Verificación

```bash
cd /home/goviedo/proyectos/limache/google-limache

# 1. Contar locales
npx wrangler d1 execute locales-limache --local --command="SELECT COUNT(*) FROM locales;"

# 2. Ver últimos agregados
npx wrangler d1 execute locales-limache --local --command="SELECT * FROM locales ORDER BY id DESC LIMIT 5;"

# 3. Ver por categoría
npx wrangler d1 execute locales-limache --local --command="SELECT categoria, COUNT(*) FROM locales GROUP BY categoria;"

# 4. Ver locales con rating > 4
npx wrangler d1 execute locales-limache --local --command="SELECT nombre, rating FROM locales WHERE rating > 4 ORDER BY rating DESC;"
```

---

## Errores Comunes

### "API key no configurada"

```bash
# sol: exportar la variable antes
export GOOGLE_MAPS_API_KEY='AIzaSy...'
```

### "No se generan registros"

- Verificar que las coordenadas estén dentro del área de cobertura de Google Maps
- Reducir el radio de búsqueda

### "Error al insertar en D1"

```bash
# Verificar que wrangler esté instalado
npx wrangler --version
```

---

## Siguiente Paso: Deploy a Producción

Una vez verificado en local, podés deployar a producción:

```bash
# 1. Insertar en D1 remoto
npx wrangler d1 execute locales-limache --remote --file=scripts/insert_locales.sql

# 2. Deploy Worker API
npx wrangler deploy
```

Ver [ACTUALIZAR_LOCALES.md](../scripts/ACTUALIZAR_LOCALES.md) para más detalles.

---

## Ver También

- [BUSCAR_LUGARES.md](BUSCAR_LUGARES.md) - Manual del script
- [DESARROLLO_ENTORNO_VIRTUAL.md](DESARROLLO_ENTORNO_VIRTUAL.md) - Configuración del entorno
- [obtener_google_places.py](../scripts/obtener_google_places.py) - Script principal
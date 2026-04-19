# 🐛 Errores Resueltos - google-limache

> **LEER ANTES DE CONTINUAR TRABAJANDO EN ESTE PROYECTO.**
> Cada error documentado aquí ya fue resuelto. Se mantiene como referencia para no repetir los mismos errores.

---

## 0. ⚠️ D1 `.all()` requiere `await` - BUG MUY IMPORTANTE

**Error:** La API retorna `{}` (objeto vacío) sin datos, sin errores.

**Causa:** `stmt.all()` y `stmt.bind(...params).all()` retornan una **Promise**. Sin `await`, se retorna la Promise sin resolver, que se serializa como `{}`.

**Código INCORRECTO:**
```javascript
const results = params.length > 0 ? stmt.bind(...params).all() : stmt.all();
return Response.json(results);
```

**Código CORRECTO:**
```javascript
const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
return Response.json(results);
```

**Regla:** SIEMPRE usar `await` con operaciones D1 (`.all()`, `.run()`, `.first()`, `.raw()`).

---

## 1. IDs sin comillas en SQL causan error SQLITE_ERROR

**Error:**
```
no such column: loc at offset 183: SQLITE_ERROR
```

**Causa:** Los IDs tipo `loc-001` sin comillas son interpretados como `loc` menos `001` (operador `-`), no como un string.

**Solución:** SIEMPRE poner comillas simples alrededor de IDs string:
```sql
-- INCORRECTO:
VALUES (loc-001, 'Nombre', ...);

-- CORRECTO:
VALUES ('loc-001', 'Nombre', ...);
```

---

## 2. `wrangler pages dev` y `wrangler d1 execute` usan DBs diferentes sin `--persist-to`

**Error:** Los datos insertados con `wrangler d1 execute --local` no aparecen en `wrangler pages dev`.

**Causa:** `wrangler d1 execute --local` y `wrangler pages dev` pueden usar directorios de persistencia diferentes por defecto.

**Solución:** Usar `--persist-to` en TODOS los comandos para compartir la misma DB:
```bash
# Siempre usar el mismo --persist-to en TODOS los comandos
npx wrangler d1 execute locales-limache --local --persist-to .wrangler/state --file=schema.sql
npx wrangler d1 execute locales-limache --local --persist-to .wrangler/state --file=datos.sql
npx wrangler pages dev public --port 8787 --d1 locales --persist-to .wrangler/state
```

---

## 3. Wrangler `--file` flag no funciona correctamente

**Error:**
```
unrecognized token: "\" at offset 203: SQLITE_ERROR
```

**Causa:** El flag `--file` de wrangler corrupta los caracteres de escape cuando se suben archivos SQL con caracteres especiales o comillas.

**Solución:** NO usar `--file` para remoto. En su lugar:
1. Leer el archivo SQL y ejecutar cada statement individualmente
2. O usar la API de D1 directamente con `--command` inline

```bash
# INCORRECTO - causa error:
npx wrangler d1 execute db-name --remote --file=archivo.sql

# CORRECTO - usar comandos inline:
npx wrangler d1 execute db-name --remote --command="INSERT INTO..."
```

**Nota:** `--file` funciona correcto con `--local`, pero no con `--remote`.

---

## 4. Functions de Cloudflare Pages no se reconocen en deploy

**Error:**
```
No routes found when building Functions directory: ./functions - skipping
```

**Causa:** Cloudflare Pages busca las Functions en la carpeta `functions/` en la raíz del proyecto.

**Solución:**
1. Asegurarse de que `functions/` esté en la raíz del proyecto
2. Usar JavaScript (`.js`) en vez de TypeScript (`.ts`) para las Functions
3. Crear `public/_worker.js` si se quiere un worker más controlable

**Estructura correcta:**
```
proyecto/
├── functions/
│   └── api/
│       └── locales/
│           └── index.js
├── public/
│   ├── index.html
│   └── _worker.js      # Alternativa: Worker bundle
└── wrangler.toml
```

---

## 5. D1 Database no vinculada a Pages Functions en producción

**Error:** La API devuelve `{}` o `{"error": "Base de datos no configurada"}`

**Causa:** El binding `[[d1_databases]]` en `wrangler.toml` no se vincula automáticamente a Pages Functions en producción. Pages Functions y Workers tienen bindings separados.

**Solución:** Usar un **Worker standalone** en vez de Pages Functions para la API:

```bash
# 1. Crear wrangler.toml para Worker
cat > wrangler.toml << 'EOF'
name = "google-limache-api"
compatibility_date = "2024-04-18"

[[d1_databases]]
binding = "locales"
database_name = "locales-limache"
database_id = "e31afcac-2816-4ee0-aa02-1c009830cb4a"
EOF

# 2. Deployar como Worker
npx wrangler deploy worker.js
```

**URLs finales:**
- Frontend: `https://google-limache.pages.dev` (Cloudflare Pages)
- API: `https://google-limache-api.gonzalo-oviedo-dev.workers.dev` (Cloudflare Worker)

---

## 6. Wrangler desactualizado

**Error:**
```
The version of Wrangler you are using is now out-of-date.
```

**Solución:**
```bash
npm install --save-dev wrangler@latest
```

**Versión actual:** Wrangler 4.83.0

---

## 7. Multi-line SQL parsing issue

**Error:**
```
SQLITE_MISUSE: Statement is not executable
```

**Causa:** Los INSERT statements multilínea no se parsean correctamente con `--file`.

**Solución:** Parsear carácter por carácter, manejando strings entre comillas:

```python
def parse_values(values_str):
    parts = []
    current = ''
    in_quote = False
    for c in values_str:
        if c == "'":
            in_quote = not in_quote
        elif c == ',' and not in_quote:
            parts.append(current.strip())
            current = ''
            continue
        current += c
    parts.append(current.strip())
    return parts
```

---

## 8. Proyecto Cloudflare Workers vs Pages

| Característica | Cloudflare Pages | Cloudflare Workers |
|----------------|-------------------|-------------------|
| Binding D1 en local | Requiere `--d1` y `--persist-to` | Funciona correctamente |
| Deploy | `wrangler pages deploy` | `wrangler deploy` |
| API Routes | `functions/api/*.js` | `worker.js` |
| URL | `*.pages.dev` | `*.workers.dev` |
| Comando dev | `wrangler pages dev public --d1 locales --persist-to .wrangler/state` | `wrangler dev worker.js` |

**Recomendación para este proyecto:**
- Frontend estático → Cloudflare Pages
- API con D1 → Cloudflare Worker standalone (para producción)
- Local → `wrangler pages dev` con `--d1` y `--persist-to`

---

## 9. `_worker.js` con `export` incorrecto causa error de build

**Error:**
```
No matching export in "_worker.js" for import "default"
```

**Causa:** El archivo `public/_worker.js` usaba `export async function onRequest(context)` en vez de `export default { async fetch() }`.

**Solución:** Para `wrangler pages dev`, usar Pages Functions en `functions/` o `_worker.js` con formato correcto:
```javascript
// INCORRECTO para _worker.js:
export async function onRequest(context) { ... }

// CORRECTO para _worker.js:
export default {
  async fetch(request, env, ctx) { ... }
};

// MEJOR OPCIÓN: usar functions/api/locales/index.js con formato onRequest
```

---

## 10. Deploy a Preview en vez de Production

**Error:** `wrangler pages deploy` sube el deploy al ambiente **Preview** en vez de **Production**.

**Causa:** Cloudflare Pages determina el ambiente según la rama Git:
- Rama `main` → **Production**
- Cualquier otra rama → **Preview**

El proyecto usa rama `master`, que Cloudflare no reconoce como rama de producción.

**Solución:** Usar `--branch=main` para deployar a Production:
```bash
# INCORRECTO - sube a Preview si la rama no es "main":
npx wrangler pages deploy public --project-name=google-limache

# CORRECTO - fuerza deploy a Production:
npx wrangler pages deploy public --project-name=google-limache --branch=main
```

**Verificar el ambiente:**
```bash
# Listar deployments y ver Environment
npx wrangler pages deployment list --project-name=google-limache
```

**Resultado esperado:**
- `Environment: Production` + `Branch: main` → carga en `google-limache.pages.dev`
- `Environment: Preview` + `Branch: master` → carga en `<id>.google-limache.pages.dev`

---

## 11. Worker API también necesita `await` en D1

**Error:** La API Worker en producción retorna `{}` vacío.

**Causa:** Mismo bug que en `functions/api/locales/index.js`. El archivo `workers/worker.js` también tenía `stmt.all()` sin `await`.

**Solución:** Ambos archivos necesitan `await`:
- `functions/api/locales/index.js` → ya corregido
- `workers/worker.js` → corregido y redeployado

**Regla:** Cada vez que se modifica `workers/worker.js`, hay que redeployar:
```bash
npx wrangler deploy workers/worker.js --name google-limache-api
```

---

---

## 12. `_worker.js` aparece inexplicablemente en `dist/` causando deploy roto

**Error:** El dominio `google-limache.pages.dev` devuelve 404 mientras subdomains específicos funcionan.

**Síntoma:**
```bash
curl -sI "https://c9c69704.google-limache.pages.dev"  # 200 OK
curl -sI "https://google-limache.pages.dev"       # 404
```

**Causa:** Hay un archivo `_worker.js` en el directorio `dist/` que se copia desde `public/_worker.js` o desde otra ubicación. Cuando existe `_worker.js` en el directorio de deploy, Cloudflare Pages intenta habilitar Pages Functions, pero sin el binding de D1 correcto, todo falla.

**Diagnóstico:**
```bash
ls -la dist/  # Si aparece _worker.js aquí, ese es el problema
```

**Solución:**
1. Eliminar manualmente `_worker.js` del directorio de build antes de deployar:
```bash
rm dist/_worker.js
npx wrangler pages deploy dist --branch=main
```

2. O asegurar que el build sea limpio:
```bash
rm -rf dist
npm run build
rm -f dist/_worker.js  #por seguridad
npx wrangler pages deploy dist --branch=main
```

**Nota:** Este problema puede originarse porque wrangler copia archivos de más durante el build. Siempre verificar el contenido de `dist/` antes de deployar.

---

## 13. Rama Git incorrecta causa deploy a Preview en vez de Production

**Error:** El deploy aparece como "Preview" en Cloudflare Dash y el dominio principal no funciona.

**Causa:** El proyecto usaba rama `master` en vez de `main`:
```bash
git branch -a
# * master
```

Cloudflare mapea:
- `main` → Production → `*.pages.dev`
- `master` o cualquier otra → Preview → `<id>.pages.dev`

**Solución:**
1. Crear la rama `main` locally:
```bash
git checkout -b main
```

2. Deployar especificando la rama:
```bash
npx wrangler pages deploy dist --branch=main
```

3. Verificar en Cloudflare Dash que el deployment muestre:
   - `Environment: Production`
   - `Branch: main`

**Verificar:**
```bash
npx wrangler pages deployment list --project-name=google-limache
```

Debería mostrar `main` en la columna `Branch` y `Production` en `Environment`.

---

## 14. Arquitectura recomendada: Worker externo + Pages estático

**Problema:** Pages Functions con D1 tiene problemas de binding en producción.

**Solución confirmada:**
1. **Frontend** → Cloudflare Pages (archivos estáticos)
2. **API** → Cloudflare Worker standalone (independiente)

**Ventajas:**
- Worker standalone tiene binding D1 más estable
- Frontend es solo estático, más rápido y confiable
- Frontend puede llamar a Worker externo via fetch

**Configuración en App.tsx:**
```typescript
const API_URL = 'https://google-limache-api.gonzalo-oviedo-dev.workers.dev';
const response = await fetch(`${API_URL}/api/locales?q=${encodeURIComponent(termino)}`);
```

**Deploy separación:**
```bash
# Frontend (Pages)
npm run build
rm -f dist/_worker.js
npx wrangler pages deploy dist --branch=main

# API (Worker)
npx wrangler deploy workers/worker.js --name google-limache-api
```

**URLs finales:**
- Frontend: `https://google-limache.pages.dev`
- API: `https://google-limache-api.gonzalo-oviedo-dev.workers.dev`

---

## 15. Dominio principal de Pages returns 404 pero subdomains funcionan

**Síntoma:**Algunos subdomains `<id>.google-limache.pages.dev` funcionan (200 OK) pero el dominio principal `google-limache.pages.dev` devuelve 404.

**Causa raíz:** Este es un bug conocido de Cloudflare Pages que ocurre cuando:
1. Hay deployments corruptos o incompletos en el proyecto
2. La última deployación exitosa no está asociada correctamente al dominio principal
3. Existe un `_worker.js` problemático en el build

**Solución probada:**
1. Limpiar el build completamente:
```bash
rm -rf dist
npm run build
rm -f dist/_worker.js
```

2. Deployar a rama `main` (Production):
```bash
npx wrangler pages deploy dist --branch=main
```

3. Esperar 30-60 segundos y probar el dominio principal

**Si persiste:** Puede ser necesario esperar más tiempo o crear un nuevo proyecto en Cloudflare Pages.

---

*Documento actualizado: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*

---

## 16. ⚠️ `_worker.js` en `dist/` conflict con Worker standalone

**Error:** El dominio `google-limache.pages.dev` devuelve 404 mientras el Worker standalone en `workers.dev` funciona.

**Síntoma:**
```bash
curl -sI "https://google-limache.pages.dev"        # 404
curl -sI "https://google-limache-api.gonzalo-oviedo-dev.workers.dev"  # 200 OK
```

**Causa:** Cuando existe `_worker.js` en el directorio `dist/` que se deploya con Cloudflare Pages, el sistema de Pages intenta habilitar **Pages Functions** además del frontend estático. Esto conflictúa con el **Worker standalone** (`workers/worker.js`) que ya está desplegado separadamente en `workers.dev`.

El resultado es que Cloudflare Pages intenta crear un worker interno que overridea las rutas y falla porque:
1. No tiene el binding D1 correcto
2. Usa código diferente al Worker standalone
3. Puede entrar en conflicto de rutas

**Diagnóstico:**
```bash
ls -la dist/
# Si ve: _worker.js  ← ese es el problema
```

**ALTO: NUNCA incluir `_worker.js` en `dist/`**

**Solución:** SIEMPRE eliminar `_worker.js` antes de deployar:
```bash
# Script de deploy CORRECTO:
rm -rf dist
npm run build
rm -f dist/_worker.js  # ← IMPORTANTE: eliminar antes de deploy
npx wrangler pages deploy dist --project-name=google-limache --branch=main
```

**Reglas absolutas:**
1. ❌ NUNCA hacer `cp public/_worker.js dist/`
2. ❌ NUNCA incluir `_worker.js` en el build
3. ✅ SIEMPRE eliminar `_worker.js` de `dist/` antes de deployar
4. ✅ Mantener Worker API completamente separado en `workers/worker.js`

**Por qué pasa esto:**
- `wrangler pages deploy` copia TODO el contenido de `dist/`
- Si hay `_worker.js`, Cloudflare habilita Pages Functions
- Pages Functions ≠ Worker standalone
- Ambos pueden conflictuar en las rutas `/api/*`

**Verificar después del build:**
```bash
ls dist/  # No debe aparecer _worker.js
```
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

*Documento creado: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*
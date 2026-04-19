# Google Limache - Arquitectura y Configuración

## 📍 Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | google-limache |
| **Tipo** | Cloudflare Pages + Cloudflare Workers (API) + D1 Database |
| **Ubicación** | `/home/goviedo/proyectos/limache/google-limache` |
| **URL Producción** | https://google-limache.pages.dev |
| **URL Deploys** | https://d91cc776.google-limache.pages.dev (último) |

---

## 🔐 Cuentas Cloudflare

### Cuenta Principal (Usada para este deploy)
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

---

## 🏗️ Arquitectura del Proyecto

```
google-limache/
├── public/                    # Archivos compilados para deploy (copia de dist/)
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
│
├── functions/                 # Cloudflare Pages Functions (API)
│   └── api/
│       └── locales/
│           └── index.js       # Endpoint GET /api/locales
│
├── src/                       # Código fuente React
│   ├── App.tsx               # Componente principal + datos fallback
│   ├── types.ts              # Interfaces TypeScript
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos
│
├── schema.sql                # Schema D1 (locales + categorias)
├── wrangler.toml             # Configuración Cloudflare
├── vite.config.ts            # Configuración Vite
└── package.json
```

---

## 📊 Base de Datos D1

### Tabla: `locales` (69 registros)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PRIMARY KEY | Identificador (loc-001 a loc-069) |
| nombre | TEXT | Nombre del negocio |
| descripcion | TEXT | Descripción |
| categoria | TEXT | Categoría (Restaurante, Tienda, etc.) |
| imagen_url | TEXT | URL de imagen (vacío en fallback) |
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

### Tabla: `categorias` (9 registros)
- Comida, Tienda, Restaurante, Servícia, Ferretería, Supermercado, Farmacia, Gimnasio, Bar

---

## 🌐 API Endpoints

### GET /api/locales
Busca locales en D1 con filtros opcionales.

**Query Parameters:**
- `q` - Término de búsqueda (busca en nombre, descripción, categoría, dirección)
- `categoria` - Filtrar por categoría

**Respuesta:**
```json
{
  "results": [...],
  "success": true,
  "meta": {...}
}
```

**Archivo:** `functions/api/locales/index.js`

---

## ⚙️ Configuración wrangler.toml

```toml
name = "google-limache"
compatibility_date = "2024-04-18"
pages_build_output_dir = "public"

[vars]
APP_NAME = "Buscador de Locales Limache"
APP_DESCRIPTION = "Buscador de negocios y locales en Limache, Chile"

[[d1_databases]]
binding = "locales"
database_name = "locales-limache"
database_id = "e31afcac-2816-4ee0-aa02-1c009830cb4a"
```

---

## 🚀 Comandos de Deploy

### Desarrollo Local
```bash
# Build del frontend
npx vite build

# Copiar dist a public
cp -r dist public

# Probar local con wrangler
npx wrangler pages dev public --port 8787
```

### Deploy a Producción
```bash
cd /home/goviedo/proyectos/limache/google-limache

# 1. Build
npx vite build

# 2. Copiar a public
rm -rf public && cp -r dist public

# 3. Deploy
npx wrangler pages deploy public --project-name=google-limache
```

### Gestionar D1 Remoto
```bash
# Ver registros
npx wrangler d1 execute locales-limache --remote --command "SELECT COUNT(*) FROM locales"

# Ejecutar SQL desde archivo
npx wrangler d1 execute locales-limache --remote --file=archivo.sql

# Ejecutar SQL inline
npx wrangler d1 execute locales-limache --remote --command "SELECT * FROM locales LIMIT 5"
```

---

## 🔑 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps (para fotos) |

---

## 📝 Issues Conocidos

### CRÍTICO - SQL Injection potencial
**Archivo:** `functions/api/locales/index.js:17`
El parámetro de búsqueda se usa directamente en `LIKE ?` pero no se sanitizan caracteres especiales como `%` y `_`.

### MEDIO - Fallback usa datos old
**Archivo:** `src/App.tsx`
Los 69 negocios reales están en D1, pero el fallback en frontend tiene datos hardcodeados que pueden estar desactualizados.

### INFO - Wrangler desactualizado
Versión 3.114.17 instalada, disponible 4.83.0

---

## 🔗 Recursos

- [Cloudflare Pages](https://pages.cloudflare.com)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 📅 Historial

| Fecha | Acción |
|-------|--------|
| 2026-04-18 | Creación del proyecto |
| 2026-04-18 | Deploy inicial a google-limache.pages.dev |
| 2026-04-18 | Creación D1 locales-limache con 69 registros |

---

## 🐛 Errores Encontrados y Soluciones

Esta sección documenta los errores críticos encontrados durante el desarrollo y deploy, con las soluciones aplicadas. **LEER ANTES DE CONTINUAR TRABAJANDO EN ESTE PROYECTO.**

### 1. Wrangler `--file` flag no funciona correctamente

**Error:**
```
unrecognized token: "\" at offset 203: SQLITE_ERROR
```

**Causa:** El flag `--file` de wrangler corrupta los caracteres de escape cuando se suben archivos SQL. Wrangler tiene un bug conocido con archivos que contienen caracteres especiales o comillas.

**Solución:** NO usar `--file`. En su lugar:
1. Leer el archivo SQL y ejecutar cada statement individualmente
2. O usar la API de D1 directamente con `--command` inline

**Comando correcto:**
```bash
# INCORRECTO - causa error:
npx wrangler d1 execute db-name --remote --file=archivo.sql

# CORRECTO - usar comandos inline:
npx wrangler d1 execute db-name --remote --command="INSERT INTO..."
```

**Referencias:** AGENTS.md línea ~"RESOLVED: Wrangler's --file flag corruption issue"

---

### 2. Functions de Cloudflare Pages no se reconocen en deploy

**Error:**
```
No routes found when building Functions directory: ./functions - skipping
```

**Causa:** Cloudflare Pages busca las Functions en la carpeta `functions/` en la raíz del proyecto. El archivo debe estar en `functions/api/locales/index.js` (o `.ts`).

**Solución:**
1. Asegurarse de que la carpeta `functions/` esté en la raíz del proyecto
2. Usar JavaScript (`.js`) en vez de TypeScript (`.ts`) para las Functions
3. Crear `public/_worker.js` si se quiere un worker más controlable

**Estructura correcta:**
```
proyecto/
├── functions/           # ← Required para Pages Functions
│   └── api/
│       └── locales/
│           └── index.js
├── public/             # ← Archivos estáticos
│   ├── index.html
│   └── _worker.js      # ← Alternative: Worker bundle
└── wrangler.toml
```

**Referencias:** AGENTS.md línea ~"Functions only works in production deployment"

---

### 3. D1 Database no vinculada a Pages Functions

**Error:**
La API devuelve `{}` o `{"error": "Base de datos no configurada"}`

**Causa:** El binding `[[d1_databases]]` en `wrangler.toml` no se vincula automáticamente a Pages Functions en producción. Pages Functions y Workers tienen bindings separados.

**Solución:** Usar un **Worker standalone** en vez de Pages Functions:

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

# 2. Crear worker.js
cat > worker.js << 'EOF'
export default {
  async fetch(request, env) {
    // API aquí
  }
};
EOF

# 3. Deployar como Worker
npx wrangler deploy worker.js
```

**Resultado:** El Worker deployado tiene acceso directo a D1 bindings.

**URLs finales:**
- Frontend: `https://google-limache.pages.dev` (Cloudflare Pages)
- API: `https://google-limache-api.gonzalo-oviedo-dev.workers.dev` (Cloudflare Worker)

**Referencias:** AGENTS.md línea ~"API limitation: /api/locales endpoint only works in production"

---

### 4. Wrangler desactualizado

**Error:**
```
The version of Wrangler you are using is now out-of-date.
```

**Causa:** Versión 3.x instalada, versión 4.x disponible con mejor soporte.

**Solución:**
```bash
npm install --save-dev wrangler@latest
```

**Importante:** Wrangler 4 tiene cambios en la CLI:
- `wrangler pages deploy` ahora sube correctamente Functions
- Cambios en algunos flags

---

### 5. Multi-line SQL parsing issue

**Error:**
```
SQLITE_MISUSE: Statement is not executable
```

**Causa:** Los INSERT statements multilínea no se parsean correctamente. El SQL original tenía `INSERT INTO locales (...)` en una línea y `VALUES (...)` en otra.

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

**Referencias:** AGENTS.md línea ~"Character-by-character parsing"

---

### 6. Proyecto Cloudflare Workers vs Pages

**Concepto clave:** Hay DOS formas de crear APIs con Cloudflare:

| Característica | Cloudflare Pages | Cloudflare Workers |
|----------------|-------------------|-------------------|
| Binding D1 | No funciona bien en local | Funciona correctamente |
| Deploy | `wrangler pages deploy` | `wrangler deploy` |
| API Routes | `functions/api/*.js` | `worker.js` |
| URL | `*.pages.dev` | `*.workers.dev` |

**Recomendación para este proyecto:**
- Frontend estático → Cloudflare Pages
- API con D1 → Cloudflare Worker standalone

---

### 7. Comandos para verificar estado

```bash
# Ver deployments
npx wrangler pages deployment list --project-name=google-limache

# Ver D1 remoto
npx wrangler d1 execute locales-limache --remote --command "SELECT COUNT(*) FROM locales"

# Ver cuenta
npx wrangler whoami

# Listar D1
npx wrangler d1 list
```

---

## 📋 Checklist Pre-Deploy

Antes de hacer deploy a producción, verificar:

- [ ] `npx vite build` ejecutado
- [ ] `dist/` copiado a `public/`
- [ ] `wrangler.toml` tiene `pages_build_output_dir = "public"`
- [ ] `functions/` existe en raíz con `index.js`
- [ ] D1 tiene `database_id` correcto
- [ ] Wrangler actualizado (`wrangler@latest`)
- [ ] Tests locales pasan

---

*Documento generado: 2026-04-18*
*Última actualización: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*

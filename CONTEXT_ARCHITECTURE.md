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

## 🐛 Errores Resueltos

> **Todos los errores resueltos fueron movidos a `BUGS_RESUELTOS.md`**
> **LEER `BUGS_RESUELTOS.md` ANTES DE CONTINUAR TRABAJANDO EN ESTE PROYECTO.**

Errores documentados:
1. D1 `.all()` requiere `await`
2. IDs sin comillas en SQL causan SQLITE_ERROR
3. `wrangler pages dev` y `d1 execute` usan DBs diferentes sin `--persist-to`
4. Wrangler `--file` flag no funciona correctamente con remoto
5. Functions de Pages no se reconocen en deploy
6. D1 Database no vinculada a Pages Functions
7. Wrangler desactualizado
8. Multi-line SQL parsing issue
9. `_worker.js` con export incorrecto
10. Proyecto Workers vs Pages

Ver detalles y soluciones en [`BUGS_RESUELTOS.md`](./BUGS_RESUELTOS.md)

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
- [ ] `await` en todas las llamadas D1 (ver `BUGS_RESUELTOS.md` #0)
- [ ] IDs SQL con comillas simples (ver `BUGS_RESUELTOS.md` #1)
- [ ] `--persist-to` en todos los comandos wrangler (ver `BUGS_RESUELTOS.md` #2)

---

*Documento generado: 2026-04-18*
*Última actualización: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*

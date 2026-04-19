# 🔍 Code Review - google-limache

> ⚠️ **NOTA IMPORTANTE**: Antes de trabajar en este proyecto, leer primero:
> - `CONTEXT_ARCHITECTURE.md` - Arquitectura, cuentas y errores documentados
> - `CONTEXT_ARCHITECTURE.md#-errores-encontrados-y-soluciones` - Soluciones a problemas conocidos

## Resumen Ejecutivo
- **Archivos revisados**: 8 archivos principales
- **Issues encontrados**: 9
- **Severity**: 🔴 Críticos: 2 | 🟡 Medios: 4 | 🟢 Info: 3
- **Ver también**: `CONTEXT_ARCHITECTURE.md` para errores de deploy y soluciones

## ⚠️ Reglas de Proyecto

**EL USUARIO SIEMPRE CORRE EL PROYECTO LOCALMENTE.** No intentar ejecutar `wrangler pages dev` ni ningún comando que leave el terminal esperando input o loop infinito. Solo dar instrucciones y esperar output del usuario.

**Para probar localmente, el usuario ejecuta:**
```bash
cd /home/goviedo/proyectos/limache/google-limache
./scripts/dev.sh
```

---

## 🔴 Issues Críticos (Fix inmediato)

### 1. [CRÍTICO] ⚠️ SIEMPRE usar `await` con D1
**Archivo**: `functions/api/locales/index.js`
**Severidad**: 🔴🔴🔴 CRÍTICO
**Problema**: `stmt.all()` y `stmt.bind().all()` retornan Promises. Sin `await`, la API retorna `{}` vacío.
**Regla**: SIEMPRE usar `await` con operaciones D1 (`.all()`, `.run()`, `.first()`, `.raw()`)
```javascript
// ❌ INCORRECTO - retorna Promise vacía como {}
const results = stmt.all();

// ✅ CORRECTO - retorna datos reales
const results = await stmt.all();
```

### 2. [CRÍTICO] SQL IDs sin comillas causan SQLITE_ERROR
**Archivo**: `scripts/insert_locales.sql`
**Severidad**: 🔴
**Problema**: Los IDs tipo `loc-001` sin comillas son interpretados como `loc - 001` (operador resta).
**Regla**: SIEMPRE usar comillas simples en IDs string: `'loc-001'` no `loc-001`

### 3. [CRÍTICO] SQL Injection potencial en API
**Archivo**: `functions/api/locales/index.ts:17`
**Severidad**: 🔴
**Problema**: Los parámetros de búsqueda se insertan con `LIKE ?` pero no se sanitizan.
**Recomendación**: Sanitizar el input antes de insertarlo en el query:
```typescript
const sanitizedQuery = query.replace(/[%_]/g, '\\$&'); // escapar %
```

---

## 🟡 Issues Medios (Fix planeado)

### 3. [MEDIO] Datos hardcodeados desactualizados
**Archivo**: `src/App.tsx`
**Severidad**: 🟡
**Problema**: Los 20 locales hardcodeados en `localesData` son los datos originales de ejemplo (Café Central, Restaurant El Parque, etc.) y NO reflejan los 69 negocios reales obtenidos de Google Maps (Club Social Italo Chileno, Kustom Burguer, etc.).
**Recomendación**: Actualizar `localesData` con los datos de `scripts/insert_locales.sql` o usar la API para obtener los datos de D1.

### 4. [MEDIO] Falta campo rating en UI
**Archivo**: `src/App.tsx:163-167`
**Severidad**: 🟡
**Problema**: La tarjeta de negocio muestra `plus_code` pero no muestra el `rating` (estrellas) que viene de Google Maps.
**Recomendación**: Agregar visualización de rating:
```tsx
{local.rating && (
  <div className="card-detail">
    <span className="card-detail-icon">⭐</span>
    <div>
      <div className="card-detail-label">Rating</div>
      <div className="card-detail-text">{local.rating} ⭐ ({local.rating_count} reseñas)</div>
    </div>
  </div>
)}
```

### 5. [MEDIO] Tipo TypeScript incompleto
**Archivo**: `src/types.ts`
**Severidad**: 🟡
**Problema**: La interfaz `Locales` no incluye los campos `rating`, `horario`, `website` que se agregaron al schema.
**Recomendación**: Agregar campos al tipo:
```typescript
export interface Locales {
  // ... campos existentes
  rating?: number;
  rating_count?: number;
  horario?: string;
  website?: string;
}
```

### 6. [MEDIO] Fallback no efectivo
**Archivo**: `src/App.tsx:18-27`
**Severidad**: 🟡
**Problema**: El fallback a datos locales solo funciona cuando la API falla, pero no usa los 69 negocios reales de Google Maps cuando no hay D1 configurado.
**Recomendación**: Importar los datos de Google Maps como fallback cuando no hay API.

---

## 🟢 Recomendaciones

### 7. [INFO] Typo en datos hardcodeados
**Archivo**: `src/App.tsx:112`
**Severidad**: 🟢
**Problema**: "abastecederes" debería ser "abastecedores"
```typescript
// Línea 112
descripcion: 'Supermercado con productos frescos, abastecimiento y productos nacionales...'
```

### 8. [INFO] Sin tests
**Archivo**: Proyecto completo
**Severidad**: 🟢
**Problema**: No hay tests unitarios ni de integración.
**Recomendación**: Agregar tests con Vitest para los componentes React y la función de API.

### 9. [INFO] API Key no configurada en frontend
**Archivo**: `src/App.tsx`
**Severidad**: 🟢
**Problema**: La variable de entorno `GOOGLE_MAPS_API_KEY` está documentada pero no se usa en el frontend (las fotos de Google Maps no se cargan por falta de la key en el cliente).
**Recomendación**: Considerar mostrar las fotos del servidor (el script ya genera URLs con la API key del servidor).

---

## ✅ Fixes Aplicados (histórico)

- [x] Corregido typo "indicadores" → "indicaciones" en UI
- [x] Corregidos errores TypeScript (duplicados en types.ts)
- [x] Removido cloudflare plugin de vite.config.ts (incompatibilidad)
- [x] Schema.sql actualizado con campos rating, horario, website
- [x] Script Python corregido (campo 'photo' vs 'photos')
- [x] **69 negocios insertados en D1 remoto** (usando Python + sqlite3 directo, no `--file`)
- [x] **API deployada como Worker standalone** (Pages Functions no funcionan bien con D1)
- [x] **Wrangler actualizado a v4.83.0**

---

## 📋 Próximos Pasos Recomendados

1. **Ejecutar insert_locales.sql** - El SQL tiene un problema con wrangler CLI (posible bug). Ejecutar manualmente:
   ```bash
   # Opción 1: Dividir en statements individuales
   # Opción 2: Usar sqlite3 directamente con el archivo .db
   ```

2. **Sincronizar tipos TypeScript** con el schema de D1

3. **Mostrar rating en las tarjetas** - Los datos de Google Maps incluyen rating

4. **Actualizar datos de fallback** - Usar los 69 negocios reales

---

## 📁 Estructura del Proyecto

```
google-limache/
├── public/                    # Archivos compilados (build de Vite)
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
├── functions/                 # Cloudflare Pages Functions (no usado para API)
│   └── api/
│       └── locales/
├── src/
│   ├── App.tsx              # Componente principal + datos fallback
│   ├── main.tsx            # Entry point
│   ├── types.ts            # TypeScript interfaces
│   └── index.css           # Estilos (Google-like)
├── scripts/
│   ├── obtener_google_places.py  # Script para obtener datos de Google
│   └── insert_locales.sql        # SQL con 69 negocios reales
├── worker.js                 # Cloudflare Worker API (USA D1)
├── wrangler.toml            # Configuración Cloudflare (Worker + D1)
├── schema.sql              # Schema D1 (actualizado con rating, horario, website)
└── package.json            # Dependencias
```

---

## 🔗 Recursos

- **Cloudflare Pages**: https://pages.cloudflare.com
- **D1 Database**: https://developers.cloudflare.com/d1/
- **Google Places API**: https://developers.google.com/maps/documentation/places/web-service
- **API Key actual**: Configurada en variable de entorno `GOOGLE_MAPS_API_KEY`

---

## 🔗 Recursos y Documentación

- **CONTEXT_ARCHITECTURE.md** - Arquitectura completa, cuentas, y errores documentados
- **Cloudflare Pages**: https://pages.cloudflare.com
- **D1 Database**: https://developers.cloudflare.com/d1/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

## 📍 URLs de Producción

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | https://google-limache.pages.dev | ✅ Activo |
| API (Worker) | https://google-limache-api.gonzalo-oviedo-dev.workers.dev | ✅ Deployado |
| D1 Database | locales-limache (ID: e31afcac-2816-4ee0-aa02-1c009830cb4a) | ✅ 69 registros |

## 🔐 Cuenta Cloudflare

- **Email**: gonzalo.oviedo.dev@gmail.com
- **Account ID**: `0e7c015c16da16f0cebace036c8495c8`

---

*Última revisión: 2026-04-19*
*Proyecto: Buscador de locales de Limache, Chile*
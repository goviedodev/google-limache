# SYSTEM_PROMPT - Buscador de Locales Limache

## Descripción del Proyecto

Aplicación web React desplegada en Cloudflare Pages que funciona como un buscador de locales y negocios de Limache, Chile. Inspirada en la interfaz de búsqueda de Google.

## Funcionalidades

### 1. Buscador Principal
- Campo de búsqueda similar a Google con botón "Buscar en Limache"
- Búsqueda por nombre, categoría o descripción de locales
- Diseño centrado con logo y branding de Limache

### 2. Matriz de Resultados (Grid)
- Grid de 2 columnas de ancho x N filas de largo
- Tarjetas de locales con estructura de información

### 3. Tarjeta de Negocio
Cada tarjeta contiene:

#### Imagen
- Imagen del local/negocio en la parte superior
- Tamaño recomendado: 400x250px
- Objeto con propiedades: url, titulo, alt

#### Título
- Nombre del establecimiento
- Texto en negrita, tamaño 18px

#### Tabs de Menú
- Pestañas tipo "Description" con contenido
- Contenido de la pestaña "Descripción General"

#### Sección Descripción con iconos:
- 📍 Indicaciones (icono de ubicación + texto de direcciones)
- Plus Code (icono + código plus code de ubicación)
- 📞 Celular (icono de teléfono + número, opcional)
- 📧 Correo Electrónico (icono de email + correo, opcional)

### 4. Datos de Locales
Incluir datos de ejemplo realistas de locales de Limache:
- Restaurantes, cafeterías, tiendas
- Servicios municipales
- Comercios locales

## Tech Stack

- React 18+ con Vite
- TypeScript
- CSS moderno con variables CSS
- wrangler.toml para Cloudflare Pages

## Deployment

```bash
npm run build
# o
npx wrangler pages deploy dist
```

## Base de Datos D1 (Opcional)

- Base de datos: SQLite en Cloudflare D1
- Nombre: `locales`
- Binding: `locales`
- Schema: `schema.sql`

### Deployment D1

```bash
# Crear base de datos D1
npx wrangler d1 create locales

# Aplicar schema
npx wrangler d1 execute locales --local --file=schema.sql
```

## Archivos del Proyecto

```
/google-limache/
├── SYSTEM_PROMPT.md       # Este archivo
├── package.json           # Dependencias npm
├── vite.config.ts        # Configuración Vite
├── wrangler.toml         # Configuración Cloudflare
├── tsconfig.json         # Configuración TypeScript
├── schema.sql           # Schema D1
├── index.html           # Entry point HTML
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx         # Entry point React
│   ├── App.tsx          # Componente principal con datos
│   ├── types.ts         # Tipos TypeScript
│   └── index.css        # Estilos CSS
├── functions/
│   └── api/locales/
│       └── index.ts     # API de búsqueda (D1)
└── dist/               # Build output
```

## Capturas de Pantalla参考

El proyecto incluye datos de ejemplo de 20 locales de Limache:
- Café Central Limache
- Restaurant El Parque
- Supermercado Los Andes
- Farmacia Sana
- Biblioteca Municipal
- Gimnasio Fitness Zone
- Pizzería Napoli
- Peluquería Style
- Cyber Café Game
- Panadería Don Pan
- Centro Médico Limache
- Bar Deportivo Sports
- Lavandería Clean
- Librería El Saber
- Clínica Veterinaria PetCare
- Piscina Municipal
- Centro Cultural
- Municipalidad de Limache
- Hotel Rancho Limache
- Distribuidora de Gas
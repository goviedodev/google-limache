-- Schema para base de datos D1 de locales de Limache

-- Tabla principal de locales/negocios
CREATE TABLE locales (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  imagen_url TEXT,
  imagen_titulo TEXT,
  imagen_alt TEXT,
  indicaciones TEXT,
  plus_code TEXT,
  celular TEXT,
  correo TEXT,
  direccion TEXT,
  rating REAL,
  horario TEXT,
  website TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tabla de categorías
CREATE TABLE categorias (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  icono TEXT,
  color TEXT
);

-- Insertar categorías iniciales
INSERT INTO categorias (id, nombre, icono, color) VALUES
('restaurante', 'Restaurante', '🍽️', '#ea4335'),
('cafe', 'Café', '☕', '#fbbc05'),
('tienda', 'Tienda', '🏪', '#34a853'),
('servicio', 'Servicio', '🔧', '#4285f4'),
('entretencion', 'Entretención', '🎮', '#9c27b0'),
('salud', 'Salud', '🏥', '#e91e63'),
('educacion', 'Educación', '📚', '#00bcd4'),
('deporte', 'Deporte', '⚽', '#ff9800'),
('municipal', 'Municipal', '🏛️', '#607d8b');
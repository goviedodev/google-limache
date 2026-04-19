export interface Locales {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  imagen_url?: string;
  imagen_titulo?: string;
  imagen_alt?: string;
  indicaciones?: string;
  plus_code?: string;
  celular?: string;
  correo?: string;
  direccion?: string;
  rating?: number | null;
  horario?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
}
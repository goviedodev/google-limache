#!/usr/bin/env python3
"""
Script para obtener negocios del centro de Limache usando Google Maps Places API
y generar SQL para insertar en D1

MODO DE USO:
- Este script soporta MÚLTIPLES ZONAS de búsqueda
- Editar el diccionario ZONAS para agregar nuevas zonas
- Seleccionar qué zonas buscar con ZONAS_A_BUSCAR
- Por defecto NO borra los registros existentes
- Para borrar y empezar fresco: exportar DELETE_EXISTING=1
- START_ID configurable para continuar desde ID existente

Ejemplo de uso (AGREGAR nuevos):
  export GOOGLE_MAPS_API_KEY='...'
  export START_ID=70
  python scripts/obtener_google_places.py

Ejemplo de uso (EMPEZAR FRESCO):
  export GOOGLE_MAPS_API_KEY='...'
  export DELETE_EXISTING=1  # Borra todos los registros
  export START_ID=1
  python scripts/obtener_google_places.py
"""

import os
import sys
import json
import math
import googlemaps


def haversine(lat1, lon1, lat2, lon2):
    """Calcula distancia en km entre dos coordenadas"""
    R = 6371  # Radio de la Tierra en km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon/2)**2)
    return R * 2 * math.asin(math.sqrt(a))


def generar_grilla(centro_lat, centro_lon, radio_total_m, radio_punto_m=250):
    """
    Genera una grilla de puntos de búsqueda dentro de un radio total.
    
    Args:
        centro_lat, centro_lon: Centro del área
        radio_total_m: Radio total del área en metros
        radio_punto_m: Radio de cada punto individual (default 250m)
    
    Returns:
        Lista de tuplas (lat, lon) para cada punto de la grilla
    """
    # Espaciado: 1.8x el radio para solapamiento
    espaciado = radio_punto_m * 1.8  # ~450m entre puntos
    
    # Calcular grados equivalentes
    km_to_deg_lat = 1 / 111.32
    km_to_deg_lon = 1 / (111.32 * math.cos(math.radians(centro_lat)))
    
    espaciado_lat = espaciado / 1000 * km_to_deg_lat
    espaciado_lon = espaciado / 1000 * km_to_deg_lon
    
    # Calcular cuántos puntos caben
    radio_total_km = radio_total_m / 1000
    n_puntos = int(radio_total_km / (espaciado / 1000)) + 1
    
    puntos = []
    for i in range(-n_puntos, n_puntos + 1):
        for j in range(-n_puntos, n_puntos + 1):
            lat = centro_lat + i * espaciado_lat
            lon = centro_lon + j * espaciado_lon
            
            # Verificar que esté dentro del radio total
            dist_km = haversine(centro_lat, centro_lon, lat, lon)
            if dist_km <= radio_total_km:
                puntos.append((lat, lon))
    
    return puntos

# ============================================================
# ZONAS DE BÚSQUEDA
# ============================================================
# Agregar nuevas zonas aquí con el formato:
#   'NOMBRE_ZONA': {'coords': (lat, long), 'radio': metros}
#
# Ejemplos de zonas disponibles:
#   - LIMACHE_CENTRO: Plaza de Armas
#        'coords': (-32.99097137380414, -71.2756202276518),
#        'radio': 2000,
#   - LIMACHE_NUEVO: Sector nuevo/este de Limache
#   - 'LIMACHE_VIEJO': { // Sector antiguo/oeste de Limache
#        'coords': (-33.008, -71.264),
#        'radio': 1000,
#    },
#   - Quillota: Ciudad cercana
#   - Villa Alemana: Ciudad cercana

#   - Avenida Concepcion, Centro Veterinario -33.01480948672327, -71.26809175449857
#   - 7000 metros
# ============================================================

ZONAS = {
    'LIMACHE_CENTRO': {
        'coords': (-33.01480948672327, -71.26809175449857),
        'radio': 14000, # 7 Kms.
    }
    # === AGREGAR NUEVAS ZONAS AQUÍ ===
    # 'QUILLOTA': {
    #     'coords': (-32.950, -71.230),
    #     'radio': 1500,
    # },
}

# Zonas a buscar (seleccionar cuáles usar)
# Por defecto busca todas las zonas definidas
ZONAS_A_BUSCAR = list(ZONAS.keys())  # ['LIMACHE_CENTRO', 'LIMACHE_VIEJO', ...]

# ============================================================
# OTRAS CONFIGURACIONES
# ============================================================

# Starting ID (para continuar desde existente, ej: 70 para continuar después de 69)
# Establecer en 1 para empezar desde cero, o en N+1 para continuar después de N existentes
START_ID = int(os.getenv('START_ID', '1'))  # Cambiar a 70 para continuar después de 69 existentes

# Borrar registros existentes antes de insertar (1 = sí, 0 = no)
DELETE_EXISTING = os.getenv('DELETE_EXISTING', '0') == '1'

# Tipos de lugares a buscar
TIPOS = ['restaurant', 'cafe', 'bar', 'supermarket', 'pharmacy', 'bank', 'store']

# Mapeo de tipos de Google a categorías locales
TIPO_A_CATEGORIA = {
    'restaurant': 'restaurante',
    'cafe': 'cafe',
    'bar': 'restaurante',
    'supermarket': 'tienda',
    'pharmacy': 'salud',
    'bank': 'servicio',
    'store': 'tienda',
}

# ============================================================
# INICIO DEL SCRIPT
# ============================================================

# Cargar API key desde variable de entorno
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not API_KEY:
    print("Error: GOOGLE_MAPS_API_KEY no está configurada")
    print("Ejecuta: export GOOGLE_MAPS_API_KEY='tu_api_key'")
    exit(1)

print("=" * 50)
print("🔍 BUSCADOR DE NEGOCIOS - GOOGLE MAPS")
print("=" * 50)
print(f"\n📍 Zonas a buscar: {', '.join(ZONAS_A_BUSCAR)}")
print(f"🔢 Starting ID: {START_ID}")
print()

gmaps = googlemaps.Client(key=API_KEY)

def obtener_place_details(place_id):
    """Obtiene detalles completos de un lugar"""
    try:
        details = gmaps.place(place_id, fields=[
            'name', 'formatted_address', 'formatted_phone_number',
            'website', 'rating', 'user_ratings_total',
            'opening_hours', 'photo', 'plus_code'
        ])
        return details.get('result', {})
    except Exception as e:
        print(f"    ⚠️ Error obteniendo detalles: {e}")
        return {}

def sql_val(v):
    """Limpiar valor para SQL"""
    if v is None or v == '':
        return 'NULL'
    # Escapar comillas simples
    texto = str(v).replace("'", "''")
    return f"'{texto}'"

def generar_insert_sql(negocio, indice, sql_mode='INSERT OR IGNORE'):
    """Genera sentencia SQL INSERT para un negocio"""
    nombre = sql_val(negocio.get('nombre'))
    descripcion = sql_val(negocio.get('descripcion', ''))
    categoria = sql_val(negocio.get('categoria'))
    direccion = sql_val(negocio.get('direccion'))
    indicaciones = sql_val(negocio.get('indicaciones'))
    plus_code = sql_val(negocio.get('plus_code'))
    celular = sql_val(negocio.get('celular'))
    correo = sql_val(negocio.get('correo', ''))
    rating = negocio.get('rating') or 'NULL'
    horario = sql_val(negocio.get('horario', ''))
    website = sql_val(negocio.get('website', ''))
    imagen_url = sql_val(negocio.get('imagen_url', ''))
    
    # Usar START_ID + indice para generar ID único (con comillas para SQL)
    local_id = f"'loc-{START_ID + indice:03d}'"
    
    # Usar INSERT o INSERT OR IGNORE según modo
    return f"""{sql_mode} INTO locales (id, nombre, descripcion, categoria, imagen_url, imagen_titulo, imagen_alt, indicaciones, plus_code, celular, correo, direccion, rating, horario, website)
VALUES ({local_id}, {nombre}, {descripcion}, {categoria}, {imagen_url}, {nombre}, {nombre}, {indicaciones}, {plus_code}, {celular}, {correo}, {direccion}, {rating}, {horario}, {website});"""

# ============================================================
# BÚSQUEDA POR ZONAS
# ============================================================

print("=" * 50)
print("FASE 1: Buscando lugares en zonas")
print("=" * 50)

todos_resultados = []

for nombre_zona in ZONAS_A_BUSCAR:
    zona = ZONAS[nombre_zona]
    centro = zona['coords']
    radio_total = zona['radio']
    
    print(f"\n📍 Zona: {nombre_zona}")
    print(f"   Centro: {centro}")
    print(f"   Radio total: {radio_total}m")
    
    # Generar grilla de puntos
    puntos = generar_grilla(centro[0], centro[1], radio_total, radio_punto_m=1000)
    print(f"   Grilla: {len(puntos)} puntos de búsqueda")
    
    for idx, punto in enumerate(puntos):
        print(f"\n  [{idx+1}/{len(puntos)}] Punto: ({punto[0]:.4f}, {punto[1]:.4f})")
        
        for tipo in TIPOS:
            print(f"    📥 Buscando {tipo}...")
            
            try:
                results = gmaps.places_nearby(
                    location=punto,
                    radius=1000,  # Radio fijo 1000m
                    type=tipo
                )
                
                if results.get('results'):
                    for place in results['results']:
                        todos_resultados.append({
                            'place_id': place['place_id'],
                            'nombre': place.get('name', ''),
                            'direccion': place.get('vicinity', ''),
                            'rating': place.get('rating'),
                            'categoria': TIPO_A_CATEGORIA.get(tipo, 'tienda'),
                            'tipo_original': tipo,
                            'zona_busqueda': nombre_zona,
                        })
                        print(f"      ✓ {place['name']}")
            except Exception as e:
                print(f"      ✗ Error: {e}")

# Eliminar duplicados por place_id
unique_results = {}
for place in todos_resultados:
    unique_results[place['place_id']] = place
todos_resultados = list(unique_results.values())

print(f"\n📊 Total de lugares encontrados (sin duplicados): {len(todos_resultados)}")

# Segunda fase: obtener detalles de cada lugar
print("\n🔎 Obteniendo detalles de cada lugar...\n")

negocios_con_detalles = []

for i, negocio in enumerate(todos_resultados):
    print(f"  [{i+1}/{len(todos_resultados)}] {negocio['nombre']}...")
    
    details = obtener_place_details(negocio['place_id'])
    
    if details:
        # Construir objeto completo
        imagen_url = ''
        if details.get('photo'):
            foto_ref = details['photo'][0]['photo_reference']
            imagen_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={foto_ref}&key={API_KEY}"
        
        horario = ''
        if details.get('opening_hours', {}).get('weekday_text'):
            horario = ' | '.join(details['opening_hours']['weekday_text'])
        
        plus_code = ''
        if details.get('plus_code'):
            plus_code = details['plus_code'].get('global_code', '')
        
        negocio_completo = {
            'nombre': details.get('name', negocio['nombre']),
            'direccion': details.get('formatted_address', negocio['direccion']),
            'indicaciones': details.get('formatted_address', negocio['direccion']),
            'celular': details.get('formatted_phone_number', ''),
            'website': details.get('website', ''),
            'rating': details.get('rating'),
            'categoria': negocio['categoria'],
            'plus_code': plus_code,
            'horario': horario,
            'imagen_url': imagen_url,
        }
        negocios_con_detalles.append(negocio_completo)
        print(f"    ✓ Tel: {negocio_completo.get('celular', 'N/A')[:30] if negocio_completo.get('celular') else 'N/A'}")
    else:
        # Usar datos básicos si no hay detalles
        negocio['indicaciones'] = negocio['direccion']
        negocios_con_detalles.append(negocio)
    
print(f"\n✅ Negocios con detalles: {len(negocios_con_detalles)}")

# Generar SQL
print("\n📝 Generando SQL...\n")

sql_statements = []

# Si DELETE_EXISTING=1, agregar DELETE al inicio
if os.getenv('DELETE_EXISTING', '0') == '1':
    sql_statements.append('DELETE FROM locales;')
    sql_mode = 'INSERT'
else:
    sql_mode = 'INSERT OR IGNORE'

for i, negocio in enumerate(negocios_con_detalles):
    sql = generar_insert_sql(negocio, i, sql_mode)
    sql_statements.append(sql)

# Guardar SQL en archivo
output_file = '/home/goviedo/proyectos/limache/google-limache/scripts/insert_locales.sql'
with open(output_file, 'w') as f:
    f.write(f'-- SQL para insertar negocios de Limache desde Google Maps Places API\n')
    f.write(f'-- Generado automáticamente (START_ID={START_ID})\n')
    if DELETE_EXISTING:
        f.write(f'-- ⚠️ BORRÓ todos los registros existentes\n\n')
    else:
        f.write(f'-- NO borra los registros existentes\n\n')
    f.write('\n'.join(sql_statements))
    f.write('\n')

print(f"✅ SQL guardado en: {output_file}")
inserciones = len(sql_statements) - (1 if DELETE_EXISTING else 0)
print(f"   Total de inserciones: {inserciones}")
print(f"   Rango de IDs: loc-{START_ID:03d} a loc-{START_ID + inserciones - 1:03d}")
if DELETE_EXISTING:
    print(f"   ⚠️ Modo: REEMPLAZAR TODO (DELETE incluido)")

# Mostrar resumen por categoría
print("\n📊 Resumen por categoría:")
from collections import Counter
categorias = Counter([n['categoria'] for n in negocios_con_detalles])
for cat, count in categorias.most_common():
    print(f"  {cat}: {count}")

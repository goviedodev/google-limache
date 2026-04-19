#!/usr/bin/env python3
"""
Script para obtener negocios del centro de Limache usando Google Maps Places API
y generar SQL para insertar en D1
"""

import os
import json
import googlemaps

# Cargar API key desde variable de entorno
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not API_KEY:
    print("Error: GOOGLE_MAPS_API_KEY no está configurada")
    print("Ejecuta: export GOOGLE_MAPS_API_KEY='tu_api_key'")
    exit(1)

gmaps = googlemaps.Client(key=API_KEY)

# Centro de Limache
CENTER = (-33.008, -71.264)

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

def generar_insert_sql(negocio, indice):
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
    
    local_id = f"loc-{indice:03d}"
    
    return f"""INSERT INTO locales (id, nombre, descripcion, categoria, imagen_url, imagen_titulo, imagen_alt, indicaciones, plus_code, celular, correo, direccion, rating, horario, website)
VALUES ({local_id}, {nombre}, {descripcion}, {categoria}, {imagen_url}, {nombre}, {nombre}, {indicaciones}, {plus_code}, {celular}, {correo}, {direccion}, {rating}, {horario}, {website});"""

print("🔍 Obteniendo negocios de Limache, Chile...\n")

todos_resultados = []

# Primera fase: obtener lista de negocios
for tipo in TIPOS:
    print(f"📥 Obteniendo {tipo}...")
    
    try:
        results = gmaps.places_nearby(
            location=CENTER,
            radius=800,
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
                })
                print(f"  ✓ {place['name']}")
    except Exception as e:
        print(f"  ✗ Error: {e}")

print(f"\n📊 Total de lugares encontrados: {len(todos_resultados)}")

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
for i, negocio in enumerate(negocios_con_detalles):
    sql = generar_insert_sql(negocio, i + 1)
    sql_statements.append(sql)

# Guardar SQL en archivo
output_file = '/home/goviedo/proyectos/limache/google-limache/scripts/insert_locales.sql'
with open(output_file, 'w') as f:
    f.write('-- SQL para insertar negocios de Limache desde Google Maps Places API\n')
    f.write('-- Generado automáticamente\n\n')
    f.write('DELETE FROM locales;\n\n')
    f.write('\n'.join(sql_statements))
    f.write('\n')

print(f"✅ SQL guardado en: {output_file}")
print(f"   Total de inserciones: {len(sql_statements)}")

# Mostrar resumen por categoría
print("\n📊 Resumen por categoría:")
from collections import Counter
categorias = Counter([n['categoria'] for n in negocios_con_detalles])
for cat, count in categorias.most_common():
    print(f"  {cat}: {count}")
#!/usr/bin/env python3
"""
Image Proxy Service para google-limache
Descarga y sirve fotos de Google Places Photo API

Puerto: 14771
"""

import os
import hashlib
import requests
from flask import Flask, send_from_directory, jsonify, abort, request

app = Flask(__name__)

# Configuración
PHOTOS_DIR = os.path.join(os.path.dirname(__file__), 'photos')
DOWNLOADS_DIR = os.path.join(PHOTOS_DIR, 'downloads')
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs')
PHOTO_API_URL = 'https://maps.googleapis.com/maps/api/place/photo'

# Crear directorios
os.makedirs(DOWNLOADS_DIR, exist_ok=True)


def get_photo_filename(photo_ref: str) -> str:
    """Genera nombre de archivo para un photo_reference"""
    # Usar hash del reference para nombre de archivo válido
    safe_name = hashlib.md5(photo_ref.encode()).hexdigest()[:16]
    return f"{safe_name}.jpg"


def download_photo(photo_ref: str, max_width: int = 400) -> str | None:
    """
    Descarga una foto de Google Places Photo API
    Retorna la ruta del archivo descargado o None si falla
    """
    filename = get_photo_filename(photo_ref)
    filepath = os.path.join(DOWNLOADS_DIR, filename)
    
    # Si ya existe, retornar
    if os.path.exists(filepath):
        print(f"  ✓ Ya existe: {filename}")
        return filepath
    
    # Descargar de Google
    try:
        params = {
            'maxwidth': max_width,
            'photo_reference': photo_ref,
            'key': API_KEY
        }
        response = requests.get(PHOTO_API_URL, params=params, allow_redirects=True, timeout=30)
        
        if response.status_code == 200:
            # Verificar que es una imagen
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print(f"  ✓ Descargado: {filename}")
                return filepath
            else:
                print(f"  ⚠️ No es imagen: {content_type}")
        else:
            print(f"  ⚠️ HTTP {response.status_code}")
            
    except Exception as e:
        print(f"  ⚠️ Error: {e}")
    
    return None


def get_or_download_photo(photo_ref: str, max_width: int = 400) -> str:
    """
    Obtiene una foto (del cache o descargando si no existe)
    Retorna el nombre del archivo
    """
    filename = get_photo_filename(photo_ref)
    filepath = os.path.join(DOWNLOADS_DIR, filename)
    
    if not os.path.exists(filepath):
        download_photo(photo_ref, max_width)
    
    return filename


# ========== Rutas ==========

@app.route('/')
def index():
    """Página principal"""
    return jsonify({
        'service': 'Image Proxy - google-limache',
        'port': 14771,
        'endpoints': {
            '/': 'Este endpoint',
            '/photo/<photo_ref>': 'Obtiene/redirige a foto',
            '/serve/<filename>': 'Sirve foto directa',
            '/download?ref=<photo_ref>': 'Descarga foto de Google',
        }
    })


@app.route('/photo/<photo_ref>')
def serve_photo(photo_ref):
    """
    Obtiene una foto por su reference de Google
    Si no está en cache, la descarga primero
    """
    try:
        # Intentar obtener del cache
        filename = get_photo_filename(photo_ref)
        filepath = os.path.join(DOWNLOADS_DIR, filename)
        
        if not os.path.exists(filepath):
            # Descargar de Google
            filepath = download_photo(photo_ref)
            if not filepath:
                abort(404)
        
        return send_from_directory(DOWNLOADS_DIR, os.path.basename(filepath))
        
    except Exception as e:
        print(f"Error sirvienso foto: {e}")
        abort(404)


@app.route('/serve/')
def serve_file(filename):
    """Sirve un archivo directamente"""
    try:
        return send_from_directory(DOWNLOADS_DIR, filename)
    except:
        abort(404)


@app.route('/download')
def download():
    """
    Endpoint para descargar una foto por query param
    ?ref=AU_ZVEH...&maxwidth=400
    """
    photo_ref = request.args.get('ref')
    max_width = int(request.args.get('maxwidth', '400'))
    
    if not photo_ref:
        return jsonify({'error': 'Falta parámetro: ref'}), 400
    
    filepath = download_photo(photo_ref, max_width)
    
    if filepath:
        return jsonify({
            'status': 'ok',
            'filename': os.path.basename(filepath),
            'size': os.path.getsize(filepath)
        })
    else:
        return jsonify({'error': 'No se pudo descargar'}), 500


@app.route('/list')
def list_photos():
    """Lista fotos disponibles en cache"""
    files = os.listdir(DOWNLOADS_DIR) if os.path.exists(DOWNLOADS_DIR) else []
    return jsonify({
        'count': len(files),
        'files': files
    })


# ========== Inicio ==========

if __name__ == '__main__':
    port = int(os.getenv('PORT', 14771))
    print(f"🚀 Image Proxy Service iniciado en puerto {port}")
    print(f"📁 Directorio de fotos: {DOWNLOADS_DIR}")
    app.run(host='0.0.0.0', port=port)
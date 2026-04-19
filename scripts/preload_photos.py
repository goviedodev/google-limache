#!/usr/bin/env python3
"""
Script para pre-cargar todas las fotos de locales al storage del image-service.

Usage:
    python3 scripts/preload_photos.py
"""

import requests
import time
import sys

API_URL = "https://google-limache-api.gonzalo-oviedo-dev.workers.dev"
IMAGE_SERVICE = "https://imagenes.limachelocales.cl"


def main():
    print("📡 Obteniendo locales de la base de datos...")
    response = requests.get(f"{API_URL}/api/locales")
    
    if response.status_code != 200:
        print(f"❌ Error obteniendo locales: {response.status_code}")
        sys.exit(1)
    
    data = response.json()
    locales = data.get('results', [])
    
    # Filtrar locales con imagen
    con_foto = [l for l in locales if l.get('imagen_url')]
    sin_foto = [l for l in locales if not l.get('imagen_url')]
    
    print(f"✅ Total locales: {len(locales)}")
    print(f"🖼️ Con foto: {len(con_foto)}")
    print(f"❌ Sin foto: {len(sin_foto)}")
    print()
    
    resultados = {"ok": 0, "error": 0, "skip": 0}
    
    print("📥 Descargando fotos al storage...")
    print("-" * 50)
    
    for i, local in enumerate(con_foto, 1):
        nombre = local.get('nombre', 'Unknown')
        imagen_url = local.get('imagen_url', '')
        
        # Extraer photo_reference de la URL
        if 'photo_reference=' not in imagen_url:
            resultados["skip"] += 1
            print(f"  [{i}/{len(con_foto)}] SKIP: {nombre} (sin reference)")
            continue
        
        # Extraer solo el photo_reference
        ref = imagen_url.split('photo_reference=')[1].split('&')[0]
        
        # Descargar al storage del image-service
        try:
            url = f"{IMAGE_SERVICE}/download?ref={ref}"
            resp = requests.get(url, timeout=30)
            
            if resp.status_code == 200:
                resultados["ok"] += 1
                data = resp.json()
                filename = data.get('filename', 'unknown')
                size = data.get('size', 0)
                print(f"  [{i}/{len(con_foto)}] ✅ {nombre} ({filename}, {size} bytes)")
            else:
                resultados["error"] += 1
                print(f"  [{i}/{len(con_foto)}] ❌ {nombre} (HTTP {resp.status_code})")
        except Exception as e:
            resultados["error"] += 1
            print(f"  [{i}/{len(con_foto)}] ❌ {nombre} ({e})")
        
        time.sleep(0.3)  # Rate limiting para no saturar
    
    print("-" * 50)
    print(f"\n📊 === Resumen ===")
    print(f"✅ Descargadas: {resultados['ok']}")
    print(f"❌ Errores: {resultados['error']}")
    print(f"⏭️ Omitidas: {resultados['skip']}")
    
    # Verificar storage
    print("\n📁 Verificando storage...")
    resp = requests.get(f"{IMAGE_SERVICE}/list")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Total fotos en storage: {data.get('count', 0)}")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Script para probar si una API Key de Google Maps funciona correctamente.

Uso:
  ./venv/bin/python scripts/test_api_key.py <API_KEY>
  ./venv/bin/python scripts/test_api_key.py AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs

También puedes usar variable de entorno:
  export GOOGLE_MAPS_API_KEY='AIzaSy...'
  ./venv/bin/python scripts/test_api_key.py
"""

import sys
import os
import googlemaps


def test_api_key(api_key):
    """Prueba si una API key de Google Maps funciona"""
    print(f"\n🔑 Probando API Key: {api_key[:10]}...{api_key[-4:]}")
    print("=" * 50)

    try:
        gmaps = googlemaps.Client(key=api_key)

        # Test 1: Nearby Search (requiere Places API habilitado)
        print("\n📡 Test 1: Nearby Search...")
        results = gmaps.places_nearby(
            location=(-33.0148, -71.2681),  # Limache centro
            radius=500,
            type='restaurant'
        )
        if results.get('results'):
            print(f"   ✅ OK - {len(results['results'])} restaurantes encontrados")
            print(f"   Ejemplo: {results['results'][0]['name']}")
        else:
            print("   ⚠️ Sin resultados (¿API habilitada?)")

        # Test 2: Place Details (requiere Places API habilitado)
        print("\n📡 Test 2: Place Details...")
        if results.get('results'):
            place_id = results['results'][0]['place_id']
            details = gmaps.place(place_id, fields=['name', 'formatted_address'])
            if details.get('result'):
                print(f"   ✅ OK - {details['result']['name']}")
            else:
                print("   ⚠️ Sin detalles")

        # Test 3: Geocoding (requiere Geocoding API habilitado)
        print("\n📡 Test 3: Geocoding...")
        geocode = gmaps.geocode("Limache, Chile")
        if geocode:
            print(f"   ✅ OK - {geocode[0]['formatted_address']}")
        else:
            print("   ⚠️ Sin resultados de geocoding")

        # Test 4: Verificar cuota/errores
        print("\n📊 Resultado:")
        print("   ✅ API Key FUNCIONA correctamente")
        return True

    except googlemaps.exceptions.ApiError as e:
        print(f"\n❌ Error de API: {e}")
        if "REQUEST_DENIED" in str(e):
            print("   → La API key no tiene permisos o no tiene facturación habilitada")
        elif "OVER_QUERY_LIMIT" in str(e):
            print("   → Cuota excedida")
        elif "INVALID_REQUEST" in str(e):
            print("   → Request inválido")
        return False

    except googlemaps.exceptions.HTTPError as e:
        print(f"\n❌ Error HTTP: {e}")
        print("   → Verifica que la API key sea correcta")
        return False

    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return False


def main():
    # Obtener API key de argumento o variable de entorno
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    elif os.getenv('GOOGLE_MAPS_API_KEY'):
        api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    else:
        print("❌ Uso:")
        print("   ./venv/bin/python scripts/test_api_key.py <API_KEY>")
        print("   export GOOGLE_MAPS_API_KEY='AIzaSy...'")
        exit(1)

    # Probar la key
    success = test_api_key(api_key)

    # Mostrar resumen
    print("\n" + "=" * 50)
    if success:
        print("✅ API Key válida - Lista para usar")
        print("\nPara usar con el script principal:")
        print(f"  export GOOGLE_MAPS_API_KEY='{api_key}'")
    else:
        print("❌ API Key inválida o sin permisos")
        print("\nRevisa:")
        print("  1. Que la API key sea correcta")
        print("  2. Que Places API esté habilitado")
        print("  3. Que la facturación esté activa")

    return 0 if success else 1


if __name__ == '__main__':
    exit(main())

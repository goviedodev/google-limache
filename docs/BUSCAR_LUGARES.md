# Manual: Buscar Lugares con Google Maps

Script helper para ejecutar `obtener_google_places.py` de forma más sencillas.

## Archivo

`scripts/search_places.sh`

## Uso

```bash
cd /home/goviedo/proyectos/limache/google-limache
./scripts/search_places.sh
```

## Configuración

El script tiene estas variables hardcodeadas:

| Variable | Valor | Descripción |
|----------|------|-----------|
| `GOOGLE_MAPS_API_KEY` | `AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs` | API key de Google Maps |
| `DELETE_EXISTING` | `1` | Borrar todos los registros existentes |
| `START_ID` | `1` | Empezar desde ID 001 |

## Qué hace

1. Cambia al directorio del proyecto
2. Ejecuta el script Python con las variables de entorno
3. Busca lugares en **todas las zonas** configuradas (`LIMACHE_CENTRO` + `LIMACHE_VIEJO`)
4. Genera `scripts/insert_locales.sql` con `DELETE FROM locales;`
5. Inserta todos los negocios encontrados

## Modificar comportamiento

### Para AGREGAR nuevos sin borrar

Editar el script y cambiar:
```bash
DELETE_EXISTING=0
START_ID=70  # o el último ID + 1
```

### Para cambiar zonas

Editar `obtener_google_places.py` y modificar el array `ZONAS`:
```python
ZONAS_A_BUSCAR = ['LIMACHE_CENTRO']  # solo una zona
```

## Ver También

- [obtener_google_places.py](obtener_google_places.py) - Script principal
- [ACTUALIZAR_LOCALES.md](ACTUALIZAR_LOCALES.md) - Manual para actualizar D1
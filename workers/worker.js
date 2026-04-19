// Agregar CORS headers a todas las respuestas
function corsResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse('', 204);
    }

    // Endpoint de proxy de fotos: /api/photo/{photo_reference}
    if (pathname.startsWith('/api/photo/')) {
      return handlePhotoRequest(pathname, env);
    }

    // Solo manejar /api/*
    if (!pathname.startsWith('/api/')) {
      return corsResponse(JSON.stringify({ error: 'Not Found' }), 404);
    }

    const query = url.searchParams.get('q') || '';
    const categoria = url.searchParams.get('categoria') || '';

    try {
      if (env.locales) {
        let sql = 'SELECT * FROM locales';
        const params = [];
        const conditions = [];

        if (query) {
          conditions.push('(nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ? OR direccion LIKE ?)');
          const searchTerm = `%${query}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (categoria) {
          conditions.push('categoria = ?');
          params.push(categoria);
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY nombre';

        const stmt = env.locales.prepare(sql);
        const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

        return jsonResponse(results);
      }

      return jsonResponse({ error: 'Base de datos no configurada', keys: Object.keys(env || {}) }, 500);
    } catch (error) {
      return jsonResponse(
        { error: 'Error al buscar locales', details: String(error) },
        500
      );
    }
  }
};

// Handler para el proxy de fotos через image-service
async function handlePhotoRequest(pathname, env) {
  try {
    // Extraer el photo_reference de la URL
    // /api/photo/AU_ZVEH... -> AU_ZVEH...
    const photoReference = pathname.replace('/api/photo/', '').replace('/', '');

    if (!photoReference) {
      return new Response('Photo reference requerida', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // URL del image-service (a través de Cloudflare Tunnel)
    // Si no hay IMAGE_SERVICE_URL, usa el dominio por defecto
    const imageServiceBase = env.IMAGE_SERVICE_URL || 'https://imagenes.limachelocales.cl';
    const imageServiceUrl = `${imageServiceBase}/photo/${photoReference}`;

    // Fetch al image-service (a través del tunnel)
    const response = await fetch(imageServiceUrl, {
      redirect: 'follow'
    });

    if (!response.ok) {
      return new Response(`Error del image-service: ${response.status}`, { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Obtener la imagen
    const imageData = await response.arrayBuffer();

    // Obtener content-type (default a jpeg si no viene)
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Retornar la imagen directamente
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
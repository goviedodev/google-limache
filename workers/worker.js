export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Endpoint de proxy de fotos: /api/photo/{photo_reference}
    if (pathname.startsWith('/api/photo/')) {
      return handlePhotoRequest(pathname, env);
    }

    // Solo manejar /api/*
    if (!pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404 });
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

        return Response.json(results);
      }

      return Response.json({ error: 'Base de datos no configurada', keys: Object.keys(env || {}) }, { status: 500 });
    } catch (error) {
      return Response.json(
        { error: 'Error al buscar locales', details: String(error) },
        { status: 500 }
      );
    }
  }
};

// Handler para el proxy de fotos de Google
async function handlePhotoRequest(pathname, env) {
  try {
    // Extraer el photo_reference de la URL
    // /api/photo/AU_ZVEH... -> AU_ZVEH...
    const photoReference = pathname.replace('/api/photo/', '').replace('/', '');

    if (!photoReference) {
      return new Response('Photo reference requerida', { status: 400 });
    }

    // URL de Google Photos API
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${env.GOOGLE_MAPS_API_KEY}`;

    // Fetch a Google (follow redirect)
    const response = await fetch(googlePhotoUrl, {
      redirect: 'follow'
    });

    if (!response.ok) {
      return new Response(`Error de Google: ${response.status}`, { status: response.status });
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
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
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

    return Response.json({ error: 'Base de datos no configurada' }, { status: 500 });
  } catch (error) {
    return Response.json(
      { error: 'Error al buscar locales', details: String(error) },
      { status: 500 }
    );
  }
}
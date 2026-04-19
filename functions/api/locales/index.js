export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const categoria = url.searchParams.get('categoria') || '';

  console.log('DEBUG: env.locales =', env.locales);
  console.log('DEBUG: env =', JSON.stringify(Object.keys(env || {})));

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

      console.log('DEBUG: sql =', sql);
      console.log('DEBUG: params =', params);

      const stmt = env.locales.prepare(sql);
      const results = params.length > 0 ? stmt.bind(...params).all() : stmt.all();

      console.log('DEBUG: results =', JSON.stringify(results));

      return Response.json(results);
    }

    console.log('DEBUG: env.locales is undefined');
    return Response.json({ error: 'Base de datos no configurada' }, { status: 500 });
  } catch (error) {
    console.log('DEBUG: error =', error);
    return Response.json(
      { error: 'Error al buscar locales', details: String(error) },
      { status: 500 }
    );
  }
}

import { useState, useEffect } from 'react';
import type { Locales } from './types';

function App() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Locales[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Función para buscar locales
  const buscar = async (query?: string) => {
    setCargando(true);
    setBusquedaRealizada(true);
    const termino = query || busqueda;

    try {
      // Intentar obtener datos de la API del Worker
      const API_URL = 'https://google-limache-api.gonzalo-oviedo-dev.workers.dev';
      const response = await fetch(`${API_URL}/api/locales?q=${encodeURIComponent(termino)}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data.results || data);
      } else {
        // Si no hay API, usar datos locales como fallback
        buscarEnDatosLocales(termino);
      }
    } catch {
      // En desarrollo, usar datos locales
      buscarEnDatosLocales(termino);
    } finally {
      setCargando(false);
    }
  };

  // Buscar en datos locales (fallback)
  const buscarEnDatosLocales = (termino: string) => {
    const terminoLower = termino.toLowerCase();
    const filtered = localesData.filter(
      (local) =>
        local.nombre.toLowerCase().includes(terminoLower) ||
        (local.descripcion?.toLowerCase().includes(terminoLower) ?? false) ||
        local.categoria.toLowerCase().includes(terminoLower) ||
        (local.direccion?.toLowerCase().includes(terminoLower) ?? false)
    );
    setResultados(filtered);
  };

  // Manejar formulario de búsqueda
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      buscar(busqueda);
    }
  };

  // Búsqueda inicial con todos los locales
  useEffect(() => {
    buscar('');
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <a href="/" className="logo">
          <div className="logo-icon">L</div>
          <div>
            <div className="logo-text">Limache</div>
            <div className="logo-subtitle">Buscador de Locales</div>
          </div>
        </a>
        <nav className="nav-links">
          <a href="#">Inicio</a>
          <a href="#">Categorías</a>
          <a href="https://limache.cl" target="_blank" rel="noopener">
            Limache.cl
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="search-container">
          <div className="search-logo">
            <span className="limache">Limache</span>
            <span className="punto">.py</span>
          </div>

          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar locales, negocios, servicios en Limache..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="search-buttons">
              <button type="submit" className="search-button primary">
                Buscar en Limache
              </button>
              <button
                type="button"
                className="search-button"
                onClick={() => {
                  setBusqueda('');
                  buscar('');
                }}
              >
                Mostrar todos
              </button>
            </div>
          </form>
        </div>

        {/* Results Info */}
        {busquedaRealizada && !cargando && (
          <div className="results-info">
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado
            {resultados.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Grid */}
        {cargando ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-title">Buscando locales...</div>
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid-container">
            {resultados.map((local) => (
              <TarjetaNegocio key={local.id} local={local} />
            ))}
          </div>
        ) : busquedaRealizada ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No se encontraron locales</div>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          © 2024-2026 Buscador de Locales Limache | Información de{' '}
          <a href="https://limache.cl" target="_blank" rel="noopener">
            limache.cl
          </a>
        </p>
      </footer>
    </div>
  );
}

// Componente de Tarjeta de Negocio
function TarjetaNegocio({ local }: { local: Locales }) {
  return (
    <article className="card">
      {/* Imagen */}
      {local.imagen_url && (
        <img
          src={local.imagen_url}
          alt={local.imagen_alt || local.nombre}
          className="card-image"
        />
      )}

      {/* Contenido */}
      <div className="card-content">
        {/* Categoría */}
        {local.categoria && (
          <span className="category-badge">{local.categoria}</span>
        )}

        {/* Título */}
        <h3 className="card-title">{local.nombre}</h3>

        {/* Tabs */}
        <div className="card-tabs">
          <button className="card-tab active">Descripción</button>
        </div>

        {/* Descripción */}
        <p className="card-description">{local.descripcion}</p>

        {/* Detalles */}
        <div className="card-details">
          {/* Indicaciones */}
          {local.indicaciones && (
            <div className="card-detail">
              <span className="card-detail-icon">📍</span>
              <div>
                <div className="card-detail-label">Indicaciones</div>
                <div className="card-detail-text">{local.indicaciones}</div>
              </div>
            </div>
          )}

          {/* Plus Code */}
          {local.plus_code && (
            <div className="card-detail">
              <span className="card-detail-icon">⭐</span>
              <div>
                <div className="card-detail-label">Plus Code</div>
                <div className="card-detail-text">{local.plus_code}</div>
              </div>
            </div>
          )}

          {/* Celular */}
          {local.celular && (
            <div className="card-detail">
              <span className="card-detail-icon">📞</span>
              <div>
                <div className="card-detail-label">Celular</div>
                <div className="card-detail-text">{local.celular}</div>
              </div>
            </div>
          )}

          {/* Correo */}
          {local.correo && (
            <div className="card-detail">
              <span className="card-detail-icon">📧</span>
              <div>
                <div className="card-detail-label">Correo</div>
                <div className="card-detail-text">{local.correo}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Datos locales de ejemplo
const localesData: Locales[] = [
  {
    id: 'loc-001',
    nombre: 'Club Social Italo Chileno',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Club Social Italo Chileno',
    imagen_alt: 'Club Social Italo Chileno',
    indicaciones: 'Av. Republica 35, 2240462 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXJ+9V',
    celular: '(2) 3365 9886',
    correo: '',
    direccion: 'Av. Republica 35, 2240462 Limache, Valparaiso, Chile',
    rating: 4.5,
    horario: 'Monday: 10:00 AM - 5:00 PM | Tuesday: 10:00 AM - 5:00 PM | Wednesday: 10:00 AM - 5:00 PM | Thursday: 10:00 AM - 9:00 PM | Friday: 10:00 AM - 9:00 PM | Saturday: 10:00 AM - 9:00 PM | Sunday: 10:00 AM - 5:00 PM',
    website: 'http://www.italochilenolimache.cl/'
  },
  {
    id: 'loc-002',
    nombre: 'Wherepaulo sushi',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Wherepaulo sushi',
    imagen_alt: 'Wherepaulo sushi',
    indicaciones: '12 de Febrero 245, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRP+CH',
    celular: '9 8306 5051',
    correo: '',
    direccion: '12 de Febrero 245, 2240000 Limache, Valparaiso, Chile',
    rating: 3.0,
    horario: 'Monday: 12:00 - 11:30 PM | Tuesday: 12:00 - 11:30 PM | Wednesday: 12:00 - 11:30 PM | Thursday: 12:00 - 11:30 PM | Friday: 12:00 - 11:30 PM | Saturday: 12:00 - 11:30 PM | Sunday: 4:00 - 11:30 PM',
    website: ''
  },
  {
    id: 'loc-003',
    nombre: 'Kustom Burguer',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Kustom Burguer',
    imagen_alt: 'Kustom Burguer',
    indicaciones: '12 de Febrero 245, 2240525 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRP+CJ',
    celular: '9 8486 4884',
    correo: '',
    direccion: '12 de Febrero 245, 2240525 Limache, Valparaiso, Chile',
    rating: 4.0,
    horario: 'Monday: Closed | Tuesday: 12:00 - 11:33 PM | Wednesday: 12:00 - 11:33 PM | Thursday: 12:00 - 11:33 PM | Friday: 12:00 - 11:33 PM | Saturday: 12:00 - 11:33 PM | Sunday: 12:00 - 11:33 PM',
    website: ''
  },
  {
    id: 'loc-004',
    nombre: 'Compipav',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Compipav',
    imagen_alt: 'Compipav',
    indicaciones: 'Av. Independencia 25, 2240541 Limache, Quillota, Valparaiso, Chile',
    plus_code: '',
    celular: '(33) 236 7391',
    correo: '',
    direccion: 'Av. Independencia 25, 2240541 Limache, Quillota, Valparaiso, Chile',
    rating: 5.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-005',
    nombre: 'Donde La Martina Limache',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Donde La Martina Limache',
    imagen_alt: 'Donde La Martina Limache',
    indicaciones: 'Av. Independencia 482, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVQ+4J',
    celular: '9 3779 8415',
    correo: '',
    direccion: 'Av. Independencia 482, 2240000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: Closed | Tuesday: 12:00 - 11:00 PM | Wednesday: 12:00 - 11:00 PM | Thursday: 12:00 - 11:00 PM | Friday: 12:00 PM - 12:00 AM | Saturday: 12:00 PM - 12:00 AM | Sunday: 12:00 - 11:00 PM',
    website: ''
  },
  {
    id: 'loc-006',
    nombre: 'Fusiona2 Sushi & Fast Food',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Fusiona2 Sushi & Fast Food',
    imagen_alt: 'Fusiona2 Sushi & Fast Food',
    indicaciones: '2440000 Limache, 2440000 Valparaiso, Limache, Valparaiso, Chile',
    plus_code: '47RCXPQQ+QC',
    celular: '9 8775 2927',
    correo: '',
    direccion: '2440000 Limache, 2440000 Valparaiso, Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: 'https://m.facebook.com/Fusionadoslimache/'
  },
  {
    id: 'loc-007',
    nombre: 'Lapicadelatoya',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Lapicadelatoya',
    imagen_alt: 'Lapicadelatoya',
    indicaciones: 'Los chaparros, poste 38, 2241007 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVR+32',
    celular: '9 9062 3531',
    correo: '',
    direccion: 'Los chaparros, poste 38, 2241007 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-008',
    nombre: 'J&J Comida Rapida',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'J&J Comida Rapida',
    imagen_alt: 'J&J Comida Rapida',
    indicaciones: 'Santiago Bueras 859, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQP+59',
    celular: '',
    correo: '',
    direccion: 'Santiago Bueras 859, 2240000 Limache, Valparaiso, Chile',
    rating: 4.6,
    horario: 'Monday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Tuesday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Wednesday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Thursday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Friday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Saturday: 12:00 - 2:00 PM, 4:00 - 10:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-009',
    nombre: 'foodmania',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'foodmania',
    imagen_alt: 'foodmania',
    indicaciones: 'Av. Republica 681, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWQ+99',
    celular: '9 5331 3008',
    correo: '',
    direccion: 'Av. Republica 681, 2240000 Limache, Valparaiso, Chile',
    rating: 4.9,
    horario: 'Monday: Open 24 hours | Tuesday: Open 24 hours | Wednesday: 9:00 AM - 5:00 PM | Thursday: Open 24 hours | Friday: Open 24 hours | Saturday: Open 24 hours | Sunday: Open 24 hours',
    website: ''
  },
  {
    id: 'loc-010',
    nombre: 'Diaz Soto Luz Del Carmen',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Diaz Soto Luz Del Carmen',
    imagen_alt: 'Diaz Soto Luz Del Carmen',
    indicaciones: 'Del Cobre 1074, 2240682 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQR+X7',
    celular: '',
    correo: '',
    direccion: 'Del Cobre 1074, 2240682 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-011',
    nombre: 'Pizzati',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Pizzati',
    imagen_alt: 'Pizzati',
    indicaciones: 'Av. Republica 787, 2240438 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWQ+6R',
    celular: '9 7764 0338',
    correo: '',
    direccion: 'Av. Republica 787, 2240438 Limache, Valparaiso, Chile',
    rating: 4.9,
    horario: 'Monday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Tuesday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Wednesday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Thursday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Friday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Saturday: 1:00 - 3:00 PM, 6:00 - 10:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-012',
    nombre: 'Marzan Bernal Manuel Antonio',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Marzan Bernal Manuel Antonio',
    imagen_alt: 'Marzan Bernal Manuel Antonio',
    indicaciones: 'Av. Palmira Romano Sur 1200, 2240719 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVJ+46',
    celular: '',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 1200, 2240719 Limache, Valparaiso, Chile',
    rating: 3.8,
    horario: '',
    website: ''
  },
  {
    id: 'loc-013',
    nombre: 'Los Paisas',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Los Paisas',
    imagen_alt: 'Los Paisas',
    indicaciones: 'Echaurren 1165, local 4, Limache, Valparaiso, Chile',
    plus_code: '47RCXPQJ+RF',
    celular: '9 5671 7697',
    correo: '',
    direccion: 'Echaurren 1165, local 4, Limache, Valparaiso, Chile',
    rating: 4.2,
    horario: 'Monday: 5:00 PM - 1:50 AM | Tuesday: 5:00 PM - 1:50 AM | Wednesday: 5:00 PM - 1:50 AM | Thursday: 5:00 PM - 1:50 AM | Friday: 5:00 PM - 2:50 AM | Saturday: 5:00 PM - 2:50 AM | Sunday: Closed',
    website: 'https://www.facebook.com/lospaisas.sandwicheria/'
  },
  {
    id: 'loc-014',
    nombre: 'Hao Yi',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Hao Yi',
    imagen_alt: 'Hao Yi',
    indicaciones: '22240000, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRR+PR',
    celular: '9 5396 0287',
    correo: '',
    direccion: '22240000, 2240000 Limache, Valparaiso, Chile',
    rating: 4.6,
    horario: 'Monday: 12:00 - 10:00 PM | Tuesday: 12:00 - 10:00 PM | Wednesday: 12:00 - 10:00 PM | Thursday: 12:00 - 10:00 PM | Friday: 12:00 - 10:00 PM | Saturday: 12:00 - 10:00 PM | Sunday: 12:00 - 10:00 PM',
    website: 'https://www.facebook.com/profile.php?id=100073276882055&mibextid=ZbWKwL'
  },
  {
    id: 'loc-015',
    nombre: 'Casino de bomberos',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Casino de bomberos',
    imagen_alt: 'Casino de bomberos',
    indicaciones: 'Av. Republica 495, 2240394 Marga Marga, Limache, Valparaiso, Chile',
    plus_code: '47RCXPWP+X6',
    celular: '',
    correo: '',
    direccion: 'Av. Republica 495, 2240394 Marga Marga, Limache, Valparaiso, Chile',
    rating: 4.8,
    horario: '',
    website: ''
  },
  {
    id: 'loc-016',
    nombre: 'Tomaticon',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Tomaticon',
    imagen_alt: 'Tomaticon',
    indicaciones: 'Andres Bello, Limache, Valparaiso, Chile',
    plus_code: '47RCXPQR+XV',
    celular: '',
    correo: '',
    direccion: 'Andres Bello, Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-017',
    nombre: 'Amalu sushi',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Amalu sushi',
    imagen_alt: 'Amalu sushi',
    indicaciones: 'Av. Republica 257, Local 10, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXM+2P',
    celular: '9 7351 7505',
    correo: '',
    direccion: 'Av. Republica 257, Local 10, 2240000 Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 12:30 - 4:00 PM, 6:00 - 9:00 PM | Tuesday: Closed | Wednesday: 12:30 - 4:00 PM, 6:00 - 9:00 PM | Thursday: 12:30 - 4:00 PM, 6:00 - 9:00 PM | Friday: 12:30 - 4:00 PM, 6:00 - 9:00 PM | Saturday: 12:30 - 4:00 PM, 6:00 - 9:00 PM | Sunday: Closed',
    website: 'https://www.instagram.com/amalu_sushi/'
  },
  {
    id: 'loc-018',
    nombre: 'Bienmesabe',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Bienmesabe',
    imagen_alt: 'Bienmesabe',
    indicaciones: 'Andres Bello 374, 2240712 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQR+HM',
    celular: '',
    correo: '',
    direccion: 'Andres Bello 374, 2240712 Limache, Valparaiso, Chile',
    rating: 3.5,
    horario: '',
    website: ''
  },
  {
    id: 'loc-019',
    nombre: 'Sabroson',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Sabroson',
    imagen_alt: 'Sabroson',
    indicaciones: 'Av. Republica 211-265, 2240487 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXM+4C',
    celular: '(33) 225 5420',
    correo: '',
    direccion: 'Av. Republica 211-265, 2240487 Limache, Valparaiso, Chile',
    rating: 3.8,
    horario: 'Monday: 10:30 AM - 10:30 PM | Tuesday: 10:30 AM - 10:30 PM | Wednesday: 10:30 AM - 10:30 PM | Thursday: 10:30 AM - 10:30 PM | Friday: 10:30 AM - 10:30 PM | Saturday: 10:30 AM - 10:30 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-020',
    nombre: 'Camion de comida unimarc',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'Camion de comida unimarc',
    imagen_alt: 'Camion de comida unimarc',
    indicaciones: 'Echaurren, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXP+73',
    celular: '',
    correo: '',
    direccion: 'Echaurren, 2240491 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 9:40 AM - 8:00 PM | Tuesday: 9:40 AM - 8:00 PM | Wednesday: 9:40 AM - 8:00 PM | Thursday: 9:40 AM - 8:00 PM | Friday: 9:40 AM - 8:00 PM | Saturday: 9:40 AM - 8:00 PM | Sunday: 9:40 AM - 8:00 PM',
    website: ''
  },
  {
    id: 'loc-021',
    nombre: 'CAFETERIA DEL EMPORIO SABORES Y SENSACIONES',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'CAFETERIA DEL EMPORIO SABORES Y SENSACIONES',
    imagen_alt: 'CAFETERIA DEL EMPORIO SABORES Y SENSACIONES',
    indicaciones: 'Av. Republica 882, local 1, 2224000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWQ+5V',
    celular: '9 5212 5472',
    correo: '',
    direccion: 'Av. Republica 882, local 1, 2224000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 9:00 AM - 6:00 PM | Tuesday: 9:00 AM - 6:00 PM | Wednesday: 9:00 AM - 6:00 PM | Thursday: 9:00 AM - 6:00 PM | Friday: 9:00 AM - 6:00 PM | Saturday: 9:00 AM - 3:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-022',
    nombre: 'Entre Pollos Limache',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Entre Pollos Limache',
    imagen_alt: 'Entre Pollos Limache',
    indicaciones: 'Echaurren, Limache, Valparaiso, Chile',
    plus_code: '47RCXPWM+VM',
    celular: '',
    correo: '',
    direccion: 'Echaurren, Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-023',
    nombre: 'Fundacion Cultural Lumbre',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Fundacion Cultural Lumbre',
    imagen_alt: 'Fundacion Cultural Lumbre',
    indicaciones: 'Av. Republica 996, 2240438 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVR+XM',
    celular: '9 6347 3517',
    correo: '',
    direccion: 'Av. Republica 996, 2240438 Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 9:00 AM - 6:00 PM | Tuesday: 9:00 AM - 6:00 PM | Wednesday: 9:00 AM - 6:00 PM | Thursday: 9:00 AM - 6:00 PM | Friday: 9:00 AM - 6:00 PM | Saturday: Closed | Sunday: Closed',
    website: 'http://www.lumbre.cl/'
  },
  {
    id: 'loc-024',
    nombre: 'Flavors & Delights spa',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Flavors & Delights spa',
    imagen_alt: 'Flavors & Delights spa',
    indicaciones: 'Av. Palmira Romano Sur 248, local 6, 2224000 Limache, viejo, Valparaiso, Chile',
    plus_code: '47RCXPWH+5V',
    celular: '9 4451 1907',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 248, local 6, 2224000 Limache, viejo, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 9:30 AM - 8:30 PM | Tuesday: 9:30 AM - 8:30 PM | Wednesday: 9:30 AM - 8:30 PM | Thursday: 9:30 AM - 8:30 PM | Friday: 9:30 AM - 8:30 PM | Saturday: 10:00 AM - 8:30 PM | Sunday: Closed',
    website: 'https://www.instagram.com/postres.jenny?igsh=MWxjN2cwNzI0dHVxcw=='
  },
  {
    id: 'loc-025',
    nombre: 'Delicias de Jenny  sin gluten  sin lactosa y sin azucar ',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Delicias de Jenny  sin gluten  sin lactosa y sin azucar ',
    imagen_alt: 'Delicias de Jenny  sin gluten  sin lactosa y sin azucar ',
    indicaciones: 'Av. Palmira Romano Sur 248, local 6, 2240425 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWH+5V',
    celular: '9 4451 1907',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 248, local 6, 2240425 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 9:00 AM - 9:00 PM | Tuesday: 9:00 AM - 9:00 PM | Wednesday: 9:00 AM - 9:00 PM | Thursday: 9:00 AM - 9:00 PM | Friday: 9:00 AM - 9:00 PM | Saturday: 10:00 AM - 9:00 PM | Sunday: Closed',
    website: 'https://www.instagram.com/postres.jenny'
  },
  {
    id: 'loc-026',
    nombre: 'Cafe Cabo de Hornos',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Cafe Cabo de Hornos',
    imagen_alt: 'Cafe Cabo de Hornos',
    indicaciones: 'Av. Palmira Romano Sur 405, Local 30, Limache, Valparaiso, Chile',
    plus_code: '47RCXPWJ+VJ',
    celular: '',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 405, Local 30, Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-027',
    nombre: 'Emporio Las Araucarias',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Emporio Las Araucarias',
    imagen_alt: 'Emporio Las Araucarias',
    indicaciones: 'Av. Palmira Romano Sur 405, Limache, Valparaiso, Chile',
    plus_code: '47RCXPWJ+VJ',
    celular: '9 8881 1432',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 405, Limache, Valparaiso, Chile',
    rating: 4.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-028',
    nombre: 'Pronto Express Palmira Romano Sur',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Pronto Express Palmira Romano Sur',
    imagen_alt: 'Pronto Express Palmira Romano Sur',
    indicaciones: 'Av. Palmira Romano Sur 500, 2240504 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQH+6W',
    celular: '800 200 354',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 500, 2240504 Limache, Valparaiso, Chile',
    rating: 4.0,
    horario: 'Monday: Open 24 hours | Tuesday: Open 24 hours | Wednesday: Open 24 hours | Thursday: Open 24 hours | Friday: Open 24 hours | Saturday: Open 24 hours | Sunday: Open 24 hours',
    website: 'https://www.punto-copec.cl/'
  },
  {
    id: 'loc-029',
    nombre: 'Barna Cafe',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Barna Cafe',
    imagen_alt: 'Barna Cafe',
    indicaciones: 'Av. Palmira Romano Sur 405, 2240462 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXJ+7V',
    celular: '',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 405, 2240462 Limache, Valparaiso, Chile',
    rating: 3.3,
    horario: '',
    website: ''
  },
  {
    id: 'loc-030',
    nombre: 'Turtle Coffee',
    descripcion: '',
    categoria: 'Cafe',
    imagen_url: '',
    imagen_titulo: 'Turtle Coffee',
    imagen_alt: 'Turtle Coffee',
    indicaciones: 'Roma 140, 2224000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWV+86',
    celular: '9 9436 6390',
    correo: '',
    direccion: 'Roma 140, 2224000 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-031',
    nombre: 'foodmania',
    descripcion: '',
    categoria: 'Restaurante',
    imagen_url: '',
    imagen_titulo: 'foodmania',
    imagen_alt: 'foodmania',
    indicaciones: 'Av. Republica 681, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWQ+99',
    celular: '9 5331 3008',
    correo: '',
    direccion: 'Av. Republica 681, 2240000 Limache, Valparaiso, Chile',
    rating: 4.9,
    horario: 'Monday: Open 24 hours | Tuesday: Open 24 hours | Wednesday: 9:00 AM - 5:00 PM | Thursday: Open 24 hours | Friday: Open 24 hours | Saturday: Open 24 hours | Sunday: Open 24 hours',
    website: ''
  },
  {
    id: 'loc-032',
    nombre: 'Super Bodega aCuenta',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Super Bodega aCuenta',
    imagen_alt: 'Super Bodega aCuenta',
    indicaciones: 'Av. Republica N 219, 2240493 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWM+WG',
    celular: '600 400 9000',
    correo: '',
    direccion: 'Av. Republica N 219, 2240493 Limache, Valparaiso, Chile',
    rating: 4.1,
    horario: 'Monday: 8:00 AM - 9:30 PM | Tuesday: 8:00 AM - 9:30 PM | Wednesday: 8:00 AM - 9:30 PM | Thursday: 8:00 AM - 9:30 PM | Friday: 8:00 AM - 9:30 PM | Saturday: 8:00 AM - 9:30 PM | Sunday: 8:00 AM - 9:00 PM',
    website: 'https://www.acuenta.cl/'
  },
  {
    id: 'loc-033',
    nombre: 'Lofmarket',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Lofmarket',
    imagen_alt: 'Lofmarket',
    indicaciones: 'Del Petroleo 206, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRR+H4',
    celular: '9 4095 4152',
    correo: '',
    direccion: 'Del Petroleo 206, 2240000 Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 8:00 AM - 8:30 PM | Tuesday: 8:00 AM - 8:30 PM | Wednesday: 8:00 AM - 8:30 PM | Thursday: 8:00 AM - 8:30 PM | Friday: 8:00 AM - 8:30 PM | Saturday: 9:00 AM - 8:30 PM | Sunday: 9:00 AM - 8:00 PM',
    website: ''
  },
  {
    id: 'loc-034',
    nombre: 'Distribuidora Los Primos',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Distribuidora Los Primos',
    imagen_alt: 'Distribuidora Los Primos',
    indicaciones: 'Av. Republica 613, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWQ+F3',
    celular: '9 9821 1743',
    correo: '',
    direccion: 'Av. Republica 613, 2240000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Tuesday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Wednesday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Thursday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Friday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Saturday: 10:00 AM - 2:00 PM, 4:00 - 7:00 PM | Sunday: Closed',
    website: 'http://pedidos.distribuidoralosprimos.cl/'
  },
  {
    id: 'loc-035',
    nombre: 'Botilleria Joga Bonito',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Botilleria Joga Bonito',
    imagen_alt: 'Botilleria Joga Bonito',
    indicaciones: 'Andres Bello 416, 2240733 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQR+8H',
    celular: '9 3447 7540',
    correo: '',
    direccion: 'Andres Bello 416, 2240733 Limache, Valparaiso, Chile',
    rating: 4.3,
    horario: 'Monday: 10:00 AM - 1:00 AM | Tuesday: 10:00 AM - 1:00 AM | Wednesday: 10:00 AM - 1:00 AM | Thursday: 10:00 AM - 1:00 AM | Friday: 10:00 AM - 3:00 AM | Saturday: 10:00 AM - 3:00 AM | Sunday: 10:00 AM - 12:00 PM',
    website: ''
  },
  {
    id: 'loc-036',
    nombre: 'Unimarc',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Unimarc',
    imagen_alt: 'Unimarc',
    indicaciones: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXP+77',
    celular: '600 600 0025',
    correo: '',
    direccion: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    rating: 4.3,
    horario: 'Monday: 8:30 AM - 9:30 PM | Tuesday: 8:30 AM - 9:30 PM | Wednesday: 8:30 AM - 9:30 PM | Thursday: 8:30 AM - 9:30 PM | Friday: 8:30 AM - 9:30 PM | Saturday: 8:30 AM - 9:30 PM | Sunday: 9:00 AM - 9:00 PM',
    website: 'https://www.unimarc.cl/'
  },
  {
    id: 'loc-037',
    nombre: 'Supermercado Italia',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Supermercado Italia',
    imagen_alt: 'Supermercado Italia',
    indicaciones: 'Av. Republica 1225, Limache, Valparaiso, Chile',
    plus_code: '47RCXPVV+FH',
    celular: '(33) 241 2798',
    correo: '',
    direccion: 'Av. Republica 1225, Limache, Valparaiso, Chile',
    rating: 4.5,
    horario: 'Monday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Tuesday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Wednesday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Thursday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Friday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Saturday: 9:00 AM - 2:00 PM, 4:00 - 8:30 PM | Sunday: 9:00 AM - 2:00 PM',
    website: ''
  },
  {
    id: 'loc-038',
    nombre: 'Provimarket',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Provimarket',
    imagen_alt: 'Provimarket',
    indicaciones: 'Av. Republica 1204, 2240576 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVV+9M',
    celular: '9 5857 3024',
    correo: '',
    direccion: 'Av. Republica 1204, 2240576 Limache, Valparaiso, Chile',
    rating: 4.3,
    horario: 'Monday: 8:30 AM - 8:30 PM | Tuesday: 8:30 AM - 8:30 PM | Wednesday: 8:30 AM - 8:30 PM | Thursday: 8:30 AM - 8:30 PM | Friday: 8:30 AM - 8:30 PM | Saturday: 8:30 AM - 8:30 PM | Sunday: 9:00 AM - 6:30 PM',
    website: ''
  },
  {
    id: 'loc-039',
    nombre: 'Farmacia Familiar Limache',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Farmacia Familiar Limache',
    imagen_alt: 'Farmacia Familiar Limache',
    indicaciones: 'Av. Republica 221, LOCAL 2, 2240493 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWM+VH',
    celular: '(33) 241 7707',
    correo: '',
    direccion: 'Av. Republica 221, LOCAL 2, 2240493 Limache, Valparaiso, Chile',
    rating: 3.9,
    horario: 'Monday: 9:00 AM - 9:00 PM | Tuesday: 9:00 AM - 9:00 PM | Wednesday: 9:00 AM - 9:00 PM | Thursday: 9:00 AM - 9:00 PM | Friday: 9:00 AM - 9:00 PM | Saturday: 9:00 AM - 9:00 PM | Sunday: 9:00 AM - 9:00 PM',
    website: 'https://www.facebook.com/farmaciasfamiliar/'
  },
  {
    id: 'loc-040',
    nombre: 'Farmacias Cruz Verde',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Farmacias Cruz Verde',
    imagen_alt: 'Farmacias Cruz Verde',
    indicaciones: 'Esquina, Republica - Echaurren 275, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWM+XR',
    celular: '(33) 241 8343',
    correo: '',
    direccion: 'Esquina, Republica - Echaurren 275, 2240491 Limache, Valparaiso, Chile',
    rating: 3.8,
    horario: 'Monday: 9:00 AM - 7:30 PM | Tuesday: 9:00 AM - 7:30 PM | Wednesday: 9:00 AM - 7:30 PM | Thursday: 9:00 AM - 7:30 PM | Friday: 9:00 AM - 7:30 PM | Saturday: 9:30 AM - 7:00 PM | Sunday: Closed',
    website: 'https://www.cruzverde.cl/?utm_source=gbp&utm_medium=organic&utm_campaign=ficha_google&utm_content=334'
  },
  {
    id: 'loc-041',
    nombre: 'Eco Farmacias Limache Republica',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Eco Farmacias Limache Republica',
    imagen_alt: 'Eco Farmacias Limache Republica',
    indicaciones: 'Av. Republica 257, Loc.1, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXM+2P',
    celular: '(55) 295 8619',
    correo: '',
    direccion: 'Av. Republica 257, Loc.1, 2240000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 9:00 AM - 7:30 PM | Tuesday: 9:00 AM - 7:30 PM | Wednesday: 9:00 AM - 7:30 PM | Thursday: 9:00 AM - 7:30 PM | Friday: 9:00 AM - 7:30 PM | Saturday: 10:00 AM - 2:00 PM | Sunday: Closed',
    website: 'http://www.ecofarmacias.cl/'
  },
  {
    id: 'loc-042',
    nombre: 'Tribu Mascotas',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Tribu Mascotas',
    imagen_alt: 'Tribu Mascotas',
    indicaciones: 'Andres Bello 406, 2240733 Limache, Marga Marga, Valparaiso, Chile',
    plus_code: '47RCXPQR+9J',
    celular: '',
    correo: '',
    direccion: 'Andres Bello 406, 2240733 Limache, Marga Marga, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: 'https://www.instagram.com/tribu_mascotas_limache'
  },
  {
    id: 'loc-043',
    nombre: 'Farmacias Ahumada',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Farmacias Ahumada',
    imagen_alt: 'Farmacias Ahumada',
    indicaciones: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXP+65',
    celular: '600 222 4000',
    correo: '',
    direccion: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    rating: 4.8,
    horario: 'Monday: 9:00 AM - 8:00 PM | Tuesday: 9:00 AM - 8:00 PM | Wednesday: 9:00 AM - 8:00 PM | Thursday: 9:00 AM - 8:00 PM | Friday: 9:00 AM - 8:00 PM | Saturday: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 8:17 PM',
    website: 'https://www.farmaciasahumada.cl/'
  },
  {
    id: 'loc-044',
    nombre: 'Farmacias del Dr. Simi',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Farmacias del Dr. Simi',
    imagen_alt: 'Farmacias del Dr. Simi',
    indicaciones: 'Av. Palmira Romano Sur 248, Local 3 y 4, 2224000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWH+5V',
    celular: '(2) 2871 7007',
    correo: '',
    direccion: 'Av. Palmira Romano Sur 248, Local 3 y 4, 2224000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 8:00 AM - 8:00 PM | Tuesday: 8:00 AM - 8:00 PM | Wednesday: 8:00 AM - 8:00 PM | Thursday: 8:00 AM - 8:00 PM | Friday: 8:00 AM - 8:00 PM | Saturday: 8:00 AM - 8:00 PM | Sunday: 9:00 AM - 5:00 PM',
    website: 'https://www.drsimi.cl/'
  },
  {
    id: 'loc-045',
    nombre: 'Farmacia Comunitaria Limache',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Farmacia Comunitaria Limache',
    imagen_alt: 'Farmacia Comunitaria Limache',
    indicaciones: 'A Molina 1, local A, 2240409 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXM+6F',
    celular: '9 8627 8173',
    correo: '',
    direccion: 'A Molina 1, local A, 2240409 Limache, Valparaiso, Chile',
    rating: 3.5,
    horario: 'Monday: 8:30 AM - 2:00 PM, 3:00 - 5:00 PM | Tuesday: 8:30 AM - 2:00 PM, 3:00 - 5:00 PM | Wednesday: 8:30 AM - 2:00 PM, 3:00 - 5:00 PM | Thursday: 8:30 AM - 2:00 PM, 3:00 - 5:00 PM | Friday: 8:30 AM - 2:30 PM | Saturday: Closed | Sunday: Closed',
    website: 'http://www.limache.cl/'
  },
  {
    id: 'loc-046',
    nombre: 'Cruz Verde pharmacy',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Cruz Verde pharmacy',
    imagen_alt: 'Cruz Verde pharmacy',
    indicaciones: 'Palmira Romano Ote. 405, Limache, Valparaiso, Chile',
    plus_code: '47RCXPXJ+4Q',
    celular: '800 802 800',
    correo: '',
    direccion: 'Palmira Romano Ote. 405, Limache, Valparaiso, Chile',
    rating: 3.8,
    horario: 'Monday: 8:30 AM - 7:30 PM | Tuesday: 8:30 AM - 7:30 PM | Wednesday: 8:30 AM - 7:30 PM | Thursday: 8:30 AM - 7:30 PM | Friday: 8:30 AM - 7:30 PM | Saturday: 9:00 AM - 7:30 PM | Sunday: 10:00 AM - 7:30 PM',
    website: 'https://www.cruzverde.cl/?utm_source=gbp&utm_medium=organic&utm_campaign=ficha_google&utm_content=771'
  },
  {
    id: 'loc-047',
    nombre: 'Puppy\'\'s Nutrition & Puppy\'\'s Nutrivet',
    descripcion: '',
    categoria: 'Salud',
    imagen_url: '',
    imagen_titulo: 'Puppy\'\'s Nutrition & Puppy\'\'s Nutrivet',
    imagen_alt: 'Puppy\'\'s Nutrition & Puppy\'\'s Nutrivet',
    indicaciones: 'Palmira Romano Sur - Paseo Las Araucarias 405, Locales 25, 27 y 28, Limache, Valparaiso, Chile',
    plus_code: '47RCXPXJ+5Q',
    celular: '9 7935 2793',
    correo: '',
    direccion: 'Palmira Romano Sur - Paseo Las Araucarias 405, Locales 25, 27 y 28, Limache, Valparaiso, Chile',
    rating: 4.2,
    horario: 'Monday: 10:30 AM - 7:30 PM | Tuesday: 10:30 AM - 7:30 PM | Wednesday: 10:30 AM - 7:30 PM | Thursday: 10:30 AM - 7:30 PM | Friday: 10:30 AM - 7:30 PM | Saturday: 10:30 AM - 7:30 PM | Sunday: 10:30 AM - 6:00 PM',
    website: 'http://www.puppysnutrition.cl/'
  },
  {
    id: 'loc-048',
    nombre: 'ATM Banco Itau',
    descripcion: '',
    categoria: 'Servicio',
    imagen_url: '',
    imagen_titulo: 'ATM Banco Itau',
    imagen_alt: 'ATM Banco Itau',
    indicaciones: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPXP+64',
    celular: '600 686 0888',
    correo: '',
    direccion: 'Av. Republica 342, 2240491 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: '',
    website: ''
  },
  {
    id: 'loc-049',
    nombre: 'Caja vecina',
    descripcion: '',
    categoria: 'Servicio',
    imagen_url: '',
    imagen_titulo: 'Caja vecina',
    imagen_alt: 'Caja vecina',
    indicaciones: 'Av. Republica 13-207, Limache, Valparaiso, Chile',
    plus_code: '47RCXPXM+65',
    celular: '',
    correo: '',
    direccion: 'Av. Republica 13-207, Limache, Valparaiso, Chile',
    rating: 1.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-050',
    nombre: 'Semillas ABE SpA',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Semillas ABE SpA',
    imagen_alt: 'Semillas ABE SpA',
    indicaciones: 'Sgto. Aldea 361, 2240537 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVR+GC',
    celular: '(33) 241 8393',
    correo: '',
    direccion: 'Sgto. Aldea 361, 2240537 Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 9:00 AM - 1:45 PM, 2:30 - 6:00 PM | Tuesday: 9:00 AM - 1:45 PM, 2:30 - 6:00 PM | Wednesday: 9:00 AM - 1:45 PM, 2:30 - 6:00 PM | Thursday: 9:00 AM - 1:45 PM, 2:30 - 6:00 PM | Friday: 9:00 AM - 1:45 PM, 2:30 - 5:00 PM | Saturday: Closed | Sunday: Closed',
    website: 'http://www.semillasabe.cl/'
  },
  {
    id: 'loc-051',
    nombre: 'Fiestita Loca',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Fiestita Loca',
    imagen_alt: 'Fiestita Loca',
    indicaciones: 'Av. Republica 345, 2240491 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWP+V4',
    celular: '9 7547 5678',
    correo: '',
    direccion: 'Av. Republica 345, 2240491 Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 10:00 AM - 7:30 PM | Tuesday: 10:00 AM - 7:30 PM | Wednesday: 10:00 AM - 7:30 PM | Thursday: 10:00 AM - 7:30 PM | Friday: 10:00 AM - 7:30 PM | Saturday: 10:00 AM - 7:30 PM | Sunday: Closed',
    website: 'http://www.facebook.com/fiestitaloca'
  },
  {
    id: 'loc-052',
    nombre: 'Super Bodega aCuenta',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Super Bodega aCuenta',
    imagen_alt: 'Super Bodega aCuenta',
    indicaciones: 'Av. Republica N 219, 2240493 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWM+WG',
    celular: '600 400 9000',
    correo: '',
    direccion: 'Av. Republica N 219, 2240493 Limache, Valparaiso, Chile',
    rating: 4.1,
    horario: 'Monday: 8:00 AM - 9:30 PM | Tuesday: 8:00 AM - 9:30 PM | Wednesday: 8:00 AM - 9:30 PM | Thursday: 8:00 AM - 9:30 PM | Friday: 8:00 AM - 9:30 PM | Saturday: 8:00 AM - 9:30 PM | Sunday: 8:00 AM - 9:00 PM',
    website: 'https://www.acuenta.cl/'
  },
  {
    id: 'loc-053',
    nombre: 'Sociedad Colmenares Flora Nativa',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Sociedad Colmenares Flora Nativa',
    imagen_alt: 'Sociedad Colmenares Flora Nativa',
    indicaciones: 'Av. Independencia 37, 2240463 Limache, Valparaiso, Chile',
    plus_code: '47RCXPWJ+JJ',
    celular: '(33) 241 2466',
    correo: '',
    direccion: 'Av. Independencia 37, 2240463 Limache, Valparaiso, Chile',
    rating: 4.8,
    horario: 'Monday: 10:00 AM - 1:30 PM, 3:00 - 6:00 PM | Tuesday: 10:00 AM - 1:30 PM, 3:00 - 6:00 PM | Wednesday: 10:00 AM - 1:30 PM, 3:00 - 6:00 PM | Thursday: 10:00 AM - 1:30 PM, 3:00 - 6:00 PM | Friday: 10:00 AM - 1:30 PM, 3:00 - 6:00 PM | Saturday: 10:00 AM - 2:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-054',
    nombre: 'COPEC',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'COPEC',
    imagen_alt: 'COPEC',
    indicaciones: 'Av. Palmira Romano Sur N 500, 2240504 Limache, Valparaiso, Chile',
    plus_code: '47RCXPQH+5W',
    celular: '800 200 354',
    correo: '',
    direccion: 'Av. Palmira Romano Sur N 500, 2240504 Limache, Valparaiso, Chile',
    rating: 4.2,
    horario: 'Monday: Open 24 hours | Tuesday: Open 24 hours | Wednesday: Open 24 hours | Thursday: Open 24 hours | Friday: Open 24 hours | Saturday: Open 24 hours | Sunday: Open 24 hours',
    website: 'https://ww2.copec.cl/'
  },
  {
    id: 'loc-055',
    nombre: 'Carniceria el Nono',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Carniceria el Nono',
    imagen_alt: 'Carniceria el Nono',
    indicaciones: '12 de Febrero 239, 2240525 Marga Marga, Limache, Valparaiso, Chile',
    plus_code: '47RCXPRP+JV',
    celular: '9 6808 1267',
    correo: '',
    direccion: '12 de Febrero 239, 2240525 Marga Marga, Limache, Valparaiso, Chile',
    rating: 4.8,
    horario: 'Monday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Tuesday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Wednesday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Thursday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Friday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Saturday: 9:00 AM - 2:30 PM, 5:00 - 8:00 PM | Sunday: Closed',
    website: 'http://www.carniceriaelnono.cl/'
  },
  {
    id: 'loc-056',
    nombre: 'JNS Automotriz',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'JNS Automotriz',
    imagen_alt: 'JNS Automotriz',
    indicaciones: 'C. Marcela Paz 154, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVM+5R',
    celular: '9 4717 0708',
    correo: '',
    direccion: 'C. Marcela Paz 154, 2240000 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 10:00 AM - 5:00 AM | Tuesday: 10:00 AM - 5:00 PM | Wednesday: 10:00 AM - 5:00 PM | Thursday: 10:00 AM - 5:00 PM | Friday: 10:00 AM - 5:00 PM | Saturday: 10:00 AM - 2:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-057',
    nombre: 'Origen - Productos Naturales -',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Origen - Productos Naturales -',
    imagen_alt: 'Origen - Productos Naturales -',
    indicaciones: 'C. Marcela Paz 154, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVM+5R',
    celular: '9 8436 7805',
    correo: '',
    direccion: 'C. Marcela Paz 154, 2240000 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 10:00 AM - 6:30 PM | Tuesday: 10:00 AM - 6:30 PM | Wednesday: 10:00 AM - 6:30 PM | Thursday: 10:00 AM - 6:00 PM | Friday: 10:00 AM - 6:30 PM | Saturday: 10:00 AM - 6:30 PM | Sunday: 10:00 AM - 2:00 PM',
    website: ''
  },
  {
    id: 'loc-058',
    nombre: 'La Surenita',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'La Surenita',
    imagen_alt: 'La Surenita',
    indicaciones: 'Av. Independencia 1410, 4, 2240541 Limache, Quillota, Valparaiso, Chile',
    plus_code: '',
    celular: '',
    correo: '',
    direccion: 'Av. Independencia 1410, 4, 2240541 Limache, Quillota, Valparaiso, Chile',
    rating: 5.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-059',
    nombre: 'Limachina',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Limachina',
    imagen_alt: 'Limachina',
    indicaciones: 'Av. Independencia 65, 2240541 Limache, Quillota, Valparaiso, Chile',
    plus_code: '',
    celular: '(33) 241 1317',
    correo: '',
    direccion: 'Av. Independencia 65, 2240541 Limache, Quillota, Valparaiso, Chile',
    rating: 3.0,
    horario: 'Monday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Tuesday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Wednesday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Thursday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Friday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Saturday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM | Sunday: 7:30 AM - 1:30 PM, 4:00 - 7:30 PM',
    website: ''
  },
  {
    id: 'loc-060',
    nombre: 'El Canelo',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'El Canelo',
    imagen_alt: 'El Canelo',
    indicaciones: 'Av. Independencia 45, 2240541 Limache, Quillota, Valparaiso, Chile',
    plus_code: '',
    celular: '9 8145 6680',
    correo: '',
    direccion: 'Av. Independencia 45, 2240541 Limache, Quillota, Valparaiso, Chile',
    rating: 4.3,
    horario: 'Monday: 10:00 AM - 5:00 PM | Tuesday: 10:00 AM - 6:00 PM | Wednesday: 10:00 AM - 6:00 PM | Thursday: 10:00 AM - 6:00 PM | Friday: 10:00 AM - 6:00 PM | Saturday: 10:00 AM - 2:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-061',
    nombre: 'Amasanderia Danessa',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Amasanderia Danessa',
    imagen_alt: 'Amasanderia Danessa',
    indicaciones: 'C. El Boldo, Limache, Valparaiso, Chile',
    plus_code: '47RCXPRP+2P',
    celular: '',
    correo: '',
    direccion: 'C. El Boldo, Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: '',
    website: ''
  },
  {
    id: 'loc-062',
    nombre: 'Le Gout de Mourice',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Le Gout de Mourice',
    imagen_alt: 'Le Gout de Mourice',
    indicaciones: 'C. del Limache 711, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRM+9F',
    celular: '9 8360 3764',
    correo: '',
    direccion: 'C. del Limache 711, 2240000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: '',
    website: 'https://www.facebook.com/scarlett.b.olivares'
  },
  {
    id: 'loc-063',
    nombre: 'TOSO',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'TOSO',
    imagen_alt: 'TOSO',
    indicaciones: 'Av. Independencia 66, 2240514 Limache, Valparaiso, Chile',
    plus_code: '47RCXPVP+P7',
    celular: '',
    correo: '',
    direccion: 'Av. Independencia 66, 2240514 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 8:30 AM - 1:00 PM, 3:00 - 6:30 PM | Tuesday: 8:30 AM - 1:00 PM, 3:00 - 6:30 PM | Wednesday: 8:30 AM - 1:00 PM, 3:00 - 6:30 PM | Thursday: 8:30 AM - 1:00 PM, 3:00 - 6:30 PM | Friday: 8:30 AM - 1:00 PM, 3:00 - 6:30 PM | Saturday: 8:30 AM - 1:30 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-064',
    nombre: 'Bazar Rayito de Sol',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Bazar Rayito de Sol',
    imagen_alt: 'Bazar Rayito de Sol',
    indicaciones: 'C. los Capachitos 140, 2241117 Valparaiso, Marga Marga, Valparaiso, Chile',
    plus_code: '47RCXPRM+2J',
    celular: '',
    correo: '',
    direccion: 'C. los Capachitos 140, 2241117 Valparaiso, Marga Marga, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 9:00 AM - 8:00 PM | Tuesday: 9:00 AM - 8:00 PM | Wednesday: 9:00 AM - 8:00 PM | Thursday: 9:00 AM - 8:00 PM | Friday: 9:00 AM - 8:00 PM | Saturday: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 8:00 PM',
    website: ''
  },
  {
    id: 'loc-065',
    nombre: 'Mecanica Automotriz Rodriguez',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Mecanica Automotriz Rodriguez',
    imagen_alt: 'Mecanica Automotriz Rodriguez',
    indicaciones: 'el boldo 938 el boldo esquina los alamos 938 Limache, 2240000 Valparaiso, Limache, Valparaiso, Chile',
    plus_code: '47RCXPQQ+W5',
    celular: '9 6531 5898',
    correo: '',
    direccion: 'el boldo 938 el boldo esquina los alamos 938 Limache, 2240000 Valparaiso, Limache, Valparaiso, Chile',
    rating: 4.7,
    horario: 'Monday: 9:00 AM - 2:00 PM, 4:00 - 7:00 PM | Tuesday: 9:00 AM - 2:00 PM, 4:00 - 7:00 PM | Wednesday: 9:00 AM - 2:00 PM, 4:00 - 7:00 PM | Thursday: 9:00 AM - 2:00 PM, 4:00 - 7:00 PM | Friday: 9:00 AM - 2:00 PM, 4:00 - 7:00 PM | Saturday: Closed | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-066',
    nombre: 'D\'\'lux studio',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'D\'\'lux studio',
    imagen_alt: 'D\'\'lux studio',
    indicaciones: '460, 2240000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRQ+HP',
    celular: '9 5489 6528',
    correo: '',
    direccion: '460, 2240000 Limache, Valparaiso, Chile',
    rating: 5.0,
    horario: 'Monday: 10:00 AM - 7:00 PM | Tuesday: 10:00 AM - 7:00 PM | Wednesday: 10:00 AM - 7:00 PM | Thursday: 10:00 AM - 7:00 PM | Friday: 10:00 AM - 7:00 PM | Saturday: 10:00 AM - 2:00 PM | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-067',
    nombre: 'Panaderia Danessa',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Panaderia Danessa',
    imagen_alt: 'Panaderia Danessa',
    indicaciones: 'El Aromo 900, 998, Limache, Valparaiso, Chile',
    plus_code: '47RCXPQP+PX',
    celular: '(33) 241 2912',
    correo: '',
    direccion: 'El Aromo 900, 998, Limache, Valparaiso, Chile',
    rating: 3.7,
    horario: 'Monday: 7:45 AM - 9:00 PM | Tuesday: 8:45 AM - 9:00 PM | Wednesday: 7:45 AM - 9:00 PM | Thursday: 7:45 AM - 9:00 PM | Friday: 7:45 AM - 9:00 PM | Saturday: 7:45 AM - 9:00 PM | Sunday: 7:45 AM - 2:00 PM',
    website: ''
  },
  {
    id: 'loc-068',
    nombre: 'ZeroSpread PCP',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'ZeroSpread PCP',
    imagen_alt: 'ZeroSpread PCP',
    indicaciones: 'Sgto. Aldea 307, 2224000 Limache, Valparaiso, Chile',
    plus_code: '47RCXPRQ+8R',
    celular: '9 8284 9239',
    correo: '',
    direccion: 'Sgto. Aldea 307, 2224000 Limache, Valparaiso, Chile',
    rating: undefined,
    horario: 'Monday: 10:00 AM - 8:00 PM | Tuesday: 10:00 AM - 8:00 PM | Wednesday: 10:00 AM - 8:00 PM | Thursday: 10:00 AM - 8:00 PM | Friday: 10:00 AM - 8:00 PM | Saturday: Closed | Sunday: Closed',
    website: ''
  },
  {
    id: 'loc-069',
    nombre: 'Villavicencio hnos',
    descripcion: '',
    categoria: 'Tienda',
    imagen_url: '',
    imagen_titulo: 'Villavicencio hnos',
    imagen_alt: 'Villavicencio hnos',
    indicaciones: 'Los 13, - El Aromo, Limache, Olmue, Valparaiso, Chile',
    plus_code: '47RCXPQQ+J4',
    celular: '(33) 244 2481',
    correo: '',
    direccion: 'Los 13, - El Aromo, Limache, Olmue, Valparaiso, Chile',
    rating: 3.3,
    horario: '',
    website: ''
  },
];

export default App;
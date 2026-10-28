import { useState } from 'react';
import { Link } from 'react-router-dom';
import SucursalCard, { crearUrlMapa, tieneCoordenadas } from '../components/SucursalCard.jsx';
import useSucursales from '../hooks/useSucursales.js';
import SectionTitle from '../components/SectionTitle.jsx';

function calcularDistanciaKm(origen, sucursal) {
  const radianes = (grados) => (grados * Math.PI) / 180;
  const diferenciaLatitud = radianes(sucursal.lat - origen.lat);
  const diferenciaLongitud = radianes(sucursal.lng - origen.lng);
  const a = Math.sin(diferenciaLatitud / 2) ** 2
    + Math.cos(radianes(origen.lat))
    * Math.cos(radianes(sucursal.lat))
    * Math.sin(diferenciaLongitud / 2) ** 2;
  const distanciaAcotada = Math.min(1, Math.max(0, a));
  return 6371 * 2 * Math.atan2(Math.sqrt(distanciaAcotada), Math.sqrt(1 - distanciaAcotada));
}

function SalesPointsPage() {
  const { sucursales, loading, error, retry } = useSucursales();
  const [ubicacion, setUbicacion] = useState(null);
  const [ubicacionError, setUbicacionError] = useState('');
  const local = sucursales.find((sucursal) => sucursal.id === 'mall-del-sol');
  const localConCoordenadas = local && tieneCoordenadas(local);

  function calcularDistancia() {
    setUbicacion(null);
    setUbicacionError('');
    if (!navigator.geolocation) {
      setUbicacionError('Este navegador no permite consultar tu ubicación.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUbicacion({ lat: coords.latitude, lng: coords.longitude }),
      () => setUbicacionError('No pudimos consultar tu ubicación. Revisa el permiso del navegador e inténtalo de nuevo.')
    );
  }

  return (
    <section className="container page-content info-page">
      <SectionTitle
        eyebrow="Ubicación en planificación"
        title="Nuestro local: Mall del Sol"
        description="Nuestro único local piloto está planificado en Mall del Sol, Guayaquil."
        level="h1"
      />
      <section className="branch-list-section" aria-labelledby="branch-list-title">
        <h2 id="branch-list-title">El local piloto</h2>
        {loading && <p role="status">Cargando el local...</p>}
        {error && (
          <div className="branch-error" role="alert">
            <p>{error}</p>
            <button className="button button-secondary" type="button" onClick={retry}>Reintentar</button>
          </div>
        )}
        {!loading && !error && !local && (
          <p role="status">No se encontró la ficha del local planificado.</p>
        )}
        {!loading && !error && local && (
          <div className="grid branch-grid">
            <SucursalCard sucursal={local} />
          </div>
        )}
      </section>
      <section className="branch-nearby" aria-labelledby="nearby-title">
        <h2 id="nearby-title">Cerca de mí</h2>
        {!loading && !error && local && !localConCoordenadas && (
          <p>
            Todavía no podemos calcular la distancia porque faltan las coordenadas del local.
            {crearUrlMapa(local) && (
              <>
                {' '}
                <a href={crearUrlMapa(local)} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              </>
            )}
          </p>
        )}
        {!loading && !error && local && localConCoordenadas && (
          <>
            <p>
              Tu ubicación se usa solo en este navegador para calcular una distancia aproximada;
              no se envía ni se guarda.
            </p>
            <button className="button button-secondary" type="button" onClick={calcularDistancia}>
              Calcular distancia desde mi ubicación
            </button>
            {ubicacionError && <p className="branch-error" role="alert">{ubicacionError}</p>}
            {ubicacion && (
              <p className="branch-nearby-results" aria-live="polite">
                Estás a aproximadamente {calcularDistanciaKm(ubicacion, local).toFixed(1)} km del local.
                {' '}
                <a href={crearUrlMapa(local)} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
              </p>
            )}
          </>
        )}
      </section>
      <div className="info-copy">
        <h2>Un local piloto en planificación</h2>
        <p>
          El punto exacto dentro del centro comercial está por definir. El crecimiento dependerá
          de los resultados del piloto y, por ahora, no hay otro local planificado.
        </p>
      </div>
      <div className="info-cta">
        <h2>¿Tienes un gimnasio o un local? Hablemos</h2>
        <p>Nos gustaría conocer tu idea y conversar sobre este local piloto.</p>
        <Link className="button button-primary" to="/contacto?tipo=tienda">
          Hablemos
        </Link>
        <Link className="button button-secondary" to="/contacto?tipo=consulta">
          Avísame cuando abra
        </Link>
      </div>
    </section>
  );
}

export default SalesPointsPage;

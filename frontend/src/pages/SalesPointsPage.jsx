import { Link } from 'react-router-dom';
import SucursalCard from '../components/SucursalCard.jsx';
import useSucursales from '../hooks/useSucursales.js';
import SectionTitle from '../components/SectionTitle.jsx';

function SalesPointsPage() {
  const { sucursales, loading, error, retry } = useSucursales();
  const local = sucursales.find((sucursal) => sucursal.id === 'mall-del-sol');

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

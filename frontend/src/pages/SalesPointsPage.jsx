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
        eyebrow="Mall del Sol"
        title="Nuestro local: Mall del Sol"
        description="Encuentra a SmoothieFit en Mall del Sol, Guayaquil."
        level="h1"
      />
      <section className="branch-list-section" aria-labelledby="branch-list-title">
        <h2 id="branch-list-title">Ubicación</h2>
        {loading && <p role="status">Cargando el local...</p>}
        {error && (
          <div className="branch-error" role="alert">
            <p>{error}</p>
            <button className="button button-secondary" type="button" onClick={retry}>Reintentar</button>
          </div>
        )}
        {!loading && !error && !local && (
          <p role="status">No se encontró la información del local.</p>
        )}
        {!loading && !error && local && (
          <div className="grid branch-grid">
            <SucursalCard sucursal={local} />
          </div>
        )}
      </section>
      <div className="info-cta">
        <h2>¿Tienes un gimnasio o un local? Hablemos</h2>
        <p>Nos gustaría conocer tu idea y conversar contigo.</p>
        <Link className="button button-primary" to="/contacto?tipo=tienda">
          Hablemos
        </Link>
        <Link className="button button-secondary" to="/contacto?tipo=consulta">
          Contáctanos
        </Link>
      </div>
    </section>
  );
}

export default SalesPointsPage;

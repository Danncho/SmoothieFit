import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

function SalesPointsPage() {
  return (
    <section className="container page-content info-page">
      <SectionTitle
        eyebrow="Conversemos"
        title="Puntos de venta"
        description="SmoothieFit quiere conocer comercios interesados en conversar sobre la propuesta."
        level="h1"
      />
      <div className="info-copy">
        <h2>Una idea en desarrollo</h2>
        <p>
          Estamos explorando cómo podría presentarse SmoothieFit en tiendas y otros puntos de
          venta. Por ahora no hay locales ni alianzas confirmadas; compartiremos información
          cuando existan acuerdos reales.
        </p>
      </div>
      <div className="info-cta">
        <h2>¿Tienes un comercio y quieres conversar?</h2>
        <p>Nos gustaría conocer tu idea y revisar posibles formas de colaboración.</p>
        <Link className="button button-primary" to="/contacto?tipo=tienda">
          Contactar sobre puntos de venta
        </Link>
      </div>
    </section>
  );
}

export default SalesPointsPage;

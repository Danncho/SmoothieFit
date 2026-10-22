import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

function CollegesPage() {
  return (
    <section className="container page-content info-page">
      <SectionTitle
        eyebrow="Para compartir"
        title="SmoothieFit para colegios y familias"
        description="El proyecto imagina opciones para actividades, eventos y momentos para compartir."
        level="h1"
      />
      <div className="info-copy">
        <h2>Una propuesta por conversar</h2>
        <p>
          Nos gustaría conversar con colegios y familias sobre posibles actividades y formas de
          compartir la propuesta SmoothieFit. Estas opciones aún están en desarrollo y no
          representan servicios o acuerdos confirmados.
        </p>
      </div>
      <div className="info-cta">
        <h2>¿Quieres conversar sobre una idea?</h2>
        <p>Cuéntanos qué actividad tienes en mente.</p>
        <Link className="button button-primary" to="/contacto?tipo=colegio">
          Contactar sobre colegios
        </Link>
      </div>
    </section>
  );
}

export default CollegesPage;

import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

const values = [
  { title: 'Cercanía', description: 'Escuchar, conversar y tratar a cada persona con amabilidad.' },
  { title: 'Creatividad', description: 'Disfrutar el proceso de probar combinaciones y compartir ideas.' },
  { title: 'Transparencia', description: 'Contar con claridad qué es una propuesta, un ejemplo o una meta por cumplir.' },
  { title: 'Colaboración', description: 'Aprender en equipo y reconocer el aporte de productores y aliados.' }
];

function AboutPage() {
  return (
    <div className="container page-content info-page">
      <section className="info-hero">
        <SectionTitle
          eyebrow="Una idea con ganas de crecer"
          title="Somos SmoothieFit"
          description="Un proyecto académico que imagina una forma sencilla, colorida y cercana de disfrutar smoothies hechos con ingredientes locales."
          level="h1"
        />
      </section>
      <section className="info-section">
        <div className="info-copy">
          <p className="eyebrow">Cómo empezó</p>
          <h2>Una mezcla de ideas y entusiasmo</h2>
          <p>
            SmoothieFit nació como una propuesta para unir sabores de frutas, verduras y semillas
            con una experiencia alegre y fácil de explorar. Nos gustó la idea de que cada persona
            pudiera elegir sus ingredientes y crear una mezcla propia.
          </p>
          <p>
            Este sitio forma parte de un proyecto académico. Estamos construyendo sus páginas y
            funciones paso a paso, aprendiendo cómo organizar una idea y convertirla en una
            experiencia digital.
          </p>
        </div>
        <aside className="info-highlight">
          <span className="highlight-icon" aria-hidden="true">☺</span>
          <p><strong>La idea detrás de cada sorbo</strong></p>
          <p>Que elegir un smoothie se sienta como un momento de color, creatividad y buen sabor.</p>
        </aside>
      </section>
      <section className="info-section info-section-soft">
        <SectionTitle eyebrow="Lo que nos guía" title="Misión y visión" level="h2" />
        <div className="grid purpose-grid">
          <article className="card purpose-card">
            <h3>Nuestra misión</h3>
            <p>Crear una propuesta de smoothies sencilla y divertida, con opciones para conocer ingredientes locales y combinar sabores a gusto de cada persona.</p>
          </article>
          <article className="card purpose-card">
            <h3>Nuestra visión</h3>
            <p>Convertirnos en un proyecto cercano que inspire a compartir nuevas mezclas y a valorar las historias de quienes producen nuestros ingredientes.</p>
          </article>
        </div>
      </section>
      <section className="info-section">
        <SectionTitle eyebrow="Nuestra forma de hacer las cosas" title="Valores" level="h2" />
        <div className="grid values-grid">
          {values.map((value) => (
            <article className="card value-card" key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-cta">
        <h2>Gracias por conocer nuestra idea</h2>
        <p>Seguimos aprendiendo y construyendo SmoothieFit con muchas ganas.</p>
        <Link className="button button-primary" to="/smoothies">Explora los smoothies</Link>
      </section>
    </div>
  );
}

export default AboutPage;

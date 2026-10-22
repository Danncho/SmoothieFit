import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

const producerExamples = [
  {
    icon: '🍓',
    name: 'Finca La Mora',
    location: 'Tungurahua, Ecuador',
    description: 'Perfil de ejemplo de una finca familiar que cultiva moras y frutillas para mercados de la zona.'
  },
  {
    icon: '🥭',
    name: 'Huerto Sol de Manabí',
    location: 'Manabí, Ecuador',
    description: 'Perfil ficticio dedicado a frutas tropicales como mango y maracuyá, según la temporada.'
  },
  {
    icon: '🍌',
    name: 'Asociación Valle Verde',
    location: 'Azuay, Ecuador',
    description: 'Ejemplo ficticio de un grupo productor con banano, hierbas y otros ingredientes.'
  }
];

const selectionCriteria = [
  {
    title: 'Conocer su origen',
    description: 'Conversaremos sobre dónde y cómo se cultivan los ingredientes y quiénes forman parte de ese trabajo.'
  },
  {
    title: 'Revisar calidad y frescura',
    description: 'Buscaremos ingredientes en buen estado, adecuados para preparar las recetas de SmoothieFit.'
  },
  {
    title: 'Construir acuerdos justos',
    description: 'Queremos conversar sobre disponibilidad, precios y formas de colaboración claras para ambas partes.'
  }
];

function ProducersPage() {
  return (
    <div className="container page-content info-page">
      <section className="info-hero">
        <SectionTitle
          eyebrow="Cerca de nuestra tierra"
          title="El sabor también empieza en el campo"
          description="En SmoothieFit queremos que cada mezcla nos acerque a los frutos, las personas y las historias de Ecuador."
          level="h1"
        />
      </section>
      <section className="info-section">
        <div className="info-copy">
          <p className="eyebrow">Nuestra propuesta</p>
          <h2>Crecer junto a productores locales</h2>
          <p>
            SmoothieFit nace como una idea para disfrutar smoothies con ingredientes de aquí.
            Nos gustaría colaborar con productores ecuatorianos y conocer el camino que siguen
            sus frutas, verduras y semillas antes de llegar a nuestras recetas.
          </p>
          <p>
            Queremos construir relaciones cercanas, escuchar a quienes cultivan y aprender de su
            trabajo. Esta es una meta del proyecto; las alianzas y proveedores reales se definirán
            más adelante.
          </p>
        </div>
        <aside className="info-highlight">
          <span className="highlight-icon" aria-hidden="true">✿</span>
          <p><strong>Una idea que empieza local</strong></p>
          <p>Elegir ingredientes de temporada puede ayudarnos a crear mezclas distintas y a conversar con quienes los producen.</p>
        </aside>
      </section>
      <section className="info-section info-section-soft">
        <SectionTitle
          eyebrow="Con cuidado y conversación"
          title="¿Cómo elegiremos a nuestros proveedores?"
          description="Nos gustaría tomar decisiones claras y aprender en conjunto."
          level="h2"
        />
        <div className="grid info-card-grid">
          {selectionCriteria.map((item, index) => (
            <article className="card info-card" key={item.title}>
              <span className="info-card-number" aria-hidden="true">{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-section">
        <SectionTitle
          eyebrow="Perfiles para imaginar"
          title="Productores de ejemplo"
          description="Estos perfiles son ficticios y se usan únicamente para presentar la idea del proyecto."
          level="h2"
        />
        <div className="grid producer-grid">
          {producerExamples.map((producer) => (
            <article className="card producer-card" key={producer.name}>
              <span className="producer-mark" aria-hidden="true">{producer.icon}</span>
              <p className="sample-label">Ejemplo ficticio</p>
              <h3>{producer.name}</h3>
              <p className="producer-location">{producer.location}</p>
              <p>{producer.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-cta">
        <h2>¿Te gustaría ser parte de esta idea?</h2>
        <p>Nos encantará escuchar a productores y personas interesadas en colaborar.</p>
        <Link className="button button-primary" to="/contacto">Conversemos</Link>
      </section>
    </div>
  );
}

export default ProducersPage;

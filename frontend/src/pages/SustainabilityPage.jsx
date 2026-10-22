import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

const packagingIdeas = [
  {
    icon: '♻',
    title: 'Materiales por evaluar',
    description: 'Buscamos opciones de empaque con materiales que puedan reciclarse donde exista un sistema adecuado para recibirlos. Revisaremos la información de cada proveedor antes de elegir.'
  },
  {
    icon: '↘',
    title: 'Menos residuos',
    description: 'Trabajamos para evitar materiales innecesarios y considerar alternativas reutilizables cuando sean prácticas y seguras para el uso previsto.'
  },
  {
    icon: '⌂',
    title: 'Proveedores cercanos',
    description: 'Nos gustaría conocer proveedores locales de empaques y comparar sus materiales, disponibilidad y formas de entrega antes de tomar una decisión.'
  }
];

function SustainabilityPage() {
  return (
    <div className="container page-content info-page">
      <section className="info-hero">
        <SectionTitle
          eyebrow="Pequeñas decisiones, paso a paso"
          title="Queremos cuidar también el lugar que compartimos"
          description="En SmoothieFit buscamos tomar decisiones más conscientes sobre los empaques y los materiales que usamos."
          level="h1"
        />
      </section>
      <section className="info-section info-section-soft">
        <SectionTitle
          eyebrow="Nuestro punto de partida"
          title="Un empaque pensado con cuidado"
          description="Estamos definiendo opciones para presentar nuestros smoothies de forma práctica, sin dejar de pensar en los residuos que pueden generar."
          level="h2"
        />
        <div className="grid info-card-grid sustainability-grid">
          {packagingIdeas.map((idea) => (
            <article className="card info-card" key={idea.title}>
              <span className="info-card-icon" aria-hidden="true">{idea.icon}</span>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-section">
        <div className="info-copy">
          <p className="eyebrow">Aprender y mejorar</p>
          <h2>Un compromiso en construcción</h2>
          <p>
            Este proyecto está definiendo sus procesos. Por eso, preferimos contar con honestidad
            qué estamos buscando en vez de prometer resultados que aún no hemos medido.
          </p>
          <p>
            Cuando elijamos un empaque, compartiremos su material y las indicaciones disponibles
            para desecharlo correctamente. La posibilidad de reciclarlo depende de las condiciones
            y servicios de cada lugar.
          </p>
        </div>
        <aside className="info-highlight">
          <span className="highlight-icon" aria-hidden="true">✦</span>
          <p><strong>Vamos paso a paso</strong></p>
          <p>Buscamos, preguntamos y revisamos opciones para tomar decisiones cada vez mejor informadas.</p>
        </aside>
      </section>
      <section className="info-cta">
        <h2>¿Conoces una opción interesante?</h2>
        <p>Nos gustaría conocer ideas y proveedores que puedan ayudar a este proyecto.</p>
        <Link className="button button-primary" to="/contacto">Comparte tu idea</Link>
      </section>
    </div>
  );
}

export default SustainabilityPage;

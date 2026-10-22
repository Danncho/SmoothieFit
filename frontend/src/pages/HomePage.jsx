import { Link } from 'react-router-dom';

const featuredSmoothies = [
  {
    name: 'Mora Andina',
    description: 'Una mezcla frutal con un toque de semillas.',
    price: '$3.50',
    art: '🫐',
    style: 'pink'
  },
  {
    name: 'Maracuyá Alegre',
    description: 'Maracuyá y naranjilla en una combinación cítrica.',
    price: '$3.75',
    art: '🍊',
    style: 'yellow'
  },
  {
    name: 'Verde Fresco',
    description: 'Frutas con un poco de espinaca y chía.',
    price: '$4.00',
    art: '🥬',
    style: 'purple'
  }
];

const benefits = [
  { icon: '♥', title: 'Sabor', description: 'Mezclas coloridas para disfrutar cada sorbo.' },
  { icon: '✿', title: 'Ingredientes locales', description: 'Frutas, verduras y semillas de productores locales.' },
  { icon: '↗', title: 'Práctico', description: 'Una opción fácil de llevar para tus planes del día.' },
  { icon: '♻', title: 'Empaques por evaluar', description: 'Exploramos opciones de empaque con cuidado y transparencia.' }
];

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Un momento rico, a tu manera</p>
            <h1>Fruta, color y buen sabor en cada sorbo</h1>
            <p>
              Smoothies hechos con frutas, verduras y semillas de productores locales.
              Elige uno de nuestros favoritos o crea tu propia mezcla.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/smoothies">Ver smoothies</Link>
              <Link className="button button-secondary" to="/crea-tu-smoothie">Crea tu smoothie</Link>
            </div>
          </div>
          <div className="hero-art" role="img" aria-label="Ilustración de un smoothie sonriente con sorbete">
            <div className="smoothie-character" aria-hidden="true">
              <span className="character-straw" />
              <span className="character-eye character-eye-left" />
              <span className="character-eye character-eye-right" />
              <span className="character-smile" />
            </div>
            <span className="hero-sparkle sparkle-one" aria-hidden="true">✦</span>
            <span className="hero-sparkle sparkle-two" aria-hidden="true">✦</span>
          </div>
        </div>
      </section>

      <section className="home-section container" aria-labelledby="why-title">
        <div className="section-heading">
          <p className="eyebrow">Así nos gusta</p>
          <h2 id="why-title">¿Por qué SmoothieFit?</h2>
          <p>Ideas frescas, preparadas para acompañar tu día.</p>
        </div>
        <div className="grid benefit-grid">
          {benefits.map((benefit) => (
            <article className="card benefit-card" key={benefit.title}>
              <span className="benefit-icon" aria-hidden="true">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section featured-section" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Para empezar a elegir</p>
            <h2 id="featured-title">Tres mezclas de ejemplo</h2>
            <p>Ideas de muestra para explorar el catálogo.</p>
          </div>
          <div className="grid smoothie-grid">
            {featuredSmoothies.map((smoothie) => (
              <article className="card smoothie-card" key={smoothie.name}>
                <div className={`smoothie-art smoothie-art-${smoothie.style}`} role="img" aria-label={`Ilustración de ${smoothie.name}`}>
                  {smoothie.art}
                </div>
                <div className="smoothie-info">
                  <h3>{smoothie.name}</h3>
                  <p>{smoothie.description}</p>
                  <p className="smoothie-price">{smoothie.price} <span>precio de ejemplo</span></p>
                  <p className="sample-label">Producto de ejemplo</p>
                </div>
              </article>
            ))}
          </div>
          <div className="section-action">
            <Link className="button button-secondary" to="/smoothies">Ver todos los smoothies</Link>
          </div>
        </div>
      </section>

      <section className="home-section container">
        <div className="custom-banner">
          <div>
            <p className="eyebrow">Tu mezcla, tus reglas</p>
            <h2>Hazlo a tu manera</h2>
            <p>Combina tus ingredientes favoritos y arma un smoothie con tu propio estilo.</p>
          </div>
          <Link className="button button-primary" to="/crea-tu-smoothie">Crear mi smoothie</Link>
        </div>
      </section>

      <section className="home-section container">
        <div className="school-banner">
          <div>
            <p className="eyebrow">Para compartir</p>
            <h2>¿Eres parte de un colegio o una familia?</h2>
            <p>Conversemos sobre opciones para actividades, eventos y momentos para compartir.</p>
          </div>
          <Link className="button button-secondary" to="/colegios">Conoce más</Link>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <div className="container final-cta-inner">
          <p className="eyebrow">Un sorbo de alegría</p>
          <h2 id="cta-title">¿Listo para elegir tu próximo smoothie?</h2>
          <Link className="button button-primary" to="/smoothies">Encuentra tu favorito</Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;

import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import ProductsStatus from '../components/ProductsStatus.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import useProducts from '../hooks/useProducts.js';

const benefits = [
  { icon: '♥', title: 'Sabor', description: 'Mezclas coloridas para disfrutar cada sorbo.' },
  { icon: '✿', title: 'Ingredientes locales', description: 'Frutas, verduras y semillas de productores locales.' },
  { icon: '↗', title: 'Práctico', description: 'Una opción fácil de llevar para tus planes del día.' },
  { icon: '♻', title: 'Empaques por evaluar', description: 'Exploramos opciones de empaque con cuidado y transparencia.' }
];

function HomePage() {
  const { products, loading, error, retry } = useProducts();
  const featuredProducts = products.filter((product) => product.destacado).slice(0, 3);
  const featuredSmoothies = (featuredProducts.length ? featuredProducts : products).slice(0, 3);

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
        <SectionTitle
          eyebrow="Así nos gusta"
          title="¿Por qué SmoothieFit?"
          description="Ideas frescas, preparadas para acompañar tu día."
          id="why-title"
        />
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
          <SectionTitle
            eyebrow="Para empezar a elegir"
            title="Tres mezclas del catálogo"
            description="Productos de ejemplo para explorar el catálogo."
            id="featured-title"
          />
          <ProductsStatus
            loading={loading}
            error={error}
            empty={!loading && !error && featuredSmoothies.length === 0}
            onRetry={retry}
          />
          {!loading && !error && featuredSmoothies.length > 0 && (
            <div className="grid smoothie-grid">
              {featuredSmoothies.map((product) => (
                <ProductCard product={product} key={product.id ?? product.nombre} />
              ))}
            </div>
          )}
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

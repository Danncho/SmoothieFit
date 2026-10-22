import { useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import ProductsStatus from '../components/ProductsStatus.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import useProducts from '../hooks/useProducts.js';

function SmoothiesPage() {
  const { products, loading, error, retry } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))];
  const visibleProducts = selectedCategory
    ? products.filter((product) => product.categoria === selectedCategory)
    : products;

  return (
    <section className="container page-content" aria-labelledby="catalog-title">
      <SectionTitle
        eyebrow="Colores para disfrutar"
        title="Nuestros smoothies"
        description="Explora las mezclas de ejemplo y elige la que más te guste."
        id="catalog-title"
        level="h1"
      />
      {!loading && !error && products.length > 0 && (
        <div className="catalog-filter">
          <label htmlFor="category-filter">Filtrar por categoría</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option value={category} key={category}>{category}</option>
            ))}
          </select>
        </div>
      )}
      <ProductsStatus
        loading={loading}
        error={error}
        empty={!loading && !error && visibleProducts.length === 0}
        onRetry={retry}
      />
      {!loading && !error && visibleProducts.length > 0 && (
        <div className="grid smoothie-grid">
          {visibleProducts.map((product) => (
            <ProductCard product={product} key={product.id ?? product.nombre} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SmoothiesPage;

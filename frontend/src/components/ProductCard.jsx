function ProductCard({ product }) {
  const hasImageUrl = typeof product.imagen === 'string'
    && /^(https?:\/\/|\/)/i.test(product.imagen);

  return (
    <article className="card smoothie-card">
      {product.imagen && (
        <div className="smoothie-art" role="img" aria-label={`Imagen de ${product.nombre}`}>
          {hasImageUrl
            ? <img src={product.imagen} alt="" loading="lazy" />
            : <span aria-hidden="true">{product.imagen}</span>}
        </div>
      )}
      <div className="smoothie-info">
        <h2>{product.nombre}</h2>
        <p>{product.descripcion}</p>
        {Array.isArray(product.ingredientes) && (
          <p className="smoothie-ingredients">
            Ingredientes: {product.ingredientes.join(', ')}
          </p>
        )}
        {product.categoria && <p className="smoothie-category">{product.categoria}</p>}
        {Number.isFinite(Number(product.precio)) && (
          <p className="smoothie-price">{formatPrice(product.precio)}</p>
        )}
        {product.esEjemplo && <p className="sample-label">Producto de ejemplo</p>}
      </div>
    </article>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(price));
}

export default ProductCard;

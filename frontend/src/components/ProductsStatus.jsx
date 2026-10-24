function ProductsStatus({ loading, error, empty, onRetry }) {
  if (loading) {
    return (
      <p className="products-status" role="status" aria-live="polite">
        Smoothies en camino! esto puede tardar un poco. Cargando...
      </p>
    );
  }

  if (error) {
    return (
      <div className="products-status products-error" role="alert">
        <p>Lo sentimos, no pudimos cargar los smoothies. {error}</p>
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (empty) {
    return <p className="products-status">Nuevos smoothies estaran disponibles pronto.</p>;
  }

  return null;
}

export default ProductsStatus;

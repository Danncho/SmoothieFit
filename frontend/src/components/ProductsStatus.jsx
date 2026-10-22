function ProductsStatus({ loading, error, empty, onRetry }) {
  if (loading) {
    return (
      <p className="products-status" role="status" aria-live="polite">
        Cargando... Puede tardar unos segundos mientras el servidor se activa.
      </p>
    );
  }

  if (error) {
    return (
      <div className="products-status products-error" role="alert">
        <p>No pudimos cargar los smoothies. {error}</p>
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (empty) {
    return <p className="products-status">Todavía no hay smoothies para mostrar.</p>;
  }

  return null;
}

export default ProductsStatus;

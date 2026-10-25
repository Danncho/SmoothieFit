import { Link } from 'react-router-dom';
import { CONSTRUCTOR_DISPONIBLE } from '../config/features.js';
import { votosDelProducto } from '../utils/productRanking.js';

function ProductCard({
  product,
  favorito = false,
  yaVoto = false,
  votando = false,
  onVotar
}) {
  const hasImageUrl = typeof product.imagen === 'string'
    && /^(https?:\/\/|\/)/i.test(product.imagen);
  const votos = votosDelProducto(product);

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
        {favorito && <span className="favorite-label">Favorito</span>}
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
        {onVotar && (
          <div className="smoothie-card-actions">
            <button
              className="button button-secondary"
              type="button"
              aria-pressed={yaVoto}
              aria-label={yaVoto
                ? `Ya votaste por ${product.nombre}; ${votos} votos`
                : `Me gusta ${product.nombre}; ${votos} votos`}
              disabled={yaVoto || votando}
              onClick={() => onVotar(product)}
            >
              {yaVoto ? `Ya votaste · ${votos}` : `Me gusta · ${votos}`}
            </button>
            {CONSTRUCTOR_DISPONIBLE && (
              <Link
                className="button button-primary"
                to={`/crea-tu-smoothie?base=${encodeURIComponent(product.id)}`}
              >
                Personalizar
              </Link>
            )}
          </div>
        )}
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

import { useRef, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import ProductsStatus from '../components/ProductsStatus.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { apiRequest } from '../services/api.js';
import useProducts from '../hooks/useProducts.js';
import { ordenarPorVotos, votosDelProducto } from '../utils/productRanking.js';

const VOTOS_LOCAL_STORAGE_KEY = 'smoothiefitVotedProducts';
const VENTANA_VOTO_MS = 24 * 60 * 60 * 1000;

function leerVotosGuardados() {
  try {
    const guardados = localStorage.getItem(VOTOS_LOCAL_STORAGE_KEY);
    const marcas = guardados ? JSON.parse(guardados) : {};
    if (!marcas || typeof marcas !== 'object' || Array.isArray(marcas)) {
      return { ids: [], error: 'No se pudieron leer los votos guardados en este navegador.' };
    }
    const ahora = Date.now();
    const marcasValidas = Object.fromEntries(
      Object.entries(marcas).filter(([id, fecha]) => (
        /^\d+$/.test(id)
        && Number.isSafeInteger(Number(id))
        && Number(id) > 0
        && Number.isSafeInteger(fecha)
        && fecha <= ahora
        && ahora - fecha < VENTANA_VOTO_MS
      ))
    );
    return { ids: Object.keys(marcasValidas).map(Number), marcas: marcasValidas, error: '' };
  } catch {
    return { ids: [], marcas: {}, error: 'No se pudieron leer los votos guardados en este navegador.' };
  }
}

function guardarVotos(marcas) {
  try {
    localStorage.setItem(VOTOS_LOCAL_STORAGE_KEY, JSON.stringify(marcas));
    return true;
  } catch {
    return false;
  }
}

function mensajeErrorVoto(error) {
  if (error.status === 429) return error.message;
  return error.message || 'No pudimos guardar tu voto. Inténtalo de nuevo.';
}

function SmoothiesPage() {
  const { products, loading, error, retry } = useProducts();
  const votosIniciales = useRef(null);
  if (votosIniciales.current === null) votosIniciales.current = leerVotosGuardados();
  const [votedIds, setVotedIds] = useState(votosIniciales.current.ids);
  const votedIdsRef = useRef(votedIds);
  const marcasVotoRef = useRef(votosIniciales.current.marcas || {});
  const [optimisticVotes, setOptimisticVotes] = useState({});
  const [votingIds, setVotingIds] = useState([]);
  const [voteError, setVoteError] = useState('');
  const [storageWarning, setStorageWarning] = useState(votosIniciales.current.error);
  const pendingVotes = useRef(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const productsWithVotes = products.map((product) => ({
    ...product,
    votos: optimisticVotes[product.id] ?? product.votos ?? 0
  }));
  const rankedProducts = ordenarPorVotos(productsWithVotes);
  const categories = [...new Set(rankedProducts.map((product) => product.categoria).filter(Boolean))];
  const visibleProducts = selectedCategory
    ? rankedProducts.filter((product) => product.categoria === selectedCategory)
    : rankedProducts;
  const todosSinVotos = rankedProducts.length > 0
    && rankedProducts.every((product) => votosDelProducto(product) === 0);
  const favoritosIds = new Set(
    rankedProducts
      .filter((product) => votosDelProducto(product) > 0)
      .slice(0, 3)
      .map((product) => product.id)
  );

  async function votar(product) {
    if (pendingVotes.current.has(product.id) || votedIdsRef.current.includes(product.id)) return;

    pendingVotes.current.add(product.id);
    setVotingIds((current) => [...current, product.id]);
    setVoteError('');

    const votosAnteriores = votosDelProducto(product);
    const idsActualizados = [...votedIdsRef.current, product.id];
    const marcasActualizadas = { ...marcasVotoRef.current, [product.id]: Date.now() };
    votedIdsRef.current = idsActualizados;
    marcasVotoRef.current = marcasActualizadas;
    setVotedIds(idsActualizados);
    setOptimisticVotes((current) => ({ ...current, [product.id]: votosAnteriores + 1 }));

    if (!guardarVotos(marcasActualizadas)) {
      setStorageWarning('Este navegador no pudo recordar tu voto; el servidor seguirá evitando votos repetidos por 24 horas.');
    } else {
      setStorageWarning('');
    }

    try {
      const resultado = await apiRequest(`/productos/${product.id}/voto`, { method: 'POST' });
      if (!Number.isSafeInteger(resultado?.votos) || resultado.votos < 0) {
        throw new Error('El servidor devolvió un total de votos inválido.');
      }
      setOptimisticVotes((current) => ({ ...current, [product.id]: resultado.votos }));
    } catch (requestError) {
      const idsRevertidos = votedIdsRef.current.filter((id) => id !== product.id);
      const marcasRevertidas = { ...marcasVotoRef.current };
      delete marcasRevertidas[product.id];
      votedIdsRef.current = idsRevertidos;
      marcasVotoRef.current = marcasRevertidas;
      setVotedIds(idsRevertidos);
      setOptimisticVotes((current) => ({ ...current, [product.id]: votosAnteriores }));
      if (!guardarVotos(marcasRevertidas)) {
        setStorageWarning('No se pudo actualizar el registro local del voto.');
      }
      setVoteError(mensajeErrorVoto(requestError));
    } finally {
      pendingVotes.current.delete(product.id);
      setVotingIds((current) => current.filter((id) => id !== product.id));
    }
  }

  return (
    <section className="container page-content" aria-labelledby="catalog-title">
      <SectionTitle
        eyebrow="Elegidos por la gente"
        title="Favoritos del público"
        description="Vota por tus mezclas favoritas y descubre cuáles prefiere la comunidad."
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
      {!loading && !error && todosSinVotos && (
        <p className="vote-empty-message" role="status">
          Aún sin votos: ¡sé el primero en elegir tu favorito!
        </p>
      )}
      {storageWarning && <p className="vote-storage-warning" role="status">{storageWarning}</p>}
      {voteError && <p className="vote-error" role="alert">{voteError}</p>}
      {!loading && !error && visibleProducts.length > 0 && (
        <div className="grid smoothie-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              product={product}
              key={product.id ?? product.nombre}
              favorito={favoritosIds.has(product.id)}
              yaVoto={votedIds.includes(product.id)}
              votando={votingIds.includes(product.id)}
              onVotar={votar}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default SmoothiesPage;

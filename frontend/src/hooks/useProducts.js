import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const result = await apiRequest('/productos');
        if (!Array.isArray(result)) {
          throw new Error('La respuesta de productos no tiene el formato esperado.');
        }
        if (isCurrentRequest) {
          setProducts(result);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError.message || 'No se pudieron cargar los productos.');
        }
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      isCurrentRequest = false;
    };
  }, [requestNumber]);

  function retry() {
    setRequestNumber((number) => number + 1);
  }

  return { products, loading, error, retry };
}

export default useProducts;

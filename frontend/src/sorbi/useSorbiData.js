import { useCallback, useState } from 'react';
import { apiRequest } from '../services/api.js';

let dataCache = null;
let dataRequest = null;

async function fetchSorbiData() {
  if (dataCache) return dataCache;
  if (!dataRequest) {
    dataRequest = Promise.all([
      apiRequest('/productos'),
      apiRequest('/sucursales'),
      apiRequest('/ingredientes')
    ]).then(([products, locals, ingredients]) => {
      if (!Array.isArray(products) || !Array.isArray(locals) || !Array.isArray(ingredients)) {
        throw new Error('El sitio devolvió datos incompletos para Sorbi.');
      }
      const local = locals.find((item) => item?.id === 'mall-del-sol');
      if (!local) throw new Error('No se encontró la ficha del local planificado.');
      dataCache = { products, local, ingredients };
      return dataCache;
    }).finally(() => {
      dataRequest = null;
    });
  }
  return dataRequest;
}

export function clearSorbiDataCache() {
  dataCache = null;
  dataRequest = null;
}

function useSorbiData() {
  const [data, setData] = useState(dataCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (retry = false) => {
    if (retry) clearSorbiDataCache();
    if (dataCache) {
      setData(dataCache);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await fetchSorbiData();
      setData(result);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar los datos de Sorbi.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, load };
}

export default useSorbiData;

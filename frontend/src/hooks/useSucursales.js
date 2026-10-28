import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

function useSucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadSucursales() {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest('/sucursales');
        if (!Array.isArray(result)) {
          throw new Error('La respuesta del local no tiene el formato esperado.');
        }
        if (isCurrentRequest) {
          setSucursales(result);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError.message || 'No se pudo cargar el local planificado.');
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    }

    loadSucursales();
    return () => {
      isCurrentRequest = false;
    };
  }, [requestNumber]);

  function retry() {
    setRequestNumber((number) => number + 1);
  }

  return { sucursales, loading, error, retry };
}

export default useSucursales;

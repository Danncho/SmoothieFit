const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
export const API_URL = configuredApiUrl || '/api';

export async function apiRequest(path, options = {}) {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_URL}${endpoint}`, options);
  let data = null;

  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new Error('El servidor devolvió una respuesta inválida.');
    }
  }

  if (!response.ok) {
    const error = new Error(data?.mensaje || `La solicitud a la API falló (${response.status}).`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

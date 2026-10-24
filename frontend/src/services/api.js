const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
export const API_URL = configuredApiUrl || '/api';
export const AUTH_TOKEN_KEY = 'smoothiefitAdminToken';

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
    if (response.status === 401 && endpoint !== '/auth/login') {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event('smoothiefit:session-expired'));
    }

    const error = new Error(data?.mensaje || `La solicitud a la API falló (${response.status}).`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function authenticatedRequest(path, options = {}) {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestOptions = { ...options, headers };
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return apiRequest(path, requestOptions);
}

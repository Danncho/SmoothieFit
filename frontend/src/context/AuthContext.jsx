import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, AUTH_TOKEN_KEY, authenticatedRequest } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const logout = useCallback((sessionExpired = false) => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setAuthError('');
    navigate('/admin/login', {
      replace: true,
      state: sessionExpired ? { sessionExpired: true } : undefined
    });
  }, [navigate]);

  const validateSession = useCallback(async () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setAuthError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAuthError('');
    try {
      setUser(await authenticatedRequest('/auth/me'));
    } catch (error) {
      setUser(null);
      if (error.status !== 401) {
        setAuthError('No pudimos validar la sesión. Comprueba el servidor e inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      logout(true);
    }

    window.addEventListener('smoothiefit:session-expired', handleSessionExpired);
    return () => window.removeEventListener('smoothiefit:session-expired', handleSessionExpired);
  }, [logout]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = useCallback(async (correo, contrasena) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    sessionStorage.setItem(AUTH_TOKEN_KEY, result.token);
    setUser(result.usuario);
    navigate('/admin', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    isLoading,
    authError,
    login,
    logout,
    validateSession
  }), [user, isLoading, authError, login, logout, validateSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return context;
}

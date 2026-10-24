import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, isLoading, authError, validateSession } = useAuth();

  if (isLoading) {
    return <p className="admin-status" role="status">Verificando sesión...</p>;
  }

  if (authError) {
    return (
      <div className="container page-content admin-error" role="alert">
        <p>{authError}</p>
        <button className="button button-secondary" type="button" onClick={validateSession}>
          Reintentar
        </button>
      </div>
    );
  }

  return user ? children : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute;

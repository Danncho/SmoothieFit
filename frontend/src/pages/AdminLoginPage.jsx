import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AdminLoginPage() {
  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionExpired = location.state?.sessionExpired;

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const nextFieldErrors = {};
    if (!emailPattern.test(correo.trim())) {
      nextFieldErrors.correo = 'Escribe un correo válido.';
    }
    if (!contrasena) {
      nextFieldErrors.contrasena = 'Escribe tu contraseña.';
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      setError('Revisa los campos señalados.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(correo.trim().toLowerCase(), contrasena);
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeCredential(field, value) {
    if (field === 'correo') setCorreo(value);
    if (field === 'contrasena') setContrasena(value);
    setFieldErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  }

  return (
    <section className="container page-content admin-login-page">
      <SectionTitle
        eyebrow="Acceso de administración"
        title="Iniciar sesión"
        description="Ingresa con la cuenta administradora del proyecto."
        level="h1"
      />
      <form className="card admin-login-form" onSubmit={handleSubmit} noValidate>
        {sessionExpired && (
          <p className="form-error" role="alert">
            Tu sesión expiró. Inicia sesión de nuevo.
          </p>
        )}
        <div className="form-field">
          <label htmlFor="admin-email">Correo</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(event) => changeCredential('correo', event.target.value)}
            aria-invalid={Boolean(fieldErrors.correo)}
            aria-describedby={fieldErrors.correo ? 'admin-email-error' : undefined}
            required
          />
          {fieldErrors.correo && <p className="field-error" id="admin-email-error">{fieldErrors.correo}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(event) => changeCredential('contrasena', event.target.value)}
            aria-invalid={Boolean(fieldErrors.contrasena)}
            aria-describedby={fieldErrors.contrasena ? 'admin-password-error' : undefined}
            required
          />
          {fieldErrors.contrasena && (
            <p className="field-error" id="admin-password-error">{fieldErrors.contrasena}</p>
          )}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}

export default AdminLoginPage;

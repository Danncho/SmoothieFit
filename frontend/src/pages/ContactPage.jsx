import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';
import { apiRequest } from '../services/api.js';

const allowedTypes = ['consulta', 'colegio', 'tienda', 'pedido'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?=.*\d)[0-9 +\-]+$/;
const maxMessageLength = 1000;

function getInitialType(value) {
  return allowedTypes.includes(value) ? value : 'consulta';
}

function createEmptyForm(tipo) {
  return {
    nombre: '',
    correo: '',
    telefono: '',
    tipo,
    organizacion: '',
    mensaje: '',
    website: ''
  };
}

function validateForm(form) {
  const errors = {};
  const nombre = form.nombre.trim();
  const correo = form.correo.trim();
  const telefono = form.telefono.trim();
  const organizacion = form.organizacion.trim();
  const mensaje = form.mensaje.trim();

  if (!nombre) {
    errors.nombre = 'Escribe tu nombre.';
  } else if (nombre.length > 100) {
    errors.nombre = 'El nombre no puede superar 100 caracteres.';
  }

  if (!correo) {
    errors.correo = 'Escribe tu correo.';
  } else if (correo.length > 254 || !emailPattern.test(correo)) {
    errors.correo = 'Escribe un correo válido.';
  }

  if (telefono && (telefono.length < 7 || telefono.length > 30 || !phonePattern.test(telefono))) {
    errors.telefono = 'Usa solo números, espacios, + o guiones (de 7 a 30 caracteres).';
  }

  if (!allowedTypes.includes(form.tipo)) {
    errors.tipo = 'Selecciona un tipo de solicitud válido.';
  }

  if (organizacion.length > 120) {
    errors.organizacion = 'No puede superar 120 caracteres.';
  }

  if (mensaje.length < 10) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
  } else if (mensaje.length > maxMessageLength) {
    errors.mensaje = `El mensaje no puede superar ${maxMessageLength} caracteres.`;
  }

  return errors;
}

function getOrganizationLabel(tipo) {
  if (tipo === 'colegio') {
    return 'Institución (opcional)';
  }
  if (tipo === 'tienda') {
    return 'Negocio (opcional)';
  }
  return 'Organización (opcional)';
}

function ContactPage() {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('tipo');
  const [form, setForm] = useState(() => createEmptyForm(getInitialType(requestedType)));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextType = getInitialType(requestedType);
    setForm((currentForm) => ({ ...currentForm, tipo: nextType }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.tipo;
      return nextErrors;
    });
  }, [requestedType]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Revisa los campos marcados antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest('/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          correo: form.correo.trim().toLowerCase(),
          telefono: form.telefono.trim(),
          tipo: form.tipo,
          organizacion: form.organizacion.trim(),
          mensaje: form.mensaje.trim(),
          website: form.website
        })
      });

      setForm(createEmptyForm(form.tipo));
      setErrors({});
      setMessage(result?.mensaje || 'Tu solicitud se envió correctamente.');
      setIsSuccess(true);
    } catch (error) {
      if (error.status === 400 && error.data?.errores) {
        setErrors(error.data.errores);
      }

      if (error.status === 429) {
        setMessage('Has enviado varias solicitudes. Intenta de nuevo dentro de una hora.');
      } else if (error.status === 503) {
        setMessage('El servicio no puede guardar tu solicitud ahora. Intenta más tarde.');
      } else if (error.status === 400) {
        setMessage(error.data?.mensaje || 'Revisa los campos del formulario.');
      } else if (error.status) {
        setMessage(error.data?.mensaje || 'No pudimos enviar tu solicitud. Intenta de nuevo más tarde.');
      } else {
        setMessage('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      }
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const organizationLabel = getOrganizationLabel(form.tipo);
  const messageLength = form.mensaje.length;

  return (
    <section className="container page-content contact-page">
      <SectionTitle
        eyebrow="Estamos para escuchar"
        title="Contacto"
        description="Cuéntanos qué tienes en mente y responderemos a tu solicitud."
        level="h1"
      />

      <form className="contact-form card" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="contact-name">Nombre</label>
          <input
            id="contact-name"
            name="nombre"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={form.nombre}
            onChange={handleChange}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby={errors.nombre ? 'error-nombre' : undefined}
            required
          />
          {errors.nombre && <p className="field-error" id="error-nombre">{errors.nombre}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="contact-email">Correo</label>
          <input
            id="contact-email"
            name="correo"
            type="email"
            autoComplete="email"
            maxLength={254}
            value={form.correo}
            onChange={handleChange}
            aria-invalid={Boolean(errors.correo)}
            aria-describedby={errors.correo ? 'error-correo' : undefined}
            required
          />
          {errors.correo && <p className="field-error" id="error-correo">{errors.correo}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone">Teléfono (opcional)</label>
          <input
            id="contact-phone"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={form.telefono}
            onChange={handleChange}
            aria-invalid={Boolean(errors.telefono)}
            aria-describedby={errors.telefono ? 'error-telefono' : undefined}
          />
          {errors.telefono && <p className="field-error" id="error-telefono">{errors.telefono}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="contact-type">Tipo de solicitud</label>
          <select
            id="contact-type"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            aria-invalid={Boolean(errors.tipo)}
            aria-describedby={errors.tipo ? 'error-tipo' : undefined}
            required
          >
            <option value="consulta">Consulta</option>
            <option value="colegio">Colegio</option>
            <option value="tienda">Tienda</option>
            <option value="pedido">Pedido</option>
          </select>
          {errors.tipo && <p className="field-error" id="error-tipo">{errors.tipo}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="contact-organization">{organizationLabel}</label>
          <input
            id="contact-organization"
            name="organizacion"
            type="text"
            maxLength={120}
            value={form.organizacion}
            onChange={handleChange}
            aria-invalid={Boolean(errors.organizacion)}
            aria-describedby={errors.organizacion ? 'error-organizacion' : undefined}
          />
          {errors.organizacion && <p className="field-error" id="error-organizacion">{errors.organizacion}</p>}
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="contact-message">Mensaje</label>
          <textarea
            id="contact-message"
            name="mensaje"
            rows="6"
            minLength={10}
            maxLength={maxMessageLength}
            value={form.mensaje}
            onChange={handleChange}
            aria-invalid={Boolean(errors.mensaje)}
            aria-describedby={errors.mensaje
              ? 'error-mensaje message-counter'
              : 'message-counter'}
            required
          />
          <p className="message-counter" id="message-counter" aria-live="polite">
            {messageLength}/{maxMessageLength} caracteres (mínimo 10)
          </p>
          {errors.mensaje && <p className="field-error" id="error-mensaje">{errors.mensaje}</p>}
        </div>

        <div className="contact-honeypot" aria-hidden="true">
          <label htmlFor="contact-website">No completar este campo</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex="-1"
            autoComplete="off"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-field form-field-wide">
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
          {isSubmitting && (
            <p className="form-status" role="status" aria-live="polite">
              El servidor está despertando, puede tardar hasta un minuto.
            </p>
          )}
          <p className="privacy-note">
            Usaremos tus datos solo para responder a esta solicitud. SmoothieFit es un proyecto académico.
          </p>
          {message && (
            <p className={isSuccess ? 'form-success' : 'form-error'} role={isSuccess ? 'status' : 'alert'}>
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

export default ContactPage;

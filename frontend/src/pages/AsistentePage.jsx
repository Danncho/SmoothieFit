import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { apiRequest } from '../services/api.js';

const preguntasRapidas = [
  'Algo dulce y tropical',
  'Para antes de clases',
  'Con cacao',
  '¿Qué ingredientes son locales?',
  'Quiero pedir para mi colegio'
];

const avisoPrivacidad = 'Sorbi es un asistente automático con respuestas preparadas; puede equivocarse. No da consejo nutricional. Revisa los ingredientes si tienes alergias. No escribas datos personales.';

function SorbiAvatar() {
  return (
    <div className="sorbi-avatar" role="img" aria-label="Sorbi, un smoothie sonriente con sorbete">
      <span className="sorbi-straw" aria-hidden="true" />
      <span aria-hidden="true">☺</span>
    </div>
  );
}

function AsistentePage() {
  const [mensaje, setMensaje] = useState('');
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const formRef = useRef(null);

  function elegirPregunta(pregunta) {
    setMensaje(pregunta);
    setInputError('');
    setError('');
    formRef.current?.querySelector('textarea')?.focus();
  }

  async function enviarConsulta(event) {
    event.preventDefault();
    const consulta = mensaje.trim();
    if (consulta.length < 3 || consulta.length > 300 || /[\u0000-\u001f\u007f-\u009f]/u.test(consulta)) {
      setInputError('Escribe una consulta de 3 a 300 caracteres.');
      return;
    }

    setInputError('');
    setError('');
    setRespuesta(null);
    setIsLoading(true);

    try {
      const result = await apiRequest('/ia/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: consulta })
      });
      setRespuesta(result);
      setMensaje('');
    } catch (requestError) {
      if (requestError.status === 429) {
        setError(requestError.message || 'Llegaste al límite de consultas. Espera un minuto e inténtalo de nuevo.');
      } else if (requestError.status === 503) {
        setError('El catálogo o el servidor no están disponibles ahora. Intenta de nuevo en un momento.');
      } else if (requestError.status === 400) {
        setError(requestError.message || 'Revisa tu consulta e inténtalo de nuevo.');
      } else {
        setError('No pudimos conectar con Sorbi. El servidor puede estar despertando; inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="container page-content assistant-page">
      <SectionTitle
        eyebrow="Una ayuda para elegir"
        title="Conoce a Sorbi"
        description="Cuéntale qué sabores te gustan o pregúntale algo básico sobre SmoothieFit."
        level="h1"
      />

      <div className="assistant-chat">
        <div className="assistant-welcome card">
          <SorbiAvatar />
          <div>
            <p className="assistant-name">¡Hola! Soy Sorbi</p>
            <p>¿Buscas un sabor para probar o tienes una duda sobre SmoothieFit? Estoy aquí para ayudarte.</p>
          </div>
        </div>

        <div className="assistant-quick-questions" aria-label="Preguntas rápidas">
          {preguntasRapidas.map((pregunta) => (
            <button
              className="assistant-chip"
              key={pregunta}
              type="button"
              disabled={isLoading}
              onClick={() => elegirPregunta(pregunta)}
            >
              {pregunta}
            </button>
          ))}
        </div>

        <form className="assistant-form card" onSubmit={enviarConsulta} ref={formRef} noValidate>
          <label htmlFor="sorbi-message">Tu consulta</label>
          <textarea
            id="sorbi-message"
            rows="3"
            maxLength={300}
            value={mensaje}
            onChange={(event) => {
              setMensaje(event.target.value);
              setInputError('');
              setError('');
            }}
            aria-invalid={Boolean(inputError)}
            aria-describedby={inputError ? 'sorbi-message-error sorbi-counter' : 'sorbi-counter'}
            required
          />
          <div className="assistant-form-meta">
            <span id="sorbi-counter" aria-live="polite">{mensaje.length}/300 caracteres</span>
            {inputError && <span className="field-error" id="sorbi-message-error">{inputError}</span>}
          </div>
          <button className="button button-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Sorbi está pensando...' : 'Enviar consulta'}
          </button>
          <p className="assistant-privacy">{avisoPrivacidad}</p>
        </form>

        {isLoading && (
          <p className="assistant-status" role="status" aria-live="polite">
            Sorbi está pensando... si el servidor estaba dormido puede tardar hasta un minuto.
          </p>
        )}

        {error && <p className="assistant-error" role="alert">{error}</p>}

        {respuesta && (
          <section className="assistant-answer" aria-label="Respuesta de Sorbi" aria-live="polite">
            <div className="assistant-answer-heading">
              <SorbiAvatar />
              <span className="assistant-mode">Respuestas preparadas</span>
            </div>
            <p className="assistant-answer-message">{respuesta.mensaje}</p>

            {respuesta.recomendaciones?.length > 0 && (
              <div className="grid smoothie-grid assistant-recommendations">
                {respuesta.recomendaciones.map(({ producto, motivo }) => (
                  <div className="assistant-recommendation" key={producto.id}>
                    <ProductCard product={producto} />
                    <p className="assistant-reason">{motivo}</p>
                  </div>
                ))}
              </div>
            )}

            {respuesta.accion && (
              <Link className="button button-secondary assistant-action" to={respuesta.accion.ruta}>
                {respuesta.accion.texto}
              </Link>
            )}
          </section>
        )}
      </div>
    </section>
  );
}

export default AsistentePage;

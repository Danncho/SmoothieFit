import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buildAssistantReply,
  calculateDistanceKm,
  containsPersonalData,
  extractPreferences,
  getDirectionsUrl,
  getInputIssue,
  normalizeText,
  recommendationReason,
  scoreProducts
} from '../../sorbi/engine.js';
import {
  faqResponses,
  quickActions,
  recommendationQuestions,
  tasteOptions
} from '../../sorbi/knowledge.js';
import useSorbiData from '../../sorbi/useSorbiData.js';

const STORAGE_KEY = 'smoothiefitSorbiConversation';
const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function createWelcomeMessage() {
  return {
    id: 'welcome',
    role: 'assistant',
    text: '¡Hola! Soy Sorbi. Puedo recomendarte bebidas, contarte sobre el local y ayudarte a llegar al constructor.',
    quickActions
  };
}

function readConversation() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return { messages: [createWelcomeMessage()], flow: null, error: '' };
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.messages)) throw new Error('Formato de conversación inválido.');
    const messages = parsed.messages.filter((message) => (
      message
      && typeof message.text === 'string'
      && ['assistant', 'user'].includes(message.role)
      && !(message.role === 'user' && containsPersonalData(message.text))
    ));
    return {
      messages: messages.length ? messages : [createWelcomeMessage()],
      flow: parsed.flow || null,
      error: ''
    };
  } catch {
    return {
      messages: [createWelcomeMessage()],
      flow: null,
      error: 'Esta pestaña no pudo recuperar la conversación guardada; puedes seguir conversando.'
    };
  }
}

function makeMessage(role, text, extras = {}) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text, ...extras };
}

function formatPrice(price) {
  const parsed = Number(price);
  if (!Number.isFinite(parsed)) return 'Precio por confirmar';
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(parsed);
}

function getFlowStep(flow) {
  if (!flow?.moment) return 'moment';
  if (flow.tastes === null) return 'taste';
  if (!flow.avoidSpecified) return 'avoid';
  return '';
}

function questionMessage(step, data, flow) {
  if (step === 'moment' || step === 'taste') {
    const question = recommendationQuestions[step];
    return makeMessage('assistant', question.prompt, { choices: question.options, choiceStep: step });
  }
  const choices = [
    { id: 'none', label: recommendationQuestions.avoid.noneLabel },
    ...data.ingredients.map((ingredient) => ({
      id: `ingredient-${ingredient.id}`,
      label: ingredient.nombre,
      ingredientId: ingredient.id,
      selected: flow.avoidIngredients.some((item) => item.id === ingredient.id)
    })),
    { id: 'done', label: 'Usar selección' }
  ];
  return makeMessage('assistant', recommendationQuestions.avoid.prompt, {
    choices,
    choiceStep: 'avoid'
  });
}

function tasteForBuilder(flow) {
  return (flow.tastes || []).find((taste) => tasteOptions.some(
    (option) => option.id === taste && taste !== 'surprise'
  ));
}

function recommendationMessage(flow, data, offset = 0) {
  const results = scoreProducts(data.products, flow);
  if (!results.length) {
    const taste = tasteForBuilder(flow);
    const route = taste ? `/crea-tu-smoothie?sabor=${encodeURIComponent(taste)}` : '/crea-tu-smoothie';
    return makeMessage(
      'assistant',
      'No encontré un producto del catálogo que coincida con todos esos gustos. Puedes armar una combinación en el constructor.',
      { actions: [{ label: 'Probar el constructor', to: route }] }
    );
  }

  const cards = results.map((result) => ({
    product: result.product,
    reason: recommendationReason(result)
  }));
  return makeMessage('assistant', 'Estas opciones del catálogo coinciden con lo que buscas:', {
    kind: 'recommendations',
    recommendations: cards,
    offset,
    results,
    actions: [
      ...(offset + 3 < cards.length ? [{ label: 'Otra opción', type: 'nextRecommendation' }] : []),
      { label: 'Cambiar mis gustos', type: 'restartRecommendation' }
    ]
  });
}

function SorbiAvatar() {
  return (
    <span className="sorbi-avatar" aria-hidden="true">
      <span className="sorbi-straw" />
      ☺
    </span>
  );
}

function MessageActions({ actions, onAction }) {
  if (!actions?.length) return null;
  return (
    <div className="sorbi-message-actions">
      {actions.map((action) => {
        if (action.external) {
          return (
            <a
              className="button button-secondary"
              href={action.href}
              key={`${action.label}-${action.href}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {action.label}
            </a>
          );
        }
        if (action.to) {
          return (
            <Link className="button button-secondary" key={`${action.label}-${action.to}`} to={action.to}>
              {action.label}
            </Link>
          );
        }
        return (
          <button
            className="button button-secondary"
            key={action.type}
            type="button"
            onClick={() => onAction(action)}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function LocalDetails({ local }) {
  const statusText = local.estado === 'abierta'
    ? faqResponses.localOpen
    : local.estado === 'proxima'
      ? faqResponses.localUpcoming
      : faqResponses.localPlanned;

  return (
    <div className="sorbi-local-details">
      <p><strong>{statusText}</strong></p>
      {local.direccion && <p><strong>Dirección:</strong> {local.direccion}</p>}
      {local.referencia && <p><strong>Referencia:</strong> {local.referencia}</p>}
      {local.horario && <p><strong>Horario:</strong> {local.horario}</p>}
      <p>{faqResponses.locationPermission}</p>
    </div>
  );
}

function IngredientList({ ingredients }) {
  return (
    <div className="sorbi-ingredient-list">
      {ingredients.map((ingredient) => (
        <p key={ingredient.nombre}>
          <strong>{ingredient.nombre}</strong> · {ingredient.categoria}
          {ingredient.alergenos.length > 0
            ? ` · Alérgenos declarados: ${ingredient.alergenos.join(', ')}`
            : ' · Sin alérgenos declarados en la ficha'}
        </p>
      ))}
    </div>
  );
}

function RecommendationCards({ message }) {
  const visible = message.recommendations.slice(message.offset || 0, (message.offset || 0) + 3);
  return (
    <div className="sorbi-recommendation-grid">
      {visible.map(({ product, reason }) => (
        <article className="sorbi-product-card" key={product.id}>
          {product.imagen && <span className="sorbi-product-image" aria-hidden="true">{product.imagen}</span>}
          <h3>{product.nombre}</h3>
          <p>{product.descripcion}</p>
          {Array.isArray(product.ingredientes) && (
            <p><strong>Ingredientes:</strong> {product.ingredientes.join(', ')}</p>
          )}
          {Number.isFinite(Number(product.precio)) && (
            <p><strong>Precio de ejemplo:</strong> {formatPrice(product.precio)}</p>
          )}
          <p className="sorbi-product-reason">{reason}</p>
          {product.esEjemplo && <span className="sorbi-sample-label">Producto de ejemplo</span>}
          <Link
            className="button button-primary"
            to={`/crea-tu-smoothie?base=${encodeURIComponent(product.id)}`}
          >
            Personalizar
          </Link>
        </article>
      ))}
    </div>
  );
}

function SorbiMessage({ message, onQuickAction, onChoice, onAction, disabled }) {
  return (
    <article className={`sorbi-message sorbi-message-${message.role}`}>
      {message.role === 'assistant' && <SorbiAvatar />}
      <div className="sorbi-message-content">
        {!message.local && <p className="sorbi-message-text">{message.text}</p>}
        {message.local && <LocalDetails local={message.local} />}
        {message.ingredients && <IngredientList ingredients={message.ingredients} />}
        {message.recommendations && (
          <RecommendationCards message={message} />
        )}
        {message.quickActions && (
          <div className="sorbi-quick-actions">
            {message.quickActions.map((action) => (
              <button
                className="assistant-chip"
                key={action.id}
                type="button"
                disabled={disabled}
                onClick={() => onQuickAction(action.id, action.label)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        {message.choices && (
          <div className="sorbi-choice-list">
            {message.choices.map((choice) => (
              <button
                className="assistant-chip"
                key={choice.id}
                type="button"
                aria-pressed={choice.selected}
                disabled={disabled}
                onClick={() => onChoice(choice, message.choiceStep, message.id)}
              >
                {choice.selected ? '✓ ' : ''}{choice.label}
              </button>
            ))}
          </div>
        )}
        {message.kind === 'recommendations' && message.actions?.length > 0 && (
          <MessageActions actions={message.actions} onAction={onAction} />
        )}
        {message.kind !== 'recommendations' && (
          <MessageActions actions={message.actions} onAction={onAction} />
        )}
      </div>
    </article>
  );
}

function SorbiChat({
  onMinimize,
  contextSuggestion,
  showMinimize = false,
  initialFocus = false
}) {
  const initialConversation = useMemo(readConversation, []);
  const [messages, setMessages] = useState(initialConversation.messages);
  const [flow, setFlow] = useState(initialConversation.flow);
  const [storageWarning, setStorageWarning] = useState(initialConversation.error);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const { data, loading, error, load } = useSorbiData();
  const messagesRef = useRef(messages);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const responseSequenceRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    if (initialFocus) inputRef.current?.focus();
  }, [initialFocus]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' });
  }, [messages, typing, locating]);

  function persist(nextMessages, nextFlow) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: nextMessages.filter((message) => (
          message.role !== 'user' || !containsPersonalData(message.text)
        )),
        flow: nextFlow
      }));
      setStorageWarning('');
    } catch {
      setStorageWarning('El navegador no pudo guardar esta conversación en la pestaña; seguirá disponible mientras el chat esté abierto.');
    }
  }

  function appendMessages(additions, nextFlow = flow) {
    const next = [...messagesRef.current, ...additions];
    messagesRef.current = next;
    setMessages(next);
    persist(next, nextFlow);
    setFlow(nextFlow);
  }

  function restartChat() {
    responseSequenceRef.current += 1;
    const welcome = [createWelcomeMessage()];
    messagesRef.current = welcome;
    setMessages(welcome);
    setFlow(null);
    setInput('');
    setTyping(false);
    setSubmitting(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setStorageWarning('');
    } catch {
      persist(welcome, null);
    }
  }

  function pushTextAnswer(text, extras = {}) {
    appendMessages([makeMessage('assistant', text, extras)]);
  }

  function askNextFlowQuestion(nextFlow) {
    const step = getFlowStep(nextFlow);
    if (!step) {
      const result = recommendationMessage(nextFlow, data);
      appendMessages([result], null);
      setFlow(null);
      return;
    }
    appendMessages([questionMessage(step, data, nextFlow)], nextFlow);
  }

  function startRecommendation(preferences = {}) {
    const nextFlow = {
      moment: preferences.moment || null,
      tastes: preferences.tasteSpecified ? preferences.tastes : null,
      avoidIngredients: preferences.avoidIngredients || [],
      avoidSpecified: Boolean(preferences.avoidSpecified)
    };
    askNextFlowQuestion(nextFlow);
  }

  function answerQuickAction(actionId, label) {
    appendMessages([makeMessage('user', label)]);
    if (actionId === 'recommend') {
      startRecommendation();
      return;
    }
    if (actionId === 'constructor') {
      pushTextAnswer('Puedes armar una creación en el constructor. Es una simulación académica mientras el local siga planificado.', {
        actions: [{ label: 'Armar mi smoothie', to: '/crea-tu-smoothie' }]
      });
      return;
    }
    const inputText = {
      location: 'Dónde estamos y cómo llegar',
      favorites: 'Favoritos del público',
      ingredients: 'Ingredientes y alérgenos',
      colleges: 'Colegios',
      contact: 'Hablar con una persona'
    }[actionId] || label;
    if (data) respond(inputText);
  }

  function answerChoice(choice, step) {
    if (!flow || !data) return;
    if (step === 'avoid' && choice.ingredientId) {
      const selected = data.ingredients.find((ingredient) => ingredient.id === choice.ingredientId);
      if (!selected) return;
      const nextFlow = {
        ...flow,
        avoidIngredients: flow.avoidIngredients.some((item) => item.id === selected.id)
          ? flow.avoidIngredients.filter((item) => item.id !== selected.id)
          : [...flow.avoidIngredients, selected]
      };
      setFlow(nextFlow);
      const current = [...messagesRef.current];
      const questionIndex = current.findLastIndex((message) => message.choiceStep === 'avoid');
      if (questionIndex >= 0) {
        const updated = current.map((message, index) => (
          index === questionIndex
            ? {
              ...message,
              choices: message.choices.map((item) => (
                item.ingredientId === selected.id
                  ? { ...item, selected: !item.selected }
                  : item
              ))
            }
            : message
        ));
        messagesRef.current = updated;
        setMessages(updated);
        persist(updated, nextFlow);
      }
      return;
    }
    if (step === 'avoid' && choice.id === 'none') {
      const nextFlow = { ...flow, avoidIngredients: [], avoidSpecified: true };
      appendMessages([makeMessage('user', choice.label)], nextFlow);
      askNextFlowQuestion(nextFlow);
      return;
    }
    if (step === 'avoid' && choice.id === 'done') {
      const nextFlow = { ...flow, avoidSpecified: true };
      const selectedNames = nextFlow.avoidIngredients.map((item) => item.nombre);
      const answer = selectedNames.length
        ? `Evitar ${selectedNames.join(', ')}`
        : recommendationQuestions.avoid.noneLabel;
      appendMessages([makeMessage('user', answer)], nextFlow);
      askNextFlowQuestion(nextFlow);
      return;
    }

    const nextFlow = step === 'moment'
      ? { ...flow, moment: choice.id }
      : { ...flow, tastes: choice.id === 'surprise' ? [] : [choice.id] };
    appendMessages([makeMessage('user', choice.label)], nextFlow);
    askNextFlowQuestion(nextFlow);
  }

  function respond(message) {
    if (!data) return;
    const result = buildAssistantReply(message, data);
    const additions = result.responses.map((response) => makeMessage('assistant', response.text, response));
    appendMessages(additions);
    if (result.shouldRecommend) startRecommendation(result.preferences || extractPreferences(message, data.ingredients));
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    const issue = getInputIssue(text);
    setInput('');
    if (issue) {
      const response = issue === 'privateData'
        ? faqResponses.privateData
        : issue === 'tooLong'
          ? faqResponses.tooLong
          : faqResponses.empty;
      pushTextAnswer(response);
      inputRef.current?.focus();
      return;
    }
    if (!data || submitting) return;

    appendMessages([makeMessage('user', text)]);
    setSubmitting(true);
    setTyping(true);
    const responseSequence = ++responseSequenceRef.current;
    await delay(400 + (text.length % 401));
    if (mountedRef.current && responseSequenceRef.current === responseSequence) {
      setTyping(false);
      setSubmitting(false);
      respond(text);
      inputRef.current?.focus();
    }
  }

  function runNearby() {
    if (!data?.local) {
      pushTextAnswer(faqResponses.noLocal);
      return;
    }
    const local = data.local;
    const directions = getDirectionsUrl(local);
    if (!Number.isFinite(local.lat) || !Number.isFinite(local.lng)) {
      pushTextAnswer(faqResponses.noCoordinates, {
        actions: directions
          ? [{ label: 'Cómo llegar', href: directions, external: true }]
          : []
      });
      return;
    }
    if (!navigator.geolocation) {
      pushTextAnswer(faqResponses.locationUnsupported, {
        actions: directions ? [{ label: 'Cómo llegar', href: directions, external: true }] : []
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const distance = calculateDistanceKm(
          { lat: coords.latitude, lng: coords.longitude },
          local
        );
        setLocating(false);
        if (distance === null) {
          pushTextAnswer(faqResponses.locationUnavailable);
          return;
        }
        pushTextAnswer(
          `Estás a aproximadamente ${distance.toFixed(1)} km del local. La distancia se calculó aquí, en tu dispositivo.`,
          { actions: directions ? [{ label: 'Cómo llegar', href: directions, external: true }] : [] }
        );
      },
      (error) => {
        setLocating(false);
        const text = error.code === error.PERMISSION_DENIED
          ? faqResponses.locationDenied
          : faqResponses.locationUnavailable;
        pushTextAnswer(text, { actions: directions ? [{ label: 'Cómo llegar', href: directions, external: true }] : [] });
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  }

  function handleAction(action) {
    if (action.type === 'nearby') runNearby();
    if (action.type === 'nextRecommendation') {
      const last = [...messages].reverse().find((message) => message.kind === 'recommendations');
      if (!last) return;
      const offset = (last.offset || 0) + 3;
      if (offset >= last.recommendations.length) {
        pushTextAnswer('Ya te mostré las opciones que coinciden. Puedes cambiar tus gustos para probar otra búsqueda.');
        return;
      }
      const recommendation = { ...last };
      delete recommendation.id;
      appendMessages([makeMessage('assistant', 'Aquí tienes otra opción:', {
        ...recommendation,
        offset,
        actions: [
          ...(offset + 3 < last.recommendations.length ? [{ label: 'Otra opción', type: 'nextRecommendation' }] : []),
          { label: 'Cambiar mis gustos', type: 'restartRecommendation' }
        ]
      })]);
    }
    if (action.type === 'restartRecommendation') startRecommendation();
  }

  function handleContextAction() {
    if (!contextSuggestion || !data) return;
    answerQuickAction(
      contextSuggestion.action,
      contextSuggestion.label
    );
  }

  return (
    <section className={`sorbi-chat${showMinimize ? ' sorbi-chat-widget' : ' sorbi-chat-page'}`} aria-label="Conversación con Sorbi">
      <header className="sorbi-chat-header">
        <SorbiAvatar />
        <div>
          <h2>Sorbi</h2>
          <p>Asistente del sitio</p>
        </div>
        <div className="sorbi-chat-header-actions">
          <button className="sorbi-text-button" type="button" onClick={restartChat}>
            Empezar de nuevo
          </button>
          {showMinimize && (
            <button
              className="sorbi-close-button"
              type="button"
              onClick={onMinimize}
              aria-label="Minimizar conversación"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <div className="sorbi-privacy">
        Sorbi responde con información del sitio, no usa IA externa ni envía tus mensajes a ningún servicio.
        La conversación vive solo en esta pestaña y se borra al empezar de nuevo. No compartas datos personales.
        Puede equivocarse. No da consejo nutricional.
      </div>

      {contextSuggestion && (
        <div className="sorbi-context-suggestion">
          <span>En esta página:</span>
          <button
            className="assistant-chip"
            type="button"
            disabled={!data || loading || typing}
            onClick={handleContextAction}
          >
            {contextSuggestion.label}
          </button>
        </div>
      )}

      {loading && (
        <div className="sorbi-load-status" role="status" aria-live="polite">
          <p>Cargando la información pública del sitio…</p>
          <p>Si el servidor estuvo inactivo, puede tardar hasta un minuto en despertar.</p>
        </div>
      )}
      {error && (
        <div className="sorbi-load-error" role="alert">
          <p>{error}</p>
          <p>El servidor puede tardar hasta un minuto en despertar.</p>
          <button className="button button-secondary" type="button" onClick={() => load(true)}>
            Reintentar
          </button>
        </div>
      )}
      {storageWarning && <p className="sorbi-storage-warning" role="status">{storageWarning}</p>}

      <div className="sorbi-messages" aria-live="polite" aria-relevant="additions text">
        {messages.map((message) => (
          <SorbiMessage
            key={message.id}
            message={message}
            onQuickAction={answerQuickAction}
            onChoice={answerChoice}
            onAction={handleAction}
            disabled={!data || loading || typing}
          />
        ))}
        {typing && (
          <p className="sorbi-typing" role="status" aria-live="polite">
            Sorbi está escribiendo…
          </p>
        )}
        {locating && (
          <p className="sorbi-typing" role="status" aria-live="polite">
            Calculando distancia en este dispositivo…
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="sorbi-input-form" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="sorbi-chat-input">Escribe tu mensaje</label>
        <textarea
          id="sorbi-chat-input"
          ref={inputRef}
          rows="1"
          maxLength={200}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribe aquí…"
          aria-describedby="sorbi-input-help"
        />
        <button className="button button-primary" type="submit" disabled={submitting || loading || Boolean(error)}>
          Enviar
        </button>
        <span className="sorbi-input-help" id="sorbi-input-help">{input.length}/200</span>
      </form>
    </section>
  );
}

export default SorbiChat;

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';
import { apiRequest } from '../services/api.js';

const saboresPredefinidos = {
  tropical: ['mango', 'piña', 'maracuyá'],
  citrico: ['maracuyá', 'naranjilla', 'piña'],
  dulce: ['banano', 'frutilla', 'mango'],
  cacao: ['banano'],
  verde: ['piña', 'banano']
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizarNombre(valor) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

function ConstructorPage() {
  const [searchParams] = useSearchParams();
  const baseParam = searchParams.get('base') || '';
  const saborParam = searchParams.get('sabor') || '';
  const queryKey = `${baseParam}|${saborParam}`;
  const appliedQuery = useRef('');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [intentoCarga, setIntentoCarga] = useState(0);
  const [precarga, setPrecarga] = useState({
    baseParam: '',
    producto: null,
    cargando: false,
    error: ''
  });
  const [selection, setSelection] = useState({
    tamano: '',
    baseId: null,
    ingredientesIds: [],
    nombre: ''
  });
  const [avisosPrecarga, setAvisosPrecarga] = useState([]);
  const [contacto, setContacto] = useState({ nombre: '', correo: '', nota: '' });
  const [erroresContacto, setErroresContacto] = useState({});
  const [errorPedido, setErrorPedido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => {
    let solicitudVigente = true;

    async function cargarDatos() {
      setCargando(true);
      setErrorCarga('');
      try {
        const [ingredientes, reglas, locales] = await Promise.all([
          apiRequest('/ingredientes'),
          apiRequest('/reglas-constructor'),
          apiRequest('/sucursales')
        ]);
        if (!Array.isArray(ingredientes) || !Array.isArray(reglas?.tamanos)
          || !Array.isArray(locales) || locales.length !== 1
          || locales[0]?.id !== 'mall-del-sol') {
          throw new Error('El servidor devolvió datos incompletos para el constructor.');
        }
        if (solicitudVigente) setDatos({ ingredientes, reglas, local: locales[0] });
      } catch (requestError) {
        if (solicitudVigente) {
          setErrorCarga(requestError.message || 'No se pudieron cargar las opciones del constructor.');
        }
      } finally {
        if (solicitudVigente) setCargando(false);
      }
    }

    cargarDatos();
    return () => {
      solicitudVigente = false;
    };
  }, [intentoCarga]);

  useEffect(() => {
    let solicitudVigente = true;
    if (!baseParam) {
      setPrecarga({ baseParam: '', producto: null, cargando: false, error: '' });
      return () => {
        solicitudVigente = false;
      };
    }

    setPrecarga({ baseParam, producto: null, cargando: true, error: '' });
    apiRequest(`/productos/${encodeURIComponent(baseParam)}`)
      .then((producto) => {
        if (solicitudVigente) setPrecarga({ baseParam, producto, cargando: false, error: '' });
      })
      .catch((requestError) => {
        if (solicitudVigente) {
          setPrecarga({
            baseParam,
            producto: null,
            cargando: false,
            error: requestError.message || 'No se pudo cargar el producto de referencia.'
          });
        }
      });

    return () => {
      solicitudVigente = false;
    };
  }, [baseParam]);

  useEffect(() => {
    if (!datos || precarga.baseParam !== baseParam || precarga.cargando || appliedQuery.current === queryKey) {
      return;
    }
    appliedQuery.current = queryKey;

    const ingredientes = datos.ingredientes;
    const porNombre = new Map(ingredientes.map((ingrediente) => (
      [normalizarNombre(ingrediente.nombre), ingrediente]
    )));
    const agua = ingredientes.find((ingrediente) => normalizarNombre(ingrediente.nombre) === 'agua');
    let base = agua;
    const seleccionados = new Set();
    const avisos = [];

    if (baseParam && precarga.producto) {
      const ingredientesProducto = Array.isArray(precarga.producto.ingredientes)
        ? precarga.producto.ingredientes
        : [];
      const reconocidos = ingredientesProducto.map((nombre) => (
        typeof nombre === 'string' ? porNombre.get(normalizarNombre(nombre)) : undefined
      ));
      const baseProducto = reconocidos.find((ingrediente) => (
        ingrediente?.categoria === datos.reglas.categorias.base
      ));
      if (baseProducto) {
        base = baseProducto;
      } else {
        avisos.push('El producto no define una base disponible; se seleccionó agua.');
      }

      ingredientesProducto.forEach((nombre, index) => {
        const ingrediente = reconocidos[index];
        if (!ingrediente) {
          avisos.push(`Se omitió "${nombre}" porque no está disponible en el constructor.`);
        } else if (ingrediente.id !== base?.id
          && ingrediente.categoria !== datos.reglas.categorias.base) {
          seleccionados.add(ingrediente.id);
        }
      });
    } else if (baseParam && precarga.error) {
      avisos.push('No se pudo cargar el producto de referencia; se seleccionó agua.');
    }

    const sabor = saboresPredefinidos[saborParam];
    if (sabor) {
      sabor.forEach((nombre) => {
        const ingrediente = porNombre.get(normalizarNombre(nombre));
        if (ingrediente?.categoria === datos.reglas.categorias.frutas) {
          seleccionados.add(ingrediente.id);
        }
      });
    } else if (saborParam) {
      avisos.push('Ese sabor de referencia no está disponible; puedes elegir los ingredientes manualmente.');
    }

    setSelection((current) => ({
      ...current,
      tamano: datos.reglas.tamanos[0]?.id || '',
      baseId: base?.id ?? null,
      ingredientesIds: [...seleccionados]
    }));
    setAvisosPrecarga(avisos);
  }, [datos, baseParam, saborParam, precarga, queryKey]);

  const ingredientesElegidos = useMemo(() => (
    datos?.ingredientes.filter((ingrediente) => selection.ingredientesIds.includes(ingrediente.id)) || []
  ), [datos, selection.ingredientesIds]);
  const baseElegida = datos?.ingredientes.find((ingrediente) => ingrediente.id === selection.baseId);
  const tamanoElegido = datos?.reglas.tamanos.find((tamano) => tamano.id === selection.tamano);
  const erroresReglas = useMemo(() => {
    if (!datos) return [];
    const { reglas } = datos;
    const errores = [];
    const frutas = ingredientesElegidos.filter(
      (ingrediente) => ingrediente.categoria === reglas.categorias.frutas
    );
    const frutasYVerduras = ingredientesElegidos.filter((ingrediente) => (
      [reglas.categorias.frutas, reglas.categorias.verduras].includes(ingrediente.categoria)
    ));
    const extras = ingredientesElegidos.filter(
      (ingrediente) => ingrediente.categoria === reglas.categorias.extras
    );

    if (!tamanoElegido) errores.push('Selecciona un tamaño.');
    if (!baseElegida || baseElegida.categoria !== reglas.categorias.base) {
      errores.push('Selecciona una base.');
    }
    if (frutas.length < reglas.seleccion.frutasMinimas) errores.push('Elige al menos una fruta.');
    if (frutasYVerduras.length > reglas.seleccion.frutasYVerdurasMaximas) {
      errores.push(`Elige como máximo ${reglas.seleccion.frutasYVerdurasMaximas} frutas y verduras en total.`);
    }
    if (extras.length > reglas.seleccion.extrasMaximos) {
      errores.push(`Elige como máximo ${reglas.seleccion.extrasMaximos} extras.`);
    }
    return errores;
  }, [datos, ingredientesElegidos, tamanoElegido, baseElegida]);

  const precioEstimado = useMemo(() => {
    const centavos = [
      tamanoElegido?.precioBase || 0,
      baseElegida?.precioExtra || 0,
      ...ingredientesElegidos.map((ingrediente) => ingrediente.precioExtra)
    ].reduce((total, precio) => total + Math.round(precio * 100), 0);
    return centavos / 100;
  }, [tamanoElegido, baseElegida, ingredientesElegidos]);
  const alergenos = [...new Set([
    ...(baseElegida?.alergenos || []),
    ...ingredientesElegidos.flatMap((ingrediente) => ingrediente.alergenos || [])
  ])];

  function cambiarIngrediente(id) {
    setSelection((current) => ({
      ...current,
      ingredientesIds: current.ingredientesIds.includes(id)
        ? current.ingredientesIds.filter((itemId) => itemId !== id)
        : [...current.ingredientesIds, id]
    }));
    setConfirmacion(null);
  }

  function sorprender() {
    if (!datos) return;
    const escoger = (lista, maximo) => {
      const mezclados = [...lista].sort(() => Math.random() - 0.5);
      return mezclados.slice(0, Math.min(maximo, mezclados.length));
    };
    const frutas = datos.ingredientes.filter(
      (ingrediente) => ingrediente.categoria === datos.reglas.categorias.frutas
    );
    const verduras = datos.ingredientes.filter(
      (ingrediente) => ingrediente.categoria === datos.reglas.categorias.verduras
    );
    const extras = datos.ingredientes.filter(
      (ingrediente) => ingrediente.categoria === datos.reglas.categorias.extras
    );
    const frutaInicial = escoger(frutas, 1);
    const otrosVegetales = escoger(verduras, Math.max(
      0,
      datos.reglas.seleccion.frutasYVerdurasMaximas - frutaInicial.length
    ));
    const frutasAdicionales = escoger(frutas.filter(
      (ingrediente) => !frutaInicial.includes(ingrediente)
    ), Math.max(
      0,
      datos.reglas.seleccion.frutasYVerdurasMaximas - frutaInicial.length - otrosVegetales.length
    ));

    setSelection((current) => ({
      ...current,
      tamano: escoger(datos.reglas.tamanos, 1)[0]?.id || current.tamano,
      baseId: escoger(datos.ingredientes.filter(
        (ingrediente) => ingrediente.categoria === datos.reglas.categorias.base
      ), 1)[0]?.id ?? current.baseId,
      ingredientesIds: [
        ...frutaInicial,
        ...otrosVegetales,
        ...frutasAdicionales,
        ...escoger(extras, datos.reglas.seleccion.extrasMaximos)
      ].map((ingrediente) => ingrediente.id)
    }));
    setAvisosPrecarga([]);
    setConfirmacion(null);
  }

  function empezarDeNuevo() {
    setSelection({
      tamano: datos?.reglas.tamanos[0]?.id || '',
      baseId: datos?.ingredientes.find(
        (ingrediente) => normalizarNombre(ingrediente.nombre) === 'agua'
      )?.id ?? null,
      ingredientesIds: [],
      nombre: ''
    });
    setContacto({ nombre: '', correo: '', nota: '' });
    setErroresContacto({});
    setErrorPedido('');
    setAvisosPrecarga([]);
    setConfirmacion(null);
    appliedQuery.current = queryKey;
  }

  function cambiarContacto(event) {
    const { name, value } = event.target;
    setContacto((current) => ({ ...current, [name]: value }));
    setErroresContacto((current) => ({ ...current, [name]: '' }));
    setErrorPedido('');
    setConfirmacion(null);
  }

  async function guardarCreacion(event) {
    event.preventDefault();
    setErrorPedido('');
    setConfirmacion(null);
    const errores = {};
    const nombre = contacto.nombre.trim();
    const correo = contacto.correo.trim();
    const nota = contacto.nota.trim();
    if (!nombre) errores.nombre = 'Escribe tu nombre.';
    else if (nombre.length > 100) errores.nombre = 'El nombre no puede superar 100 caracteres.';
    if (!correo) errores.correo = 'Escribe tu correo.';
    else if (correo.length > 254 || !emailPattern.test(correo)) errores.correo = 'Escribe un correo válido.';
    if (nota && (nota.length < 10 || nota.length > 1000)) {
      errores.nota = 'La nota debe tener entre 10 y 1000 caracteres.';
    }
    setErroresContacto(errores);
    if (Object.keys(errores).length || erroresReglas.length) return;

    setEnviando(true);
    try {
      const result = await apiRequest('/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo: correo.toLowerCase(),
          tipo: 'pedido',
          mensaje: nota || 'Interés en retirar una creación personalizada en el Mall del Sol.',
          creacion: {
            ...(selection.nombre.trim() ? { nombre: selection.nombre.trim() } : {}),
            tamano: selection.tamano,
            baseId: selection.baseId,
            ingredientesIds: selection.ingredientesIds
          }
        })
      });
      if (typeof result?.codigo !== 'string' || !Number.isFinite(result.precioCalculado)) {
        throw new Error('El servidor no devolvió el código y el precio calculado esperados.');
      }
      setConfirmacion(result);
      setErroresContacto({});
    } catch (requestError) {
      if (requestError.status === 400 && requestError.data?.errores) {
        setErrorPedido(Object.values(requestError.data.errores).join(' '));
      } else if (requestError.status === 429) {
        setErrorPedido(requestError.message);
      } else if (requestError.status === 503) {
        setErrorPedido('El servicio no puede guardar tu creación ahora. Intenta más tarde.');
      } else {
        setErrorPedido(requestError.message || 'No pudimos registrar tu interés. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  const capas = [baseElegida, ...ingredientesElegidos].filter(Boolean);

  return (
    <section className="container page-content constructor-page">
      <SectionTitle
        eyebrow="A tu manera"
        title="Crea tu smoothie"
        description="Elige el tamaño y los ingredientes; puedes revisar el resumen antes de registrar tu interés."
        level="h1"
      />
      {cargando && <p role="status">Cargando opciones del constructor...</p>}
      <p className="constructor-server-note">
        Si el servidor estuvo inactivo, puede tardar hasta un minuto en despertar.
      </p>
      <p className="constructor-sample-note">
        Los ingredientes, las combinaciones y los precios son ejemplos académicos.
      </p>
      {errorCarga && (
        <div className="constructor-error" role="alert">
          <p>{errorCarga}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setIntentoCarga((intento) => intento + 1)}
          >
            Reintentar
          </button>
        </div>
      )}
      {!cargando && datos && (
        <>
          {avisosPrecarga.length > 0 && (
            <ul className="constructor-notices" role="status">
              {avisosPrecarga.map((aviso) => <li key={aviso}>{aviso}</li>)}
            </ul>
          )}
          {precarga.error && baseParam && (
            <p className="constructor-notice">
              No se pudo obtener el producto de referencia. Puedes continuar con agua o volver a
              <Link to="/smoothies"> Favoritos</Link>.
            </p>
          )}
          <div className="constructor-layout">
            <div className="constructor-options">
              <section className="constructor-step" aria-labelledby="size-title">
                <h2 id="size-title">1. Elige el tamaño</h2>
                <div className="constructor-choice-grid">
                  {datos.reglas.tamanos.map((tamano) => (
                    <label className="constructor-choice" key={tamano.id}>
                      <input
                        type="radio"
                        name="tamano"
                        value={tamano.id}
                        checked={selection.tamano === tamano.id}
                        onChange={() => {
                          setSelection((current) => ({ ...current, tamano: tamano.id }));
                          setConfirmacion(null);
                        }}
                      />
                      <span>{tamano.nombre} · {formatPrice(tamano.precioBase)}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="constructor-step" aria-labelledby="base-title">
                <h2 id="base-title">2. Elige una base</h2>
                <div className="constructor-choice-grid">
                  {datos.ingredientes.filter(
                    (ingrediente) => ingrediente.categoria === datos.reglas.categorias.base
                  ).map((ingrediente) => (
                    <label className="constructor-choice" key={ingrediente.id}>
                      <input
                        type="radio"
                        name="base"
                        checked={selection.baseId === ingrediente.id}
                        onChange={() => {
                          setSelection((current) => ({ ...current, baseId: ingrediente.id }));
                          setConfirmacion(null);
                        }}
                      />
                      <span>{ingrediente.nombre} · +{formatPrice(ingrediente.precioExtra)}</span>
                    </label>
                  ))}
                </div>
              </section>

              {[
                { categoria: datos.reglas.categorias.frutas, titulo: '3. Elige frutas' },
                { categoria: datos.reglas.categorias.verduras, titulo: 'Verduras' },
                { categoria: datos.reglas.categorias.extras, titulo: '4. Elige extras' }
              ].map(({ categoria, titulo }) => (
                <section className="constructor-step" key={categoria} aria-label={titulo}>
                  <h2>{titulo}</h2>
                  <div className="constructor-choice-grid">
                    {datos.ingredientes.filter((ingrediente) => ingrediente.categoria === categoria)
                      .map((ingrediente) => (
                        <label className="constructor-choice" key={ingrediente.id}>
                          <input
                            type="checkbox"
                            checked={selection.ingredientesIds.includes(ingrediente.id)}
                            onChange={() => cambiarIngrediente(ingrediente.id)}
                          />
                          <span>{ingrediente.nombre} · +{formatPrice(ingrediente.precioExtra)}</span>
                        </label>
                      ))}
                  </div>
                </section>
              ))}

              <div className="constructor-name-field">
                <label htmlFor="creation-name">5. Ponle un nombre (opcional)</label>
                <input
                  id="creation-name"
                  name="nombre"
                  type="text"
                  maxLength={40}
                  value={selection.nombre}
                  onChange={(event) => {
                    setSelection((current) => ({ ...current, nombre: event.target.value }));
                    setConfirmacion(null);
                  }}
                />
              </div>
              <div className="constructor-actions">
                <button className="button button-secondary" type="button" onClick={sorprender}>
                  Sorpréndeme
                </button>
                <button className="button button-secondary" type="button" onClick={empezarDeNuevo}>
                  Empezar de nuevo
                </button>
              </div>
            </div>

            <aside className="card constructor-summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Tu resumen</h2>
              <svg
                className="constructor-glass"
                viewBox="0 0 160 220"
                role="img"
                aria-labelledby="glass-title glass-description"
              >
                <title id="glass-title">Vaso de smoothie</title>
                <desc id="glass-description">Ilustración con capas del color de los ingredientes elegidos.</desc>
                <defs>
                  <clipPath id="smoothie-glass-clip">
                    <path d="M43 48 H117 L106 191 Q80 203 54 191 Z" />
                  </clipPath>
                </defs>
                <path className="constructor-straw" d="M91 50 L109 12" />
                <g clipPath="url(#smoothie-glass-clip)">
                  {capas.map((ingrediente, index) => (
                    <rect
                      key={ingrediente.id}
                      x="35"
                      y={190 - ((index + 1) * 142) / capas.length}
                      width="90"
                      height={142 / capas.length + 1}
                      fill={/^#[0-9a-f]{6}$/i.test(ingrediente.color) ? ingrediente.color : '#f7dce7'}
                    />
                  ))}
                </g>
                <path className="constructor-glass-outline" d="M43 48 H117 L106 191 Q80 203 54 191 Z" />
                <path className="constructor-glass-rim" d="M39 48 H121" />
                <path className="constructor-glass-smile" d="M70 123 Q80 134 90 123" />
                <circle cx="69" cy="111" r="2.5" fill="currentColor" />
                <circle cx="91" cy="111" r="2.5" fill="currentColor" />
              </svg>
              <p><strong>Tamaño:</strong> {tamanoElegido?.nombre || 'Por elegir'}</p>
              <p><strong>Base:</strong> {baseElegida?.nombre || 'Por elegir'}</p>
              <p><strong>Ingredientes:</strong> {ingredientesElegidos.map((item) => item.nombre).join(', ') || 'Elige al menos una fruta'}</p>
              {selection.nombre.trim() && <p><strong>Nombre:</strong> {selection.nombre.trim()}</p>}
              <p className="constructor-total" aria-live="polite">
                <strong>Precio de ejemplo:</strong> {formatPrice(precioEstimado)}
              </p>
              {erroresReglas.length > 0 && (
                <ul className="constructor-rule-errors" role="alert">
                  {erroresReglas.map((error) => <li key={error}>{error}</li>)}
                </ul>
              )}
              {alergenos.length > 0 && (
                <div className="constructor-allergens" role="status">
                  <p><strong>Contiene:</strong> {alergenos.join(', ')}</p>
                  <p>Revisa los ingredientes si tienes alergias.</p>
                </div>
              )}
            </aside>
          </div>

          <section className="constructor-order" aria-labelledby="order-title">
            <h2 id="order-title">Guardar mi creación y pedirla para retirar</h2>
            <p className="constructor-simulation">
              Simulación académica: todavía no abrimos el local en el Mall del Sol; tu creación queda registrada como interés.
              {datos.local.estado === 'planificada' && ' El local está planificado.'}
            </p>
            <p>
              Si registras tu interés, el retiro sería en el Mall del Sol. No pedimos teléfono ni más datos
              de los necesarios para esta simulación.
            </p>
            <form className="constructor-order-form card" onSubmit={guardarCreacion} noValidate>
              <div className="constructor-form-field">
                <label htmlFor="order-name">Tu nombre</label>
                <input
                  id="order-name"
                  name="nombre"
                  type="text"
                  maxLength={100}
                  autoComplete="name"
                  value={contacto.nombre}
                  aria-invalid={Boolean(erroresContacto.nombre)}
                  aria-describedby={erroresContacto.nombre ? 'order-name-error' : undefined}
                  onChange={cambiarContacto}
                  required
                />
                {erroresContacto.nombre && <span className="field-error" id="order-name-error">{erroresContacto.nombre}</span>}
              </div>
              <div className="constructor-form-field">
                <label htmlFor="order-email">Correo</label>
                <input
                  id="order-email"
                  name="correo"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={contacto.correo}
                  aria-invalid={Boolean(erroresContacto.correo)}
                  aria-describedby={erroresContacto.correo ? 'order-email-error' : undefined}
                  onChange={cambiarContacto}
                  required
                />
                {erroresContacto.correo && <span className="field-error" id="order-email-error">{erroresContacto.correo}</span>}
              </div>
              <div className="constructor-form-field">
                <label htmlFor="order-note">Nota opcional</label>
                <textarea
                  id="order-note"
                  name="nota"
                  rows="3"
                  maxLength={1000}
                  value={contacto.nota}
                  aria-invalid={Boolean(erroresContacto.nota)}
                  aria-describedby={erroresContacto.nota
                    ? 'order-note-help order-note-error'
                    : 'order-note-help'}
                  onChange={cambiarContacto}
                />
                <span id="order-note-help">No escribas datos personales en la nota.</span>
                {erroresContacto.nota && (
                  <span className="field-error" id="order-note-error">{erroresContacto.nota}</span>
                )}
              </div>
              {errorPedido && <p className="constructor-error" role="alert">{errorPedido}</p>}
              <button
                className="button button-primary"
                type="submit"
                disabled={enviando || erroresReglas.length > 0}
              >
                {enviando ? 'Registrando interés...' : 'Guardar mi creación y pedirla para retirar'}
              </button>
            </form>
            {confirmacion && (
              <div className="constructor-confirmation" role="status">
                <h3>Tu interés quedó registrado</h3>
                <p><strong>Código de retiro:</strong> {confirmacion.codigo}</p>
                <p><strong>Precio calculado por el servidor:</strong> {formatPrice(confirmacion.precioCalculado)}</p>
                <p><strong>Local:</strong> {confirmacion.sucursal?.nombre || 'Mall del Sol'}</p>
                {confirmacion.sucursal?.estado === 'planificada' && (
                  <p>El local está planificado; todavía no está abierto.</p>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default ConstructorPage;

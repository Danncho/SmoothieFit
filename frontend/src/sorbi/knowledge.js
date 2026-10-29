export const ingredientLabels = {
  agua: ['ligero'],
  banano: ['tropical', 'dulce', 'cremoso', 'contundente'],
  cacao: ['dulce', 'cremoso', 'cacao', 'contundente'],
  frutilla: ['dulce', 'ligero'],
  hierbaluisa: ['verde', 'ligero'],
  leche: ['cremoso'],
  mango: ['tropical', 'dulce'],
  maracuya: ['tropical', 'citrico'],
  miel: ['dulce'],
  mora: ['dulce'],
  naranjilla: ['tropical', 'citrico'],
  avena: ['cremoso', 'contundente'],
  pepino: ['verde', 'ligero'],
  pina: ['tropical', 'ligero'],
  espinaca: ['verde'],
  yogur: ['cremoso'],
  linaza: ['contundente']
};

export const ingredientSynonyms = {
  chia: ['chía'],
  maracuya: ['maracuyá', 'parchita'],
  pina: ['piña'],
  frutilla: ['fresa']
};

export const tasteOptions = [
  { id: 'dulce', label: 'Dulce', synonyms: ['dulce', 'dulse', 'azucarado'] },
  { id: 'citrico', label: 'Cítrico', synonyms: ['citrico', 'acido', 'citrus'] },
  { id: 'tropical', label: 'Tropical', synonyms: ['tropical', 'trobical', 'tropikal'] },
  { id: 'cacao', label: 'Con cacao', synonyms: ['cacao', 'chocolate'] },
  { id: 'verde', label: 'Verde', synonyms: ['verde', 'vegetal'] },
  { id: 'surprise', label: 'Sorpréndeme', synonyms: ['sorprendeme', 'sorpresa', 'cualquiera'] }
];

export const momentOptions = [
  {
    id: 'beforeTraining',
    label: 'Antes de entrenar',
    synonyms: ['antes de entrenar', 'antes del gym', 'pre entrenar', 'pre entrenamiento'],
    preferredLabels: ['ligero']
  },
  {
    id: 'afterTraining',
    label: 'Después de entrenar',
    synonyms: ['despues de entrenar', 'despues del gym', 'post entrenar', 'post entrenamiento'],
    preferredLabels: ['cremoso', 'contundente']
  },
  {
    id: 'snack',
    label: 'Merienda',
    synonyms: ['merienda', 'media tarde', 'snack'],
    preferredLabels: ['dulce', 'cremoso']
  },
  {
    id: 'breakfast',
    label: 'Desayuno',
    synonyms: ['desayuno', 'desayunar', 'por la manana'],
    preferredLabels: ['contundente']
  }
];

export const intentSynonyms = {
  greeting: ['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'buenas noches'],
  thanks: ['gracias', 'muchas gracias', 'te agradezco'],
  goodbye: ['chao', 'adios', 'hasta luego', 'nos vemos'],
  recommend: ['recomiendame', 'recomendar', 'recomendacion', 'sugiere', 'quiero elegir', 'algo'],
  constructor: ['armar', 'preparar', 'crear', 'construir', 'personalizar', 'crea tu smoothie'],
  location: ['donde', 'ubicacion', 'como llegar', 'direccion', 'queda', 'local', 'sucursal', 'mall del sol', 'cerca de mi'],
  otherLocations: [
    'otra ubicacion', 'otras ubicaciones', 'otro local', 'otros locales',
    'otra sucursal', 'otras sucursales', 'otro lugar', 'otros lugares',
    'en otro lugar', 'en otra parte', 'fuera del mall', 'mas lugares',
    'donde mas', 'otro punto', 'otra ciudad', 'otras ciudades'
  ],
  favorites: ['favoritos', 'favorito', 'mas votado', 'mas votados', 'popular'],
  ingredients: ['ingredientes', 'alergenos', 'alergia', 'contiene', 'lleva', 'que tiene'],
  colleges: ['colegio', 'colegios', 'escuela', 'escuelas', 'actividad escolar'],
  contact: ['hablar con una persona', 'hablar con alguien', 'persona', 'contacto', 'ayuda'],
  producers: ['productor local', 'productores locales', 'ingredientes locales', 'proveedor local'],
  prices: ['precio', 'precios', 'cuanto cuesta', 'cuanto vale'],
  hours: ['horario', 'horarios', 'a que hora', 'cuando abren'],
  ordering: ['pedir', 'pedido', 'comprar', 'retiro', 'retirar', 'como pido']
};

export const healthTerms = [
  'adelgaza', 'bajar de peso', 'perder peso', 'proteina', 'calorias', 'vitaminas',
  'saludable', 'dieta', 'nutricion', 'nutricional', 'rendimiento', 'desintoxica'
];

export const avoidanceTerms = [
  'sin', 'no', 'evitar', 'evitando', 'no quiero', 'no le pongas', 'no incluir', 'excepto'
];

export const faqResponses = {
  greeting: '¡Hola! Puedo recomendarte una mezcla, contarte sobre el local o ayudarte a armar tu smoothie.',
  thanks: '¡Con gusto! Si necesitas algo más, aquí estoy.',
  goodbye: '¡Hasta luego! Puedes volver cuando quieras.',
  fallback: 'No estoy segura de haber entendido. Prueba con una de estas opciones o dime qué sabor buscas.',
  health: 'No doy consejos ni información nutricional confirmada. Puedo ayudarte a explorar sabores e ingredientes; para orientación sobre salud, consulta a un profesional.',
  allergens: 'Puedo mostrar los alérgenos declarados, pero no asegurar que un producto sea apto para ti. Revisa sus ingredientes y consulta a un profesional si tienes una alergia.',
  producers: 'Trabajar con productores locales está en evaluación; todavía no hay acuerdos confirmados.',
  hoursUnknown: 'El horario del local está por confirmar. Puedes pedir que te avisemos cuando abra.',
  noLocal: 'No pude cargar la ficha del local ahora. Intenta de nuevo en un momento.',
  localPlanned: 'Todavía no abrimos: es la ubicación que estamos planificando.',
  localUpcoming: 'El local figura como próximo, pero la fecha de apertura está por confirmar.',
  localOpen: 'El local figura como abierto.',
  locationPermission: 'Tu ubicación se usa solo en este dispositivo para calcular una distancia aproximada; no se envía ni se guarda.',
  locationDenied: 'No se pudo consultar la ubicación. Revisa el permiso del navegador si quieres intentarlo de nuevo.',
  locationUnavailable: 'El navegador no pudo obtener una ubicación. Puedes intentarlo de nuevo o abrir Cómo llegar.',
  locationUnsupported: 'Este navegador no permite consultar la ubicación. Puedes abrir Cómo llegar.',
  noCoordinates: 'Todavía no podemos calcular la distancia porque faltan las coordenadas del local. Puedes usar Cómo llegar al Mall del Sol.',
  privateData: 'Por privacidad, no escribas correos ni teléfonos en el chat. No procesé ese mensaje; puedes usar Contacto si necesitas comunicarte.',
  tooLong: 'El mensaje no puede superar los 200 caracteres. Puedes resumirlo e intentarlo de nuevo.',
  empty: 'Escribe una pregunta o elige una de las opciones para empezar.',
  prices: 'Los precios que aparecen en el catálogo son ejemplos académicos, no precios comerciales confirmados.',
  ordering: 'Puedes armar una creación en Crea tu smoothie. El registro es una simulación académica hasta que abra el local; el retiro planificado sería en el Mall del Sol. También puedes escribirnos desde Contacto.',
  colleges: 'La propuesta para colegios está en desarrollo. Si quieres conversar sobre una actividad, puedes escribirnos.',
  otherLocations: 'Por ahora solo hay un local planificado en el Mall del Sol. El crecimiento dependerá de los resultados del piloto.'
};

export const quickActions = [
  { id: 'recommend', label: 'Recomiéndame algo' },
  { id: 'constructor', label: 'Armar mi smoothie' },
  { id: 'location', label: 'Dónde estamos y cómo llegar' },
  { id: 'favorites', label: 'Favoritos del público' },
  { id: 'ingredients', label: 'Ingredientes y alérgenos' },
  { id: 'colleges', label: 'Colegios' },
  { id: 'contact', label: 'Hablar con una persona' }
];

export const contextualSuggestions = {
  '/smoothies': { label: '¿Te ayudo a elegir?', action: 'recommend' },
  '/sucursales': { label: '¿Quieres saber cómo llegar?', action: 'location' },
  '/crea-tu-smoothie': { label: '¿Te sorprendo con una mezcla?', action: 'recommend' }
};

export const recommendationQuestions = {
  moment: {
    prompt: '¿Para qué momento la buscas?',
    options: momentOptions.map(({ id, label }) => ({ id, label }))
  },
  taste: {
    prompt: '¿Qué sabor prefieres?',
    options: tasteOptions.map(({ id, label }) => ({ id, label }))
  },
  avoid: {
    prompt: '¿Hay algún ingrediente que quieras evitar? Puedes elegir más de uno y luego pulsar Usar selección.',
    noneLabel: 'Ninguno'
  }
};

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssistantReply,
  calculateDistanceKm,
  containsPersonalData,
  detectIntents,
  extractPreferences,
  getInputIssue,
  getDirectionsUrl,
  normalizeText,
  scoreProducts
} from './engine.js';

const products = [
  {
    id: 1,
    nombre: 'Mango Claro',
    ingredientes: ['mango', 'piña'],
    votos: 2,
    precio: 3
  },
  {
    id: 2,
    nombre: 'Mango Alegre',
    ingredientes: ['mango', 'banano'],
    votos: 5,
    precio: 3
  },
  {
    id: 3,
    nombre: 'Cacao Mora',
    ingredientes: ['mora', 'cacao', 'avena'],
    votos: 7,
    precio: 3
  }
];

const ingredients = [
  { id: 1, nombre: 'Leche', categoria: 'base', alergenos: ['lácteos'] },
  { id: 2, nombre: 'Mango', categoria: 'frutas', alergenos: [] },
  { id: 3, nombre: 'Cacao', categoria: 'extras', alergenos: [] }
];

test('normaliza tildes, mayúsculas y signos', () => {
  assert.equal(normalizeText('¿DÓNDE está Sorbí? ¡Qué alegría!'), 'donde esta sorbi que alegria');
});

test('tolera errores sencillos y extrae varios gustos de una consulta', () => {
  const message = 'kiero algo dulse trobical';
  const intents = detectIntents(message);
  const preferences = extractPreferences(message, ingredients);
  assert.ok(intents.includes('recommend'));
  assert.deepEqual(preferences.tastes, ['dulce', 'tropical']);
  assert.equal(preferences.tasteSpecified, true);
});

test('detecta la pregunta sobre cómo llegar al local del Mall del Sol', () => {
  assert.ok(detectIntents('donde queda el local del mall del sol').includes('location'));
});

test('detecta varias intenciones en el mismo mensaje', () => {
  const intents = detectIntents('¿Dónde queda el local? Recomiéndame algo dulce para después del gym.', ingredients);
  assert.ok(intents.includes('location'));
  assert.ok(intents.includes('recommend'));
});

test('responde honestamente si se pregunta por otra ubicación', () => {
  const reply = buildAssistantReply('¿Hay otro local?', {
    products,
    local: { id: 'mall-del-sol', estado: 'planificada', destinoMapa: 'Mall del Sol, Guayaquil' },
    ingredients
  });
  assert.ok(reply.intents.includes('otherLocations'));
  assert.ok(reply.responses.some((response) => (
    /Por ahora solo hay un local planificado en el Mall del Sol/.test(response.text)
  )));
});

test('puntúa sabores y desempata por votos y luego por nombre', () => {
  const ranked = scoreProducts(products, { tastes: ['tropical'], moment: null, avoidIngredients: [] });
  assert.deepEqual(ranked.map(({ product }) => product.id), [2, 1]);
  const alphabetical = scoreProducts([
    { ...products[0], nombre: 'Zeta', votos: 0 },
    { ...products[1], nombre: 'Alfa', votos: 0 }
  ], { tastes: ['tropical'], moment: null, avoidIngredients: [] });
  assert.deepEqual(alphabetical.map(({ product }) => product.nombre), ['Alfa', 'Zeta']);
});

test('excluye productos que incluyen un ingrediente a evitar', () => {
  const ranked = scoreProducts(products, {
    tastes: ['dulce'],
    moment: null,
    avoidIngredients: [ingredients[1]]
  });
  assert.ok(ranked.every(({ product }) => !product.ingredientes.includes('mango')));
});

test('calcula la distancia Haversine entre dos puntos conocidos', () => {
  const distance = calculateDistanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
  assert.ok(Math.abs(distance - 111.195) < 0.1);
});

test('rechaza calcular distancia si al local le faltan coordenadas', () => {
  assert.equal(calculateDistanceKm({ lat: -2, lng: -79 }, { lat: null, lng: null }), null);
});

test('acepta dirección al Mall cuando aún no hay coordenadas', () => {
  const local = { destinoMapa: 'Mall del Sol, Guayaquil', lat: null, lng: null };
  assert.equal(
    getDirectionsUrl(local),
    'https://www.google.com/maps/dir/?api=1&destination=Mall%20del%20Sol%2C%20Guayaquil'
  );
  const reply = buildAssistantReply('donde queda el local', {
    products,
    local: { ...local, estado: 'planificada', direccion: 'Mall del Sol', horario: null },
    ingredients
  });
  assert.match(reply.responses[0].text, /ubicación se usa solo en este dispositivo/i);
  assert.doesNotMatch(reply.responses[0].text, /Horario:/);
  assert.ok(reply.responses[0].actions.some((action) => (
    action.label === 'Cómo llegar' && action.href === getDirectionsUrl(local)
  )));
});

test('identifica entradas vacías, símbolos, exceso de longitud y HTML sin procesarlo como marcado', () => {
  assert.equal(getInputIssue(''), 'empty');
  assert.equal(getInputIssue('?!  --'), 'empty');
  assert.equal(getInputIssue('x'.repeat(201)), 'tooLong');
  const html = '<img src=x onerror=alert(1)>';
  assert.equal(getInputIssue(html), '');
  assert.deepEqual(detectIntents(html), []);
});

test('responde las preguntas de salud sin hacer promesas nutricionales', () => {
  const reply = buildAssistantReply('¿adelgaza?', { products, local: null, ingredients });
  assert.ok(reply.intents.includes('health'));
  assert.match(reply.responses[0].text, /No doy consejos ni información nutricional confirmada/);
});

test('reconoce el sinónimo de ingrediente de catálogo', () => {
  assert.ok(detectIntents('quiero evitar parchita', [
    { id: 6, nombre: 'Maracuyá', categoria: 'frutas', alergenos: [] }
  ]).includes('avoidIngredient'));
  assert.deepEqual(extractPreferences('sin fresa', [
    { id: 8, nombre: 'Frutilla', categoria: 'frutas' }
  ]).avoidIngredients.map((item) => item.nombre), ['Frutilla']);
});

test('detecta y bloquea un correo antes de procesar el mensaje', () => {
  assert.equal(containsPersonalData('mi correo es persona@example.com'), true);
  assert.equal(getInputIssue('mi correo es persona@example.com'), 'privateData');
});

test('detecta un número telefónico en un mensaje', () => {
  assert.equal(containsPersonalData('llámame al +593 99 123 4567'), true);
  assert.equal(getInputIssue('llámame al +593 99 123 4567'), 'privateData');
});

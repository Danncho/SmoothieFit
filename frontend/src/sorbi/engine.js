import {
  avoidanceTerms,
  faqResponses,
  healthTerms,
  ingredientLabels,
  ingredientSynonyms,
  intentSynonyms,
  momentOptions,
  quickActions,
  tasteOptions
} from './knowledge.js';
import { votosDelProducto } from '../utils/productRanking.js';

const EARTH_RADIUS_KM = 6371;

export function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function maxEditDistance(word) {
  if (word.length >= 7) return 2;
  if (word.length >= 4) return 1;
  return 0;
}

function withinEditDistance(left, right, limit) {
  if (left === right) return true;
  if (!limit || Math.abs(left.length - right.length) > limit) return false;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + cost
      );
      rowMinimum = Math.min(rowMinimum, current[column]);
    }
    if (rowMinimum > limit) return false;
    previous = current;
  }
  return previous[right.length] <= limit;
}

function tokenMatches(token, candidate) {
  const limit = Math.max(maxEditDistance(token), maxEditDistance(candidate));
  return withinEditDistance(token, candidate, limit);
}

function hasTerm(text, terms) {
  if (!text) return false;
  const normalizedTerms = terms.map(normalizeText).filter(Boolean);
  const words = text.split(' ');

  return normalizedTerms.some((term) => {
    if (text.includes(term)) return true;
    const termWords = term.split(' ');
    if (termWords.length === 1) return words.some((word) => tokenMatches(word, term));
    return words.some((word, index) => (
      index + termWords.length <= words.length
      && termWords.every((termWord, termIndex) => tokenMatches(words[index + termIndex], termWord))
    ));
  });
}

function normalizedIngredientNames(ingredients = []) {
  return ingredients.flatMap((ingredient) => {
    if (typeof ingredient?.nombre !== 'string') return [];
    const name = normalizeText(ingredient.nombre);
    return [name, ...(ingredientSynonyms[name] || []).map(normalizeText)];
  });
}

export function containsPersonalData(message) {
  if (typeof message !== 'string') return false;
  const email = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/iu.test(message);
  const digits = message.replace(/\D/g, '');
  const phone = digits.length >= 8 && /(?:\+?\d[\d\s().-]{6,}\d)/u.test(message);
  return email || phone;
}

export function getInputIssue(message) {
  if (typeof message !== 'string' || normalizeText(message) === '') return 'empty';
  if (message.length > 200) return 'tooLong';
  if (containsPersonalData(message)) return 'privateData';
  return '';
}

export function detectIntents(message, ingredients = []) {
  const text = normalizeText(message);
  if (!text) return [];

  const intents = Object.entries(intentSynonyms)
    .filter(([, terms]) => hasTerm(text, terms))
    .map(([intent]) => intent);
  const tastes = tasteOptions.filter((option) => (
    option.id !== 'surprise' && hasTerm(text, option.synonyms)
  ));
  const moments = momentOptions.filter((option) => hasTerm(text, option.synonyms));
  if (hasTerm(text, healthTerms)) intents.push('health');
  if (tastes.length || moments.length) intents.push('recommend');

  const names = normalizedIngredientNames(ingredients);
  const mentionsIngredient = names.some((name) => hasTerm(text, [name]));
  if (mentionsIngredient && hasTerm(text, avoidanceTerms)) intents.push('avoidIngredient');

  return [...new Set(intents)];
}

export function extractPreferences(message, ingredients = []) {
  const text = normalizeText(message);
  const tastes = tasteOptions
    .filter((option) => hasTerm(text, option.synonyms))
    .map((option) => option.id);
  const moment = momentOptions.find((option) => hasTerm(text, option.synonyms))?.id || null;
  const avoidSpecified = hasTerm(text, ['ninguno', 'ninguna', 'nada']) && hasTerm(text, avoidanceTerms);
  const shouldAvoidIngredients = hasTerm(text, avoidanceTerms);
  const avoidIngredients = shouldAvoidIngredients
    ? ingredients.filter((ingredient) => (
      normalizedIngredientNames([ingredient]).some((name) => hasTerm(text, [name]))
    ))
    : [];
  return {
    tastes: tastes.includes('surprise') ? [] : tastes,
    tasteSpecified: tastes.length > 0,
    moment,
    avoidIngredients: avoidSpecified ? [] : avoidIngredients,
    avoidSpecified: avoidSpecified || (shouldAvoidIngredients && avoidIngredients.length > 0)
  };
}

function normalizeForLabels(value) {
  return normalizeText(value).replace(/\s/g, '');
}

function productIngredientLabels(product) {
  return new Set((Array.isArray(product.ingredientes) ? product.ingredientes : [])
    .flatMap((name) => ingredientLabels[normalizeForLabels(name)] || []));
}

export function scoreProducts(products, preferences = {}) {
  const tastes = Array.isArray(preferences.tastes) ? preferences.tastes : [];
  const avoidNames = (preferences.avoidIngredients || []).map((item) => (
    normalizeText(typeof item === 'string' ? item : item?.nombre)
  )).filter(Boolean);
  const moment = momentOptions.find((option) => option.id === preferences.moment);
  const momentLabels = moment?.preferredLabels || [];

  return products
    .map((product) => {
      const productIngredients = (Array.isArray(product.ingredientes) ? product.ingredientes : [])
        .map(normalizeText);
      if (avoidNames.some((avoid) => productIngredients.includes(avoid))) return null;

      const labels = productIngredientLabels(product);
      const tasteMatches = tastes.filter((taste) => labels.has(taste));
      const momentMatches = momentLabels.filter((label) => labels.has(label));
      const score = tasteMatches.length * 3 + momentMatches.length * 2;
      if (score === 0) return null;

      return {
        product,
        score,
        tasteMatches,
        momentMatches
      };
    })
    .filter(Boolean)
    .sort((left, right) => (
      right.score - left.score
      || votosDelProducto(right.product) - votosDelProducto(left.product)
      || (left.product.nombre || '').localeCompare(right.product.nombre || '', 'es', { sensitivity: 'base' })
    ));
}

export function calculateDistanceKm(origin, local) {
  if (!origin || !local
    || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)
    || !Number.isFinite(local.lat) || !Number.isFinite(local.lng)
    || Math.abs(origin.lat) > 90 || Math.abs(local.lat) > 90
    || Math.abs(origin.lng) > 180 || Math.abs(local.lng) > 180) {
    return null;
  }

  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDifference = radians(local.lat - origin.lat);
  const longitudeDifference = radians(local.lng - origin.lng);
  const a = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(radians(origin.lat))
    * Math.cos(radians(local.lat))
    * Math.sin(longitudeDifference / 2) ** 2;
  const bounded = Math.min(1, Math.max(0, a));
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(bounded), Math.sqrt(1 - bounded));
}

export function getDirectionsUrl(local) {
  if (Number.isFinite(local?.lat) && Number.isFinite(local?.lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`;
  }
  if (local?.destinoMapa) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(local.destinoMapa)}`;
  }
  return null;
}

function localResponse(local) {
  if (!local) return { text: faqResponses.noLocal };
  return {
    text: faqResponses.locationPermission,
    local,
    actions: [
      ...(getDirectionsUrl(local) ? [{ label: 'Cómo llegar', href: getDirectionsUrl(local), external: true }] : []),
      { label: 'Avísame cuando abra', to: '/contacto?tipo=consulta' },
      { label: 'Cerca de mí', type: 'nearby' }
    ]
  };
}

function favoritesResponse(products) {
  const ranked = [...products].sort((a, b) => (
    votosDelProducto(b) - votosDelProducto(a)
    || (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
  ));
  if (!ranked.length || ranked.every((product) => votosDelProducto(product) === 0)) {
    return { text: 'Todavía no hay favoritos del público: los productos aún no tienen votos.' };
  }
  return {
    text: 'Estos son los productos con más votos del catálogo:',
    recommendations: ranked.filter((product) => votosDelProducto(product) > 0).slice(0, 3)
      .map((product) => ({ product, reason: `${votosDelProducto(product)} votos del público.` }))
  };
}

function ingredientResponse(ingredients) {
  return {
    text: faqResponses.allergens,
    ingredients: ingredients.map(({ nombre, categoria, alergenos = [] }) => ({
      nombre,
      categoria,
      alergenos: Array.isArray(alergenos) ? alergenos : []
    }))
  };
}

function pricesResponse(products) {
  const examples = products
    .filter((product) => Number.isFinite(Number(product.precio)))
    .map((product) => (
      `${product.nombre}: ${new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(product.precio))}`
    ));
  return {
    text: `${faqResponses.prices}${examples.length ? ` ${examples.join('; ')}.` : ''}`
  };
}

export function buildAssistantReply(message, data) {
  const intents = detectIntents(message, data.ingredients);
  const responses = [];
  let shouldRecommend = intents.includes('recommend');

  if (!intents.length) {
    return {
      intents,
      responses: [{ text: faqResponses.fallback, quickActions }],
      shouldRecommend: false
    };
  }

  if (intents.includes('health')) {
    responses.push({ text: faqResponses.health });
  }
  if (intents.includes('greeting')) responses.push({ text: faqResponses.greeting });
  if (intents.includes('location')) responses.push(localResponse(data.local));
  if (intents.includes('favorites')) responses.push(favoritesResponse(data.products));
  if (intents.includes('ingredients')) responses.push(ingredientResponse(data.ingredients));
  if (intents.includes('colleges')) {
    responses.push({
      text: faqResponses.colleges,
      actions: [{ label: 'Consultar por colegios', to: '/contacto?tipo=colegio' }]
    });
  }
  if (intents.includes('contact')) {
    responses.push({
      text: 'Puedes comunicarte con el equipo desde el formulario de Contacto.',
      actions: [{ label: 'Ir a Contacto', to: '/contacto' }]
    });
  }
  if (intents.includes('producers')) responses.push({ text: faqResponses.producers });
  if (intents.includes('prices')) responses.push(pricesResponse(data.products));
  if (intents.includes('hours')) {
    responses.push(data.local?.horario
      ? { text: `El horario informado es: ${data.local.horario}.` }
      : {
        text: faqResponses.hoursUnknown,
        actions: [{ label: 'Avísame cuando abra', to: '/contacto?tipo=consulta' }]
      });
  }
  if (intents.includes('ordering')) {
    responses.push({
      text: faqResponses.ordering,
      actions: [
        { label: 'Crea tu smoothie', to: '/crea-tu-smoothie' },
        { label: 'Ir a Contacto', to: '/contacto' }
      ]
    });
  }
  if (intents.includes('otherLocations')) {
    responses.push({ text: faqResponses.otherLocations });
  }
  if (intents.includes('constructor')) {
    responses.push({
      text: 'Puedes elegir tamaño, base y otros ingredientes en el constructor. Es una simulación académica mientras el local siga planificado.',
      actions: [{ label: 'Armar mi smoothie', to: '/crea-tu-smoothie' }]
    });
  }
  if (intents.includes('thanks')) responses.push({ text: faqResponses.thanks });
  if (intents.includes('goodbye')) responses.push({ text: faqResponses.goodbye });

  if (shouldRecommend) {
    return {
      intents,
      responses,
      shouldRecommend: true,
      preferences: extractPreferences(message, data.ingredients)
    };
  }

  if (intents.includes('avoidIngredient')) {
    responses.push({
      text: 'Anoté el ingrediente que quieres evitar para la recomendación. Revisemos también los ingredientes declarados antes de elegir.'
    });
    shouldRecommend = true;
  }
  if (intents.length && responses.length === 0) {
    responses.push({ text: faqResponses.fallback });
  }
  return { intents, responses, shouldRecommend };
}

export function recommendationReason(result) {
  const matchingLabels = [...result.tasteMatches, ...result.momentMatches];
  const ingredientNames = Array.isArray(result.product.ingredientes)
    ? result.product.ingredientes.join(', ')
    : '';
  if (!matchingLabels.length) return `Te la sugiero por sus ingredientes: ${ingredientNames}.`;
  return `Coincide con los sabores ${matchingLabels.join(', ')}; lleva ${ingredientNames}.`;
}

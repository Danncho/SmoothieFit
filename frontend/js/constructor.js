const builderStatus = document.querySelector('#builder-status');
const builderContent = document.querySelector('#builder-content');
const builderForm = document.querySelector('#builder-form');
const sizeOptions = document.querySelector('#size-options');
const baseOptions = document.querySelector('#base-options');
const fruitOptions = document.querySelector('#fruit-options');
const vegetableOptions = document.querySelector('#vegetable-options');
const extrasOptions = document.querySelector('#extras-options');
const selectedIngredientsList = document.querySelector('#selected-ingredients');
const builderWarnings = document.querySelector('#builder-warnings');
const builderPrice = document.querySelector('#builder-price');
const allergenNotice = document.querySelector('#allergen-notice');
const smoothieGlass = document.querySelector('#smoothie-glass');
const glassLayers = document.querySelector('#glass-layers');
const creationName = document.querySelector('#creation-name');
const addToOrderButton = document.querySelector('#add-to-order-button');
const cartMessage = document.querySelector('#cart-message');
const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD'
});
const cartStorageKey = 'smoothiefitCart';

let ingredients = [];
let constructorRules = null;

function mostrarEstado(message, isError = false) {
  builderStatus.textContent = message;
  builderStatus.classList.toggle('catalog-error', isError);
}

async function cargarIngredientes() {
  try {
    const [ingredientsResponse, rulesResponse] = await Promise.all([
      fetch('/api/ingredientes'),
      fetch('/api/reglas-constructor')
    ]);

    if (!ingredientsResponse.ok || !rulesResponse.ok) {
      throw new Error('El servidor no pudo cargar las opciones del constructor.');
    }

    const loadedIngredients = await ingredientsResponse.json();
    const loadedRules = await rulesResponse.json();

    if (!Array.isArray(loadedIngredients) || !Array.isArray(loadedRules.tamanos)) {
      throw new Error('El servidor devolvió datos incompletos para el constructor.');
    }

    ingredients = loadedIngredients;
    constructorRules = loadedRules;
    crearOpciones();
    mostrarReglas();
    builderContent.hidden = false;
    builderStatus.hidden = true;
    actualizarResumen();
  } catch (error) {
    console.error('Error al cargar el constructor:', error);
    mostrarEstado('No pudimos cargar los ingredientes. Intenta de nuevo más tarde.', true);
  }
}

function crearOpcion(ingredient, type) {
  const label = document.createElement('label');
  label.className = 'builder-option';

  const input = document.createElement('input');
  input.type = type;
  input.name = ingredient.categoria;
  input.value = String(ingredient.id);
  input.dataset.category = ingredient.categoria;
  input.dataset.color = ingredient.color;
  input.setAttribute('aria-label', `${ingredient.nombre}, ${currencyFormatter.format(ingredient.precioExtra)} extra`);
  input.addEventListener('change', actualizarClasesSeleccion);

  const color = document.createElement('span');
  color.className = 'ingredient-swatch';
  color.style.setProperty('--ingredient-color', ingredient.color);
  color.setAttribute('aria-hidden', 'true');

  const name = document.createElement('span');
  name.className = 'builder-option-name';
  name.textContent = ingredient.nombre;

  const price = document.createElement('span');
  price.className = 'builder-option-price';
  price.textContent = ingredient.precioExtra > 0
    ? `+${currencyFormatter.format(ingredient.precioExtra)}`
    : 'Incluida';

  label.append(input, color, name, price);
  return label;
}

function crearOpciones() {
  const { categorias } = constructorRules;
  const baseItems = ingredients.filter((ingredient) => ingredient.categoria === categorias.base);
  const fruitItems = ingredients.filter((ingredient) => ingredient.categoria === categorias.frutas);
  const vegetableItems = ingredients.filter((ingredient) => ingredient.categoria === categorias.verduras);
  const extraItems = ingredients.filter((ingredient) => categorias.extras.includes(ingredient.categoria));

  constructorRules.tamanos.forEach((size, index) => {
    const label = document.createElement('label');
    label.className = 'builder-size-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'tamano';
    input.value = size.id;
    input.checked = index === 0;
    input.addEventListener('change', actualizarClasesSeleccion);

    const sizeName = document.createElement('span');
    sizeName.textContent = size.nombre;

    const sizePrice = document.createElement('span');
    sizePrice.textContent = currencyFormatter.format(size.precioBase);

    label.append(input, sizeName, sizePrice);
    sizeOptions.append(label);
  });

  baseItems.forEach((ingredient) => baseOptions.append(crearOpcion(ingredient, 'radio')));
  fruitItems.forEach((ingredient) => fruitOptions.append(crearOpcion(ingredient, 'checkbox')));
  vegetableItems.forEach((ingredient) => vegetableOptions.append(crearOpcion(ingredient, 'checkbox')));
  extraItems.forEach((ingredient) => extrasOptions.append(crearOpcion(ingredient, 'checkbox')));
  actualizarClasesSeleccion();
}

function actualizarClasesSeleccion() {
  builderForm.querySelectorAll('.builder-option, .builder-size-option').forEach((label) => {
    const input = label.querySelector('input');
    label.classList.toggle('is-selected', input.checked);
  });
}

function mostrarReglas() {
  const { seleccion } = constructorRules;
  document.querySelector('#produce-hint').textContent =
    `Elige al menos ${seleccion.frutasMinimas} fruta y hasta ${seleccion.frutasYVerdurasMaximas} frutas y verduras en total.`;
  document.querySelector('#extras-hint').textContent =
    `Puedes elegir hasta ${seleccion.semillasYExtrasMaximos} semillas o extras.`;
}

function obtenerSeleccion() {
  const selectedBaseId = builderForm.querySelector('input[name="base"]:checked')?.value;
  const selectedIngredientIds = [...builderForm.querySelectorAll('input[data-category]:checked')]
    .map((input) => Number(input.value));

  return ingredients.filter((ingredient) => (
    ingredient.id === Number(selectedBaseId) || selectedIngredientIds.includes(ingredient.id)
  ));
}

function validarSeleccion() {
  const selected = obtenerSeleccion();
  const { categorias, seleccion: limits, tamanos } = constructorRules;
  const bases = selected.filter((item) => item.categoria === categorias.base);
  const fruits = selected.filter((item) => item.categoria === categorias.frutas);
  const produce = selected.filter((item) => (
    item.categoria === categorias.frutas || item.categoria === categorias.verduras
  ));
  const extras = selected.filter((item) => categorias.extras.includes(item.categoria));
  const selectedSize = builderForm.querySelector('input[name="tamano"]:checked')?.value;
  const selectedName = creationName.value.trim();
  const warnings = [];

  if (bases.length !== limits.basesExactas) {
    warnings.push('Elige una base.');
  }
  if (fruits.length < limits.frutasMinimas) {
    warnings.push(`Elige al menos ${limits.frutasMinimas} fruta.`);
  }
  if (produce.length > limits.frutasYVerdurasMaximas) {
    warnings.push(`Elige máximo ${limits.frutasYVerdurasMaximas} frutas y verduras en total.`);
  }
  if (extras.length > limits.semillasYExtrasMaximos) {
    warnings.push(`Elige máximo ${limits.semillasYExtrasMaximos} semillas o extras.`);
  }
  if (!tamanos.some((size) => size.id === selectedSize)) {
    warnings.push('Elige un tamaño.');
  }
  if (!selectedName) {
    warnings.push('Escribe un nombre para tu creación.');
  }

  return { selected, warnings, selectedSize };
}

function calcularPrecio(selected, selectedSize) {
  const size = constructorRules.tamanos.find((item) => item.id === selectedSize);
  const basePrice = size ? size.precioBase : 0;
  const extrasPrice = selected.reduce((total, ingredient) => total + ingredient.precioExtra, 0);
  return Math.round((basePrice + extrasPrice) * 100) / 100;
}

function dibujarVaso(selected) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const cupHeight = 170;
  const bottomY = 216;
  glassLayers.replaceChildren();

  if (selected.length > 0) {
    const layerHeight = cupHeight / selected.length;

    selected.forEach((ingredient, index) => {
      const layer = document.createElementNS(svgNamespace, 'rect');
      layer.setAttribute('x', '25');
      layer.setAttribute('width', '150');
      layer.setAttribute('height', String(layerHeight + 1));
      layer.setAttribute('y', String(bottomY - (index + 1) * layerHeight));
      layer.setAttribute('fill', ingredient.color);
      layer.classList.add('glass-layer');
      glassLayers.append(layer);
    });
  }

  smoothieGlass.setAttribute(
    'aria-label',
    selected.length
      ? `Vaso con capas de ${selected.map((item) => item.nombre).join(', ')}`
      : 'Vaso vacío'
  );
}

function mostrarIngredientes(selected) {
  if (selected.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Aún no has elegido ingredientes.';
    selectedIngredientsList.replaceChildren(emptyItem);
    return;
  }

  const items = selected.map((ingredient) => {
    const item = document.createElement('li');
    item.textContent = `${ingredient.nombre} (${currencyFormatter.format(ingredient.precioExtra)} extra)`;
    return item;
  });
  selectedIngredientsList.replaceChildren(...items);
}

function mostrarAvisos(selected, warnings) {
  const warningItems = warnings.map((warning) => {
    const item = document.createElement('li');
    item.textContent = warning;
    return item;
  });
  builderWarnings.replaceChildren(...warningItems);

  const allergens = [...new Set(selected.flatMap((ingredient) => ingredient.alergenos))];
  allergenNotice.textContent = allergens.length
    ? `Contiene: ${allergens.join(', ')}.`
    : 'No has elegido ingredientes con alérgenos declarados.';
}

function actualizarResumen() {
  const { selected, warnings, selectedSize } = validarSeleccion();
  const price = calcularPrecio(selected, selectedSize);

  mostrarIngredientes(selected);
  mostrarAvisos(selected, warnings);
  dibujarVaso(selected);
  builderPrice.textContent = `Precio: ${currencyFormatter.format(price)}`;
  addToOrderButton.disabled = warnings.length > 0;
}

function seleccionarAlAzar(items, amount) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, amount);
}

function sorprenderme() {
  const { categorias, seleccion: limits, tamanos } = constructorRules;
  const fruits = ingredients.filter((item) => item.categoria === categorias.frutas);
  const produce = ingredients.filter((item) => (
    item.categoria === categorias.frutas || item.categoria === categorias.verduras
  ));
  const extras = ingredients.filter((item) => categorias.extras.includes(item.categoria));
  const bases = ingredients.filter((item) => item.categoria === categorias.base);

  builderForm.querySelectorAll('input[data-category]').forEach((input) => {
    input.checked = false;
  });

  const chosenFruit = seleccionarAlAzar(fruits, limits.frutasMinimas);
  const remainingProduce = produce.filter((item) => !chosenFruit.includes(item));
  const produceAmount = limits.frutasMinimas + Math.floor(
    Math.random() * Math.max(1, limits.frutasYVerdurasMaximas - limits.frutasMinimas + 1)
  );
  const chosenProduce = [...chosenFruit, ...seleccionarAlAzar(
    remainingProduce,
    Math.min(produceAmount - chosenFruit.length, remainingProduce.length)
  )];
  const extrasAmount = Math.floor(Math.random() * (limits.semillasYExtrasMaximos + 1));
  const chosenExtras = seleccionarAlAzar(extras, Math.min(extrasAmount, extras.length));
  const chosenIds = new Set([...chosenProduce, ...chosenExtras].map((item) => item.id));

  builderForm.querySelectorAll('input[data-category]').forEach((input) => {
    input.checked = chosenIds.has(Number(input.value));
  });

  const base = seleccionarAlAzar(bases, limits.basesExactas)[0];
  const baseInput = builderForm.querySelector(`input[name="${categorias.base}"][value="${base.id}"]`);
  if (baseInput) {
    baseInput.checked = true;
  }

  const size = seleccionarAlAzar(tamanos, 1)[0];
  builderForm.querySelector(`input[name="tamano"][value="${size.id}"]`).checked = true;
  creationName.value = 'Mezcla sorpresa';
  actualizarClasesSeleccion();
  cartMessage.textContent = '';
  actualizarResumen();
}

function agregarAlPedido() {
  const { selected, warnings, selectedSize } = validarSeleccion();

  if (warnings.length > 0) {
    actualizarResumen();
    return;
  }

  const size = constructorRules.tamanos.find((item) => item.id === selectedSize);
  const creation = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nombre: creationName.value.trim(),
    ingredientes: selected.map((ingredient) => ({
      id: ingredient.id,
      nombre: ingredient.nombre,
      categoria: ingredient.categoria
    })),
    tamano: { id: size.id, nombre: size.nombre },
    precio: calcularPrecio(selected, selectedSize),
    cantidad: 1
  };

  try {
    const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    if (!Array.isArray(savedCart)) {
      throw new Error('El carrito guardado no tiene el formato esperado.');
    }

    savedCart.push(creation);
    localStorage.setItem(cartStorageKey, JSON.stringify(savedCart));
    cartMessage.classList.remove('catalog-error');
    cartMessage.textContent = `${creation.nombre} se agregó a tu pedido.`;
  } catch (error) {
    console.error('Error al guardar en el carrito:', error);
    cartMessage.classList.add('catalog-error');
    cartMessage.textContent = 'No pudimos guardar tu creación en el carrito.';
  }
}

builderForm.addEventListener('change', actualizarResumen);
creationName.addEventListener('input', actualizarResumen);
document.querySelector('#surprise-button').addEventListener('click', sorprenderme);
addToOrderButton.addEventListener('click', agregarAlPedido);

cargarIngredientes();

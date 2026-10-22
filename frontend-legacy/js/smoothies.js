const catalogList = document.querySelector('#smoothies-list');
const categoryFilter = document.querySelector('#category-filter');
const catalogStatus = document.querySelector('#catalog-status');
let catalogProducts = [];

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function crearTarjeta(producto) {
  const card = document.createElement('article');
  card.className = 'card smoothie-card';

  const image = document.createElement('div');
  image.className = 'smoothie-art';
  image.setAttribute('role', 'img');
  image.setAttribute('aria-label', `Ilustración de ${producto.nombre}`);
  image.textContent = producto.imagen;

  const info = document.createElement('div');
  info.className = 'smoothie-info';

  const title = document.createElement('h2');
  title.textContent = producto.nombre;

  const description = document.createElement('p');
  description.textContent = producto.descripcion;

  const ingredients = document.createElement('p');
  ingredients.className = 'smoothie-ingredients';
  ingredients.textContent = `Ingredientes: ${producto.ingredientes.join(', ')}`;

  const category = document.createElement('p');
  category.className = 'smoothie-category';
  category.textContent = producto.categoria;

  const price = document.createElement('p');
  price.className = 'smoothie-price';
  price.textContent = priceFormatter.format(producto.precio);

  const sample = document.createElement('p');
  sample.className = 'sample-label';
  sample.textContent = producto.esEjemplo ? 'Producto de ejemplo' : 'Producto';

  info.append(title, description, ingredients, category, price, sample);
  card.append(image, info);

  return card;
}

function mostrarProductos() {
  const categoriaElegida = categoryFilter.value;
  const productosFiltrados = catalogProducts.filter((producto) => (
    !categoriaElegida || producto.categoria === categoriaElegida
  ));

  catalogList.replaceChildren(...productosFiltrados.map(crearTarjeta));
  catalogStatus.textContent = productosFiltrados.length
    ? `${productosFiltrados.length} smoothies disponibles.`
    : 'No hay smoothies en esta categoría.';
}

function cargarCategorias() {
  const categorias = [...new Set(catalogProducts.map((producto) => producto.categoria))];

  categorias.forEach((categoria) => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    categoryFilter.append(option);
  });
}

async function cargarProductos() {
  try {
    const response = await fetch('/api/productos');

    if (!response.ok) {
      throw new Error('No se pudo cargar el catálogo.');
    }

    catalogProducts = await response.json();
    cargarCategorias();
    mostrarProductos();
  } catch (error) {
    console.error('Error al cargar catálogo:', error);
    catalogStatus.textContent = 'No pudimos cargar los smoothies. Intenta de nuevo más tarde.';
    catalogStatus.classList.add('catalog-error');
  }
}

categoryFilter.addEventListener('change', mostrarProductos);
cargarProductos();

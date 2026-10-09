const featuredList = document.querySelector('#featured-smoothies');
const featuredStatus = document.querySelector('#featured-status');
const featuredPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function crearSmoothieDestacado(producto) {
  const card = document.createElement('article');
  card.className = 'card smoothie-card';

  const illustration = document.createElement('div');
  illustration.className = 'smoothie-art';
  illustration.setAttribute('role', 'img');
  illustration.setAttribute('aria-label', `Ilustración de ${producto.nombre}`);
  illustration.textContent = producto.imagen;

  const info = document.createElement('div');
  info.className = 'smoothie-info';

  const title = document.createElement('h3');
  title.textContent = producto.nombre;

  const description = document.createElement('p');
  description.textContent = producto.descripcion;

  const price = document.createElement('p');
  price.className = 'smoothie-price';
  price.textContent = featuredPrice.format(producto.precio);

  const sample = document.createElement('p');
  sample.className = 'sample-label';
  sample.textContent = producto.esEjemplo ? 'Producto de ejemplo' : 'Producto';

  info.append(title, description, price, sample);
  card.append(illustration, info);
  return card;
}

async function cargarDestacados() {
  try {
    const response = await fetch('/api/productos');

    if (!response.ok) {
      throw new Error('No se pudieron cargar los smoothies destacados.');
    }

    const productos = await response.json();
    const destacados = productos.slice(0, 3);

    featuredList.replaceChildren(...destacados.map(crearSmoothieDestacado));
    featuredStatus.textContent = destacados.length
      ? 'Ideas de ejemplo del catálogo.'
      : 'Pronto tendremos smoothies para mostrar.';
  } catch (error) {
    console.error('Error al cargar smoothies destacados:', error);
    featuredStatus.textContent = 'No pudimos cargar los smoothies. Visita el catálogo para intentarlo de nuevo.';
    featuredStatus.classList.add('catalog-error');
  }
}

cargarDestacados();

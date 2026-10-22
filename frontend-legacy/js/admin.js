const loginSection = document.querySelector('#admin-login');
const dashboard = document.querySelector('#admin-dashboard');
const loginForm = document.querySelector('#login-form');
const keyInput = document.querySelector('#admin-key');
const loginMessage = document.querySelector('#login-message');
const adminMessage = document.querySelector('#admin-message');
const productForm = document.querySelector('#product-form');
const tableBody = document.querySelector('#products-table-body');
const formTitle = document.querySelector('#product-form-title');
const saveButton = document.querySelector('#save-product-button');
const cancelEditButton = document.querySelector('#cancel-edit-button');
const logoutButton = document.querySelector('#logout-button');
const fieldNames = ['nombre', 'categoria', 'descripcion', 'ingredientes', 'precio', 'imagen'];
let editingId = null;

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('catalog-error', isError);
}

function mostrarInicioSesion(message = '') {
  dashboard.hidden = true;
  loginSection.hidden = false;
  keyInput.value = '';
  setMessage(loginMessage, message, Boolean(message));
  keyInput.focus();
}

function mostrarPanel() {
  loginSection.hidden = true;
  dashboard.hidden = false;
  setMessage(loginMessage, '');
  cargarProductos();
}

function cerrarSesion(message = '') {
  sessionStorage.removeItem('smoothiefitAdminKey');
  limpiarFormulario();
  tableBody.replaceChildren();
  setMessage(adminMessage, '');
  mostrarInicioSesion(message);
}

async function solicitar(url, options = {}) {
  const adminKey = sessionStorage.getItem('smoothiefitAdminKey');
  const headers = new Headers(options.headers || {});

  if (adminKey) {
    headers.set('x-admin-key', adminKey);
  }
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (response.status === 401) {
    cerrarSesion('Clave incorrecta. Ingresa la clave de nuevo.');
    throw new Error('Clave incorrecta.');
  }

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo completar la operación.');
  }

  return data;
}

function limpiarErrores() {
  fieldNames.forEach((fieldName) => {
    document.querySelector(`#error-${fieldName}`).textContent = '';
    document.querySelector(`[name="${fieldName}"]`).removeAttribute('aria-invalid');
  });
}

function validarFormulario() {
  limpiarErrores();
  let valido = true;

  fieldNames.forEach((fieldName) => {
    const input = productForm.elements[fieldName];
    const value = input.value.trim();
    let error = '';

    if (!value) {
      error = 'Este campo es obligatorio.';
    } else if (fieldName === 'nombre' && value.length > 80) {
      error = 'Usa hasta 80 caracteres.';
    } else if (fieldName === 'categoria' && value.length > 50) {
      error = 'Usa hasta 50 caracteres.';
    } else if (fieldName === 'descripcion' && value.length > 250) {
      error = 'Usa hasta 250 caracteres.';
    } else if (fieldName === 'imagen' && value.length > 200) {
      error = 'Usa hasta 200 caracteres.';
    } else if (fieldName === 'ingredientes') {
      const ingredientes = value.split(',').map((ingredient) => ingredient.trim());
      if (ingredientes.length > 10 || ingredientes.some((ingredient) => !ingredient || ingredient.length > 40)) {
        error = 'Escribe de 1 a 10 ingredientes de hasta 40 caracteres, separados por comas.';
      }
    } else if (fieldName === 'precio' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
      error = 'El precio debe ser un número mayor que 0.';
    }

    if (error) {
      document.querySelector(`#error-${fieldName}`).textContent = error;
      input.setAttribute('aria-invalid', 'true');
      valido = false;
    }
  });

  return valido;
}

function crearCelda(value) {
  const cell = document.createElement('td');
  cell.textContent = value;
  return cell;
}

function crearFila(product) {
  const row = document.createElement('tr');
  row.append(
    crearCelda(product.nombre),
    crearCelda(product.categoria),
    crearCelda(`$${Number(product.precio).toFixed(2)}`),
    crearCelda(product.ingredientes.join(', '))
  );

  const actions = document.createElement('td');
  actions.className = 'admin-row-actions';

  const editButton = document.createElement('button');
  editButton.className = 'button button-secondary';
  editButton.type = 'button';
  editButton.textContent = 'Editar';
  editButton.addEventListener('click', () => iniciarEdicion(product));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'button button-danger';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Eliminar';
  deleteButton.addEventListener('click', () => eliminarProducto(product));

  actions.append(editButton, deleteButton);
  row.append(actions);
  return row;
}

async function cargarProductos() {
  try {
    const products = await solicitar('/api/productos');
    tableBody.replaceChildren(...products.map(crearFila));
    setMessage(adminMessage, `${products.length} productos cargados.`);
  } catch (error) {
    if (sessionStorage.getItem('smoothiefitAdminKey')) {
      setMessage(adminMessage, error.message, true);
    }
  }
}

function iniciarEdicion(product) {
  editingId = product.id;
  productForm.elements.nombre.value = product.nombre;
  productForm.elements.categoria.value = product.categoria;
  productForm.elements.descripcion.value = product.descripcion;
  productForm.elements.ingredientes.value = product.ingredientes.join(', ');
  productForm.elements.precio.value = product.precio;
  productForm.elements.imagen.value = product.imagen;
  formTitle.textContent = 'Editar producto';
  saveButton.textContent = 'Guardar cambios';
  cancelEditButton.hidden = false;
  limpiarErrores();
  productForm.elements.nombre.focus();
}

function limpiarFormulario() {
  editingId = null;
  productForm.reset();
  limpiarErrores();
  formTitle.textContent = 'Agregar un producto';
  saveButton.textContent = 'Guardar producto';
  cancelEditButton.hidden = true;
}

async function guardarProducto(event) {
  event.preventDefault();
  setMessage(adminMessage, '');

  if (!validarFormulario()) {
    setMessage(adminMessage, 'Revisa los campos marcados.', true);
    return;
  }

  const formData = new FormData(productForm);
  const product = {
    nombre: formData.get('nombre').trim(),
    categoria: formData.get('categoria').trim(),
    descripcion: formData.get('descripcion').trim(),
    ingredientes: formData.get('ingredientes').split(',').map((ingredient) => ingredient.trim()),
    precio: Number(formData.get('precio')),
    imagen: formData.get('imagen').trim()
  };

  try {
    const isEditing = editingId !== null;
    const result = await solicitar(
      isEditing ? `/api/productos/${encodeURIComponent(editingId)}` : '/api/productos',
      {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(product)
      }
    );

    limpiarFormulario();
    setMessage(adminMessage, result.mensaje);
    await cargarProductos();
    setMessage(adminMessage, result.mensaje);
  } catch (error) {
    if (sessionStorage.getItem('smoothiefitAdminKey')) {
      setMessage(adminMessage, error.message, true);
    }
  }
}

async function eliminarProducto(product) {
  if (!window.confirm(`¿Seguro que quieres eliminar "${product.nombre}"?`)) {
    return;
  }

  try {
    const result = await solicitar(`/api/productos/${encodeURIComponent(product.id)}`, {
      method: 'DELETE'
    });
    setMessage(adminMessage, result.mensaje);
    await cargarProductos();
    setMessage(adminMessage, result.mensaje);
  } catch (error) {
    if (sessionStorage.getItem('smoothiefitAdminKey')) {
      setMessage(adminMessage, error.message, true);
    }
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const key = keyInput.value.trim();

  if (!key) {
    document.querySelector('#login-key-error').textContent = 'Ingresa la clave de administrador.';
    keyInput.setAttribute('aria-invalid', 'true');
    return;
  }

  document.querySelector('#login-key-error').textContent = '';
  keyInput.removeAttribute('aria-invalid');
  sessionStorage.setItem('smoothiefitAdminKey', key);
  mostrarPanel();
});

productForm.addEventListener('submit', guardarProducto);
cancelEditButton.addEventListener('click', limpiarFormulario);
logoutButton.addEventListener('click', () => cerrarSesion(''));

if (sessionStorage.getItem('smoothiefitAdminKey')) {
  mostrarPanel();
}

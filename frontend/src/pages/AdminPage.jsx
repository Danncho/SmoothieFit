import { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedRequest } from '../services/api.js';

const initialProduct = {
  nombre: '',
  descripcion: '',
  ingredientes: '',
  precio: '',
  imagen: '',
  categoria: ''
};

const statuses = ['nueva', 'atendida', 'descartada'];

function validateProduct(form) {
  const errors = {};
  const limits = { nombre: 80, descripcion: 250, imagen: 200, categoria: 50 };

  for (const [field, maximum] of Object.entries(limits)) {
    const value = form[field].trim();
    if (!value) {
      errors[field] = 'Este campo es obligatorio.';
    } else if (value.length > maximum) {
      errors[field] = `No puede superar ${maximum} caracteres.`;
    }
  }

  const ingredients = form.ingredientes.split(',').map((ingredient) => ingredient.trim());
  if (ingredients.length === 0 || ingredients.some((ingredient) => !ingredient)) {
    errors.ingredientes = 'Escribe al menos un ingrediente, separado por comas.';
  } else if (ingredients.length > 10 || ingredients.some((ingredient) => ingredient.length > 40)) {
    errors.ingredientes = 'Usa de 1 a 10 ingredientes de hasta 40 caracteres cada uno.';
  }

  const price = Number(form.precio);
  if (!form.precio.trim() || !Number.isFinite(price) || price <= 0) {
    errors.precio = 'El precio debe ser un número mayor que 0.';
  }

  return errors;
}

function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [productForm, setProductForm] = useState(initialProduct);
  const [productErrors, setProductErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [productMessage, setProductMessage] = useState('');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError('');
    try {
      const result = await authenticatedRequest('/productos');
      setProducts(result);
    } catch (error) {
      setProductsError(error.message || 'No se pudieron cargar los productos.');
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadRequests() {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const query = new URLSearchParams({ limite: '100' });
      if (statusFilter) query.set('estado', statusFilter);
      const result = await authenticatedRequest(`/solicitudes?${query.toString()}`);
      setRequests(result);
    } catch (error) {
      setRequestsError(error.message || 'No se pudieron cargar las solicitudes.');
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  function changeProductField(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
    setProductErrors((current) => ({ ...current, [name]: '' }));
    setProductMessage('');
  }

  function clearProductForm() {
    setProductForm(initialProduct);
    setProductErrors({});
    setEditingId(null);
  }

  function editProduct(product) {
    setEditingId(product.id);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      ingredientes: product.ingredientes.join(', '),
      precio: String(product.precio),
      imagen: product.imagen,
      categoria: product.categoria
    });
    setProductErrors({});
    setProductMessage('');
    document.getElementById('admin-product-name')?.focus();
  }

  async function saveProduct(event) {
    event.preventDefault();
    const validationErrors = validateProduct(productForm);
    setProductErrors(validationErrors);
    setProductMessage('');
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      nombre: productForm.nombre.trim(),
      descripcion: productForm.descripcion.trim(),
      ingredientes: productForm.ingredientes.split(',').map((ingredient) => ingredient.trim()),
      precio: Number(productForm.precio),
      imagen: productForm.imagen.trim(),
      categoria: productForm.categoria.trim()
    };

    setBusy(true);
    try {
      const path = editingId ? `/productos/${editingId}` : '/productos';
      const result = await authenticatedRequest(path, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setProductMessage(result.mensaje);
      clearProductForm();
      await loadProducts();
    } catch (error) {
      const serverErrors = error.data?.errores;
      setProductMessage(error.message || 'No se pudo guardar el producto.');
      if (Array.isArray(serverErrors)) {
        setProductErrors({ formulario: serverErrors.join(' ') });
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`¿Eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setBusy(true);
    setProductMessage('');
    try {
      const result = await authenticatedRequest(`/productos/${product.id}`, { method: 'DELETE' });
      setProductMessage(result.mensaje);
      if (editingId === product.id) clearProductForm();
      await loadProducts();
    } catch (error) {
      setProductMessage(error.message || 'No se pudo eliminar el producto.');
    } finally {
      setBusy(false);
    }
  }

  async function changeRequestStatus(id, estado) {
    setBusy(true);
    setRequestMessage('');
    try {
      const result = await authenticatedRequest(`/solicitudes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
      });
      setRequests((current) => current.map((request) => (
        request.id === id ? result.solicitud : request
      )).filter((request) => !statusFilter || request.estado === statusFilter));
      setRequestMessage('Estado de la solicitud actualizado.');
    } catch (error) {
      setRequestMessage(error.message || 'No se pudo actualizar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  function handleTabKeyDown(event) {
    const tabNames = ['productos', 'solicitudes'];
    const currentIndex = tabNames.indexOf(activeTab);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabNames.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabNames.length) % tabNames.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabNames.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = tabNames[nextIndex];
    setActiveTab(nextTab);
    document.getElementById(nextTab === 'productos' ? 'tab-products' : 'tab-requests')?.focus();
  }

  return (
    <section className="container page-content admin-page">
      <div className="admin-heading">
        <div>
          <SectionTitle
            eyebrow="Panel de control"
            title="Administración"
            description={`Sesión iniciada como ${user?.correo || 'administrador'}.`}
            level="h1"
          />
        </div>
        <button className="button button-secondary" type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Secciones de administración">
        <button
          id="tab-products"
          type="button"
          role="tab"
          aria-selected={activeTab === 'productos'}
          aria-controls="panel-products"
          tabIndex={activeTab === 'productos' ? 0 : -1}
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab('productos')}
        >
          Productos
        </button>
        <button
          id="tab-requests"
          type="button"
          role="tab"
          aria-selected={activeTab === 'solicitudes'}
          aria-controls="panel-requests"
          tabIndex={activeTab === 'solicitudes' ? 0 : -1}
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab('solicitudes')}
        >
          Solicitudes
        </button>
      </div>

      {activeTab === 'productos' ? (
        <section id="panel-products" role="tabpanel" aria-labelledby="tab-products">
          <div className="card admin-form-card">
            <h2>{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
            <form className="admin-product-form" onSubmit={saveProduct} noValidate>
              {productMessage && <p className="form-status" role="status">{productMessage}</p>}
              {productErrors.formulario && <p className="form-error" role="alert">{productErrors.formulario}</p>}
              {Object.keys(productErrors).some((field) => field !== 'formulario' && productErrors[field]) && (
                <p className="form-error" role="alert">Corrige los campos señalados antes de guardar.</p>
              )}
              <div className="admin-form-grid">
                <ProductField
                  id="admin-product-name"
                  name="nombre"
                  label="Nombre"
                  value={productForm.nombre}
                  error={productErrors.nombre}
                  maxLength={80}
                  onChange={changeProductField}
                />
                <ProductField
                  name="categoria"
                  label="Categoría"
                  value={productForm.categoria}
                  error={productErrors.categoria}
                  maxLength={50}
                  onChange={changeProductField}
                />
                <ProductField
                  name="descripcion"
                  label="Descripción"
                  value={productForm.descripcion}
                  error={productErrors.descripcion}
                  maxLength={250}
                  wide
                  onChange={changeProductField}
                />
                <ProductField
                  name="ingredientes"
                  label="Ingredientes (separados por coma)"
                  value={productForm.ingredientes}
                  error={productErrors.ingredientes}
                  wide
                  onChange={changeProductField}
                />
                <ProductField
                  name="precio"
                  label="Precio (USD)"
                  value={productForm.precio}
                  error={productErrors.precio}
                  type="number"
                  onChange={changeProductField}
                />
                <ProductField
                  name="imagen"
                  label="Emoji o URL de imagen"
                  value={productForm.imagen}
                  error={productErrors.imagen}
                  maxLength={200}
                  onChange={changeProductField}
                />
              </div>
              <div className="admin-form-actions">
                <button className="button button-primary" type="submit" disabled={busy}>
                  {busy ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
                </button>
                {editingId && (
                  <button className="button button-secondary" type="button" onClick={clearProductForm}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </div>

          <section className="admin-products-section" aria-labelledby="admin-products-title">
            <h2 id="admin-products-title">Productos actuales</h2>
            {productsLoading ? (
              <p className="admin-status" role="status">Cargando productos...</p>
            ) : productsError ? (
              <div className="admin-error" role="alert">
                <p>{productsError}</p>
                <button className="button button-secondary" type="button" onClick={loadProducts}>Reintentar</button>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Nombre</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Precio</th>
                      <th scope="col">Ingredientes</th>
                      <th scope="col">Origen</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <th scope="row">{product.nombre}</th>
                        <td>{product.categoria}</td>
                        <td>${Number(product.precio).toFixed(2)}</td>
                        <td>{product.ingredientes.join(', ')}</td>
                        <td>{product.esEjemplo ? 'Ejemplo' : 'Registrado'}</td>
                        <td className="admin-row-actions">
                          <button className="button button-secondary" type="button" onClick={() => editProduct(product)}>
                            Editar
                          </button>
                          <button
                            className="button button-danger"
                            type="button"
                            disabled={busy}
                            onClick={() => deleteProduct(product)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && <p>No hay productos para mostrar.</p>}
              </div>
            )}
          </section>
        </section>
      ) : (
        <section id="panel-requests" role="tabpanel" aria-labelledby="tab-requests">
          <div className="admin-request-toolbar">
            <label htmlFor="request-status-filter">Filtrar por estado</label>
            <select
              id="request-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Todos</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          {requestMessage && <p className="form-status" role="status">{requestMessage}</p>}
          {requestsLoading ? (
            <p className="admin-status" role="status">Cargando solicitudes...</p>
          ) : requestsError ? (
            <div className="admin-error" role="alert">
              <p>{requestsError}</p>
              <button className="button button-secondary" type="button" onClick={loadRequests}>Reintentar</button>
            </div>
          ) : requests.length === 0 ? (
            <p>No hay solicitudes para este filtro.</p>
          ) : (
            <div className="admin-request-list">
              {requests.map((request) => (
                <article className="card admin-request-card" key={request.id}>
                  <div className="admin-request-heading">
                    <h2>{request.nombre}</h2>
                    <time dateTime={request.fechaCreacion}>
                      {new Date(request.fechaCreacion).toLocaleString()}
                    </time>
                  </div>
                  <p><strong>Correo:</strong> {request.correo}</p>
                  <p><strong>Tipo:</strong> {request.tipo}</p>
                  {request.organizacion && <p><strong>Organización:</strong> {request.organizacion}</p>}
                  <p className="admin-request-message"><strong>Mensaje:</strong> {request.mensaje}</p>
                  <div className="admin-request-state">
                    <label htmlFor={`request-state-${request.id}`}>Estado</label>
                    <select
                      id={`request-state-${request.id}`}
                      value={request.estado}
                      disabled={busy}
                      onChange={(event) => changeRequestStatus(request.id, event.target.value)}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

function ProductField({
  id,
  name,
  label,
  value,
  error,
  maxLength,
  type = 'text',
  wide = false,
  onChange
}) {
  const fieldId = id || `admin-product-${name}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`form-field${wide ? ' form-field-wide' : ''}`}>
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        maxLength={maxLength}
        min={type === 'number' ? '0.01' : undefined}
        step={type === 'number' ? '0.01' : undefined}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        required
      />
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  );
}

export default AdminPage;

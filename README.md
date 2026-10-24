# SmoothieFit

Proyecto académico SmoothieFit. El frontend usa React y Vite; el backend Express publica la API y usa MongoDB para productos y solicitudes.

## Cómo ejecutarlo

Inicia el backend desde `backend/`:

```powershell
npm install
npm start
```

En otra terminal inicia el frontend desde `frontend/` con `npm run dev`. La dirección local de Vite se muestra en la terminal. Para detener cada servidor, presiona `Ctrl+C` en su terminal.

## Archivos principales

- `backend/server.js`: inicia Express, conecta MongoDB, configura CORS y monta las rutas de API.
- `backend/routes/productos.js`: ofrece las rutas de productos y valida los datos recibidos; las escrituras requieren JWT de administrador.
- `backend/routes/auth.js` y `backend/middleware/verificarToken.js`: gestionan el login, la sesión JWT y el acceso protegido.
- `backend/routes/solicitudes-admin.js`: permite al administrador revisar y actualizar solicitudes.
- `backend/models/Usuario.js`: define las cuentas administrativas y excluye el hash de contraseña de las respuestas.
- `backend/scripts/crear-admin.js`: crea el administrador inicial sin mostrar la contraseña introducida.
- `backend/routes/ingredientes.js`: publica los ingredientes disponibles para el constructor.
- `backend/routes/reglas-constructor.js`: comparte las reglas y tamaños definidos en `backend/config/constructorRules.js`.
- `backend/config/constructorRules.js`: fuente única de límites y precios base de tamaños del constructor.
- `backend/middleware/verificarToken.js`: verifica el JWT para las operaciones administrativas.
- `backend/.env.example`: plantilla con nombres de variables y marcadores no secretos.
- `backend/package.json`: contiene dependencias y comandos `npm start`, `npm run seed` y `npm run crear-admin`.
- `backend/package-lock.json`: registra las versiones instaladas de las dependencias.
- `backend/data/productos.json`: guarda los productos de ejemplo del catálogo.
- `backend/data/ingredientes.json`: guarda ingredientes y alérgenos de ejemplo.
- `frontend/src/App.jsx`: registra las páginas y las rutas del panel.
- `frontend/src/pages/`: contiene la landing, el catálogo, las páginas informativas, contacto y panel React.
- `frontend/src/context/AuthContext.jsx`: valida y conserva el estado de sesión en `sessionStorage`.
- `frontend/src/services/api.js`: centraliza las llamadas HTTP y el encabezado de autenticación.
- `frontend/src/styles/base.css`: variables de color, componentes y diseño responsive.
- `frontend-legacy/`: referencia del frontend antiguo; no forma parte del flujo actual.

## Diseño y navegación

La página usa Nunito desde Google Fonts y fuentes de respaldo locales. En pantallas pequeñas, el botón de menú muestra u oculta la navegación y actualiza `aria-expanded`; también se puede cerrar con Escape o al elegir un enlace.

La página de inicio usa `IntersectionObserver` para mostrar suavemente las secciones al entrar en pantalla. Si el navegador no lo admite o está activada la preferencia de movimiento reducido, el contenido permanece visible sin esa animación.

## API de productos

La API permite listar con `GET /api/productos`, consultar uno con `GET /api/productos/:id`, crear con `POST /api/productos`, actualizar con `PUT /api/productos/:id` y eliminar con `DELETE /api/productos/:id`. Las escrituras requieren el token de administrador. MongoDB es el almacenamiento operativo; `backend/data/productos.json` solo es la fuente del seed. Los productos y precios iniciales son ejemplos del proyecto.

El recorrido es: el navegador hace una solicitud con `fetch()`; Express recibe la solicitud y la ruta consulta o actualiza MongoDB; Express responde con un código HTTP y datos JSON; React usa esa respuesta para mostrar las tarjetas o un mensaje.

- `GET` consulta datos sin modificarlos.
- `POST` crea un producto nuevo.
- `PUT` reemplaza los datos de un producto existente.
- `DELETE` elimina un producto.

## Panel de administración

Configura `MONGODB_URI` y `JWT_SECRET` en `backend/.env`; el secreto JWT debe tener al menos 32 caracteres y nunca debe subirse al repositorio. Si todavía no existe el archivo, cópialo desde `.env.example` y reemplaza los marcadores con valores privados en tu computadora.

Desde `backend/`, ejecuta `npm run crear-admin`. El script pide el correo y la contraseña en la terminal; la contraseña se escribe sin mostrarse y debe tener al menos 12 caracteres. Después inicia el API con `npm start` y abre el frontend React en `http://localhost:5173/#/admin/login`.

El login entrega un JWT que vence en dos horas. React guarda el token en `sessionStorage` y lo envía como Bearer para operaciones administrativas. El panel crea productos con React; no inserta los datos como HTML.

## Constructor de smoothies

La implementación del constructor en `frontend-legacy/crea-tu-smoothie.html` sirve como referencia y no se modifica. Sus ingredientes y precios son ejemplos; la selección se guardaba en el navegador, no como pedido del backend.

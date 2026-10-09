# SmoothieFit

Proyecto web de smoothies. El backend usa Node.js y Express para mostrar los archivos del frontend.

## Cómo ejecutarlo

Abre una terminal en la carpeta `backend/` y ejecuta:

```powershell
npm install
npm start
```

Luego abre http://localhost:3000 en el navegador. Para detener el servidor, presiona `Ctrl+C` en la terminal.

## Archivos principales

- `backend/server.js`: inicia Express y publica los archivos de `frontend/`. Usa `path.join` para encontrar esa carpeta de forma compatible con Windows.
- `backend/routes/productos.js`: ofrece las rutas de productos y valida los datos recibidos.
- `backend/package.json`: contiene Express y el comando `npm start`.
- `backend/package-lock.json`: registra las versiones instaladas de las dependencias.
- `backend/data/productos.json`: guarda los productos de ejemplo del catálogo.
- `frontend/index.html`: página de inicio y tres productos destacados cargados desde la API.
- `frontend/smoothies.html`: catálogo que muestra los productos de la API y permite filtrarlos por categoría.
- `frontend/css/styles.css`: colores, tipografías, componentes y diseño responsive.
- `frontend/js/layout.js`: agrega el encabezado, menú, pie de página, control del menú móvil y aparición de secciones al desplazarse. Cada página HTML debe cargar este script.
- `frontend/js/inicio.js`: carga desde la API los tres smoothies destacados de la página de inicio.
- `frontend/js/smoothies.js`: carga y filtra el catálogo de productos.
- `frontend/img/`: imágenes del sitio.

## Diseño y navegación

La página usa Nunito desde Google Fonts y fuentes de respaldo locales. En pantallas pequeñas, el botón de menú muestra u oculta la navegación y actualiza `aria-expanded`; también se puede cerrar con Escape o al elegir un enlace.

La página de inicio usa `IntersectionObserver` para mostrar suavemente las secciones al entrar en pantalla. Si el navegador no lo admite o está activada la preferencia de movimiento reducido, el contenido permanece visible sin esa animación.

## API de productos

La API permite listar con `GET /api/productos`, consultar uno con `GET /api/productos/:id`, crear con `POST /api/productos`, actualizar con `PUT /api/productos/:id` y eliminar con `DELETE /api/productos/:id`. Los cambios se guardan en `backend/data/productos.json`. Los productos y precios iniciales son ejemplos del proyecto.

El recorrido es: el navegador hace una solicitud con `fetch()`; Express recibe la solicitud y la ruta correspondiente lee o actualiza el archivo JSON; Express responde con un código HTTP y datos JSON; JavaScript usa esa respuesta para mostrar las tarjetas o un mensaje.

- `GET` consulta datos sin modificarlos.
- `POST` crea un producto nuevo.
- `PUT` reemplaza los datos de un producto existente.
- `DELETE` elimina un producto.

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
- `backend/middleware/adminAuth.js`: comprueba la clave enviada en `x-admin-key` antes de permitir cambios en productos.
- `backend/.env.example`: muestra el nombre de la variable necesaria para configurar la clave local.
- `backend/package.json`: contiene Express y el comando `npm start`.
- `backend/package-lock.json`: registra las versiones instaladas de las dependencias.
- `backend/data/productos.json`: guarda los productos de ejemplo del catálogo.
- `frontend/index.html`: página de inicio y tres productos destacados cargados desde la API.
- `frontend/smoothies.html`: catálogo que muestra los productos de la API y permite filtrarlos por categoría.
- `frontend/css/styles.css`: colores, tipografías, componentes y diseño responsive.
- `frontend/js/layout.js`: agrega el encabezado, menú, pie de página, control del menú móvil y aparición de secciones al desplazarse. Cada página HTML debe cargar este script.
- `frontend/js/inicio.js`: carga desde la API los tres smoothies destacados de la página de inicio.
- `frontend/js/smoothies.js`: carga y filtra el catálogo de productos.
- `frontend/admin.html`: panel protegido para administrar el catálogo.
- `frontend/js/admin.js`: gestiona el inicio de sesión, el formulario y las operaciones CRUD desde el panel.
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

## Panel de administración

Si aún no tienes `backend/.env`, abre la terminal en `backend/` y copia la plantilla con `Copy-Item .env.example .env`; luego cambia el valor de `ADMIN_KEY` en `.env`. Ejecuta `npm install` y `npm start` desde esa misma carpeta. El archivo `.env` está ignorado por Git; `backend/.env.example` sirve como plantilla sin incluir la clave local. El panel está disponible en `http://localhost:3000/admin.html`.

`dotenv` carga variables de entorno desde el archivo `.env`, para que la clave no quede escrita en el código del servidor. El middleware compara esa clave con el encabezado `x-admin-key` en POST, PUT y DELETE; GET continúa siendo público. El navegador conserva la clave en `sessionStorage` solo mientras dure la pestaña.

El panel crea la tabla y sus celdas con `document.createElement()` y asigna los valores con `textContent`, en vez de interpretar datos como HTML. Así un nombre o ingrediente que contenga etiquetas se muestra como texto y no se ejecuta como marcado o script.

Esta clave compartida es una protección básica para una demostración y no sustituye una autenticación real. En producción se usarían cuentas individuales, contraseñas cifradas, sesiones seguras y conexiones HTTPS.

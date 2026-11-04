# Guía técnica y estado de SmoothieFit

Este documento describe el código actual y separa implementación de comprobación en producción. No contiene valores privados. La comprobación pública registrada aquí se hizo el 03-11-2026; el estado puede cambiar.

## Arquitectura

```text
Navegador
  ├─ React + Vite + HashRouter ── GitHub Pages
  │    ├─ Sorbi: reglas locales del navegador
  │    └─ cliente HTTP ───────────────┐
  └───────────────────────────────────┼── HTTPS / CORS
                                      ▼
                              Express en Render
                               ├─ MongoDB Atlas vía Mongoose
                               └─ Gemini solo para el panel admin
```

- El frontend es una SPA estática. `frontend/src/main.jsx` monta React, `HashRouter` y `App`; `frontend/index.html` carga ese punto de entrada. `frontend/vite.config.js` configura la base de GitHub Pages y un proxy local de `/api`.
- El backend entra por `backend/server.js`, monta las rutas REST, limita el cuerpo JSON y configura CORS con orígenes concretos. Al arrancar, conecta con MongoDB antes de escuchar.
- Productos, solicitudes y administradores usan modelos Mongoose. Los productos iniciales vienen de `backend/data/productos.json`; ingredientes, reglas y la ficha del único punto planificado son JSON de lectura.
- Sorbi carga productos, ingredientes y la ficha del punto mediante rutas públicas; a partir de ahí el procesamiento conversacional es local.
- Gemini se invoca desde una ruta administrativa que requiere JWT. La clave no se incluye en el frontend.

La app de GitHub Pages devolvió el HTML y `/api/health` de Render respondió `{"estado":"disponible"}` el 03-11-2026. El chequeo indica que Mongoose veía una conexión activa en ese momento; no se ejecutó una prueba de extremo a extremo para el formulario, el login, los cambios de administración o Gemini.

## Estructura actual relevante

```text
.
├── .github/workflows/deploy.yml
├── CONTEXTO.md
├── README.md
├── docs/MIGRACION.md
├── backend/
│   ├── config/                 # db.js y constructorRules.js
│   ├── data/                   # .gitkeep, ingredientes, productos y ficha del punto
│   ├── middleware/verificarToken.js
│   ├── models/                 # Producto, Solicitud y Usuario
│   ├── prompts/creativo.md
│   ├── routes/                 # .gitkeep y rutas API, incluida sucursales.js
│   ├── scripts/                # crear-admin.js y seed.js
│   ├── services/gemini.js
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/          # Layout, Header, Footer, tarjetas y Sorbi
        ├── context/             # sesión del panel
        ├── config/              # configuración de interfaz
        ├── hooks/               # datos de productos y del punto
        ├── pages/               # landing, catálogo, constructor, contacto, panel e informativas
        ├── services/api.js
        ├── sorbi/               # engine, knowledge, carga de datos y pruebas
        ├── styles/base.css
        └── utils/
```

Se omiten archivos generados, dependencias instaladas y detalles internos de configuración para mantener el árbol legible. La carpeta de datos incluye el archivo `.gitkeep` que está actualmente presente; no tiene lógica de ejecución.

## Rutas de la aplicación

`frontend/src/App.jsx` define las páginas y `Header.jsx` muestra la navegación:

| Ruta frontend | Contenido |
|---|---|
| `/` | Landing |
| `/smoothies` | Favoritos del público, productos y votos |
| `/crea-tu-smoothie` | Constructor y solicitud de interés |
| `/asistente` | Chat con Sorbi |
| `/sucursales` | Página “Nuestro local”; existe una sola ficha planificada |
| `/contacto` | Formulario de solicitudes |
| `/colegios` | Propuesta en desarrollo para familias y colegios |
| `/productores`, `/sostenibilidad`, `/nosotros` | Páginas informativas |
| `/admin/login`, `/admin` | Acceso y panel protegido |

El formulario de contacto admite los tipos `consulta`, `colegio`, `tienda` y `pedido`; un parámetro `tipo` puede preseleccionar el tipo cuando el enlace lo incluye.

## API: acceso público y protegido

Todas estas rutas se montan desde `backend/server.js`. Las operaciones protegidas requieren un JWT de administrador en el encabezado `Authorization`, usando el esquema Bearer; el middleware verifica firma, vencimiento y rol.

| Método | Endpoint | Acceso | Comportamiento |
|---|---|---|---|
| `GET` | `/api/health` | Público | Informa si la conexión Mongoose está activa. |
| `POST` | `/api/auth/login` | Público | Comprueba correo y contraseña; responde con JWT cuando las credenciales son válidas. |
| `GET` | `/api/auth/me` | JWT admin | Valida el usuario de la sesión. |
| `GET` | `/api/productos` | Público | Lista productos desde MongoDB. |
| `GET` | `/api/productos/:id` | Público | Consulta un producto. |
| `POST` | `/api/productos/:id/voto` | Público | Suma voto si el límite temporal por IP lo permite. |
| `POST` | `/api/productos` | JWT admin | Crea producto validado. |
| `PUT` | `/api/productos/:id` | JWT admin | Actualiza producto validado. |
| `DELETE` | `/api/productos/:id` | JWT admin | Elimina producto. |
| `GET` | `/api/ingredientes` | Público | Lee ingredientes de ejemplo desde JSON. |
| `GET` | `/api/reglas-constructor` | Público | Devuelve reglas y precios de ejemplo. |
| `GET` | `/api/sucursales` | Público | Devuelve el arreglo de datos que contiene la ficha del único punto planificado. |
| `POST` | `/api/solicitudes` | Público | Valida y guarda contacto o interés. Para `tipo: pedido` vuelve a validar la creación y calcula el precio en el servidor. |
| `GET` | `/api/solicitudes` | JWT admin | Lista solicitudes; permite filtro y limita resultados. |
| `PATCH` | `/api/solicitudes/:id` | JWT admin | Cambia a un estado autorizado. |
| `POST` | `/api/ia/admin/generar` | JWT admin | Solicita sugerencias Gemini para datos de producto. |

Los límites de login, solicitudes, votos y Gemini se mantienen en memoria; no se comparten entre instancias y se reinician al reiniciar el proceso. Los votos aplican un límite por producto y dirección IP en una ventana temporal, además de un tope por hora. La marca del navegador en `localStorage` ayuda a la interfaz, pero no identifica a una persona ni prueba demanda de mercado.

## Constructor y datos del punto

- `backend/config/constructorRules.js` define las categorías, tamaños y restricciones. `backend/data/ingredientes.json` contiene ingredientes de ejemplo con sus campos declarados, incluidos precios y alérgenos.
- El navegador valida la selección y muestra un estimado. El backend vuelve a validar IDs, tamaño, categorías y cantidades con sus propios datos y suma tamaño, base e ingredientes para calcular el precio final que guarda.
- El formulario envía una solicitud de interés con `tipo: pedido`; el servidor genera un código de referencia y asocia la ficha del punto. No procesa cobro, no reserva inventario y no confirma entrega ni retiro. El único local está planificado en el Mall del Sol, Guayaquil; la ubicación exacta, el formato, el horario, el teléfono y las coordenadas están por definir.
- Los ingredientes y precios son ejemplos académicos. El costo real por unidad no se conoce y debe calcularse por ingrediente antes de ofrecer precios comerciales.
- El alérgeno que muestra la interfaz procede de las etiquetas declaradas en el JSON. No es una garantía contra contaminación cruzada ni un dictamen de aptitud para una persona.

## Sorbi, Gemini y manejo de datos

`frontend/src/sorbi/engine.js` normaliza tildes, mayúsculas y signos; busca intenciones, sinónimos y palabras clave. Para algunos errores de escritura compara palabras con distancia de edición (distancia tipo Levenshtein) con un umbral corto según la longitud de las palabras. Las recomendaciones puntúan etiquetas de ingredientes y preferencias; en empates usa votos y nombre. No es un modelo de IA ni comprensión humana.

Al iniciar el chat, `useSorbiData.js` carga una vez los productos, el JSON de ingredientes y la ficha del punto desde la API. Luego los mensajes se interpretan en el navegador; `SorbiChat.jsx` no envía el texto a la API. El chat bloquea entradas que parecen contener correo o teléfono y limita longitud. Su conversación de sesión se puede guardar en `sessionStorage`.

La opción de cercanía solicita permiso de geolocalización del navegador y calcula distancia en el dispositivo. No guarda ni envía las coordenadas del usuario. La ficha de SmoothieFit aún tiene coordenadas nulas; hasta definirlas, Sorbi no puede calcular la distancia.

Gemini se usa solo desde el panel para sugerir nombres, descripciones y eslóganes. El backend acepta campos acotados del producto, busca indicios de instrucciones, datos personales y afirmaciones prohibidas, llama a Gemini desde Node y espera JSON. Valida formato y tipos, limita cantidad y longitud de opciones y filtra expresiones prohibidas. Una descripción puede usar una plantilla local cuando el servicio falla; los nombres y eslóganes no tienen ese respaldo. El filtrado no garantiza que todo contenido sea correcto, por lo que el administrador debe revisar las sugerencias.

Como el público del sitio incluye menores, el proyecto mantiene Gemini fuera de Sorbi y de la experiencia pública. La integración administrativa debe mantenerse dentro de las restricciones de los términos vigentes de la API. Solo se envían campos de producto, no información de clientes. No introducir datos personales, de clientes ni confidenciales.

## Variables de entorno

Se indican los nombres, nunca valores. Los secretos deben configurarse en el entorno privado de Render o localmente y no enviarse al navegador ni al repositorio.

| Nombre | Uso |
|---|---|
| `PORT` | Puerto HTTP del backend. |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por comas; el servidor rechaza `*`. |
| `MONGODB_URI` | URI privada de MongoDB Atlas o de una instancia local. |
| `JWT_SECRET` | Firma de JWT; en producción debe tener al menos 32 caracteres. |
| `GEMINI_API_KEY`, `MODELO_IA` | Credencial y modelo Gemini; solo administración. |
| `LIMITE_IA_POR_MINUTO`, `LIMITE_IA_DIARIO` | Límites opcionales de uso Gemini. |
| `VITE_API_URL` | URL base pública de la API usada durante el build del frontend. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credenciales opcionales para crear el primer admin sin interacción; se usan juntas y solo por `crear-admin`. |
| `NODE_ENV` | El backend aplica la comprobación reforzada de `JWT_SECRET` al estar en producción. |

`backend/.env.example` sirve de plantilla con marcadores. No se deben tratar sus marcadores como credenciales reales. El archivo local `.env`, si existe, nunca se debe leer en una revisión pública ni subir al repositorio.

## Scripts disponibles y ejecución local

Los nombres se cotejaron con ambos `package.json`.

| Paquete | Script | Uso |
|---|---|---|
| Backend | `npm start` | Inicia `server.js`. |
| Backend | `npm run seed` | Inserta productos iniciales faltantes sin sobrescribir los existentes. |
| Backend | `npm run crear-admin` | Crea el primer administrador; contraseña interactiva oculta o credenciales de entorno. |
| Frontend | `npm run dev` | Inicia Vite con proxy local de `/api` al backend. |
| Frontend | `npm run build` | Genera el sitio estático de producción. |
| Frontend | `npm run preview` | Previsualiza el build de Vite. |
| Frontend | `npm run test:sorbi` | Ejecuta pruebas con `node:test` para el motor de Sorbi. |

Requiere Node.js de la versión mayor 22, npm y una base MongoDB accesible. En PowerShell:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Configura localmente las variables requeridas sin compartirlas. Después:

```powershell
npm run seed
npm run crear-admin
npm start
```

En otra terminal, inicia el sitio y valida el motor:

```powershell
cd frontend
npm ci
npm run dev
npm run test:sorbi
npm run build
```

La dirección de Vite se muestra al iniciar. El usuario administrador de desarrollo solo debe ser creado en la base de datos de desarrollo prevista.

## Despliegue

- **GitHub Pages:** `.github/workflows/deploy.yml` ejecuta en Node.js la instalación limpia (`npm ci`), comprueba que exista `VITE_API_URL`, construye con Vite y publica el directorio de build. El workflow se activa ante cambios bajo `frontend/` o el propio workflow en `main`, o manualmente.
- **Render:** el código Node/Express se ejecuta por separado. El proveedor debe tener configurados el comando de inicio y las variables privadas, incluidos MongoDB, JWT y los orígenes CORS. Este repositorio no incluye una definición de Render; la configuración actual del servicio debe comprobarse en su panel.
- **MongoDB Atlas:** el backend se conecta mediante `MONGODB_URI`; el usuario, contraseña y acceso de red se configuran privadamente en Atlas y el proveedor backend.
- **Prueba disponible:** la página de GitHub Pages devolvió HTML y `/api/health` devolvió estado disponible el 03-11-2026. No se hizo una compra, envío de formulario, login ni solicitud Gemini en la app pública en esa comprobación.

## Pruebas y estado verificable

- `frontend/src/sorbi/engine.test.js` tiene pruebas Node integradas para normalización, errores de escritura, intenciones, recomendaciones, exclusión de ingredientes, límites de entrada y ubicación.
- CSS declara puntos de quiebre y reduce animaciones si el sistema solicita movimiento reducido. Esto demuestra estilos adaptables en código, no una revisión visual; probar a mano en móvil, escritorio, zoom y teclado.
- El acceso a GitHub Pages y el estado de conexión de MongoDB se comprobaron de forma puntual; el éxito de un endpoint de salud no demuestra que los datos de negocio se guarden correctamente.
- Para comprobar el mínimo de commits se requiere que el estudiante ejecute `git rev-list --count HEAD`; no se ejecutó Git para esta tarea.

## Límites del proyecto

- No hay local abierto. El único punto es un plan sin ubicación interior, formato, horario, teléfono ni coordenadas confirmadas.
- La solicitud de retiro es una simulación académica, no una compra.
- Los precios, productos e ingredientes son ejemplos; los votos son pruebas y no representan demanda del mercado.
- No se han confirmado ventas, proveedores, acuerdos, costos, permisos ni aceptación del público.
- La operación de guardar formularios, administrar productos, iniciar sesión y llamar a Gemini requiere pruebas de extremo a extremo con un entorno autorizado.

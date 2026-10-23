# Diagnóstico y plan de migración de SmoothieFit

## a. Estado actual

Este árbol refleja los archivos encontrados en la carpeta del proyecto. Se omiten `node_modules/` y el contenido interno de `.git/`.

```text
smoothiefit/
├── .gitignore
├── CONTEXTO.md
├── MIGRACION.md
├── README.md
├── backend/
│   ├── .env                         (local, ignorado por Git)
│   ├── .env.example
│   ├── config/
│   │   ├── db.js
│   │   └── constructorRules.js
│   ├── data/
│   │   ├── .gitkeep
│   │   ├── ingredientes.json
│   │   └── productos.json
│   ├── middleware/
│   │   └── adminAuth.js
│   ├── models/
│   │   ├── Producto.js
│   │   └── Solicitud.js
│   ├── package.json
│   ├── package-lock.json
│   ├── routes/
│   │   ├── .gitkeep
│   │   ├── ingredientes.js
│   │   ├── productos.js
│   │   └── reglas-constructor.js
│   ├── scripts/
│   │   └── seed.js
│   └── server.js
├── frontend/
│   ├── package.json
│   └── src/                          (React, Vite y HashRouter)
└── frontend-legacy/
    ├── admin.html
    ├── crea-tu-smoothie.html
    ├── css/
    │   ├── .gitkeep
    │   └── styles.css
    ├── img/
    │   └── .gitkeep
    ├── index.html
    ├── js/
    │   ├── .gitkeep
    │   ├── admin.js
    │   ├── constructor.js
    │   ├── inicio.js
    │   ├── layout.js
    │   └── smoothies.js
    ├── nosotros.html
    ├── productores.html
    ├── smoothies.html
    └── sostenibilidad.html
```

La carpeta `frontend-legacy/` contiene el frontend anterior, hecho con HTML, CSS y JavaScript puros. La aplicación React actual vive en `frontend/`.

En el árbol local sí aparecen `.git/` y `backend/.env`. No se ejecutaron comandos de Git, no se inició el servidor y no se comprobó el contenido del historial. El valor de la clave local no se muestra en este documento.

## b. Backend

### Endpoints existentes

| Método | Ruta | ¿Protegida? | Archivo donde vive |
|---|---|---|---|
| GET | `/api/productos` | No | `backend/routes/productos.js` |
| GET | `/api/productos/:id` | No | `backend/routes/productos.js` |
| POST | `/api/productos` | Sí, encabezado `x-admin-key` | `backend/routes/productos.js`, middleware `backend/middleware/adminAuth.js` |
| PUT | `/api/productos/:id` | Sí, encabezado `x-admin-key` | `backend/routes/productos.js`, middleware `backend/middleware/adminAuth.js` |
| DELETE | `/api/productos/:id` | Sí, encabezado `x-admin-key` | `backend/routes/productos.js`, middleware `backend/middleware/adminAuth.js` |
| GET | `/api/ingredientes` | No | `backend/routes/ingredientes.js` |
| GET | `/api/reglas-constructor` | No | `backend/routes/reglas-constructor.js` |
| GET | `/api/health` | No | `backend/server.js`; informa si MongoDB está disponible |

Las rutas se conectan en `backend/server.js`. El servidor acepta cuerpos JSON y devuelve un mensaje JSON para JSON malformado o errores no controlados. Ya no sirve archivos estáticos: espera una conexión MongoDB exitosa antes de abrir el puerto y publica la API para el frontend Vite, que se ejecuta aparte.

### Datos, reglas y configuración

- `backend/data/productos.json`: catálogo de seis productos con precios e ingredientes de ejemplo. Los registros tienen `esEjemplo: true`; ahora se conserva como fuente del seed, no como almacenamiento operativo de la API.
- `backend/data/ingredientes.json`: lista de 17 ingredientes con categoría, precio extra, color y alérgenos; los registros tienen `esEjemplo: true`.
- No existen actualmente `pedidos.json`, `contactos.json` ni `alianzas.json`; esos nombres sí aparecen excluidos en `.gitignore`.
- `backend/config/constructorRules.js`: fuente única de las categorías, límites de selección y precios base de los tamaños pequeño, mediano y grande. Sus precios están comentados como ejemplos.
- `backend/models/Producto.js`: esquema de MongoDB para los campos del producto, con un `id` numérico único que se conserva en las respuestas de la API.
- `backend/models/Solicitud.js`: modelo preparado para almacenar solicitudes de contacto; aún no tiene rutas.
- `backend/config/db.js`: conecta con `process.env.MONGODB_URI` y da un error claro si la variable falta o MongoDB no está disponible.
- `backend/scripts/seed.js`: inserta desde `productos.json` solo los IDs que todavía no existen; no sobrescribe productos existentes ni elimina el JSON.
- Reglas actuales del constructor: exactamente una base, al menos una fruta, hasta cuatro frutas y verduras combinadas, y hasta dos semillas o extras; los tamaños pequeño, mediano y grande tienen precios base de ejemplo.
- `backend/middleware/adminAuth.js`: compara `x-admin-key` con `process.env.ADMIN_KEY`; si no coincide o la variable no está configurada, responde HTTP 401. Protege solo las escrituras de productos.
- `backend/.env.example` contiene una clave de reemplazo de muestra. `backend/.env` está presente localmente y `.gitignore` contiene `.env`; la clave no se ha copiado a este informe.
- La variable de entorno utilizada por el código es `ADMIN_KEY`, cargada por `dotenv` en `backend/server.js`.

### Dependencias instaladas

Leídas de `backend/package.json`:

| Paquete | Versión declarada | Uso actual |
|---|---:|---|
| `express` | `^5.2.1` | Servidor HTTP y API REST. |
| `dotenv` | `^18.0.7` | Cargar variables locales desde `backend/.env`. |
| `mongoose` | `^9.11.3` | Esquemas/modelos y conexión a MongoDB Atlas. |

No hay `devDependencies` declaradas. No se encontró configuración `engines` que indique la versión de Node.js requerida.

## c. Frontend-legacy

**Nombre real en disco:** `frontend-legacy/`. Contiene el frontend anterior de HTML, CSS y JavaScript y servirá como referencia.

### Páginas y funcionalidades

| Archivo | Funcionalidad actual |
|---|---|
| `frontend-legacy/index.html` | Landing con mensaje de marca, botones al catálogo y al constructor, beneficios, tres destacados cargados desde la API y llamadas a otras páginas. |
| `frontend-legacy/smoothies.html` | Catálogo con carga desde `GET /api/productos`, estado de carga/error y filtro de categoría. |
| `frontend-legacy/crea-tu-smoothie.html` | Constructor paso a paso con tamaño, base, frutas, verduras, semillas/extras, nombre, vaso SVG, precio, avisos de selección y alérgenos, y botón “Sorpréndeme”. Guarda creaciones en `localStorage` (`smoothiefitCart`). |
| `frontend-legacy/admin.html` | Pantalla para pedir una clave y panel de productos. La página es estática; el backend protege las operaciones de escritura. |
| `frontend-legacy/productores.html` | Historia propuesta, criterios para proveedores y tres productores de ejemplo marcados como ficticios. |
| `frontend-legacy/sostenibilidad.html` | Propuesta cautelosa sobre empaques, materiales, residuos y proveedores locales. |
| `frontend-legacy/nosotros.html` | Historia del proyecto, misión, visión, valores y cuatro espacios para nombres y fotos del equipo. |

No se encontraron `contacto.html`, `colegios.html`, `puntos-de-venta.html` ni `pedidos.html`. Aunque sus enlaces aparecen en el layout y en el inicio, las páginas correspondientes no están en el árbol.

### Scripts

| Archivo | Responsabilidad |
|---|---|
| `frontend-legacy/js/layout.js` | Inserta encabezado y pie de página, controla el menú hamburguesa y revela elementos al desplazarse con `IntersectionObserver`, respetando movimiento reducido. |
| `frontend-legacy/js/inicio.js` | Pide productos a la API y presenta los tres primeros como destacados. |
| `frontend-legacy/js/smoothies.js` | Pide productos, crea las tarjetas y filtra por categoría. |
| `frontend-legacy/js/constructor.js` | Carga ingredientes y reglas, valida la selección en el navegador, calcula precio, dibuja capas SVG, muestra alérgenos, genera una combinación aleatoria y guarda en el carrito local. |
| `frontend-legacy/js/admin.js` | Maneja la pantalla de clave, conserva la clave en `sessionStorage`, crea la tabla y envía POST, PUT y DELETE con `x-admin-key`. |

El constructor valida las reglas en el navegador, pero el backend no recibe ni vuelve a validar una orden de smoothie. El carrito permanece en el navegador y no se registra como pedido en el servidor.

### Constructor de smoothies y reglas actuales

`frontend-legacy/crea-tu-smoothie.html` presenta cinco pasos: tamaño, base, frutas/verduras, semillas/extras y nombre. `frontend-legacy/js/constructor.js` obtiene ingredientes y reglas de la API, valida la selección en el cliente, calcula el precio a partir del tamaño y los extras, dibuja el vaso SVG, muestra ingredientes y alérgenos declarados y permite generar una combinación aleatoria. Si la selección es válida, agrega la mezcla a `localStorage` bajo `smoothiefitCart`; esto no crea ni registra un pedido en el backend.

Las reglas se comparten desde `GET /api/reglas-constructor` y `backend/config/constructorRules.js`. La validación actual solo está en el navegador: si el constructor se conserva, el backend deberá volver a validar ingredientes, cantidades y precio antes de aceptar un pedido.

### Estilos, colores y textos reutilizables

`frontend-legacy/css/styles.css` define variables en `:root`:

| Variable | Valor |
|---|---|
| `--color-red` | `#c93652` |
| `--color-purple` | `#512b68` |
| `--color-pink` | `#f7dce7` |
| `--color-white` | `#ffffff` |
| `--color-text` | `#33243a` |
| `--color-muted` | `#665c69` |
| `--color-background` | `#fff9fb` |
| `--color-border` | `#eadde6` |

También contiene variables de tipografía, espacios, bordes redondeados y ancho de contenido. Las páginas cargan Nunito desde Google Fonts con fuentes de respaldo; esto requiere conexión a ese servicio para obtener la tipografía.

Textos que pueden servir de base para componentes React: nombre `SmoothieFit`; navegación “Inicio”, “Smoothies”, “Crea tu smoothie”, “Productores”, “Colegios”, “Puntos de venta”, “Pedidos”, “Sostenibilidad”, “Nosotros” y “Contacto”; pie “Proyecto académico” y “Administración”; títulos y mensajes de la landing; mensajes de carga/error del catálogo; y los avisos del constructor sobre alérgenos y selección. Revisar los enlaces de la navegación porque varios destinos todavía no existen.

## d. Se reutiliza / Se reemplaza / Se descarta

| Pieza actual | Decisión para la nueva arquitectura | Motivo |
|---|---|---|
| Textos de marca, títulos, descripciones y navegación de `frontend-legacy/*.html` | **Se reutiliza**, revisando afirmaciones y enlaces | Mantiene la identidad y evita volver a redactar todo desde cero. |
| `frontend-legacy/css/styles.css` y sus variables de color | **Se reutiliza como referencia y se adapta** a CSS de componentes React | Conserva la paleta, los contrastes, el espaciado y los estilos que ya se entienden. |
| Encabezado y pie de `frontend-legacy/js/layout.js` | **Se reemplaza** por componentes compartidos de React y rutas de HashRouter | React debe renderizar el layout dentro de la aplicación y las rutas deben funcionar en GitHub Pages. |
| Páginas HTML actuales | **Se reemplazan gradualmente** por páginas/componentes React | El requisito del curso exige React; conviene migrar por partes para comparar resultados. |
| `frontend-legacy/js/inicio.js` y `frontend-legacy/js/smoothies.js` | **Se reemplazan** por componentes y servicios React para la API | Conservan el contrato del catálogo, pero no el mecanismo de manipulación manual del DOM. |
| Endpoints REST de productos | **Se reutilizan inicialmente y se adaptan** para consultar la base de datos | La interfaz React puede seguir usando las rutas y campos del catálogo mientras cambia el almacenamiento. |
| `productos.json` | **Se conserva como fuente de seed**, mientras MongoDB queda como almacenamiento operativo | El seed idempotente carga productos faltantes y mantiene intacto el JSON como respaldo/datos iniciales. |
| `ingredientes.json` | **Se conserva como lectura local** por ahora | Es una lista pequeña, estática y de solo lectura; una base de datos no aporta valor mientras no necesite edición o consulta dinámica. |
| `backend/config/constructorRules.js` y su endpoint | **Se reutilizan** como contrato/reglas del constructor, con validación también en servidor si se aceptan pedidos | Evita duplicar límites y permite que el frontend lea reglas comunes. |
| `frontend-legacy/js/constructor.js` y el carrito en `localStorage` | **Se reemplaza** si se mantiene el constructor; también puede posponerse porque es extra en el plan | El nuevo frontend será React y el pedido debe integrarse con una API real si se necesita persistencia. |
| `adminAuth.js`, clave compartida y pantalla de clave actual | **Se reemplazan** por usuarios, hashes seguros de contraseñas y JWT | Una clave compartida no distingue personas ni permite administrar sesiones de usuarios. |
| `admin.js` y CRUD manual del DOM | **Se reemplaza** por un panel React que use el login real | Separa el acceso y la gestión del estado visual del navegador. |
| Perfiles ficticios de productores y datos marcados `esEjemplo` | **Se reutilizan solo como ejemplos identificados** o se reemplazan con datos reales confirmados | No deben presentarse como proveedores reales. |
| Espacios “Nombre del integrante” y “Foto del equipo” | **Se reemplazan** por información real cuando el equipo la entregue | Son marcadores, no datos finales. |
| Aparición con `IntersectionObserver` | **Se puede reemplazar o reutilizar** durante la fase extra de animación | La nueva implementación debe respetar movimiento reducido y no agregar complejidad sin necesidad. |
| `.gitkeep` | **Se descarta al dejar de ser necesario** | Solo mantiene vacías carpetas en Git; no es una función del sitio. |

No se debe borrar ni sobrescribir `frontend-legacy/`; se conservará como referencia mientras React se desarrolla en `frontend/`.

## e. Riesgos y cambios del backend para producción

### Orden recomendado

1. **Separar la publicación del frontend y la API.** `backend/server.js` sirve actualmente `../frontend` con `express.static`; GitHub Pages debe servir el build estático de Vite y Express debe quedar como API, sin servir archivos del frontend en producción. Para desarrollo local, Vite puede ejecutarse por separado.
2. **Configurar la URL de la API y CORS.** El frontend no debe depender de rutas relativas como `/api/...` cuando se publique en otro dominio: usará una URL de API configurable por ambiente. Añadir `cors` al backend, permitir solo el origen publicado y los orígenes locales necesarios, y aceptar únicamente métodos y encabezados requeridos.
3. **Productos en MongoDB (implementado; falta verificar con Atlas).** `Producto`, la conexión Mongoose y el seed idempotente ya están preparados. Configurar la URI y ejecutar el seed; mantener ingredientes y reglas en JSON mientras sigan siendo datos estáticos de solo lectura.
4. **Añadir el registro real de contacto.** Crear un endpoint POST y validación del lado servidor que persistan las solicitudes en la base de datos; actualmente no existe página, ruta ni almacenamiento de contacto.
5. **Reemplazar la clave compartida por autenticación individual.** Sustituir `adminAuth.js` y `x-admin-key` por login de usuarios, hash seguro de contraseñas, emisión/verificación de JWT y protección de las rutas CRUD; crear las cuentas iniciales de forma segura y guardar secretos solo en variables de entorno.
6. **Incorporar la función de IA en el servidor.** Crear un endpoint que invoque al proveedor desde Express, mantenga la clave fuera del navegador y devuelva una respuesta de respaldo si el proveedor falla.
7. **Preparar el proceso de hosting.** Usar el puerto proporcionado por el servicio mediante `process.env.PORT`, definir variables de entorno para base de datos, JWT, proveedor de IA, CORS y URL de frontend, y desplegar/probar API y frontend por separado con HTTPS.

Los endpoints nuevos de contacto, login y la función de IA aún requieren diseño e implementación; no forman parte de la lista de rutas actuales.

### Riesgos observados

1. **Panel de administración con clave compartida:** existe una sola clave para todas las personas administradoras; queda en `sessionStorage` y se envía desde el navegador. La protección actual sirve para una demostración, no para usuarios reales. Usar HTTPS y sustituirla por autenticación individual.
2. **Datos de productos:** la API ya no modifica `productos.json`; utiliza MongoDB. El JSON sigue siendo el origen de la carga inicial. Ingredientes y reglas se leen de JSON porque no requieren escrituras.
3. **Despliegue separado y CORS:** no se encontró configuración de CORS. GitHub Pages no ejecuta Express; al alojar el frontend y backend en dominios distintos, la API necesitará origen configurable y permiso CORS.
4. **Falta de validación de orden en el backend:** las reglas del constructor se validan en JavaScript del navegador. El servidor no recibe la creación ni confirma allí ingredientes y precio; el cliente podría alterar datos locales.
5. **Requisitos importantes aún ausentes:** no hay formulario/API de contacto, páginas de colegios/puntos de venta/pedidos, base de datos, IA, login por usuario ni configuración de despliegue en el árbol observado.
6. **Enlaces sin destino:** el encabezado y la landing enlazan a páginas que aún no existen, entre ellas Contacto. Esto impide que la navegación completa esté lista.
7. **Revisión de secretos histórica pendiente:** la búsqueda local no encontró asignaciones evidentes de contraseñas, cadenas de conexión ni encabezados de claves privadas en los archivos inspeccionados. `backend/.env` sí existe, pero `.gitignore` lo excluye. Sin comandos de Git no se puede confirmar si alguna clave fue subida anteriormente.
8. **Muestras frente a información real:** productos e ingredientes actuales están marcados como ejemplo, y los productores se identifican como ficticios. Mantener esas etiquetas hasta reemplazarlos por información confirmada.
9. **Contenido de salud y sostenibilidad:** en el contenido promocional revisado no aparecen las afirmaciones prohibidas “cura”, “adelgaza”, “desintoxica”, “100% ecológico”, “cero impacto” o “único en el mercado”. Esas expresiones aparecen en `CONTEXTO.md` como ejemplos de frases que se deben evitar. Revisar el contenido al migrarlo.
10. **Dependencia de Google Fonts:** la tipografía se obtiene desde un servicio externo y puede no cargarse sin conexión o si ese servicio se bloquea; se dispone de fuentes de respaldo.

## f. Revisión de secretos

La revisión fue sobre archivos presentes, no sobre el historial:

- `backend/.env` existe localmente y contiene la variable `ADMIN_KEY`; su valor se omitió. `.gitignore` incluye `.env`, lo que también coincide con nombres `.env` en subcarpetas.
- `.gitignore` incluye `backend/data/pedidos.json`, `backend/data/contactos.json` y `backend/data/alianzas.json`. Esos tres archivos no existen en el árbol actual.
- `backend/data/productos.json` y `backend/data/ingredientes.json` no están excluidos; contienen los ejemplos del proyecto y deben seguir siendo datos no sensibles.
- `backend/.env.example` contiene un valor de sustitución, no la clave local.
- En el escaneo de archivos actual no se encontraron cadenas de conexión a bases de datos ni encabezados de claves privadas. Esta búsqueda no garantiza detectar todos los secretos posibles.
- **No verificado:** si `backend/.env` o algún dato sensible apareció en un commit anterior o sigue presente en ramas remotas. No se revisó el historial porque la instrucción de esta tarea prohíbe ejecutar comandos de Git.

Comandos de solo lectura que puedes ejecutar desde la raíz para revisar historial. No modifican el repositorio. El segundo solo muestra commits y nombres de archivos con diferencias que coinciden con patrones sensibles; no imprime las líneas encontradas:

```powershell
git log --all --oneline --decorate
git log --all -G "(ADMIN_KEY|password|passwd|secret|token|api[_-]?key|mongodb(\+srv)?://|postgres(ql)?://|mysql://|BEGIN .*PRIVATE KEY)" --format="%h %s" --name-only
git log --all --name-status -- .env backend/.env backend/data/pedidos.json backend/data/contactos.json backend/data/alianzas.json
```

Si un commit aparece, revísalo en privado y no pegues claves en chats, capturas ni documentación. Si encuentras un secreto publicado, quitarlo del último estado no basta: revoca o cambia la clave y coordina la limpieza del historial antes de hacer público el repositorio.

## g. Plan de migración por fases

| Fase | Qué se hace | Qué se reutiliza | Riesgo principal |
|---|---|---|---|
| 1. React base con Vite, Router y layout | Crear la aplicación React dentro de `frontend/`, configurar Vite y HashRouter, y construir el layout compartido. Conservar `frontend-legacy/` como referencia. | Paleta, textos, navegación, estructura del header/footer y convenciones responsive de `frontend-legacy/`. | Sobrescribir la copia del frontend anterior o romper rutas de GitHub Pages. |
| 2. Catálogo e informativas en React | Migrar landing, catálogo, productores, sostenibilidad y nosotros; agregar las páginas que faltan o ajustar navegación. | Datos y API de productos, contenido aprobado y estilo visual existente. | Enlaces incompletos o datos de ejemplo presentados como reales. |
| 3. Base de datos real (MongoDB Atlas + Mongoose) | Implementada para productos; configurar Atlas y verificar el seed. Ingredientes y reglas siguen como JSON estático de solo lectura. | `Producto`, conexión Mongoose y `productos.json` como fuente de seed. | Credenciales de conexión filtradas, modelo incorrecto o datos de muestra tomados como reales. |
| 4. Contacto real con solicitudes | Crear formulario accesible, validación de servidor y endpoint persistente para registrar solicitudes. | Tono y diseño de marca; rutas Express existentes como patrón sencillo. | Recopilar datos personales sin reglas de acceso, retención y protección. |
| 5. Primera publicación (GitHub Pages + hosting del backend) | Publicar frontend estático en GitHub Pages y desplegar backend en un servicio compatible; configurar URL de API y CORS por ambiente. | Vite y API después de separar frontend/backend. | GitHub Pages no ejecuta Node; dominios distintos requieren CORS, HTTPS y variables de entorno configuradas. |
| 6. Login real con JWT y panel admin | Crear usuarios, guardar hashes seguros de contraseñas, emitir/verificar JWT y proteger las rutas de gestión. JWT es un token firmado que permite identificar una sesión; no reemplaza una contraseña segura ni debe tratarse como secreto de texto plano. | Campos de producto, formularios y operaciones CRUD existentes. | Errores de autenticación, permisos insuficientes o almacenamiento inseguro de tokens. |
| 7. Módulo de IA con respaldo | Implementar una función útil (por ejemplo, recomendar mezclas según preferencias), llamar al proveedor solo desde backend y devolver una respuesta determinista si la IA falla. | Ingredientes, catálogo y tono sencillo. | Proveedor/costo aún no elegido, filtrar una clave de IA o dar respuestas incorrectas como hechos. |
| 8. Constructor de smoothies en React (extra) | Migrar el constructor y conectar selecciones válidas al backend y, si corresponde, al carrito/pedidos. | Ingredientes, `constructorRules.js`, alérgenos y SVG actual como referencia. | Validar precio solo en el navegador o prometer información de alérgenos no confirmada. |
| 9. Animaciones y responsive (extra) | Probar en tamaños de pantalla y agregar animaciones pequeñas solo si aportan claridad y se respetan preferencias de movimiento reducido. | Variables CSS y diseño actual. | Dependencias adicionales, carga lenta o movimiento que dificulte la accesibilidad. |
| 10. Revisión final y guía de defensa | Probar rutas y formularios, revisar seguridad, datos, contenido, publicación, documentación y preparar explicaciones en palabras del estudiante. | `README.md`, este diagnóstico y las reglas de contenido. | Declarar cumplido algo que no se haya probado o desplegado realmente. |

## h. Dependencias nuevas en orden de incorporación

Estas son candidatas para el plan, no están instaladas por esta tarea. La selección final debe respetar lo permitido por el curso y poder explicarse en la defensa.

| Orden | Dependencia | Para qué sirve y por qué se necesita |
|---|---|---|
| 1 | `react` | Permite construir la interfaz en componentes reutilizables. |
| 2 | `react-dom` | Renderiza la aplicación React en el DOM del navegador. |
| 3 | `vite` | Ejecuta el entorno de desarrollo y genera los archivos estáticos para GitHub Pages. |
| 4 | `@vitejs/plugin-react` | Integra React y JSX con Vite durante desarrollo y compilación. |
| 5 | `react-router-dom` | Proporciona `HashRouter` y rutas compatibles con hosting estático como GitHub Pages. |
| 6 | `mongoose` | Define modelos y conecta el backend Node.js con MongoDB Atlas; ya está instalado para persistir productos. |
| 7 | `cors` | Permite llamadas del frontend alojado en otro dominio, limitando los orígenes autorizados. |
| 8 | `bcryptjs` | Genera hashes de contraseña para guardar credenciales de forma no reversible; las contraseñas no deben almacenarse como texto plano. |
| 9 | `jsonwebtoken` | Firma y verifica los tokens JWT usados para autenticar sesiones y proteger operaciones administrativas. |
| 10 | SDK del proveedor de IA (por decidir) | Facilita la llamada al proveedor desde Express; elegirlo solo después de acordar proveedor, permisos y costos. |
| Opcional | Librería de animaciones (por decidir) | Podría facilitar animaciones, pero no es necesaria para los requisitos base y se debe justificar antes de añadirla. |

`express` y `dotenv` ya están declaradas en el backend y no cuentan como dependencias nuevas del plan.
No se propone una dependencia separada para contacto: Express puede recibir el formulario y Mongoose puede persistirlo. Las dependencias nuevas siguen pendientes de autorización del curso y deben mantenerse al mínimo.

## i. Checklist de requisitos del curso

| Requisito | Estado | Evidencia local |
|---|---|---|
| Landing / inicio con marca, mensaje, secciones y navegación | Parcial | `frontend/src/pages/HomePage.jsx` ya está en React; algunas funciones siguen en construcción. |
| Catálogo con productos y detalles claros | Parcial | `frontend/src/pages/SmoothiesPage.jsx` obtiene productos por API; la consulta real requiere configurar y cargar MongoDB Atlas. |
| Contacto real que envíe o registre solicitudes | Falta | No se encontró página de contacto, endpoint ni archivo/base de solicitudes. El enlace `contacto.html` no tiene destino local. |
| Panel admin con login y zona de gestión | Parcial | `frontend-legacy/admin.html`, `frontend-legacy/js/admin.js` y endpoints de escritura con `adminAuth`; usa una clave compartida, no usuarios ni hashes de contraseña. |
| IA aplicada con respaldo sin IA | Falta | No se encontró módulo o llamada de IA ni respuesta de respaldo. |
| Publicación disponible en internet | Falta / No verificado | No se encontró configuración local de GitHub Pages ni hosting del backend. No se comprobó una URL pública. |
| Frontend con React | Parcial | Vite, React, HashRouter, layout, landing, catálogo y páginas informativas ya existen en `frontend/`. |
| Mínimo 15 commits | No verificado | No se ejecutaron comandos de Git, según la instrucción. Debe comprobarse con el historial local. |
| Repositorio en GitHub | No verificado | Se inspeccionaron archivos, no el remoto ni GitHub. |
| Despliegue del frontend en GitHub Pages | Falta / No verificado | No hay configuración de despliegue en el árbol; URL externa no verificada. |
| Diseño responsive | Parcial | `frontend/src/styles/base.css` incluye estilos responsive; hace falta confirmar la experiencia en navegadores/tamaños reales. |
| Dependencias justificadas y explicables | Parcial | El backend declara `express` y `dotenv` con usos documentados en `README.md`; las dependencias futuras y permiso del curso siguen pendientes. |
| Reglas de contenido y muestras | Parcial | Productos e ingredientes tienen `esEjemplo`; productores indican que son ficticios. Revisar todo texto nuevo al migrar. |

Los estados “No verificado” significan que la instrucción de no usar Git o la falta de evidencia local impide confirmarlo; no equivalen a que el requisito se haya cumplido.

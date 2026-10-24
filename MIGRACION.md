# Diagnóstico y plan de migración de SmoothieFit

## a. Estado actual

Este árbol refleja los archivos encontrados en la carpeta del proyecto. Se omiten `node_modules/` y el contenido interno de `.git/`.

```text
smoothiefit/
├── .github/
│   └── workflows/
│       └── deploy.yml
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
│   │   └── verificarToken.js
│   ├── models/
│   │   ├── Producto.js
│   │   ├── Solicitud.js
│   │   └── Usuario.js
│   ├── package.json
│   ├── package-lock.json
│   ├── routes/
│   │   ├── .gitkeep
│   │   ├── auth.js
│   │   ├── ia.js
│   │   ├── ia-admin.js
│   │   ├── ingredientes.js
│   │   ├── productos.js
│   │   ├── reglas-constructor.js
│   │   ├── solicitudes-admin.js
│   │   └── solicitudes.js
│   ├── scripts/
│   │   ├── crear-admin.js
│   │   └── seed.js
│   ├── prompts/
│   │   └── creativo.md
│   ├── services/
│   │   ├── asistente.js
│   │   └── gemini.js
│   └── server.js
├── frontend/
│   ├── package.json
│   └── src/                          (React, Vite, HashRouter y AsistentePage)
```

La aplicación React actual vive en `frontend/`. La carpeta local `frontend-legacy/` se eliminó tras la confirmación del usuario el 24-10-2026; según el usuario, la versión HTML/CSS/JavaScript anterior se conserva en el tag histórico `v1-js-puro`. La sección siguiente describe ese snapshot y no representa archivos presentes en el árbol actual.

En el árbol local sí aparecen `.git/` y `backend/.env`. No se ejecutaron comandos de Git durante esta revisión ni se comprobó el contenido del historial. No se muestran valores de variables privadas.

## b. Backend

### Endpoints existentes

| Método | Ruta | ¿Protegida? | Archivo donde vive |
|---|---|---|---|
| GET | `/api/productos` | No | `backend/routes/productos.js` |
| GET | `/api/productos/:id` | No | `backend/routes/productos.js` |
| POST | `/api/productos` | Sí, JWT Bearer con rol admin | `backend/routes/productos.js`, middleware `backend/middleware/verificarToken.js` |
| PUT | `/api/productos/:id` | Sí, JWT Bearer con rol admin | `backend/routes/productos.js`, middleware `backend/middleware/verificarToken.js` |
| DELETE | `/api/productos/:id` | Sí, JWT Bearer con rol admin | `backend/routes/productos.js`, middleware `backend/middleware/verificarToken.js` |
| POST | `/api/solicitudes` | No; formulario público con validación y límite anti-spam | `backend/routes/solicitudes.js` |
| GET | `/api/solicitudes` | Sí, JWT Bearer con rol admin | `backend/routes/solicitudes-admin.js` |
| PATCH | `/api/solicitudes/:id` | Sí, JWT Bearer con rol admin | `backend/routes/solicitudes-admin.js` |
| POST | `/api/auth/login` | No; límite de cinco fallos por IP cada 15 minutos | `backend/routes/auth.js` |
| GET | `/api/auth/me` | Sí, JWT Bearer con rol admin | `backend/routes/auth.js` |
| GET | `/api/ingredientes` | No | `backend/routes/ingredientes.js` |
| GET | `/api/reglas-constructor` | No | `backend/routes/reglas-constructor.js` |
| POST | `/api/ia/asistente` | No; respuestas básicas, validación y 10 por IP/minuto; no usa IA externa | `backend/routes/ia.js` |
| POST | `/api/ia/admin/generar` | Sí, JWT y rol admin; cuotas globales de Gemini | `backend/routes/ia-admin.js` |
| GET | `/api/health` | No | `backend/server.js`; informa si MongoDB está disponible |

Las rutas se conectan en `backend/server.js`. El servidor acepta cuerpos JSON y devuelve un mensaje JSON para JSON malformado o errores no controlados. Ya no sirve archivos estáticos: espera una conexión MongoDB exitosa antes de abrir el puerto y publica la API para el frontend Vite, que se ejecuta aparte.

### Datos, reglas y configuración

- `backend/data/productos.json`: catálogo de seis productos con precios e ingredientes de ejemplo. Los registros tienen `esEjemplo: true`; ahora se conserva como fuente del seed, no como almacenamiento operativo de la API.
- `backend/data/ingredientes.json`: lista de 17 ingredientes con categoría, precio extra, color y alérgenos; los registros tienen `esEjemplo: true`.
- `backend/services/asistente.js`: contiene únicamente la respuesta determinista de Sorbi por palabras clave; no llama a proveedores externos.
- `backend/prompts/creativo.md` y `backend/services/gemini.js`: instrucciones para el asistente creativo del administrador y llamada REST a Gemini con `fetch` nativo, timeout de 15 segundos, clasificación de errores, validación de JSON y filtrado de frases prohibidas.
- `backend/routes/ia.js`: valida consultas públicas, conserva el filtro de correo/teléfono y el límite de 10 solicitudes por IP/minuto; usa solo recomendaciones preparadas por palabras clave y no contacta a proveedores externos.
- `backend/routes/ia-admin.js`: protege `POST /api/ia/admin/generar` con `verificarToken`, valida exclusivamente campos de producto, aplica límites globales en memoria y ofrece plantilla sin IA para descripciones.
- No existen actualmente `pedidos.json`, `contactos.json` ni `alianzas.json`; esos nombres sí aparecen excluidos en `.gitignore`.
- `backend/config/constructorRules.js`: fuente única de las categorías, límites de selección y precios base de los tamaños pequeño, mediano y grande. Sus precios están comentados como ejemplos.
- `backend/models/Producto.js`: esquema de MongoDB para los campos del producto, con un `id` numérico único que se conserva en las respuestas de la API.
- `backend/models/Solicitud.js`: modelo de solicitudes con tipo, estado inicial `nueva` y fecha de creación asignados por el servidor.
- `backend/models/Usuario.js`: usuarios administradores con correo único y normalizado, hash de contraseña no seleccionado por defecto, rol y fecha de creación.
- `backend/routes/auth.js`: login con comparación bcrypt, hash falso para correos inexistentes, limitador en memoria y JWT de dos horas; `/me` devuelve solo correo y rol.
- `backend/middleware/verificarToken.js`: verifica el token Bearer y requiere el rol `admin`.
- `backend/routes/solicitudes-admin.js`: consulta las solicitudes más recientes con filtro y límite, y permite cambiar solo a estados autorizados.
- `backend/scripts/crear-admin.js`: crea la primera cuenta de forma interactiva con contraseña oculta o mediante variables de entorno, sin sobrescribir usuarios existentes.
- `backend/routes/solicitudes.js`: acepta envíos públicos validados, descarta campos adicionales, incluye honeypot y limita a cinco solicitudes por IP y hora en memoria. La consulta y el cambio de estado se hacen en la ruta protegida `solicitudes-admin.js`.
- `backend/config/db.js`: conecta con `process.env.MONGODB_URI` y da un error claro si la variable falta o MongoDB no está disponible.
- `backend/scripts/seed.js`: inserta desde `productos.json` solo los IDs que todavía no existen; no sobrescribe productos existentes ni elimina el JSON.
- Reglas actuales del constructor: exactamente una base, al menos una fruta, hasta cuatro frutas y verduras combinadas, y hasta dos semillas o extras; los tamaños pequeño, mediano y grande tienen precios base de ejemplo.
- `backend/.env.example` incluye un marcador para `JWT_SECRET`, no un secreto real. `backend/.env` es local e ignorado por Git; no se leyó ni se modificó durante esta tarea.
- En producción el servidor exige que `JWT_SECRET` exista y tenga al menos 32 caracteres. El login requiere un secreto válido para firmar tokens.
- El generador privado usa `GEMINI_API_KEY`, `MODELO_IA`, `LIMITE_IA_POR_MINUTO` y `LIMITE_IA_DIARIO` desde variables de entorno. No hay modelo predeterminado. Los topes son 5 consultas por minuto y 100 por día por defecto, contadas en memoria por proceso; se reinician con el backend y no garantizan un máximo de facturación.
- Gemini solo está habilitado en el panel admin; no enviar consultas públicas ni datos de clientes a la API. La API no tiene modelos por defecto, y sus modelos, cuotas y precios pueden cambiar.
- Para revisar antes de configurar/publicar: [REST `generateContent`](https://ai.google.dev/api/generate-content), [guía de pensamiento](https://ai.google.dev/gemini-api/docs/thinking), [JSON estructurado](https://ai.google.dev/gemini-api/docs/structured-output), [términos de Gemini API](https://ai.google.dev/gemini-api/terms), [precios y cuotas](https://ai.google.dev/gemini-api/docs/pricing) y [políticas de datos](https://ai.google.dev/gemini-api/docs/feedback-policies).

### Dependencias instaladas

Leídas de `backend/package.json`:

| Paquete | Versión declarada | Uso actual |
|---|---:|---|
| `express` | `^5.2.1` | Servidor HTTP y API REST. |
| `dotenv` | `^18.0.7` | Cargar variables locales desde `backend/.env`. |
| `mongoose` | `^9.11.3` | Esquemas/modelos y conexión a MongoDB Atlas. |
| `bcryptjs` | `^3.0.3` | Compara contraseñas y almacena hashes de una sola vía. |
| `jsonwebtoken` | `^9.0.3` | Firma y verifica tokens de sesión con expiración. |

No hay `devDependencies` declaradas. `backend/package.json` declara Node.js `>=22 <23`.

## c. Frontend previo (snapshot histórico)

**Ubicación actual:** no hay una carpeta de frontend legacy en el árbol de trabajo. Las rutas `frontend-legacy/...` de esta sección describen los archivos del snapshot histórico `v1-js-puro`, según la confirmación del usuario.

### Páginas y funcionalidades

| Archivo del snapshot | Funcionalidad en esa versión histórica |
|---|---|
| `frontend-legacy/index.html` | Landing con mensaje de marca, botones al catálogo y al constructor, beneficios, tres destacados cargados desde la API y llamadas a otras páginas. |
| `frontend-legacy/smoothies.html` | Catálogo con carga desde `GET /api/productos`, estado de carga/error y filtro de categoría. |
| `frontend-legacy/crea-tu-smoothie.html` | Constructor paso a paso con tamaño, base, frutas, verduras, semillas/extras, nombre, vaso SVG, precio, avisos de selección y alérgenos, y botón “Sorpréndeme”. Guarda creaciones en `localStorage` (`smoothiefitCart`). |
| `frontend-legacy/admin.html` | Pantalla para pedir una clave y panel de productos. La página es estática; el backend protege las operaciones de escritura. |
| `frontend-legacy/productores.html` | Historia propuesta, criterios para proveedores y tres productores de ejemplo marcados como ficticios. |
| `frontend-legacy/sostenibilidad.html` | Propuesta cautelosa sobre empaques, materiales, residuos y proveedores locales. |
| `frontend-legacy/nosotros.html` | Historia del proyecto, misión, visión, valores y cuatro espacios para nombres y fotos del equipo. |

En ese snapshot histórico no se encontraron `contacto.html`, `colegios.html`, `puntos-de-venta.html` ni `pedidos.html`. La app React actual sí tiene página de Contacto y páginas informativas para Colegios y Puntos de venta.

### Scripts

| Archivo | Responsabilidad |
|---|---|
| `frontend-legacy/js/layout.js` | Inserta encabezado y pie de página, controla el menú hamburguesa y revela elementos al desplazarse con `IntersectionObserver`, respetando movimiento reducido. |
| `frontend-legacy/js/inicio.js` | Pide productos a la API y presenta los tres primeros como destacados. |
| `frontend-legacy/js/smoothies.js` | Pide productos, crea las tarjetas y filtra por categoría. |
| `frontend-legacy/js/constructor.js` | Carga ingredientes y reglas, valida la selección en el navegador, calcula precio, dibuja capas SVG, muestra alérgenos, genera una combinación aleatoria y guarda en el carrito local. |
| `frontend-legacy/js/admin.js` | Referencia histórica de gestión de productos; no se usa en el panel React actual. |

En el snapshot histórico, el constructor validaba las reglas en el navegador, pero el backend no recibía ni volvía a validar una orden de smoothie. El carrito permanecía en el navegador y no se registraba como pedido en el servidor.

### Constructor de smoothies y reglas actuales

El constructor del snapshot `v1-js-puro` presentaba cinco pasos: tamaño, base, frutas/verduras, semillas/extras y nombre. Su implementación validaba la selección en el navegador, calculaba el precio, dibujaba un vaso SVG y guardaba en `localStorage`; no creaba ni registraba pedidos en el backend. El constructor React actual sigue pendiente.

Las reglas se comparten desde `GET /api/reglas-constructor` y `backend/config/constructorRules.js`. La validación actual solo está en el navegador: si el constructor se conserva, el backend deberá volver a validar ingredientes, cantidades y precio antes de aceptar un pedido.

### Estilos, colores y textos reutilizables

El archivo histórico `frontend-legacy/css/styles.css` definía variables en `:root`:

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

El snapshot histórico incluía navegación, títulos, mensajes de landing, catálogo y constructor. La navegación actual de React se define en `frontend/src/App.jsx`; la ruta antigua `/crea-tu-smoothie` redirige a Inicio y el constructor React queda como mejora futura. Los textos heredados deben revisarse antes de volver a utilizarlos.

## d. Se reutiliza / Se reemplaza / Se descarta

| Pieza actual | Decisión para la nueva arquitectura | Motivo |
|---|---|---|
| Textos, estilos, navegación y layout del snapshot histórico `v1-js-puro` | **Se reutilizaron selectivamente como referencia** | Se adaptó la identidad visual a React; las afirmaciones no verificadas no deben reutilizarse. |
| Encabezado y pie del snapshot `v1-js-puro` | **Se reemplazaron** por componentes compartidos de React y rutas de HashRouter | React renderiza el layout actual y las rutas funcionan en GitHub Pages. |
| Páginas HTML del snapshot histórico | **Reemplazadas en el sitio actual** por páginas/componentes React | El requisito del curso exige React; las páginas antiguas ya no están en el árbol de trabajo. |
| Lógica de inicio y catálogo del snapshot `v1-js-puro` | **Se reemplazó** por componentes y servicios React para la API | Se conserva el contrato de catálogo, no la manipulación manual del DOM. |
| Endpoints REST de productos | **Se reutilizan inicialmente y se adaptan** para consultar la base de datos | La interfaz React puede seguir usando las rutas y campos del catálogo mientras cambia el almacenamiento. |
| `productos.json` | **Se conserva como fuente de seed**, mientras MongoDB queda como almacenamiento operativo | El seed idempotente carga productos faltantes y mantiene intacto el JSON como respaldo/datos iniciales. |
| `ingredientes.json` | **Se conserva como lectura local** por ahora | Es una lista pequeña, estática y de solo lectura; una base de datos no aporta valor mientras no necesite edición o consulta dinámica. |
| `backend/config/constructorRules.js` y su endpoint | **Se reutilizan** como contrato/reglas del constructor, con validación también en servidor si se aceptan pedidos | Evita duplicar límites y permite que el frontend lea reglas comunes. |
| Constructor y carrito `localStorage` del snapshot `v1-js-puro` | **Pendiente de reemplazo** en React | Es una mejora futura; si se conecta a pedidos, debe integrarse con una API real. |
| Middleware de clave compartida y pantalla de acceso del snapshot | **Reemplazados** en el flujo actual por usuarios, hashes seguros de contraseñas y JWT | Una clave compartida no distingue personas ni permite administrar sesiones de usuarios. |
| CRUD manual del DOM del snapshot `v1-js-puro` | **Reemplazado** en el sitio actual por un panel React con login JWT | Separa el acceso y la gestión del estado visual del navegador. |
| Perfiles ficticios de productores y datos marcados `esEjemplo` | **Se reutilizan solo como ejemplos identificados** o se reemplazan con datos reales confirmados | No deben presentarse como proveedores reales. |
| Espacios “Nombre del integrante” y “Foto del equipo” | **Se reemplazan** por información real cuando el equipo la entregue | Son marcadores, no datos finales. |
| Aparición con `IntersectionObserver` | **Se puede reemplazar o reutilizar** durante la fase extra de animación | La nueva implementación debe respetar movimiento reducido y no agregar complejidad sin necesidad. |
| `.gitkeep` | **Sin efecto funcional** | Algunos `.gitkeep` están en directorios que ya contienen archivos; se pueden retirar en una limpieza posterior si se desea. |

La carpeta local `frontend-legacy/` fue eliminada tras la confirmación del usuario. El contenido descrito en esta sección se considera referencia histórica del tag `v1-js-puro`, no parte del código ejecutable actual.

## e. Riesgos y cambios del backend para producción

### Orden recomendado

1. **Frontend y API publicados por separado.** `backend/server.js` sirve la API Express, no los archivos estáticos. `frontend/vite.config.js` configura `/SmoothieFit/` y `.github/workflows/deploy.yml` publica en GitHub Pages. La página `https://danncho.github.io/SmoothieFit/` respondió durante esta revisión.
2. **URL de API y CORS.** El frontend usa `VITE_API_URL`; el backend limita CORS a orígenes concretos mediante `CORS_ORIGINS` y rechaza `*`. El bundle publicado apunta a `https://smoothiefit-api.onrender.com`; la comprobación `/api/health` devolvió HTTP 503 el 24-10-2026.
3. **Productos en MongoDB.** `Producto`, la conexión Mongoose y el seed idempotente están implementados. La API desplegada no está saludable en esta revisión, así que no se confirmó la conexión real ni la consulta pública.
4. **Contacto con solicitudes.** La app React envía a `POST /api/solicitudes`; la ruta valida, usa honeypot y límite por IP, y persiste con el modelo `Solicitud`. La persistencia local requiere MongoDB y no se pudo verificar en producción por el estado 503.
5. **Autenticación y panel admin.** El login crea JWT de dos horas, las rutas privadas verifican el rol admin y el panel React gestiona productos y solicitudes. Se requieren `JWT_SECRET` y el usuario inicial; el estado actual de MongoDB impide confirmar el login desplegado.
6. **Sorbi público y Gemini admin.** Sorbi usa reglas y palabras clave, sin llamadas a servicios externos. `POST /api/ia/admin/generar` exige JWT admin y es la única ruta que consulta Gemini. La integración está en el código, pero no se ha probado con una clave real ni en producción.
7. **Hosting.** El servicio Render existe y responde en `/api/health`, pero devuelve HTTP 503; investigar y recuperar la conexión con MongoDB, después verificar CORS, catálogo, contacto, login y Gemini en producción. El backend lee `PORT`, confía en proxy y declara Node.js 22.

El frontend está publicado. No se confirma el funcionamiento end-to-end del catálogo, contacto, administración o Gemini mientras la API responda 503.

### Riesgos observados

1. **Límites de autenticación:** el token se conserva en `sessionStorage`, el limitador se guarda en memoria y no existe renovación de tokens. Para producción con mayores requisitos se recomiendan cookies `httpOnly`, HTTPS y limitación distribuida.
2. **Datos de productos:** la API ya no modifica `productos.json`; utiliza MongoDB. El JSON sigue siendo el origen de la carga inicial. Ingredientes y reglas se leen de JSON porque no requieren escrituras.
3. **Despliegue separado y CORS:** GitHub Pages no ejecuta Express. La API acepta los orígenes enumerados en `CORS_ORIGINS`; el valor de producción debe incluir `https://danncho.github.io`, sin una ruta de repositorio.
4. **Falta de validación de orden en el backend:** las reglas del constructor se validan en JavaScript del navegador. El servidor no recibe la creación ni confirma allí ingredientes y precio; el cliente podría alterar datos locales.
5. **IA y menores:** los términos de Gemini API prohíben su uso en aplicaciones dirigidas a menores o que probablemente serán accedidas por ellos. El asistente público no llama a Gemini ni a otro proveedor; el generador Gemini requiere autenticación y se limita al panel de administración. No trasladar la llamada a una ruta pública.
6. **Publicación parcial y persistencia no confirmada:** GitHub Pages sirve el frontend; el endpoint de salud de Render devolvió HTTP 503, por lo que no se confirma la API operativa ni la persistencia de productos y solicitudes.
7. **Revisión de secretos histórica pendiente:** el escaneo de archivos presentes (excluyendo `backend/.env`, `.git`, dependencias y artefactos) no encontró patrones de credenciales de alta confianza. No se inspeccionó `backend/.env` ni el historial de commits; por tanto, no se puede confirmar si una clave se publicó anteriormente.
8. **Muestras frente a información real:** productos e ingredientes actuales están marcados como ejemplo, y los productores se identifican como ficticios. Mantener esas etiquetas hasta reemplazarlos por información confirmada.
9. **Contenido de salud y sostenibilidad:** en las páginas de React revisadas no aparecen las afirmaciones médicas ni las frases “100% ecológico” o “único”. El snapshot histórico `v1-js-puro` incluye textos como “ingredientes 100% naturales” y “garantizar frescura y naturalidad”; no forman parte del build actual y no se deben reutilizar como afirmaciones verificadas.
10. **Redes sociales:** el pie de página actual no muestra enlaces sociales, porque no se confirmaron perfiles oficiales.

## f. Revisión de secretos

La revisión fue sobre archivos presentes, no sobre el historial:

- `backend/.env` existe localmente y `.gitignore` excluye los archivos `.env`. No se leyó ni se modificó su contenido.
- `.gitignore` incluye `backend/data/pedidos.json`, `backend/data/contactos.json` y `backend/data/alianzas.json`. Esos tres archivos no existen en el árbol actual.
- `backend/data/productos.json` y `backend/data/ingredientes.json` no están excluidos; contienen los ejemplos del proyecto y deben seguir siendo datos no sensibles.
- `backend/.env.example` contiene marcadores para configurar variables, no valores privados.
- En el escaneo de archivos presentes no se encontraron patrones de claves conocidas, JWT literales, asignaciones de credenciales o URI de bases de datos con credenciales. La revisión no garantiza encontrar todo secreto posible y excluyó `backend/.env`, `.git`, dependencias y artefactos generados.
- **No verificado:** si `backend/.env` o algún dato sensible apareció en un commit anterior o sigue presente en ramas remotas. No se revisó el historial porque la instrucción de esta tarea prohíbe ejecutar comandos de Git.

Comandos de solo lectura que puedes ejecutar desde la raíz para revisar historial. No modifican el repositorio. El segundo solo muestra commits y nombres de archivos con diferencias que coinciden con patrones sensibles; no imprime las líneas encontradas:

```powershell
git log --all --oneline --decorate
git log --all -G "(password|passwd|secret|token|api[_-]?key|mongodb(\+srv)?://|postgres(ql)?://|mysql://|BEGIN .*PRIVATE KEY)" --format="%h %s" --name-only
git log --all --name-status -- .env backend/.env backend/data/pedidos.json backend/data/contactos.json backend/data/alianzas.json
```

Si un commit aparece, revísalo en privado y no pegues claves en chats, capturas ni documentación. Si encuentras un secreto publicado, quitarlo del último estado no basta: revoca o cambia la clave y coordina la limpieza del historial antes de hacer público el repositorio.

## g. Plan de migración por fases

| Fase | Qué se hace | Qué se reutiliza | Riesgo principal |
|---|---|---|---|
| 1. React base con Vite, Router y layout | Implementado; `frontend/` usa React, Vite y HashRouter. | Elementos visuales adaptados desde el snapshot histórico `v1-js-puro`. | Mantener las rutas del build estático. |
| 2. Landing, catálogo e informativas en React | Implementado en código; el catálogo depende de que la API esté saludable. El constructor sigue como placeholder. | Datos y API de productos y estilo visual revisado. | Enlaces incompletos o datos de ejemplo presentados como reales. |
| 3. Base de datos real (MongoDB Atlas + Mongoose) | Modelos, conexión y seed implementados; salud de producción devolvió 503 y la conexión no quedó verificada. Ingredientes y reglas siguen como JSON. | `Producto`, conexión Mongoose y `productos.json` como fuente de seed. | Credenciales filtradas, modelo incorrecto o datos de muestra tomados como reales. |
| 4. Contacto real con solicitudes | Formulario y persistencia Mongoose implementados; guardado publicado no verificado por el 503 de salud. | Modelo `Solicitud`, servicio API, estilo de marca. | Recopilar datos personales sin reglas de acceso, retención y protección. |
| 5. Publicación (GitHub Pages + Render) | Frontend publicado y alcanzable; backend Render responde 503 en salud. | Vite, API separada, URL y CORS configurables. | GitHub Pages no ejecuta Node; se requiere conexión entre los servicios y base disponible. |
| 6. Login real con JWT y panel admin | Implementado en código; login publicado sin verificar. | Usuarios, hashes bcrypt, token de dos horas y endpoints protegidos. | El token se guarda en `sessionStorage`; el limitador es solo de memoria y no hay renovación. |
| 7. Sorbi público y creatividad Gemini admin | Implementado en código; Sorbi usa reglas y palabras clave. Gemini solo se llama desde `POST /api/ia/admin/generar`, con JWT, datos de producto, cuotas, filtro y respaldo de descripción. | Catálogo y reglas de marca aprobadas. | Mantener Gemini exclusivamente en administración adulta; el nivel gratuito puede usar entradas para mejorar productos. |
| 8. Constructor de smoothies en React (extra) | Migrar el constructor y conectar selecciones válidas al backend y, si corresponde, al carrito/pedidos. | Ingredientes, `constructorRules.js`, alérgenos y SVG actual como referencia. | Validar precio solo en el navegador o prometer información de alérgenos no confirmada. |
| 9. Animaciones y responsive (extra) | Probar en tamaños de pantalla y agregar animaciones pequeñas solo si aportan claridad y se respetan preferencias de movimiento reducido. | Variables CSS y diseño actual. | Dependencias adicionales, carga lenta o movimiento que dificulte la accesibilidad. |
| 10. Revisión final y guía de defensa | Probar rutas y formularios, revisar seguridad, datos, contenido, publicación, documentación y preparar explicaciones en palabras del estudiante. | `README.md`, este diagnóstico y las reglas de contenido. | Declarar cumplido algo que no se haya probado o desplegado realmente. |

## h. Dependencias nuevas en orden de incorporación

Las dependencias indicadas reflejan el estado actual del proyecto.

| Orden | Dependencia | Para qué sirve y por qué se necesita |
|---|---|---|
| 1 | `react` | Permite construir la interfaz en componentes reutilizables. |
| 2 | `react-dom` | Renderiza la aplicación React en el DOM del navegador. |
| 3 | `vite` | Ejecuta el entorno de desarrollo y genera los archivos estáticos para GitHub Pages. |
| 4 | `@vitejs/plugin-react` | Integra React y JSX con Vite durante desarrollo y compilación. |
| 5 | `react-router-dom` | Proporciona `HashRouter` y rutas compatibles con hosting estático como GitHub Pages. |
| 6 | `mongoose` | Define modelos y conecta el backend Node.js con MongoDB Atlas; ya está instalado para persistir productos. |
| 7 | `cors` | Permite llamadas del frontend alojado en otro dominio, limitando los orígenes autorizados. |
| 8 | `bcryptjs` | Genera y compara hashes de contraseña sin guardar la contraseña como texto plano. |
| 9 | `jsonwebtoken` | Firma y verifica los tokens JWT usados para autenticar sesiones y proteger operaciones administrativas. |
| Opcional | Librería de animaciones (por decidir) | Podría facilitar animaciones, pero no es necesaria para los requisitos base y se debe justificar antes de añadirla. |

`express` y `dotenv` ya están declaradas en el backend. La integración usa `fetch` nativo de Node.js 22, así que no agrega SDK ni otra dependencia. No se requiere una dependencia separada para el formulario de contacto.

## i. Checklist de requisitos del curso

| Requisito | Estado | Evidencia local |
|---|---|---|
| Landing / inicio con marca, mensaje, secciones y navegación | Cumple en código y publicada | `frontend/src/pages/HomePage.jsx`; GitHub Pages respondió durante esta revisión. |
| Catálogo con productos y detalles claros | Implementado en código; disponible en producción no verificado | `frontend/src/pages/SmoothiesPage.jsx` y `GET /api/productos`; `/api/health` de Render devolvió 503. |
| Contacto real que envíe o registre solicitudes | Implementado en código; persistencia publicada no verificada | `frontend/src/pages/ContactPage.jsx`, `POST /api/solicitudes` y modelo Mongoose `Solicitud`; la API respondió 503. |
| Panel admin con login y zona de gestión | Implementado en código; login publicado no verificado | `AdminLoginPage.jsx`, `AdminPage.jsx`, bcrypt, JWT y endpoints protegidos; depende de MongoDB disponible y `JWT_SECRET`. |
| IA aplicada al negocio | Implementada en código; Gemini real pendiente de configurar/probar | Gemini solo en `backend/routes/ia-admin.js`, protegido con JWT; Sorbi usa reglas y palabras clave, sin IA externa. |
| Publicación disponible en internet | Parcial | El workflow publica el frontend y la página se alcanzó; el backend Render devuelve HTTP 503 en `/api/health`. |
| Frontend con React | Cumple | Vite, React, HashRouter, layout, landing, catálogo y páginas informativas en `frontend/`. |
| Mínimo 15 commits | No verificado | No se ejecutaron comandos de Git, según la instrucción. Debe comprobarse con el historial local. |
| Repositorio en GitHub | Público y alcanzable | `https://github.com/Danncho/SmoothieFit` respondió durante esta revisión. |
| Despliegue del frontend en GitHub Pages | Publicado y alcanzable | `.github/workflows/deploy.yml`; la URL pública respondió durante esta revisión. |
| Diseño responsive | Parcial | `frontend/src/styles/base.css` incluye estilos responsive; hace falta confirmar la experiencia en navegadores/tamaños reales. |
| Dependencias justificadas y explicables | Parcial | La integración usa `fetch` nativo de Node.js 22 y no agregó dependencias. Revisar términos y privacidad de Google antes de configurar una clave. |
| Reglas de contenido y muestras | Parcial | Productos e ingredientes tienen `esEjemplo`; productores indican que son ficticios. Revisar todo texto nuevo al migrar. |

Los estados “No verificado” significan que la instrucción de no usar Git o la falta de evidencia local impide confirmarlo; no equivalen a que el requisito se haya cumplido.

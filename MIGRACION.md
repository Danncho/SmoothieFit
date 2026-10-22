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
│   │   └── constructorRules.js
│   ├── data/
│   │   ├── .gitkeep
│   │   ├── ingredientes.json
│   │   └── productos.json
│   ├── middleware/
│   │   └── adminAuth.js
│   ├── package.json
│   ├── package-lock.json
│   ├── routes/
│   │   ├── .gitkeep
│   │   ├── ingredientes.js
│   │   ├── productos.js
│   │   └── reglas-constructor.js
│   └── server.js
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

La carpeta `frontend-legacy/` contiene el frontend anterior, hecho con HTML, CSS y JavaScript puros. La carpeta `frontend/` queda libre para crear la nueva aplicación React.

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

Las rutas se conectan en `backend/server.js`. El servidor también publica los archivos estáticos de `frontend-legacy/`, acepta cuerpos JSON y devuelve un mensaje JSON para JSON malformado o errores no controlados.

### Datos, reglas y configuración

- `backend/data/productos.json`: catálogo de seis productos con precios e ingredientes de ejemplo. Los registros tienen `esEjemplo: true`.
- `backend/data/ingredientes.json`: lista de ingredientes con categoría, precio extra, color y alérgenos; los registros tienen `esEjemplo: true`.
- No existen actualmente `pedidos.json`, `contactos.json` ni `alianzas.json`; esos nombres sí aparecen excluidos en `.gitignore`.
- `backend/config/constructorRules.js`: fuente única de las categorías, límites de selección y precios base de los tamaños pequeño, mediano y grande. Sus precios están comentados como ejemplos.
- `backend/middleware/adminAuth.js`: compara `x-admin-key` con `process.env.ADMIN_KEY`; si no coincide o la variable no está configurada, responde HTTP 401. Protege solo las escrituras de productos.
- `backend/.env.example` contiene una clave de reemplazo de muestra. `backend/.env` está presente localmente y `.gitignore` contiene `.env`; la clave no se ha copiado a este informe.
- La variable de entorno utilizada por el código es `ADMIN_KEY`, cargada por `dotenv` en `backend/server.js`.

### Dependencias instaladas

Leídas de `backend/package.json`:

| Paquete | Versión declarada | Uso actual |
|---|---:|---|
| `express` | `^5.2.1` | Servidor HTTP, API y archivos estáticos. |
| `dotenv` | `^18.0.7` | Cargar variables locales desde `backend/.env`. |

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
| `inicio.js` y `smoothies.js` | **Se reemplazan** por componentes y servicios React para la API | Conservan el contrato del catálogo, pero no el mecanismo de manipulación manual del DOM. |
| Endpoints REST de productos | **Se reutilizan inicialmente y se adaptan** para consultar la base de datos | La interfaz React puede seguir usando las rutas y campos del catálogo mientras cambia el almacenamiento. |
| `productos.json` e `ingredientes.json` | **Se reemplazan como almacenamiento vivo** por MongoDB Atlas; se pueden usar como datos iniciales de carga | Los archivos locales no son una base persistente apropiada para hosting efímero. Conservarlos como ejemplos requiere una decisión explícita. |
| `constructorRules.js` y su endpoint | **Se reutilizan** como contrato/reglas del constructor, con validación también en servidor si se aceptan pedidos | Evita duplicar límites y permite que el frontend lea reglas comunes. |
| `frontend-legacy/js/constructor.js` y el carrito en `localStorage` | **Se reemplaza** si se mantiene el constructor; también puede posponerse porque es extra en el plan | El nuevo frontend será React y el pedido debe integrarse con una API real si se necesita persistencia. |
| `adminAuth.js`, clave compartida y pantalla de clave actual | **Se reemplazan** por usuarios, contraseñas cifradas y JWT | Una clave compartida no distingue personas ni permite administrar sesiones de usuarios. |
| `admin.js` y CRUD manual del DOM | **Se reemplaza** por un panel React que use el login real | Separa el acceso y la gestión del estado visual del navegador. |
| Perfiles ficticios de productores y datos marcados `esEjemplo` | **Se reutilizan solo como ejemplos identificados** o se reemplazan con datos reales confirmados | No deben presentarse como proveedores reales. |
| Espacios “Nombre del integrante” y “Foto del equipo” | **Se reemplazan** por información real cuando el equipo la entregue | Son marcadores, no datos finales. |
| Aparición con `IntersectionObserver` | **Se puede reemplazar o reutilizar** durante la fase extra de animación | La nueva implementación debe respetar movimiento reducido y no agregar complejidad sin necesidad. |
| `.gitkeep` | **Se descarta al dejar de ser necesario** | Solo mantiene vacías carpetas en Git; no es una función del sitio. |

No se debe borrar ni sobrescribir `frontend-legacy/`; se conservará como referencia mientras React se desarrolla en `frontend/`.

## e. Riesgos y problemas para producción

1. **Panel de administración con clave compartida:** existe una sola clave para todas las personas administradoras; queda en `sessionStorage` y se envía desde el navegador. La protección actual sirve para una demostración, no para usuarios reales. Usar HTTPS y sustituirla por autenticación individual.
2. **Archivos JSON como almacenamiento:** los productos se modifican escribiendo directamente en disco. Algunos hostings gratuitos reinician o no conservan el disco, y dos escrituras simultáneas pueden pisarse. Migrar los datos a la base prevista.
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
| 3. Base de datos real (MongoDB Atlas + Mongoose) | Crear modelos y conexión segura; migrar productos e ingredientes; dejar de depender de JSON para datos editables. | Campos actuales y archivos JSON como posible semilla inicial después de validarlos. | Credenciales de conexión filtradas, modelo incorrecto o datos de muestra tomados como reales. |
| 4. Contacto real con solicitudes | Crear formulario accesible, validación de servidor y endpoint persistente para registrar solicitudes. | Tono y diseño de marca; rutas Express existentes como patrón sencillo. | Recopilar datos personales sin reglas de acceso, retención y protección. |
| 5. Primera publicación (GitHub Pages + hosting del backend) | Publicar frontend estático en GitHub Pages y desplegar backend en un servicio compatible; configurar URL de API y CORS por ambiente. | Vite y API después de separar frontend/backend. | GitHub Pages no ejecuta Node; dominios distintos requieren CORS, HTTPS y variables de entorno configuradas. |
| 6. Login real con JWT y panel admin | Crear usuarios, guardar contraseñas cifradas, emitir/verificar JWT y proteger las rutas de gestión. JWT es un token firmado que permite identificar una sesión; no reemplaza una contraseña segura ni debe tratarse como secreto de texto plano. | Campos de producto, formularios y operaciones CRUD existentes. | Errores de autenticación, permisos insuficientes o almacenamiento inseguro de tokens. |
| 7. Módulo de IA con respaldo | Implementar una función útil (por ejemplo, recomendar mezclas según preferencias), llamar al proveedor solo desde backend y devolver una respuesta determinista si la IA falla. | Ingredientes, catálogo y tono sencillo. | Proveedor/costo aún no elegido, filtrar una clave de IA o dar respuestas incorrectas como hechos. |
| 8. Constructor de smoothies en React (extra) | Migrar el constructor y conectar selecciones válidas al backend y, si corresponde, al carrito/pedidos. | Ingredientes, `constructorRules.js`, alérgenos y SVG actual como referencia. | Validar precio solo en el navegador o prometer información de alérgenos no confirmada. |
| 9. Animaciones y responsive (extra) | Probar en tamaños de pantalla y agregar animaciones pequeñas solo si aportan claridad y se respetan preferencias de movimiento reducido. | Variables CSS y diseño actual. | Dependencias adicionales, carga lenta o movimiento que dificulte la accesibilidad. |
| 10. Revisión final y guía de defensa | Probar rutas y formularios, revisar seguridad, datos, contenido, publicación, documentación y preparar explicaciones en palabras del estudiante. | `README.md`, este diagnóstico y las reglas de contenido. | Declarar cumplido algo que no se haya probado o desplegado realmente. |

## h. Dependencias nuevas

Estas son candidatas para el plan, no están instaladas por esta tarea. La selección final debe respetar lo permitido por el curso y poder explicarse en la defensa.

| Nombre | Para qué sirve y por qué se necesita |
|---|---|
| `vite` | Inicia y compila el frontend React con una configuración simple para desarrollo y publicación estática. |
| `react` | Permite construir la interfaz con componentes reutilizables. |
| `react-dom` | Muestra los componentes React en la página del navegador. |
| `react-router-dom` | Proporciona `HashRouter` y navegación entre páginas que funciona en hosting estático como GitHub Pages. |
| `mongoose` | Define modelos y conecta el backend Node.js con MongoDB Atlas. |
| `cors` | Permite al navegador llamar al backend cuando frontend y backend estén en dominios separados, limitando los orígenes autorizados. |
| `bcryptjs` (o `bcrypt`, decisión pendiente) | Cifra las contraseñas antes de guardarlas, de modo que no se almacenen como texto legible. |
| `jsonwebtoken` | Crea y verifica los tokens JWT del login real. |
| SDK del proveedor de IA (por decidir) | Facilita llamar a la IA desde el backend; no elegir ni instalar hasta decidir proveedor y revisar permisos/costos. |
| Librería de animaciones (opcional, por decidir) | Puede simplificar animaciones, pero no es necesaria para los requisitos base y se debe confirmar con el mentor antes de añadirla. |

`express` y `dotenv` ya están declaradas en el backend y no cuentan como dependencias nuevas del plan.

## i. Checklist de requisitos del curso

| Requisito | Estado | Evidencia local |
|---|---|---|
| Landing / inicio con marca, mensaje, secciones y navegación | Parcial | `frontend-legacy/index.html` tiene hero, beneficios, destacados y llamadas a acción; todavía usa HTML/JS, no React. |
| Catálogo con productos y detalles claros | Parcial | `frontend-legacy/smoothies.html`, `frontend-legacy/js/smoothies.js` y `backend/data/productos.json`; los productos son de ejemplo y el frontend debe migrarse a React. |
| Contacto real que envíe o registre solicitudes | Falta | No se encontró página de contacto, endpoint ni archivo/base de solicitudes. El enlace `contacto.html` no tiene destino local. |
| Panel admin con login y zona de gestión | Parcial | `frontend-legacy/admin.html`, `frontend-legacy/js/admin.js` y endpoints de escritura con `adminAuth`; usa una clave compartida, no usuarios y contraseñas cifradas. |
| IA aplicada con respaldo sin IA | Falta | No se encontró módulo o llamada de IA ni respuesta de respaldo. |
| Publicación disponible en internet | Falta / No verificado | No se encontró configuración local de GitHub Pages ni hosting del backend. No se comprobó una URL pública. |
| Frontend con React | Falta | No hay `package.json` de frontend, Vite, dependencias React ni componentes React en el árbol. |
| Mínimo 15 commits | No verificado | No se ejecutaron comandos de Git, según la instrucción. Debe comprobarse con el historial local. |
| Repositorio en GitHub | No verificado | Se inspeccionaron archivos, no el remoto ni GitHub. |
| Despliegue del frontend en GitHub Pages | Falta / No verificado | No hay configuración de despliegue en el árbol; URL externa no verificada. |
| Diseño responsive | Parcial | `frontend-legacy/css/styles.css` contiene media queries y estilos de móvil; la nueva versión React todavía no existe. |
| Dependencias justificadas y explicables | Parcial | El backend declara `express` y `dotenv` con usos documentados en `README.md`; las dependencias futuras y permiso del curso siguen pendientes. |
| Reglas de contenido y muestras | Parcial | Productos e ingredientes tienen `esEjemplo`; productores indican que son ficticios. Revisar todo texto nuevo al migrar. |

Los estados “No verificado” significan que la instrucción de no usar Git o la falta de evidencia local impide confirmarlo; no equivalen a que el requisito se haya cumplido.

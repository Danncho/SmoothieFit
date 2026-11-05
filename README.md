# SmoothieFit

SmoothieFit es un proyecto académico que presenta una propuesta de smoothies, una experiencia para explorar combinaciones y un modelo de operación todavía en planificación. Los productos, ingredientes y precios publicados en el ejemplo no son una oferta comercial confirmada.

## Estado de los entregables

Evaluación actualizada el 05-11-2026. Se comprobaron manualmente en producción la landing, la publicación con carga de datos, los votos, contacto, constructor y pedido, el login del administrador, la creación, edición y eliminación de un producto de prueba, el cambio de estado de una solicitud, Gemini en el panel y Sorbi.

| Entregable | Estado real | Evidencia y límite |
|---|---|---|
| Landing | Verificada manualmente en producción hoy. | `frontend/src/pages/HomePage.jsx`; la página abre y muestra contenido. |
| Catálogo “Favoritos del público” | Verificado manualmente en producción hoy: votos. | `frontend/src/pages/SmoothiesPage.jsx`, `GET /api/productos` y `POST /api/productos/:id/voto`. Los votos disponibles son pruebas académicas, no una encuesta representativa ni prueba de demanda. |
| Contacto real | Verificado manualmente en producción hoy. | `ContactPage.jsx`, `POST /api/solicitudes`, modelo `Solicitud` y MongoDB vía Mongoose. |
| Constructor y pedido | Verificado manualmente en producción hoy. | `ConstructorPage.jsx`; la creación y el pedido siguen siendo una simulación académica. |
| Panel con login y administración | Verificado manualmente en producción hoy: login, creación, edición y eliminación de un producto de prueba, y cambio de estado de una solicitud. | `AdminLoginPage.jsx`, `AdminPage.jsx`, bcrypt, JWT y rutas protegidas. |
| IA aplicada | Verificada manualmente en producción hoy: Gemini en el panel y Sorbi. | Gemini asiste al administrador con texto de productos. Sorbi recomienda, indica el local y responde sin dar consejo nutricional. |
| Publicación | Verificada manualmente en producción hoy: la página abre y carga datos. | Se comprobó la carga de la página y sus datos; otras operaciones administrativas no se verificaron. |

Otros requisitos del curso:

- **React:** implementado con React, React DOM, Vite y `HashRouter`.
- **Responsive:** una revisión automática no encontró desbordamiento horizontal en 12 rutas. La revisión visual manual en celular está hecha.
- **Repositorio en GitHub:** el enlace público al repositorio respondió durante esta revisión.
- **GitHub Pages:** la página respondió el 03-11-2026.
- **Mínimo de commits:** **no verificado**. El estudiante puede comprobarlo desde la raíz con `git rev-list --count HEAD`; no se ejecutó Git para esta documentación.

## Modelo de negocio — PLAN

Se propone un **único punto piloto pequeño en el Mall del Sol, Guayaquil**. Hoy no hay local abierto. El punto exacto sería de preferencia cerca de un gimnasio, por confirmar. El formato también está por definir: isla o kiosco, local pequeño o rincón dentro de un gimnasio.

- **Público prioritario:** jóvenes y adultos activos.
- **Público secundario:** familias y colegios; la propuesta para colegios está en desarrollo.
- **Canales en propuesta:** atención en el local si se concreta; pedido para retirar, que ahora es una simulación académica; conversaciones con colegios y posibles alianzas con gimnasios y tiendas de salud. No hay acuerdos confirmados.
- **Validación del punto:** observar afluencia de público, gimnasios cercanos, arriendo, condiciones y reglas del centro comercial (horarios, agua, electricidad e ingreso de proveedores), y competencia visible.
- **Validación de demanda antes de abrir:** medir ventas por hora en una prueba piloto y realizar una encuesta de intención de compra. No hay resultados de esas mediciones documentados.
- **Decisión de crecimiento:** dependerá de los resultados del piloto.

No se han confirmado arriendo, ventas, costos operativos, proveedores, clientes, acuerdos, horario, teléfono ni punto exacto dentro del centro comercial.

## Números financieros — SUPUESTOS del ejemplo

Estos valores son exclusivamente un ejercicio para estimar viabilidad; no son costos, precios, ventas ni proyecciones observadas de SmoothieFit.

- Precio supuesto por smoothie: **USD 3,00**.
- Costo variable supuesto por unidad: **USD 1,50**.
- Margen de contribución supuesto por unidad: **USD 1,50**.
- Costos fijos usados en el escenario central: **USD 5.000 al mes**.
- Fórmula: **punto de equilibrio en unidades = costos fijos mensuales / margen por unidad**. Se redondea hacia arriba para cubrir los costos.

| Costos fijos mensuales del ejemplo | Unidades aproximadas al mes | Unidades aproximadas al día |
|---:|---:|---:|
| USD 3.000 | 2.000 | 67 |
| USD 4.000 | 2.667 | 89 |
| USD 5.000 | 3.334 | 111 |

Como regla del ejercicio, cada **USD 1.000** de costos fijos mensuales exige aproximadamente **667 smoothies al mes**, o unos **22 al día**. La referencia diaria usa un mes de 30 días.

El margen de USD 1,50 no incluye mermas, comisiones de cobro ni impuestos. La tabla debe completarse con arriendo, personal, servicios y permisos reales. Los precios del constructor son ejemplos y deben recalcularse con el costo real de cada ingrediente. El punto de equilibrio no es una meta de ventas confirmada.

## Trámites y requisitos por verificar

Esta lista es una guía para consultar con las entidades y el centro comercial; **ningún requisito, categoría, tasa o vigencia está confirmado en este documento**. No sustituye asesoría legal o contable.

- Permiso de funcionamiento de ARCSA para establecimientos de alimentos y bebidas: confirmar categoría aplicable, tasas, vigencia y condiciones.
- RUC ante el SRI.
- Patente municipal de Guayaquil.
- Permiso del Cuerpo de Bomberos.
- Uso de suelo.
- Certificados o requisitos aplicables al personal que manipula alimentos.
- Requisitos propios del centro comercial, incluyendo horarios, agua, electricidad, ingreso de proveedores, formato permitido y condiciones de arriendo.

## Arquitectura

| Parte | Tecnología | Responsabilidad |
|---|---|---|
| Sitio | React, React DOM, Vite, `HashRouter` y CSS | Landing, favoritos, constructor, contacto, asistente y panel. |
| API | Node.js 22, Express y Mongoose | Validación de solicitudes, cálculo del constructor, autenticación y operaciones de administración. |
| Base de datos | MongoDB Atlas mediante Mongoose | Productos, solicitudes y cuentas administrativas. La conexión observada en `/api/health` estaba disponible durante la comprobación indicada. |
| Hosting del sitio | GitHub Pages | Publica el build estático del frontend. |
| Hosting de la API | Render | Ejecuta el backend por separado; CORS permite orígenes expresamente configurados. |

El repositorio contiene `.github/workflows/deploy.yml` para construir y publicar el frontend: se activa con cambios del frontend en `main` o manualmente, instala dependencias con `npm ci`, exige la variable de repositorio `VITE_API_URL` y publica `frontend/dist`. No hay en este repositorio una definición de despliegue automatizado de Render; la configuración actual del servicio debe verificarse en su panel. La página y la salud de la API se consultaron el 03-11-2026, pero no se midieron latencias ni se probaron todas las operaciones.

## Estructura principal

```text
.
├── .github/workflows/deploy.yml
├── CONTEXTO.md
├── README.md
├── docs/MIGRACION.md
├── backend/
│   ├── config/                 # Base de datos y reglas del constructor
│   ├── data/                   # JSON de seed, ingredientes y ficha del punto
│   ├── middleware/             # Verificación del JWT
│   ├── models/                 # Producto, Solicitud y Usuario
│   ├── prompts/                # Instrucciones de Gemini para administración
│   ├── routes/                 # API Express
│   ├── scripts/                # Seed y creación del administrador
│   ├── services/               # Cliente de Gemini
│   └── server.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── components/         # Incluye el chat y widget de Sorbi
        ├── config/             # Configuración de interfaz
        ├── context/            # Sesión de administración
        ├── hooks/              # Carga de datos
        ├── pages/              # Pantallas de la aplicación
        ├── services/           # Cliente HTTP
        ├── sorbi/               # Motor, conocimiento, carga de datos y pruebas
        ├── styles/
        └── utils/
```

La estructura puede cambiar conforme avance el trabajo; el detalle técnico actualizado está en [docs/MIGRACION.md](./docs/MIGRACION.md).

## API REST

Las rutas se montan bajo `/api`. Las rutas protegidas requieren un JWT de administrador en el encabezado `Authorization`, usando el esquema Bearer.

| Método | Endpoint | Acceso y función |
|---|---|---|
| `GET` | `/api/health` | Público; indica si Mongoose está conectado. |
| `POST` | `/api/auth/login` | Público; valida credenciales y devuelve JWT. |
| `GET` | `/api/auth/me` | JWT de administrador; comprueba la sesión. |
| `GET` | `/api/productos` | Público; lista productos. |
| `GET` | `/api/productos/:id` | Público; consulta un producto. |
| `POST` | `/api/productos/:id/voto` | Público; registra un voto respetando límites por IP. |
| `POST`, `PUT`, `DELETE` | `/api/productos` y `/api/productos/:id` | JWT de administrador; gestiona productos. |
| `GET` | `/api/ingredientes` | Público; devuelve ingredientes de ejemplo desde JSON. |
| `GET` | `/api/reglas-constructor` | Público; devuelve reglas y valores de ejemplo. |
| `GET` | `/api/sucursales` | Público; por compatibilidad de nombre, devuelve una lista con la ficha del único punto planificado. |
| `POST` | `/api/solicitudes` | Público; valida y guarda solicitudes. Para el tipo `pedido`, valida la creación y calcula el precio en el servidor. |
| `GET`, `PATCH` | `/api/solicitudes` y `/api/solicitudes/:id` | JWT de administrador; consulta solicitudes y actualiza su estado. |
| `POST` | `/api/ia/admin/generar` | JWT de administrador; solicita sugerencias a Gemini para un producto. |

El límite de solicitudes públicas y los controles de login, votos y Gemini son en memoria; no se comparten entre instancias y se reinician al reiniciar el proceso.

## Votos, constructor y solicitudes

- Los votos se guardan en el producto de MongoDB. El backend limita un voto por producto e IP dentro de una ventana de 24 horas y un máximo de 20 votos por hora desde esa conexión. El navegador también guarda una marca local temporal. Estos límites no prueban identidad y no hacen que los votos sean una encuesta representativa; los conteos de la demostración son pruebas académicas.
- El constructor carga ingredientes y reglas de ejemplo desde la API. El navegador calcula una estimación para mostrarla; al enviar, el backend vuelve a comprobar los identificadores, tamaño y límites y calcula el precio con sus propias reglas. Así no confía en un precio enviado por el navegador.
- La solicitud de retiro se guarda como interés académico, con código de referencia. No procesa pago, no confirma inventario ni garantiza retiro. El local del Mall del Sol sigue planificado y no está abierto.
- Los alérgenos que aparecen proceden de los datos declarados para ingredientes de ejemplo. No son una garantía de ausencia de contaminación cruzada ni de que el producto sea seguro para una persona alérgica.

## Sorbi, Gemini y privacidad

Sorbi normaliza el texto, identifica intenciones y preferencias mediante vocabulario y sinónimos, y tolera ciertos errores de escritura mediante distancia de edición. Sus recomendaciones usan reglas locales y datos públicos previamente cargados; las preguntas se procesan en el navegador, sin enviarse a un modelo o servicio externo. El motor y sus pruebas están en `frontend/src/sorbi/`.

La geolocalización solo se intenta después de una acción del usuario y del permiso del navegador. Si se entregan coordenadas, Sorbi calcula una distancia aproximada en el dispositivo y no envía ni guarda esas coordenadas. Actualmente las coordenadas del punto están por definir; por ello no se puede calcular esa distancia.

Gemini se llama desde el backend únicamente para sugerencias administrativas. El servidor valida campos de producto, filtra entradas con patrones de datos personales, instrucciones evidentes y contenido prohibido, exige una respuesta JSON con opciones de texto y limita longitud y cantidad. Si falla Gemini, una descripción puede generarse con una plantilla local; no es una respuesta de un segundo modelo. La clave permanece en el entorno privado del backend. Como el sitio incluye menores, Gemini no forma parte de la experiencia pública y su uso debe respetar las restricciones vigentes de la API.

## Configuración de entorno

Solo se documentan nombres y propósitos; nunca se deben publicar valores. Los secretos van en el entorno privado del proveedor o en un archivo local ignorado.

| Variable | Dónde | Propósito |
|---|---|---|
| `PORT` | Backend | Puerto HTTP; localmente el servidor usa un valor de respaldo. |
| `CORS_ORIGINS` | Backend | Orígenes frontend permitidos, separados por comas; no se permite `*`. |
| `MONGODB_URI` | Backend | URI privada para MongoDB Atlas o una base local. |
| `JWT_SECRET` | Backend | Clave privada de firma JWT; producción requiere al menos 32 caracteres. |
| `GEMINI_API_KEY`, `MODELO_IA` | Backend | Clave privada y modelo para sugerencias administrativas. |
| `LIMITE_IA_POR_MINUTO`, `LIMITE_IA_DIARIO` | Backend, opcionales | Límites configurables de sugerencias Gemini; el control reside en memoria. |
| `VITE_API_URL` | Build frontend / GitHub Actions | Base pública de la API, incluida la ruta `/api`; el workflow la requiere. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo `crear-admin`, opcionales | Permiten creación no interactiva del primer administrador; deben configurarse juntos. |
| `NODE_ENV` | Backend | El servidor comprueba la longitud del secreto en producción. |

`backend/.env.example` contiene nombres y valores de muestra para configuración; no copies sus marcadores como credenciales reales. No se debe subir ningún `.env`.

## Ejecutar en local

Requisitos: Node.js compatible con el proyecto, npm y una instancia MongoDB accesible. En PowerShell, abre una terminal para cada servicio.

Backend:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Configura las variables necesarias localmente sin compartirlas. Luego:

```powershell
npm run seed
npm run crear-admin
npm start
```

El seed carga los productos de ejemplo que todavía no existan. `crear-admin` solicita las credenciales de manera interactiva y oculta la contraseña, o admite las dos variables de creación no interactiva documentadas arriba.

Frontend, en otra terminal:

```powershell
cd frontend
npm ci
npm run dev
npm run test:sorbi
npm run build
```

Vite muestra la dirección local. Su proxy envía `/api` al backend local. La prueba de Sorbi usa `node:test` y no requiere servicio externo.

## Guía de trámites antes de operar

Verifica con ARCSA la categoría, tasas y vigencia aplicables al permiso de funcionamiento de alimentos y bebidas. También consulta RUC con el SRI, patente municipal de Guayaquil, Cuerpo de Bomberos, uso de suelo, requisitos/certificados del personal que manipule alimentos y condiciones propias del centro comercial. **Todo está por verificar; este repositorio no acredita que un trámite se haya iniciado, aprobado o pagado.**

## Mejoras futuras (no implementadas)

- Añadir animaciones suaves y revisarlas respetando la preferencia de movimiento reducido.
- Preparar una tabla de costos reales por ingrediente antes de fijar precios comerciales.
- Desarrollar un script seguro para cambiar la contraseña administrativa y un reinicio de votos protegido.
- Hacer configurable el límite de solicitudes públicas.
- Simplificar el menú si la revisión de contenido lo justifica.
- Considerar cualquier expansión solo si los resultados del piloto la justifican; el plan actual sigue siendo validar un punto piloto.

## Guía breve de defensa

### Resumen de un minuto

“SmoothieFit separa la web del servidor. La web está hecha con React y Vite y se publica en GitHub Pages. Se comunica con una API de Express que corre por separado en Render; esa API usa Mongoose para guardar productos, solicitudes y usuarios en MongoDB Atlas. El panel inicia sesión con una contraseña comparada mediante bcrypt y recibe un JWT para las operaciones privadas. El constructor muestra un cálculo orientativo, pero el servidor valida las opciones y vuelve a calcular el precio. El pedido para retirar es solo una simulación porque el único local propuesto en el Mall del Sol todavía no está abierto. Sorbi entiende preguntas con reglas en el navegador y no usa servicios externos; Gemini está restringido a sugerencias del panel. La idea de negocio sigue en etapa de planificación y debe validarse antes de abrir.”

### Veinte preguntas probables

1. **¿Por qué proponen un solo punto piloto?**  
   “Para concentrar la validación en un lugar concreto y no asumir que la demanda existe. Primero mediríamos ventas por hora en una prueba piloto y preguntaríamos la intención de compra.”

2. **¿Por qué el Mall del Sol y qué falta decidir?**  
   “Es el lugar propuesto en Guayaquil. Preferimos explorar un punto cerca de un gimnasio, pero el lugar exacto y el formato —isla, kiosco, local pequeño o rincón en un gimnasio— están por confirmar. No tenemos un local abierto.”

3. **¿Cómo elegirían el punto exacto?**  
   “Revisaríamos afluencia, gimnasios cercanos, arriendo, competencia visible y reglas del centro comercial sobre horario, agua, electricidad e ingreso de proveedores.”

4. **¿Cómo interpretan el punto de equilibrio?**  
   “Divido los costos fijos mensuales por el margen que deja cada unidad. Con los supuestos del ejercicio, USD 5.000 dividido para USD 1,50 da aproximadamente 3.334 unidades al mes, redondeando hacia arriba. No es un pronóstico.”

5. **¿Qué significan los escenarios de costos?**  
   “Son ejemplos: con USD 3.000 serían cerca de 2.000 unidades al mes; con USD 4.000, unas 2.667; y con USD 5.000, unas 3.334. Cada USD 1.000 adicional requiere alrededor de 667 unidades mensuales. Hay que reemplazarlos con costos reales.”

6. **¿Qué no incluye ese margen?**  
   “No incluye mermas, comisiones de cobro ni impuestos. Tampoco es un margen medido: el precio y costo variable son supuestos. Debemos cotizar ingredientes y completar arriendo, personal, servicios y permisos.”

7. **¿Qué trámites faltan para abrir?**  
   “Debemos verificar con las entidades ARCSA y su categoría, tasas y vigencia; el RUC del SRI; patente municipal; Bomberos; uso de suelo; requisitos del personal manipulador y las reglas del centro comercial. No afirmamos que estén aprobados.”

8. **¿Cómo se calcula el precio del constructor?**  
   “El código suma el valor base del tamaño, la base y los ingredientes elegidos. Hoy esos valores son de ejemplo. Para vender, primero haríamos una tabla con el costo real de cada ingrediente.”

9. **¿Por qué se recalcula el precio en el servidor?**  
   “El navegador se puede modificar. El servidor vuelve a validar los IDs y las reglas y calcula con sus propios datos, así no acepta como verdadero un precio enviado por el cliente.”

10. **¿Cómo funcionan los votos y qué limitaciones tienen?**  
    “El servidor suma el voto al producto y limita por IP: un voto al mismo producto en 24 horas y hasta 20 votos por hora. El navegador también recuerda temporalmente el voto. No comprueba identidad y los conteos actuales son pruebas, no evidencia de preferencia del mercado.”

11. **¿El pedido del constructor es una venta?**  
    “No. Es una solicitud de interés para un retiro hipotético. No hay pago, inventario ni retiro confirmado, porque el local sigue en plan.”

12. **¿Cómo entiende Sorbi una pregunta?**  
    “Normaliza mayúsculas, tildes y signos, compara el texto con intenciones, palabras clave y sinónimos, y luego aplica reglas para responder o recomendar.”

13. **¿Cómo tolera errores de escritura?**  
    “Compara palabras con distancia de edición, que cuenta cambios de letras. El límite es pequeño y depende del largo de la palabra, así que puede fallar; no es comprensión humana.”

14. **¿Por qué Sorbi corre en el navegador y no usa IA?**  
    “Sus reglas son deterministas, simples de explicar y sus respuestas no necesitan un modelo externo. Carga datos públicos y luego procesa el texto localmente; así no manda la conversación a otro servicio.”

15. **¿Por qué Gemini está solo en el panel?**  
    “El sitio también puede ser usado por menores y los términos de la API tienen restricciones para ese tipo de aplicación. Por prudencia lo limitamos a la asistencia administrativa y debemos revisar los términos vigentes antes de habilitarlo.”

16. **¿Qué hace Gemini y cómo revisan lo que devuelve?**  
    “Propone nombres, descripciones o eslóganes para productos. El backend valida los campos, pide JSON, comprueba que las opciones sean texto, limita su cantidad y largo, y filtra expresiones prohibidas. La salida aún requiere criterio humano.”

17. **¿Qué datos envía Sorbi y cómo maneja la ubicación?**  
    “Las preguntas de Sorbi no salen del navegador. Si la persona pide calcular distancia, el navegador solicita permiso y calcula con coordenadas; actualmente esas coordenadas están por definir. La distancia no se envía ni se guarda.”

18. **¿Cómo protegen el panel y por qué CORS?**  
    “La contraseña se compara con su hash bcrypt. El backend firma un JWT y exige que las rutas privadas verifiquen el token y rol. CORS limita qué orígenes web pueden llamar a la API; no reemplaza la autenticación.”

19. **¿Por qué podría tardar en responder Render?**  
    “Si el servicio está en un plan que entra en reposo, puede tardar en despertar después de inactividad. No verificamos aquí el plan ni medimos esa demora; hoy el chequeo de salud sí respondió disponible.”

20. **¿Qué limitaciones tienen los alérgenos y qué harían con más tiempo?**  
    “Mostramos lo declarado para cada ingrediente, pero no podemos garantizar ausencia de contaminación cruzada. Después completaríamos costos reales, revisaríamos el sitio en dispositivos, mejoraríamos animaciones y límites, y estudiaríamos cualquier expansión solo si el piloto lo justifica.”

## Comprobaciones manuales antes de la defensa

- Abrir GitHub Pages en un teléfono y una computadora; probar navegación, imágenes y tamaños de texto.
- Probar en entorno controlado catálogo, voto, formulario, constructor, login, edición de producto y solicitudes; no usar datos personales de terceros.
- Confirmar en `GET /api/health` que la base está disponible y comprobar que el formulario de prueba se guarde y aparezca en el panel; retirar los datos de prueba después según el procedimiento autorizado.
- Verificar que no se revelen credenciales en el navegador y que las variables privadas estén solo en el proveedor correspondiente.
- Consultar y documentar requisitos, categorías, tasas y vigencias con cada entidad y con el centro comercial; no anunciar apertura antes de confirmar el local y sus permisos.
- Comprobar el total de commits con el comando indicado y preparar una explicación propia de cada parte del proyecto.

## Referencias

- [Contexto del proyecto](./CONTEXTO.md)
- [Guía técnica, rutas, variables y estado](./docs/MIGRACION.md)
- [Repositorio SmoothieFit](https://github.com/Danncho/SmoothieFit)
- [Aplicación en GitHub Pages](https://danncho.github.io/SmoothieFit/)
- [Chequeo de salud de la API](https://smoothiefit-api.onrender.com/api/health)

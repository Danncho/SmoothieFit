# SmoothieFit

SmoothieFit es un proyecto académico de un emprendimiento de smoothies de frutas, verduras y semillas. La aplicación presenta la marca y un catálogo, recibe solicitudes de contacto y ofrece un panel para que la persona administradora gestione productos y solicitudes. Los productos del catálogo inicial son ejemplos; no deben presentarse como una oferta comercial confirmada.

## Estado de los seis entregables

| Entregable | Estado revisado el 24-10-2026 | Evidencia y límite actual |
|---|---|---|
| Landing | Verificada manualmente en producción hoy; funciona. | Comprobación manual del usuario el 24-10-2026; implementada en `frontend/src/pages/HomePage.jsx`. |
| Catálogo | Verificado manualmente en producción hoy; funciona. | Comprobación manual del usuario el 24-10-2026; `frontend/src/pages/SmoothiesPage.jsx` consulta `GET /api/productos`. |
| Contacto real | Verificado manualmente en producción hoy; funciona. | Comprobación manual del usuario el 24-10-2026; `frontend/src/pages/ContactPage.jsx` envía solicitudes a `POST /api/solicitudes`. |
| Panel admin con login | Verificado manualmente en producción hoy; funciona. | Comprobación manual del usuario el 24-10-2026; `AdminLoginPage.jsx`, `AdminPage.jsx` y autenticación JWT. |
| IA aplicada | Verificada manualmente en producción hoy; funciona en el panel admin. | Comprobación manual del usuario el 24-10-2026; Gemini se usa solo en `POST /api/ia/admin/generar`, protegida por JWT. Sorbi público usa reglas y palabras clave, sin proveedor externo. |
| Publicación | Verificada manualmente en producción hoy; funciona. | Comprobación manual del usuario el 24-10-2026; frontend en GitHub Pages y backend en Render. |

## Enlaces de publicación

- [Aplicación en GitHub Pages](https://danncho.github.io/SmoothieFit/)
- [Salud de la API en Render](https://smoothiefit-api.onrender.com/api/health) — respondió HTTP 503 el 24-10-2026, código que el servidor usa cuando MongoDB no está disponible.
- [Repositorio en GitHub](https://github.com/Danncho/SmoothieFit)

## Arquitectura y tecnologías

| Tecnología | Uso y motivo |
|---|---|
| React y React DOM | Construyen la interfaz con componentes que se pueden reutilizar y mantener. |
| Vite | Sirve el frontend durante el desarrollo y crea archivos estáticos para GitHub Pages. |
| React Router con `HashRouter` | Cambia de página dentro de un hosting estático sin requerir que GitHub Pages ejecute un servidor de rutas. |
| Node.js 22 y Express | Ejecutan la API REST y la lógica de servidor en Render. |
| MongoDB Atlas y Mongoose | Guardan productos, solicitudes de contacto y cuentas administrativas; Mongoose define sus modelos. |
| bcryptjs y jsonwebtoken | Guardan hashes de contraseñas y emiten/verifican tokens de sesión para el panel. |
| `fetch` nativo de Node.js | Llama a Gemini desde el backend sin SDK adicional y mantiene la clave fuera del navegador. |
| CSS | Define el diseño responsive, la paleta y los estados de la interfaz sin una biblioteca visual adicional. |
| GitHub Pages y Render | Publican por separado la aplicación estática y la API Node.js. |

Gemini se utiliza únicamente para sugerencias de nombres, descripciones y eslóganes en el panel administrativo. El acceso de Sorbi en la web pública se resuelve con respuestas preparadas y coincidencias por palabras clave; no llama a Gemini ni a otro servicio de IA. El proyecto se dirige también a menores y los términos de Gemini API no permiten el uso en aplicaciones destinadas a menores o que probablemente accedan a ellas. Las sugerencias administrativas envían a Google solo datos del producto, nunca datos de clientes. En el nivel gratuito, Google puede usar entradas y respuestas para mejorar sus productos; no ingreses información personal o confidencial.

## Estructura principal

```text
.
├── backend/
│   ├── config/              # Conexión de base de datos y reglas estáticas
│   ├── data/                # JSON de seed y datos de lectura
│   │   └── sucursales.json  # Ficha del local piloto planificado en Mall del Sol
│   ├── middleware/          # Verificación de JWT
│   ├── models/              # Modelos Mongoose
│   ├── prompts/             # Instrucciones para las sugerencias Gemini de administración
│   ├── routes/              # Endpoints REST
│   ├── scripts/             # Seed y creación interactiva del administrador
│   ├── services/            # Respuesta local de Sorbi e integración Gemini
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Header, footer, tarjetas y componentes compartidos
│   │   ├── context/         # Estado de autenticación
│   │   ├── hooks/           # Carga de datos de la interfaz
│   │   ├── pages/           # Landing, catálogo, contacto, login y administración
│   │   ├── services/        # Cliente HTTP de la API
│   │   └── styles/          # Estilos responsive
│   └── vite.config.js
├── .github/workflows/       # Construcción y publicación en GitHub Pages
├── CONTEXTO.md
└── MIGRACION.md
```

## Ejecutar en local

Requisitos: Node.js 22, npm y una base MongoDB accesible. El archivo `backend/.env.example` contiene marcadores, no credenciales; crea `backend/.env` localmente y reemplaza los marcadores con valores privados. No publiques ese archivo.

### Backend

En PowerShell:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Completa en `backend/.env` las variables necesarias de la tabla siguiente. Con MongoDB configurado, carga los productos de ejemplo que aún no existan y crea la cuenta administradora:

```powershell
npm run seed
npm run crear-admin
npm start
```

`npm run crear-admin` pide correo y contraseña en la terminal de forma interactiva; la contraseña no se muestra. La contraseña debe tener al menos 12 caracteres. También acepta `ADMIN_EMAIL` y `ADMIN_PASSWORD` como variables de entorno solo para creación no interactiva; deben configurarse juntas y no conviene guardarlas en archivos versionados.

### Frontend

En otra terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abre la dirección local que indique Vite (normalmente `http://localhost:5173`). En desarrollo Vite reenvía `/api` al backend local en el puerto 3000. El login local está en `/#/admin/login`.

### Variables de entorno

Configura cada variable en el entorno privado del backend (Render para producción). En GitHub Actions, `VITE_API_URL` se configura como una variable del repositorio, no como secreto, porque forma parte del bundle público.

| Variable | Dónde | Propósito |
|---|---|---|
| `PORT` | Backend | Puerto del servidor; Render lo proporciona y localmente se usa 3000 si falta. |
| `CORS_ORIGINS` | Backend | Lista separada por comas de orígenes frontend permitidos; debe incluir el origen publicado y los de desarrollo que se utilicen. No admite `*`. |
| `MONGODB_URI` | Backend | URI privada de conexión a MongoDB Atlas o a una instancia MongoDB local. |
| `JWT_SECRET` | Backend | Clave privada para firmar/verificar JWT; en producción debe tener al menos 32 caracteres. |
| `GEMINI_API_KEY` | Backend | Clave privada de Google AI Studio; solo se usa al generar sugerencias en administración. |
| `MODELO_IA` | Backend | Identificador vigente de un modelo Gemini compatible con `generateContent`; no hay valor predeterminado. |
| `LIMITE_IA_POR_MINUTO` | Backend, opcional | Tope global de generación Gemini por minuto; valor de respaldo: 5. |
| `LIMITE_IA_DIARIO` | Backend, opcional | Tope global diario de generación Gemini; valor de respaldo: 100. |
| `VITE_API_URL` | Frontend durante build | URL base de la API, incluido `/api`; requerida por el workflow de GitHub Pages. En desarrollo, Vite usa su proxy local. |
| `ADMIN_EMAIL` y `ADMIN_PASSWORD` | Solo proceso `crear-admin`, opcionales | Credenciales iniciales para crear el primer administrador sin preguntas interactivas. No son necesarias al ejecutar el servidor. |
| `NODE_ENV` | Backend | Render lo define para producción; el servidor comprueba la longitud de `JWT_SECRET` en ese modo. |

## API REST

Las rutas se montan bajo `/api`. El token de administrador se envía en el encabezado `Authorization: Bearer <token>` para endpoints protegidos.

| Método | Endpoint | Acceso y función |
|---|---|---|
| `GET` | `/api/health` | Público; informa disponibilidad de MongoDB. |
| `POST` | `/api/auth/login` | Público; valida credenciales y devuelve un JWT de dos horas. |
| `GET` | `/api/auth/me` | JWT admin; valida la sesión actual. |
| `GET` | `/api/productos` | Público; lista el catálogo desde MongoDB. |
| `GET` | `/api/productos/:id` | Público; consulta un producto. |
| `POST` | `/api/productos` | JWT admin; crea un producto. |
| `PUT` | `/api/productos/:id` | JWT admin; actualiza un producto. |
| `DELETE` | `/api/productos/:id` | JWT admin; elimina un producto. |
| `GET` | `/api/ingredientes` | Público; lista ingredientes estáticos de ejemplo. |
| `GET` | `/api/reglas-constructor` | Público; expone tamaños, precios y límites de selección de ejemplo para el constructor. |
| `GET` | `/api/sucursales` | Público; devuelve la lista de locales desde `backend/data/sucursales.json`. |
| `POST` | `/api/solicitudes` | Público; valida y guarda una solicitud en MongoDB. Para `tipo: "pedido"` acepta opcionalmente una creación, la valida y calcula su precio en el servidor. |
| `GET` | `/api/solicitudes` | JWT admin; consulta solicitudes. |
| `PATCH` | `/api/solicitudes/:id` | JWT admin; actualiza el estado permitido de una solicitud. |
| `POST` | `/api/ia/asistente` | Público; Sorbi usa palabras clave y datos del catálogo, sin IA externa. |
| `POST` | `/api/ia/admin/generar` | JWT admin; genera hasta tres sugerencias de producto con Gemini. Si Gemini no está configurado o falla, una descripción puede usar una plantilla local; nombres y eslóganes requieren que el servicio responda. |

## Estado de datos y limitaciones

- Productos y solicitudes se guardan en MongoDB cuando la base está disponible. `backend/data/productos.json` es la fuente para el seed y los productos iniciales son ejemplos; los ingredientes y reglas se leen de JSON.
- El backend publicado responde actualmente HTTP 503 en `/api/health`, que según `server.js` indica que MongoDB no está conectado. Por eso el catálogo, el envío de contacto, el login y la generación Gemini no están confirmados de extremo a extremo en producción.
- Los límites de intentos y sugerencias se guardan en memoria: al reiniciar o escalar a varias instancias no son un control compartido.
- El JWT se guarda en `sessionStorage`; no hay renovación automática.
- `/crea-tu-smoothie` ofrece un constructor con ingredientes y precios de ejemplo. El servidor vuelve a validar cada pedido, calcula el precio y asigna el local y un código de retiro. Es una simulación académica: el local del Mall del Sol sigue planificado y la solicitud expresa interés, no confirma una compra ni una entrega.
- `backend/data/sucursales.json` contiene un único local piloto planificado en Mall del Sol, Guayaquil; todavía no está abierto. El crecimiento dependerá de los resultados del piloto y no hay otro local planificado.
- El pie de página no muestra enlaces sociales; se añadirán cuando existan perfiles oficiales.
- La versión anterior archivada en el tag histórico `v1-js-puro` incluye textos como “ingredientes 100% naturales” y “garantizar frescura y naturalidad”. No forma parte del build de React y esas frases no deben reutilizarse como afirmaciones verificadas.
- Hay animaciones pequeñas de aparición en la interfaz; queda como mejora futura probar y pulir el movimiento en dispositivos reales y verificar las preferencias de movimiento reducido.

## Mejoras futuras

1. Recuperar la disponibilidad de MongoDB y comprobar en producción el catálogo, el formulario, el login y las rutas administrativas.
2. Configurar y probar Gemini solo después de revisar los términos y la privacidad; nunca trasladar su llamada a la experiencia pública de Sorbi.
3. Mantener el constructor con precios de ejemplo hasta disponer de costos confirmados; verificar el guardado y la consulta de solicitudes en producción cuando MongoDB esté disponible.
4. Añadir enlaces sociales cuando existan perfiles oficiales.
5. Mejorar la escalabilidad de los límites de uso, el manejo de sesión y las pruebas automatizadas.
6. Probar diseño responsive, accesibilidad y animaciones en dispositivos y navegadores reales.
7. Consultar el tag histórico `v1-js-puro` solo si hace falta revisar la versión anterior; no volver a integrar sus textos no verificados.

### Actualizar la ficha del local

Edita `backend/data/sucursales.json` manteniendo cada objeto válido. `destinoMapa` acepta un texto o `null`; `lat` y `lng` deben ser ambos coordenadas numéricas válidas o ambos `null`. Cuando haya coordenadas, la web usa un mapa de OpenStreetMap y un enlace de direcciones por coordenadas. Sin coordenadas, `destinoMapa` permite abrir indicaciones de Google Maps; sin coordenadas ni destino, se muestra “Ubicación por confirmar”.

Para completar la ficha del local, reemplaza `lat` y `lng` por las coordenadas del punto confirmado, `horario` por el horario confirmado y `telefono` por el teléfono confirmado. Hasta confirmar esa información, conserva los valores `null`. Cambia `estado` solo cuando el plan avance: `planificada`, `proxima` o `abierta`; no marques el local como abierto antes de abrirlo. La validación acepta una o más fichas y rechaza tipos incorrectos, coordenadas fuera de rango y estados desconocidos.

### Constructor y precios de ejemplo

`backend/data/ingredientes.json` contiene ingredientes de ejemplo y `backend/config/constructorRules.js` es la fuente única de tamaños, precios de tamaño y reglas de selección. El catálogo del constructor carga ambas listas desde `GET /api/ingredientes` y `GET /api/reglas-constructor`; no mantiene una copia de precios o límites.

El servidor acepta una creación junto a los campos habituales de `POST /api/solicitudes` cuando `tipo` es `pedido`. Comprueba los IDs contra el catálogo, valida tamaño, base y cantidades, vuelve a calcular el precio e ignora valores de precio o local enviados por el navegador. Asigna el local planificado desde `backend/data/sucursales.json` y crea el código de retiro. El panel admin muestra estos datos. Nombre y correo son necesarios para registrar el interés; la nota es opcional y no debe contener datos personales.

Los precios y los ingredientes son ejemplos académicos, no precios comerciales: tamaño pequeño USD 2,50, mediano USD 3,00 y grande USD 3,75; base de agua USD 0,00, leche USD 0,25 y bebida vegetal o yogur USD 0,40; frutas y verduras USD 0,20 cada una; extras USD 0,30 cada uno. Se requiere una base, al menos una fruta, máximo cuatro frutas y verduras en conjunto, y máximo dos extras. El valor real del producto requeriría calcular costos confirmados.

## Guía breve de defensa

### Resumen de un minuto

SmoothieFit separa la interfaz y los servicios. El frontend está hecho con React y Vite, usa `HashRouter` y se publica como archivos estáticos en GitHub Pages. Hace solicitudes HTTP a una API REST de Express desplegada por separado en Render. La API usa Mongoose para guardar productos, solicitudes y usuarios en MongoDB. Para el panel, las contraseñas se guardan como hashes con bcrypt y el servidor entrega JWT que protegen las operaciones administrativas. La IA Gemini solo se usa desde ese panel para sugerir nombres, descripciones y eslóganes; Sorbi en la parte pública es una respuesta por reglas y palabras clave, sin proveedor externo. La publicación del frontend está disponible, pero el backend actualmente responde 503 en su chequeo de salud, así que falta recuperar y probar el funcionamiento completo.

### 15 preguntas probables

1. **¿Qué es React y por qué lo usamos?**  
   React permite construir la interfaz con piezas reutilizables llamadas componentes y actualizar la pantalla cuando cambian los datos.

2. **¿Qué es un componente?**  
   Es una parte independiente de la interfaz, por ejemplo el encabezado, una tarjeta de producto o una página.

3. **¿Para qué sirven los hooks?**  
   Hooks como `useState` guardan el estado de la pantalla; `useEffect` permite sincronizarse con servicios o eventos; los hooks propios reutilizan lógica.

4. **¿Qué significa que la API sea REST?**  
   Que ofrece rutas HTTP con operaciones claras: `GET` consulta, `POST` crea, `PUT` reemplaza o actualiza y `DELETE` elimina.

5. **¿Dónde se guardan los datos?**  
   Productos, solicitudes y usuarios usan modelos Mongoose conectados a MongoDB. Algunos datos estáticos, como reglas e ingredientes de ejemplo, siguen en JSON.

6. **¿Cómo funciona el login y qué es JWT?**  
   El backend compara la contraseña con su hash bcrypt y, si es correcta, entrega un token firmado que vence en dos horas. Las rutas privadas verifican ese token y el rol admin.

7. **¿Por qué Gemini solo se usa en el panel?**  
   SmoothieFit también se dirige a menores y los términos de Gemini API no permiten su uso en apps dirigidas a menores o probablemente accesibles por ellos. Por eso la llamada está protegida y separada de Sorbi público.

8. **¿Qué es la inyección de instrucciones y cómo se mitiga?**  
   Es texto de entrada que intenta hacer que un modelo ignore sus reglas. Se limita la entrada a campos de producto, se buscan patrones evidentes de inyección y el prompt dice que esos campos son datos, no órdenes. Ninguna defensa es perfecta.

9. **¿Por qué se valida la salida de Gemini?**  
   Porque el modelo puede devolver contenido inventado o un formato inesperado. El backend exige JSON, limita la cantidad y longitud de opciones y descarta expresiones prohibidas antes de mostrarlas.

10. **¿Qué es el respaldo sin IA?**  
    Si Gemini no está configurado o falla, para descripciones se forma una frase con el nombre e ingredientes ingresados. No hace una llamada alternativa a otro modelo.

11. **¿Qué implica el nivel gratuito para la privacidad?**  
    Google puede usar entradas y respuestas para mejorar productos y permitir revisión humana. Por eso el formulario administrativo envía solo datos del producto y no se deben escribir datos personales o confidenciales.

12. **¿Qué es CORS?**  
    Es una regla del navegador que controla qué sitios pueden leer respuestas de la API. El backend permite orígenes configurados explícitamente y rechaza el comodín `*`.

13. **¿Por qué frontend y backend están en servicios distintos?**  
    GitHub Pages sirve archivos estáticos; no ejecuta Express. Render mantiene el servidor Node.js y la API, y CORS permite que la web autorizada se conecte.

14. **¿Por qué el servidor gratuito puede tardar la primera vez?**  
    Si el servicio de Render usa una instancia gratuita que se duerme después de inactividad, tiene que arrancar al llegar una nueva petición. Ese inicio en frío puede demorar la primera respuesta.

15. **¿Cuáles son las limitaciones actuales?**  
    El backend publicado devuelve 503 en salud; por eso no se ha confirmado la persistencia pública. El constructor React es un placeholder, los datos iniciales son ejemplos y varios límites de uso solo viven en memoria.

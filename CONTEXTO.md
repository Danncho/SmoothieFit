# SmoothieFit — contexto del proyecto

## Propósito y modelo de negocio en planificación

SmoothieFit es un proyecto académico que presenta una propuesta de smoothies y herramientas para explorar combinaciones. No se debe presentar como una operación comercial abierta ni como evidencia de ventas.

- **Punto piloto:** se planifica un solo local pequeño en el Mall del Sol, Guayaquil. El punto exacto sería de preferencia cerca de un gimnasio, por confirmar. El formato sigue por definir: isla o kiosco, local pequeño o rincón dentro de un gimnasio. **Hoy no hay local abierto.**
- **Público prioritario:** jóvenes y adultos activos. **Público secundario:** familias y colegios; la propuesta para colegios está en desarrollo.
- **Canales en propuesta:** atención en el local, si se concreta; un pedido para retirar que hoy es una simulación académica; conversaciones con colegios y posibles alianzas con gimnasios y tiendas de salud. No hay acuerdos confirmados.
- **Validación antes de abrir:** observar afluencia, gimnasios cercanos, arriendo, condiciones y reglas del centro comercial (horarios, agua, electricidad e ingreso de proveedores) y competencia visible. Medir ventas por hora en una prueba piloto y realizar una encuesta de intención de compra. No hay resultados de esas mediciones documentados.
- **Crecimiento:** cualquier decisión posterior dependerá de los resultados del piloto.

Los precios e ingredientes del catálogo y del constructor son ejemplos. Los votos visibles se consideran pruebas académicas, no una encuesta representativa ni prueba de demanda. No hay información confirmada de ventas, clientes, proveedores, arriendo, costos operativos, horarios o personal.

## Arquitectura y estado comprobado

- **Frontend:** React, Vite y `HashRouter`; la página está publicada como sitio estático en GitHub Pages.
- **Backend:** API Node.js y Express separada; el código usa Mongoose para conectarse a MongoDB Atlas. El backend está alojado en Render.
- **Datos:** productos, solicitudes y cuentas administrativas usan modelos Mongoose. El archivo de productos sirve como seed; ingredientes, reglas de construcción y la ficha del único punto planificado son archivos JSON.
- **Comprobación pública:** el 3 de noviembre de 2026, GitHub Pages devolvió el HTML de la aplicación y `/api/health` respondió `{"estado":"disponible"}`. El endpoint indica que el backend veía MongoDB conectado en ese momento; no se probaron en esa comprobación todos los flujos de compra, contacto ni administración.
- **Constructor:** valida las opciones en el navegador para orientar a la persona y el backend vuelve a validar los IDs y reglas y recalcula el precio antes de guardar la solicitud. El retiro es simulado mientras no abra el local.
- **Autenticación:** el backend compara contraseñas con bcrypt y entrega JWT con vencimiento; el panel envía el token a las rutas protegidas. La clave de firma se configura fuera del código.
- **Sorbi:** asistente guiado por reglas deterministas en el navegador. Tras cargar los datos públicos desde la API, procesa las preguntas localmente y no las envía a servicios externos.
- **Gemini:** solo se llama desde la ruta protegida del panel administrativo para sugerir nombres, descripciones o eslóganes. El público del sitio incluye menores; por prudencia, Gemini no se usa en la experiencia pública y la integración debe seguir sujeta a revisión de los términos vigentes y de privacidad.

Consulta la [guía técnica y de estado](./docs/MIGRACION.md) para rutas, variables de entorno, comandos locales y evidencia de los entregables.

## Datos y límites de las afirmaciones

- No hay local abierto ni punto exacto dentro del centro comercial confirmado. Horario, teléfono y coordenadas están por definir.
- Los ingredientes y precios de muestra no son cotizaciones comerciales. El precio real requiere costos confirmados por ingrediente y revisar mermas, cobros e impuestos.
- El alérgeno mostrado corresponde a lo declarado en los datos del ejemplo; no garantiza ausencia de contaminación cruzada ni que un producto sea apto para una persona.
- Sorbi no da consejos médicos ni nutricionales y no usa inteligencia artificial externa.
- No afirmar acuerdos con proveedores, colegios, gimnasios o tiendas mientras no existan y se puedan confirmar.

## Reglas de contenido y defensa

- Usar lenguaje sencillo, cercano y explicable por el estudiante.
- No hacer afirmaciones médicas o nutricionales ni afirmar propiedades no comprobadas.
- Marcar los productos, precios e ingredientes de muestra como ejemplos.
- Presentar las proyecciones financieras como supuestos del ejercicio, nunca como resultados reales.
- Distinguir lo implementado en código, lo probado manualmente y lo no verificado.

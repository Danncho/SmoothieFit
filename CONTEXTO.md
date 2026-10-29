# SmoothieFit — contexto del proyecto

## Objetivo

Completar SmoothieFit como proyecto web académico y prepararlo para defenderlo ante jueces. La arquitectura objetivo usa React con JavaScript en el frontend y Node.js con Express en el backend, con una base de datos real. El código y las decisiones deben ser claros para que cada integrante pueda explicar su parte.

## Contexto de la marca

- **Producto:** proyecto de smoothies de frutas, verduras y semillas; se busca priorizar productores locales y evaluar opciones de empaque con cuidado, sin atribuir certificaciones ni impactos no comprobados.
- **Diferenciador:** además del catálogo, el constructor React permite combinar ingredientes de ejemplo y registrar interés en una creación para retirar en el Mall del Sol.
- **Público:** niños, adolescentes y jóvenes; padres, colegios y tiendas de salud como compradores o aliados.
- **Personalidad:** energía, salud, diversión, frescura, confianza y juventud.
- **Tono:** sencillo, positivo y cercano; nada técnico ni médico.
- **Colores:** rojo, morado, rosado y blanco. Estilo moderno, alegre y simple.
- **Logo:** placeholder de un smoothie con carita feliz, ojos cerrados, sonrisa y sorbete.

## Arquitectura

- **Estado real observado:** `backend/` contiene una API Express y `frontend/` la app React con Vite y HashRouter. La versión anterior en HTML, CSS y JavaScript puros se conserva en el historial/tag `v1-js-puro`, no como carpeta activa.
- **Arquitectura y publicación:** `frontend/` se construye como sitio estático y está disponible en GitHub Pages. `backend/` es una API Express separada, alojada en Render, con CORS por orígenes explícitos. El endpoint público `/api/health` respondió HTTP 503 el 24 de octubre de 2026; por ello el despliegue full stack no está verificado como operativo.
- **Datos:** la API de productos y solicitudes está implementada con MongoDB Atlas y Mongoose. La respuesta 503 de salud impide confirmar la conexión y persistencia actuales. Ingredientes y reglas del constructor continúan en JSON de solo lectura.
- **Acceso actual:** el panel React usa cuentas administradoras, hashes de contraseñas con bcrypt y tokens JWT de dos horas.
- **Asistente y sugerencias:** Sorbi es un asistente guiado con reglas deterministas en el navegador. Carga una vez los datos públicos del sitio al abrirse y no envía los mensajes a ningún servidor o servicio externo. Gemini se reserva para sugerencias creativas de nombres, descripciones y eslóganes dentro del panel administrativo protegido.
- **Backend actual:** productos y solicitudes se administran en MongoDB usando Mongoose; `backend/data/productos.json` se conserva como archivo de seed. Ingredientes y reglas de ejemplo siguen en JSON. El servidor valida las creaciones y recalcula sus precios antes de guardar una solicitud tipo pedido. El acceso de administración usa usuarios y JWT; configura `JWT_SECRET` en el entorno privado.
- **Proveedor de IA:** la llamada Gemini usa `fetch` nativo en el backend y requiere `GEMINI_API_KEY` y `MODELO_IA` configurados como variables privadas; no hay modelo predeterminado ni SDK. Solo envía campos del producto escritos por el administrador. El endpoint es exclusivo de sesión administrativa.
- **Privacidad y edad:** los términos de Gemini API prohíben usar el servicio dentro de sitios o aplicaciones dirigidos a menores o que probablemente serán accedidos por menores ([términos oficiales](https://ai.google.dev/gemini-api/terms)). Por ello, Gemini no se usa en la experiencia pública destinada también a menores. La API de nivel gratuito puede usar entradas y respuestas para mejorar productos y puede permitir revisión humana; no incluir datos personales, confidenciales ni de clientes. Revisar términos y prácticas de privacidad antes de configurarlo.

## Reglas de código

- Mantener carpetas claras, nombres descriptivos consistentes y comentarios breves que expliquen el porqué.
- Escribir código simple y explicable para que cada integrante pueda defender su parte. Justificar cada dependencia nueva, evitar dependencias innecesarias y confirmar con el mentor si se permiten dependencias del backend.
- Diseñar primero para celular y mantener accesibilidad: etiquetas adecuadas, texto alternativo y buen contraste.
- No eliminar, mover ni sobrescribir archivos o carpetas existentes sin preguntar antes. La carpeta local `frontend-legacy/` se eliminó con confirmación; el usuario indica que la versión histórica está preservada en el tag `v1-js-puro`.
- No ejecutar comandos de Git; el usuario los ejecuta manualmente. El proyecto requiere al menos 15 commits y un repositorio en GitHub.
- Después de cada tarea, entregar un resumen corto y sencillo de lo realizado y por qué.
- El frontend se publica como sitio estático en GitHub Pages; el backend Express se despliega por separado en Render. Verificar que el endpoint de salud y las operaciones con MongoDB respondan antes de declarar completa la publicación.
- La autenticación usa usuarios, contraseñas con hash seguro y JWT. Gemini se llama desde el backend únicamente para el panel admin; las descripciones tienen un respaldo con plantilla local.
- Evitar afirmaciones médicas o nutricionales no respaldadas y marcar los datos de muestra como ejemplos.

## Reglas de contenido

- No hacer afirmaciones médicas ni nutricionales sin respaldo. Evitar expresiones como «cura», «adelgaza» o «desintoxica».
- No usar frases como «100% ecológico», «cero impacto» ni «único en el mercado».
- Marcar en el código como ejemplos todos los datos de muestra, incluidos precios, sabores, ingredientes y productores.

## Requisitos del curso

- Entregar una landing, un catálogo, contacto real, un panel admin con login, una función de IA con respaldo y una publicación disponible en internet.
- Usar React en el frontend, Git con mínimo 15 commits, un repositorio GitHub y GitHub Pages para el frontend.
- Mantener diseño responsive y elegir dependencias que el estudiante pueda justificar y explicar.
- El estado real revisado y la evidencia disponible están en `MIGRACION.md`. El archivo `.git/config` identifica el remoto `Danncho/SmoothieFit`; no se verificaron el historial de commits, la visibilidad pública ni una URL de despliegue.

## Estado del proyecto

- **Fecha de revisión:** 24 de octubre de 2026.
- **Local piloto:** se planifica un único local en Mall del Sol, Guayaquil; todavía no está abierto. El crecimiento dependerá de sus resultados y no hay otro local planificado.
- **Fase actual:** Fase 18, verificación de entregables y documentación.
- **Estado técnico:** React tiene landing, catálogo, constructor, contacto, login, panel administrativo y Sorbi conversacional en el navegador. El backend contiene rutas para persistencia MongoDB, JWT, pedidos de prueba y generación Gemini protegida; su endpoint publicado de salud respondió 503. Sorbi no tiene un endpoint público de conversación. Gemini requiere configuración privada y no se ha confirmado una llamada de producción.
- **Redes sociales:** no se muestran enlaces en el pie de página hasta contar con perfiles oficiales.

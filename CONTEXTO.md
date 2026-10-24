# SmoothieFit — contexto del proyecto

## Objetivo

Completar SmoothieFit como proyecto web académico y prepararlo para defenderlo ante jueces. La arquitectura objetivo usa React con JavaScript en el frontend y Node.js con Express en el backend, con una base de datos real. El código y las decisiones deben ser claros para que cada integrante pueda explicar su parte.

## Contexto de la marca

- **Producto:** smoothies de frutas, verduras y semillas de productores locales, con empaques ecológicos.
- **Diferenciador:** además de ofrecer un catálogo, los clientes podrán crear su propio smoothie eligiendo ingredientes.
- **Público:** niños, adolescentes y jóvenes; padres, colegios y tiendas de salud como compradores o aliados.
- **Personalidad:** energía, salud, diversión, frescura, confianza y juventud.
- **Tono:** sencillo, positivo y cercano; nada técnico ni médico.
- **Colores:** rojo, morado, rosado y blanco. Estilo moderno, alegre y simple.
- **Logo:** placeholder de un smoothie con carita feliz, ojos cerrados, sonrisa y sorbete.

## Arquitectura

- **Estado real observado:** `backend/` contiene una API Express; `frontend-legacy/` conserva la versión anterior en HTML, CSS y JavaScript puros; `frontend/` ya contiene la app React con Vite y HashRouter.
- **Arquitectura:** `frontend/` usa JavaScript, React, Vite y React Router con `HashRouter`; el workflow de GitHub Pages construye y publica el frontend estático bajo `/SmoothieFit/`. `backend/` usa Express, lee el puerto de `PORT`, restringe CORS a orígenes explícitos y está preparado para desplegarse en Render.
- **Datos:** la API de productos ya está implementada con MongoDB Atlas y Mongoose; falta configurar `MONGODB_URI` localmente, cargar el seed y verificar la conexión real. Ingredientes y reglas del constructor continúan en JSON de solo lectura.
- **Acceso actual:** el panel React usa cuentas administradoras, hashes de contraseñas con bcrypt y tokens JWT de dos horas.
- **IA aplicada:** Sorbi, el asistente público, solo usa respuestas preparadas y recomendaciones por palabras clave; no llama a servicios externos. Gemini se reserva para sugerencias creativas de nombres, descripciones y eslóganes dentro del panel administrativo protegido.
- **Backend actual:** productos y solicitudes se administran en MongoDB usando Mongoose; `backend/data/productos.json` se conserva como archivo de seed. Ingredientes y reglas siguen en JSON. El acceso de administración usa usuarios y JWT; configura `JWT_SECRET` en el entorno privado.
- **Proveedor de IA:** la llamada Gemini usa `fetch` nativo en el backend y requiere `GEMINI_API_KEY` y `MODELO_IA` configurados como variables privadas; no hay modelo predeterminado ni SDK. Solo envía campos del producto escritos por el administrador. El endpoint es exclusivo de sesión administrativa.
- **Privacidad y edad:** los términos de Gemini API prohíben usar el servicio dentro de sitios o aplicaciones dirigidos a menores o que probablemente serán accedidos por menores ([términos oficiales](https://ai.google.dev/gemini-api/terms)). Por ello, Gemini no se usa en la experiencia pública destinada también a menores. La API de nivel gratuito puede usar entradas y respuestas para mejorar productos y puede permitir revisión humana; no incluir datos personales, confidenciales ni de clientes. Revisar términos y prácticas de privacidad antes de configurarlo.

## Reglas de código

- Mantener carpetas claras, nombres descriptivos consistentes y comentarios breves que expliquen el porqué.
- Escribir código simple y explicable para que cada integrante pueda defender su parte. Justificar cada dependencia nueva, evitar dependencias innecesarias y confirmar con el mentor si se permiten dependencias del backend.
- Diseñar primero para celular y mantener accesibilidad: etiquetas adecuadas, texto alternativo y buen contraste.
- No eliminar, mover ni sobrescribir archivos o carpetas existentes sin preguntar antes; en especial, conservar `frontend-legacy/` como referencia al crear la nueva app en `frontend/`.
- No ejecutar comandos de Git; el usuario los ejecuta manualmente. El proyecto requiere al menos 15 commits y un repositorio en GitHub.
- Después de cada tarea, entregar un resumen corto y sencillo de lo realizado y por qué.
- El frontend debe poder publicarse como sitio estático en GitHub Pages; el backend Express se desplegará por separado.
- La autenticación final debe usar usuarios, contraseñas con hash seguro y JWT. La IA debe llamarse desde el backend y contar con un respaldo sin IA.
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
- **Fase actual:** Fase 16, Gemini para sugerencias creativas solo en administración; Sorbi público permanece sin IA externa.
- **Estado técnico:** React tiene inicio, catálogo, páginas informativas, contacto, panel admin y Sorbi con respuestas preparadas. El backend valida JWT y protege el generador Gemini. Configura `JWT_SECRET`, crea el primer administrador y, si aceptas las condiciones de Google, configura `GEMINI_API_KEY` y `MODELO_IA` en privado; también falta completar la verificación del despliegue real.
- **Precaución:** `frontend-legacy/` conserva la versión anterior; la app actual se desarrolla en `frontend/`.

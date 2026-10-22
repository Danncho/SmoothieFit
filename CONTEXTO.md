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

- **Estado real observado:** `backend/` contiene una API Express; `frontend-legacy/` conserva la versión anterior en HTML, CSS y JavaScript puros. `frontend/` se reserva para la nueva aplicación; aún no hay React, Vite, HashRouter ni una base de datos real.
- **Arquitectura objetivo:** `frontend/` usará JavaScript, React, Vite y React Router con `HashRouter`; `backend/` seguirá separado con Express. GitHub Pages publicará el frontend estático y un servicio de hosting independiente ejecutará el backend.
- **Datos objetivo:** migrar productos e ingredientes desde archivos JSON a una base de datos real, prevista como MongoDB Atlas con Mongoose.
- **Acceso objetivo:** reemplazar la clave compartida por cuentas de usuario, contraseñas guardadas mediante hash seguro y autenticación con tokens JWT.
- **IA objetivo:** implementar una función útil, como recomendar mezclas según preferencias e ingredientes disponibles; el backend llamará al servicio de IA y ofrecerá una respuesta de respaldo si este no está disponible.
- **Backend actual:** productos e ingredientes se leen desde archivos JSON; las escrituras de productos usan una clave compartida en `.env`. El diagnóstico y el orden de migración están en `MIGRACION.md`.

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
- El estado real revisado y la evidencia disponible están en `MIGRACION.md`. No se verificaron el historial de commits, el remoto de GitHub ni una URL pública porque esta tarea prohíbe ejecutar Git.

## Estado del proyecto

- **Fecha de revisión:** 22 de octubre de 2026.
- **Fase actual:** Fase 8, planificación del giro hacia la arquitectura full stack requerida.
- **Estado técnico:** existe una API Express y un frontend anterior de HTML/CSS/JavaScript en `frontend-legacy/`; todavía no se inició la migración a React, la base de datos, el contacto real, el login de usuarios, la IA ni el despliegue requerido.
- **Precaución:** `frontend-legacy/` conserva la versión anterior; `frontend/` queda disponible para crear React.

# SmoothieFit — contexto del proyecto

## Objetivo

Construir la página web de SmoothieFit, un emprendimiento de smoothies saludables en Ecuador. El proyecto será presentado ante jueces que revisarán la página y el código (HTML, CSS, JavaScript y Node.js). El código debe ser claro para que quien lo presenta pueda explicar cada parte.

## Contexto de la marca

- **Producto:** smoothies de frutas, verduras y semillas de productores locales, con empaques ecológicos.
- **Diferenciador:** además de ofrecer un catálogo, los clientes podrán crear su propio smoothie eligiendo ingredientes.
- **Público:** niños, adolescentes y jóvenes; padres, colegios y tiendas de salud como compradores o aliados.
- **Personalidad:** energía, salud, diversión, frescura, confianza y juventud.
- **Tono:** sencillo, positivo y cercano; nada técnico ni médico.
- **Colores:** rojo, morado, rosado y blanco. Estilo moderno, alegre y simple.
- **Logo:** placeholder de un smoothie con carita feliz, ojos cerrados, sonrisa y sorbete.

## Arquitectura

- `backend/`: Node.js y Express para una API REST.
- `frontend/`: HTML, CSS y JavaScript puros, sin frameworks.
- El frontend consume el backend con `fetch()`.
- El código debe estar organizado, ser claro y fácil de entender.

## Reglas de código

- Mantener carpetas claras, nombres descriptivos y consistentes, y comentarios breves que expliquen el porqué.
- No usar librerías ni técnicas avanzadas difíciles de explicar para un estudiante de Ingeniería en Sistemas. Si se necesita una dependencia, justificarla.
- Diseñar primero para celular y asegurar que la página sea responsive y accesible: etiquetas adecuadas, texto alternativo en imágenes y buen contraste.
- Después de cada tarea, entregar un resumen corto de qué se hizo y por qué.
- No eliminar ni sobrescribir archivos o carpetas existentes sin preguntar antes.
- No ejecutar comandos de Git; el usuario los ejecuta manualmente.

## Reglas de contenido

- No hacer afirmaciones médicas ni nutricionales sin respaldo. Evitar expresiones como «cura», «adelgaza» o «desintoxica».
- No usar frases como «100% ecológico», «cero impacto» ni «único en el mercado».
- Marcar en el código como ejemplos todos los datos de muestra, incluidos precios, sabores, ingredientes y productores.

## Secuencia de trabajo y comprobaciones

Al completar cada base, el usuario realizará manualmente los pasos de Git indicados en la Parte 2 de sus instrucciones. Antes de cada commit, comprobará lo siguiente:

| Prompt | Qué probar antes del commit | Mensaje del commit |
|---|---|---|
| 0 | Existe `CONTEXTO.md` | `Prompt 0: contexto del proyecto` |
| 1 | Desde `backend/`, `npm start` abre `localhost:3000` | `Prompt 1: estructura backend y frontend` |
| 2 | Header, footer y menú hamburguesa funcionan | `Prompt 2: estilos, header y footer` |
| 3 | El inicio se ve bien en celular y PC | `Prompt 3: página de inicio` |
| 4 | `localhost:3000/api/productos` muestra el JSON y cargan las tarjetas | `Prompt 4: API REST de productos y catálogo` |
| 5 | En `admin.html` se puede crear, editar y eliminar con la clave correcta; una clave incorrecta es rechazada | `Prompt 5: panel de administración con clave` |
| 6 | Se puede armar un smoothie, ver su precio y agregarlo al carrito | `Prompt 6: constructor Crea tu smoothie` |
| 7 | Abren las tres páginas informativas | `Prompt 7: páginas informativas` |
| 8 | Los formularios muestran errores si se dejan vacíos | `Prompt 8: colegios y puntos de venta` |
| 9 | Se envían pedidos, contactos y alianzas, y se guardan en los JSON | `Prompt 9: backend de pedidos y formularios` |
| 10 | Funcionan todos los enlaces y el README está completo | `Prompt 10: revisión final y documentación` |

Para ejecutar el proyecto cuando exista el backend, la terminal debe estar en `backend/`, donde se encuentra `package.json`:

```powershell
cd backend
npm install
npm start
```

## Protección de datos y configuración de Git

El archivo `.gitignore` de la raíz debe excluir exactamente:

```gitignore
node_modules/
.env
backend/data/pedidos.json
backend/data/contactos.json
backend/data/alianzas.json
```

Estas exclusiones evitan subir dependencias, la clave de administrador y los datos de clientes a GitHub. El primer push será `git push -u origin main`; después, bastará con `git push`. El usuario ejecuta todos los comandos de Git manualmente.

## Clave de administrador

La clave simple en `.env` queda como opción por defecto para facilitar su explicación y demostración en vivo. El panel administrativo deberá rechazar solicitudes con una clave incorrecta (401). Si se decide dejar el panel sin protección, se quitarán el requisito de protección del Prompt 5 y las menciones al 401 en el Prompt 10.

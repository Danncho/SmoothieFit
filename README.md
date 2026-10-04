# SmoothieFit

Proyecto web de smoothies. El backend usa Node.js y Express para mostrar los archivos del frontend.

## Cómo ejecutarlo

Abre una terminal en la carpeta `backend/` y ejecuta:

```powershell
npm install
npm start
```

Luego abre http://localhost:3000 en el navegador. Para detener el servidor, presiona `Ctrl+C` en la terminal.

## Archivos principales

- `backend/server.js`: inicia Express y publica los archivos de `frontend/`. Usa `path.join` para encontrar esa carpeta de forma compatible con Windows.
- `backend/package.json`: contiene Express y el comando `npm start`.
- `backend/package-lock.json`: registra las versiones instaladas de las dependencias.
- `backend/routes/`: carpeta para las rutas de la API que se agregarán después.
- `backend/data/`: carpeta para los datos del proyecto.
- `frontend/index.html`: página inicial de prueba.
- `frontend/css/`: hojas de estilos.
- `frontend/js/`: archivos de JavaScript del navegador.
- `frontend/img/`: imágenes del sitio.

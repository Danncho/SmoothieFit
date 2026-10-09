const express = require('express');
const path = require('path');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');
const productosRoutes = require('./routes/productos');

app.use(express.json({ limit: '100kb' }));
app.use('/api/productos', productosRoutes);
app.use(express.static(frontendPath));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }

  console.error('Error del servidor:', error.message);
  return res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
});

app.listen(3000, () => {
  console.log('SmoothieFit está disponible en http://localhost:3000');
});

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

dotenv.config({ path: path.join(__dirname, '.env') });

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const productosRoutes = require('./routes/productos');
const solicitudesRoutes = require('./routes/solicitudes');
const ingredientesRoutes = require('./routes/ingredientes');
const reglasConstructorRoutes = require('./routes/reglas-constructor');

app.use(express.json({ limit: '100kb' }));
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-key']
}));
app.use('/api/productos', productosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/reglas-constructor', reglasConstructorRoutes);

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  return res.status(connected ? 200 : 503).json({
    estado: connected ? 'disponible' : 'base de datos no disponible'
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }

  console.error('Error del servidor:', error.message);
  return res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
});

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`SmoothieFit está disponible en http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(`No se pudo cerrar MongoDB: ${disconnectError.message}`);
    }
    process.exitCode = 1;
  }
}

startServer();

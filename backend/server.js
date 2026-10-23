const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

dotenv.config({ path: path.join(__dirname, '.env') });

app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.includes('*')) {
  throw new Error('CORS_ORIGINS debe especificar orígenes concretos; no se permite "*".');
}

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

  console.error('Error inesperado al procesar una solicitud.');
  return res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
});

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor HTTP iniciado en el puerto ${port}.`);
    });
  } catch {
    console.error('No se pudo iniciar el servidor. Verifica MONGODB_URI y la disponibilidad de MongoDB.');
    try {
      await mongoose.disconnect();
    } catch {
      console.error('No se pudo cerrar la conexión con MongoDB.');
    }
    process.exitCode = 1;
  }
}

startServer();

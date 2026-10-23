const mongoose = require('mongoose');

async function connectDB() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('Falta MONGODB_URI. Configúrala en backend/.env antes de iniciar el servidor.');
  }

  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000
    });
  } catch (error) {
    throw new Error(
      `No se pudo conectar a MongoDB. Verifica MONGODB_URI, el usuario de base y la IP permitida. Detalle: ${error.name}.`
    );
  }

  console.log('Conexión a MongoDB establecida.');
}

module.exports = connectDB;

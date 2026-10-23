const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Producto = require('../models/Producto');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedProducts() {
  const productsFile = path.join(__dirname, '..', 'data', 'productos.json');
  const fileContents = await fs.readFile(productsFile, 'utf8');
  const products = JSON.parse(fileContents);

  if (!Array.isArray(products)) {
    throw new Error('backend/data/productos.json debe contener una lista de productos.');
  }

  await Promise.all(products.map((product) => new Producto(product).validate()));
  await connectDB();
  await Producto.init();
  const operations = products.map((product) => ({
    updateOne: {
      filter: { id: product.id },
      update: { $setOnInsert: product },
      upsert: true
    }
  }));
  const result = await Producto.bulkWrite(operations, { ordered: false });
  const inserted = result.upsertedCount;
  const existing = products.length - inserted;

  console.log(`Seed completado: ${inserted} insertados, ${existing} ya existían.`);
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error('No se pudo cargar el seed de productos:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error('No se pudo cerrar la conexión de MongoDB:', error.message);
      process.exitCode = 1;
    }
  }
}

main();

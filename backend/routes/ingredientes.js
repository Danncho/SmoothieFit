const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const ingredientsFile = path.join(__dirname, '..', 'data', 'ingredientes.json');

router.get('/', async (req, res) => {
  try {
    const contenido = await fs.readFile(ingredientsFile, 'utf8');
    const ingredientes = JSON.parse(contenido);

    if (!Array.isArray(ingredientes)) {
      throw new Error('El archivo de ingredientes debe contener una lista.');
    }

    return res.json(ingredientes);
  } catch (error) {
    console.error('Error al leer ingredientes:', error.message);
    return res.status(500).json({ mensaje: 'No se pudieron cargar los ingredientes.' });
  }
});

module.exports = router;

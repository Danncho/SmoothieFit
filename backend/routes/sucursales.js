const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const sucursalesFile = path.join(__dirname, '..', 'data', 'sucursales.json');
const estadosValidos = new Set(['planificada', 'proxima', 'abierta']);
const camposTexto = ['id', 'nombre', 'ciudad', 'zona', 'referencia', 'formato'];
const camposTextoONull = ['direccion', 'destinoMapa', 'horario', 'telefono'];

function validarSucursal(sucursal) {
  if (!sucursal || typeof sucursal !== 'object' || Array.isArray(sucursal)) return false;
  if (camposTexto.some((campo) => typeof sucursal[campo] !== 'string' || !sucursal[campo].trim())) {
    return false;
  }
  if (camposTextoONull.some((campo) => (
    sucursal[campo] !== null
    && (typeof sucursal[campo] !== 'string' || !sucursal[campo].trim())
  ))) {
    return false;
  }
  if (
    (sucursal.lat !== null && (typeof sucursal.lat !== 'number' || sucursal.lat < -90 || sucursal.lat > 90))
    || (sucursal.lng !== null && (typeof sucursal.lng !== 'number' || sucursal.lng < -180 || sucursal.lng > 180))
    || ((sucursal.lat === null) !== (sucursal.lng === null))
  ) {
    return false;
  }
  return estadosValidos.has(sucursal.estado)
    && typeof sucursal.esEjemplo === 'boolean';
}

router.get('/', async (req, res) => {
  try {
    const contenido = await fs.readFile(sucursalesFile, 'utf8');
    const sucursales = JSON.parse(contenido);
    if (!Array.isArray(sucursales) || sucursales.length === 0 || !sucursales.every(validarSucursal)) {
      throw new Error('El archivo del local no cumple con el formato esperado.');
    }

    return res.json(sucursales);
  } catch (error) {
    console.error('Error al leer el local:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo cargar el local planificado.' });
  }
});

module.exports = router;

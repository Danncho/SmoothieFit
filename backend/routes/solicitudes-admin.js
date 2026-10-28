const express = require('express');
const mongoose = require('mongoose');
const Solicitud = require('../models/Solicitud');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();
const estadosPermitidos = ['nueva', 'atendida', 'descartada'];
const estadosTodos = [...estadosPermitidos];
const maximoResultados = 100;

router.use(verificarToken);

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'La base de datos no está disponible.' });
  }

  const { estado } = req.query;
  if (estado && !estadosTodos.includes(estado)) {
    return res.status(400).json({ mensaje: 'El filtro de estado no es válido.' });
  }

  const limiteSolicitado = req.query.limite === undefined ? 50 : Number(req.query.limite);
  if (!Number.isInteger(limiteSolicitado) || limiteSolicitado < 1) {
    return res.status(400).json({ mensaje: 'El límite debe ser un número entero positivo.' });
  }

  try {
    const consulta = estado ? { estado } : {};
    const solicitudes = await Solicitud.find(consulta)
      .select('nombre correo telefono tipo organizacion mensaje creacion precioCalculado sucursalId codigo estado fechaCreacion')
      .sort({ fechaCreacion: -1 })
      .limit(Math.min(limiteSolicitado, maximoResultados))
      .lean();

    return res.json(solicitudes.map((solicitud) => ({
      id: solicitud._id.toString(),
      nombre: solicitud.nombre,
      correo: solicitud.correo,
      telefono: solicitud.telefono || '',
      tipo: solicitud.tipo,
      organizacion: solicitud.organizacion || '',
      mensaje: solicitud.mensaje,
      creacion: solicitud.creacion || null,
      precioCalculado: solicitud.precioCalculado ?? null,
      sucursalId: solicitud.sucursalId || '',
      codigo: solicitud.codigo || '',
      estado: solicitud.estado,
      fechaCreacion: solicitud.fechaCreacion
    })));
  } catch {
    return res.status(500).json({ mensaje: 'No se pudieron cargar las solicitudes.' });
  }
});

router.patch('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'La base de datos no está disponible.' });
  }

  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id de la solicitud no es válido.' });
  }

  const estado = req.body?.estado;
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'El estado debe ser nueva, atendida o descartada.' });
  }

  try {
    const solicitud = await Solicitud.findByIdAndUpdate(
      req.params.id,
      { $set: { estado } },
      { new: true, runValidators: true }
    ).select('nombre correo telefono tipo organizacion mensaje creacion precioCalculado sucursalId codigo estado fechaCreacion').lean();

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'No se encontró la solicitud.' });
    }

    return res.json({
      solicitud: {
        id: solicitud._id.toString(),
        nombre: solicitud.nombre,
        correo: solicitud.correo,
        telefono: solicitud.telefono || '',
        tipo: solicitud.tipo,
        organizacion: solicitud.organizacion || '',
        mensaje: solicitud.mensaje,
        creacion: solicitud.creacion || null,
        precioCalculado: solicitud.precioCalculado ?? null,
        sucursalId: solicitud.sucursalId || '',
        codigo: solicitud.codigo || '',
        estado: solicitud.estado,
        fechaCreacion: solicitud.fechaCreacion
      }
    });
  } catch {
    return res.status(500).json({ mensaje: 'No se pudo actualizar la solicitud.' });
  }
});

module.exports = router;

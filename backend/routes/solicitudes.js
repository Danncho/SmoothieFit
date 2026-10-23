const express = require('express');
const mongoose = require('mongoose');
const Solicitud = require('../models/Solicitud');

const router = express.Router();
const rateLimitWindow = 60 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestsByIp = new Map();
const allowedTypes = ['consulta', 'colegio', 'tienda', 'pedido'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?=.*\d)[0-9 +\-]+$/;

function validarSolicitud(body) {
  const errores = {};
  const solicitud = {};

  if (typeof body.nombre !== 'string' || !body.nombre.trim()) {
    errores.nombre = 'Escribe tu nombre.';
  } else if (body.nombre.trim().length > 100) {
    errores.nombre = 'El nombre no puede superar 100 caracteres.';
  } else {
    solicitud.nombre = body.nombre.trim();
  }

  if (typeof body.correo !== 'string' || !body.correo.trim()) {
    errores.correo = 'Escribe tu correo.';
  } else if (body.correo.trim().length > 254 || !emailPattern.test(body.correo.trim())) {
    errores.correo = 'Escribe un correo válido.';
  } else {
    solicitud.correo = body.correo.trim().toLowerCase();
  }

  if (body.telefono !== undefined && body.telefono !== null) {
    if (typeof body.telefono !== 'string') {
      errores.telefono = 'El teléfono debe ser texto.';
    } else {
      const telefono = body.telefono.trim();
      if (telefono && (telefono.length < 7 || telefono.length > 30 || !phonePattern.test(telefono))) {
        errores.telefono = 'Usa solo números, espacios, + o guiones (de 7 a 30 caracteres).';
      } else if (telefono) {
        solicitud.telefono = telefono;
      }
    }
  }

  if (typeof body.tipo !== 'string' || !allowedTypes.includes(body.tipo)) {
    errores.tipo = 'Selecciona un tipo de solicitud válido.';
  } else {
    solicitud.tipo = body.tipo;
  }

  if (body.organizacion !== undefined && body.organizacion !== '') {
    if (typeof body.organizacion !== 'string') {
      errores.organizacion = 'La institución o negocio debe ser texto.';
    } else if (body.organizacion.trim().length > 120) {
      errores.organizacion = 'No puede superar 120 caracteres.';
    } else if (body.organizacion.trim()) {
      solicitud.organizacion = body.organizacion.trim();
    }
  }

  if (typeof body.mensaje !== 'string' || body.mensaje.trim().length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
  } else if (body.mensaje.trim().length > 1000) {
    errores.mensaje = 'El mensaje no puede superar 1000 caracteres.';
  } else {
    solicitud.mensaje = body.mensaje.trim();
  }

  return { errores, solicitud };
}

function excedioLimite(ip, now) {
  for (const [savedIp, request] of requestsByIp) {
    if (now - request.start >= rateLimitWindow) {
      requestsByIp.delete(savedIp);
    }
  }

  const request = requestsByIp.get(ip);
  if (!request || now - request.start >= rateLimitWindow) {
    requestsByIp.set(ip, { start: now, count: 1 });
    return false;
  }

  if (request.count >= maxRequestsPerWindow) {
    return true;
  }

  request.count += 1;
  return false;
}

function esFalloDeConexion(error) {
  return mongoose.connection.readyState !== 1
    || error.name === 'MongooseServerSelectionError'
    || error.name === 'MongoNetworkError';
}

router.post('/', async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      mensaje: 'Revisa los campos del formulario.',
      errores: { formulario: 'Envía la solicitud como un objeto JSON.' }
    });
  }

  if (body.website !== undefined && body.website !== null && String(body.website).trim()) {
    return res.status(201).json({ mensaje: 'Tu solicitud se envió correctamente.' });
  }

  const { errores, solicitud } = validarSolicitud(body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los campos del formulario.', errores });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      mensaje: 'El servicio no puede guardar tu solicitud en este momento. Intenta más tarde.'
    });
  }

  const ip = req.ip || req.socket.remoteAddress || 'desconocida';
  if (excedioLimite(ip, Date.now())) {
    return res.status(429).json({
      mensaje: 'Has enviado varias solicitudes. Intenta de nuevo dentro de una hora.'
    });
  }

  try {
    await Solicitud.create(solicitud);
    return res.status(201).json({ mensaje: 'Tu solicitud se envió correctamente.' });
  } catch (error) {
    console.error('No se pudo guardar la solicitud:', error.message);

    if (esFalloDeConexion(error)) {
      return res.status(503).json({
        mensaje: 'El servicio no puede guardar tu solicitud en este momento. Intenta más tarde.'
      });
    }

    return res.status(500).json({
      mensaje: 'No pudimos guardar tu solicitud. Intenta de nuevo más tarde.'
    });
  }
});

module.exports = router;

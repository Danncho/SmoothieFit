const express = require('express');
const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const { responderBasico } = require('../services/asistente');

const router = express.Router();
const ventanaIpMs = 60 * 1000;
const maximoPorIp = 10;
const peticionesPorIp = new Map();

function excedioLimiteIp(ip, ahora) {
  for (const [ipGuardada, solicitud] of peticionesPorIp) {
    if (ahora - solicitud.inicio >= ventanaIpMs) {
      peticionesPorIp.delete(ipGuardada);
    }
  }

  const solicitud = peticionesPorIp.get(ip);
  if (!solicitud || ahora - solicitud.inicio >= ventanaIpMs) {
    peticionesPorIp.set(ip, { inicio: ahora, cantidad: 1 });
    return false;
  }

  if (solicitud.cantidad >= maximoPorIp) return true;
  solicitud.cantidad += 1;
  return false;
}

function contieneCorreoOTelefono(mensaje) {
  const contieneCorreo = /\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/iu.test(mensaje);
  const contieneTelefono = /(?:\+?\d[\d\s().-]{7,}\d)/u.test(mensaje);
  return contieneCorreo || contieneTelefono;
}

router.post('/asistente', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'desconocida';
  if (excedioLimiteIp(ip, Date.now())) {
    return res.status(429).json({
      mensaje: 'Llegaste al límite de 10 consultas por minuto. Espera un momento e inténtalo de nuevo.'
    });
  }

  const mensaje = req.body?.mensaje;
  const tieneCaracteresControl = typeof mensaje === 'string'
    && /[\u0000-\u001f\u007f-\u009f]/u.test(mensaje);

  if (
    typeof mensaje !== 'string'
    || mensaje !== mensaje.trim()
    || mensaje.length < 3
    || mensaje.length > 300
    || tieneCaracteresControl
  ) {
    return res.status(400).json({
      mensaje: 'Escribe una consulta de 3 a 300 caracteres, sin espacios al inicio o al final ni caracteres de control.'
    });
  }

  if (contieneCorreoOTelefono(mensaje)) {
    return res.json({
      modo: 'basico',
      mensaje: 'Para cuidar tu privacidad, no compartas correos ni teléfonos. Si necesitas ayuda, habla con un familiar de confianza.',
      recomendaciones: [],
      accion: null
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'El catálogo no está disponible en este momento. Intenta de nuevo más tarde.' });
  }

  let productos;
  try {
    productos = await Producto.find()
      .select('id nombre descripcion ingredientes precio categoria')
      .sort({ id: 1 })
      .lean();
  } catch {
    console.error('[Sorbi] categoría=base_de_datos código=lectura_catalogo');
    return res.status(503).json({ mensaje: 'El catálogo no está disponible en este momento. Intenta de nuevo más tarde.' });
  }

  return res.json({
    modo: 'basico',
    ...responderBasico(mensaje, productos)
  });
});

module.exports = router;

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();
const intentoVentanaMs = 15 * 60 * 1000;
const maxIntentosFallidos = 5;
const intentosPorIp = new Map();
const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashFalso = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 12);

function registrarFallo(ip, ahora) {
  for (const [ipGuardada, intento] of intentosPorIp) {
    if (ahora - intento.inicio >= intentoVentanaMs) {
      intentosPorIp.delete(ipGuardada);
    }
  }

  const intento = intentosPorIp.get(ip);
  if (!intento || ahora - intento.inicio >= intentoVentanaMs) {
    intentosPorIp.set(ip, { inicio: ahora, fallos: 1 });
    return;
  }

  intento.fallos += 1;
}

function respuestaGenerica(res) {
  return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
}

router.post('/login', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'desconocida';
  const ahora = Date.now();

  for (const [ipGuardada, intento] of intentosPorIp) {
    if (ahora - intento.inicio >= intentoVentanaMs) {
      intentosPorIp.delete(ipGuardada);
    }
  }

  const intentoActual = intentosPorIp.get(ip);
  if (intentoActual && intentoActual.fallos >= maxIntentosFallidos) {
    return res.status(429).json({
      mensaje: 'Demasiados intentos de acceso. Espera 15 minutos antes de intentarlo de nuevo.'
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'El servicio de autenticación no está disponible.' });
  }
  if (typeof process.env.JWT_SECRET !== 'string' || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ mensaje: 'La autenticación no está configurada en el servidor.' });
  }

  const correo = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
  const entradaValida = correoValido.test(correo)
    && correo.length <= 254
    && Buffer.byteLength(contrasena, 'utf8') <= 72;

  try {
    const usuario = entradaValida && mongoose.connection.readyState === 1
      ? await Usuario.findOne({ correo }).select('+passwordHash')
      : null;
    const hashAComparar = usuario?.passwordHash || hashFalso;
    const contrasenaCorrecta = await bcrypt.compare(contrasena, hashAComparar);

    if (!entradaValida || !usuario || !contrasenaCorrecta || usuario.rol !== 'admin') {
      registrarFallo(ip, ahora);
      return respuestaGenerica(res);
    }

    intentosPorIp.delete(ip);
    const token = jwt.sign(
      { id: usuario._id.toString(), rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      usuario: { correo: usuario.correo, rol: usuario.rol }
    });
  } catch {
    return res.status(503).json({ mensaje: 'El servicio de autenticación no está disponible.' });
  }
});

router.get('/me', verificarToken, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'El servicio de autenticación no está disponible.' });
  }

  try {
    const usuario = await Usuario.findById(req.usuario.id).select('correo rol').lean();
    if (!usuario || usuario.rol !== 'admin') {
      return res.status(401).json({ mensaje: 'La sesión no es válida o venció.' });
    }

    return res.json({ correo: usuario.correo, rol: usuario.rol });
  } catch {
    return res.status(503).json({ mensaje: 'El servicio de autenticación no está disponible.' });
  }
});

module.exports = router;

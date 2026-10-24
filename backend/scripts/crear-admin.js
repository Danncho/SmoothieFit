const path = require('path');
const readline = require('readline');
const { emitKeypressEvents } = require('readline');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Usuario = require('../models/Usuario');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function preguntarCorreo() {
  return new Promise((resolve, reject) => {
    const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
    terminal.question('Correo del administrador: ', (correo) => {
      terminal.close();
      resolve(correo.trim().toLowerCase());
    });
    terminal.on('SIGINT', () => {
      terminal.close();
      reject(new Error('Operación cancelada.'));
    });
  });
}

function preguntarContrasenaOculta() {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
      reject(new Error('Usa una terminal interactiva o define ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.'));
      return;
    }

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write('Contraseña del administrador (entrada oculta): ');
    let contrasena = '';

    function restaurar() {
      process.stdin.removeListener('keypress', manejarTecla);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }

    function manejarTecla(caracter, tecla = {}) {
      if (tecla.ctrl && tecla.name === 'c') {
        restaurar();
        process.stdout.write('\n');
        reject(new Error('Operación cancelada.'));
        return;
      }

      if (tecla.name === 'return' || tecla.name === 'enter') {
        restaurar();
        process.stdout.write('\n');
        resolve(contrasena);
        return;
      }

      if (tecla.name === 'backspace') {
        contrasena = contrasena.slice(0, -1);
        return;
      }

      if (!tecla.ctrl && !tecla.meta && caracter) {
        contrasena += caracter;
      }
    }

    process.stdin.on('keypress', manejarTecla);
  });
}

async function obtenerCredenciales() {
  const correoPorEntorno = process.env.ADMIN_EMAIL;
  const contrasenaPorEntorno = process.env.ADMIN_PASSWORD;

  if (Boolean(correoPorEntorno) !== Boolean(contrasenaPorEntorno)) {
    throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD juntos, o no definas ninguno para usar la entrada interactiva.');
  }

  const correo = correoPorEntorno
    ? correoPorEntorno.trim().toLowerCase()
    : await preguntarCorreo();
  const contrasena = contrasenaPorEntorno || await preguntarContrasenaOculta();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 254) {
    throw new Error('El correo del administrador no tiene un formato válido.');
  }

  if (contrasena.length < 12) {
    throw new Error('La contraseña debe tener al menos 12 caracteres.');
  }

  if (Buffer.byteLength(contrasena, 'utf8') > 72) {
    throw new Error('La contraseña no puede superar 72 bytes.');
  }

  return { correo, contrasena };
}

async function crearAdmin() {
  let conectado = false;
  try {
    const { correo, contrasena } = await obtenerCredenciales();
    await connectDB();
    conectado = true;

    const existente = await Usuario.findOne({ correo }).select('_id').lean();
    if (existente) {
      console.log('Ya existe un administrador con ese correo; no se hicieron cambios.');
      return;
    }

    const passwordHash = await bcrypt.hash(contrasena, 12);
    await Usuario.create({ correo, passwordHash, rol: 'admin' });
    console.log('Administrador creado correctamente.');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Ya existe un administrador con ese correo; no se hicieron cambios.');
      process.exitCode = 1;
      return;
    }

    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (conectado) {
      try {
        await mongoose.disconnect();
      } catch {
        console.error('No se pudo cerrar la conexión con MongoDB.');
        process.exitCode = 1;
      }
    }
  }
}

crearAdmin();

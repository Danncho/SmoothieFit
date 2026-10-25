const express = require('express');
const mongoose = require('mongoose');
const verificarToken = require('../middleware/verificarToken');
const Producto = require('../models/Producto');

const router = express.Router();
const ventanaVotosHoraMs = 60 * 60 * 1000;
const ventanaVotoProductoMs = 24 * 60 * 60 * 1000;
const maximoVotosPorHora = 20;
// Es un freno básico, no infalible: vive en memoria, se reinicia y no coordina instancias.
// Las IP solo son claves temporales en memoria y nunca se guardan en la base de datos.
const votosPorIp = new Map();

function verificarConexion(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      mensaje: 'La base de datos no está disponible. Intenta de nuevo más tarde.'
    });
  }

  return next();
}

function validarProducto(datos) {
  const errores = [];
  const limites = {
    nombre: 80,
    descripcion: 250,
    imagen: 200,
    categoria: 50
  };

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return { errores: ['Envía los datos del producto como un objeto JSON.'] };
  }

  Object.entries(limites).forEach(([campo, maximo]) => {
    if (typeof datos[campo] !== 'string' || datos[campo].trim().length === 0) {
      errores.push(`El campo "${campo}" es obligatorio y debe ser texto.`);
    } else if (datos[campo].trim().length > maximo) {
      errores.push(`El campo "${campo}" no puede superar ${maximo} caracteres.`);
    }
  });

  if (!Array.isArray(datos.ingredientes) || datos.ingredientes.length === 0) {
    errores.push('El campo "ingredientes" debe ser una lista con al menos un elemento.');
  } else if (datos.ingredientes.some((ingrediente) => (
    typeof ingrediente !== 'string' || ingrediente.trim().length === 0 || ingrediente.trim().length > 40
  ))) {
    errores.push('Cada ingrediente debe ser texto de 1 a 40 caracteres.');
  } else if (datos.ingredientes.length > 10) {
    errores.push('No se pueden agregar más de 10 ingredientes.');
  }

  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    errores.push('El campo "precio" debe ser un número mayor que 0.');
  }

  if (errores.length > 0) {
    return { errores };
  }

  return {
    producto: {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      ingredientes: datos.ingredientes.map((ingrediente) => ingrediente.trim()),
      precio: datos.precio,
      imagen: datos.imagen.trim(),
      categoria: datos.categoria.trim()
    },
    errores
  };
}

function serializarProducto(documento) {
  const producto = typeof documento.toObject === 'function'
    ? documento.toObject()
    : documento;

  return {
    id: producto.id,
    esEjemplo: producto.esEjemplo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    ingredientes: producto.ingredientes,
    precio: producto.precio,
    imagen: producto.imagen,
    categoria: producto.categoria,
    votos: producto.votos ?? 0
  };
}

function responderError(res, error, mensaje) {
  console.error(`${mensaje}:`, error.message);

  const databaseUnavailable = mongoose.connection.readyState !== 1
    || error.name === 'MongooseServerSelectionError'
    || error.name === 'MongoNetworkError';

  if (databaseUnavailable) {
    return res.status(503).json({
      mensaje: 'La base de datos no está disponible. Intenta de nuevo más tarde.'
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ mensaje: 'Ya existe un producto con ese id.' });
  }

  return res.status(500).json({ mensaje });
}

function obtenerIdValido(id) {
  if (!/^\d+$/.test(id)) {
    return null;
  }

  const parsedId = Number(id);
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function limpiarRegistrosVoto(ahora) {
  for (const [ip, registro] of votosPorIp) {
    registro.votosHora = registro.votosHora
      .filter((voto) => ahora - voto.fecha < ventanaVotosHoraMs);

    for (const [idProducto, voto] of registro.productos) {
      if (ahora - voto.fecha >= ventanaVotoProductoMs) {
        registro.productos.delete(idProducto);
      }
    }

    if (registro.votosHora.length === 0 && registro.productos.size === 0) {
      votosPorIp.delete(ip);
    }
  }
}

function reservarVoto(ip, idProducto, ahora) {
  limpiarRegistrosVoto(ahora);
  let registro = votosPorIp.get(ip);

  if (!registro) {
    registro = { votosHora: [], productos: new Map() };
    votosPorIp.set(ip, registro);
  }

  if (registro.votosHora.length >= maximoVotosPorHora) {
    return { permitido: false, motivo: 'limite_hora' };
  }
  if (registro.productos.has(idProducto)) {
    return { permitido: false, motivo: 'voto_repetido' };
  }

  const reserva = { fecha: ahora };
  registro.votosHora.push(reserva);
  registro.productos.set(idProducto, reserva);
  return { permitido: true, reserva };
}

function liberarVoto(ip, idProducto, reserva) {
  const registro = votosPorIp.get(ip);
  if (!registro) return;

  registro.votosHora = registro.votosHora.filter((voto) => voto !== reserva);
  if (registro.productos.get(idProducto) === reserva) {
    registro.productos.delete(idProducto);
  }
  if (registro.votosHora.length === 0 && registro.productos.size === 0) {
    votosPorIp.delete(ip);
  }
}

router.get('/', verificarConexion, async (req, res) => {
  try {
    const productos = await Producto.find().sort({ id: 1 }).lean();
    return res.json(productos.map(serializarProducto));
  } catch (error) {
    return responderError(res, error, 'No se pudieron leer los productos.');
  }
});

router.get('/:id', verificarConexion, async (req, res) => {
  const id = obtenerIdValido(req.params.id);
  if (id === null) {
    return res.status(400).json({ mensaje: 'El id del producto debe ser un número entero positivo.' });
  }

  try {
    const producto = await Producto.findOne({ id }).lean();

    if (!producto) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    return res.json(serializarProducto(producto));
  } catch (error) {
    return responderError(res, error, 'No se pudo consultar el producto.');
  }
});

router.post('/:id/voto', verificarConexion, async (req, res) => {
  const id = obtenerIdValido(req.params.id);
  if (id === null) {
    return res.status(400).json({ mensaje: 'El id del producto debe ser un número entero positivo.' });
  }

  const ip = req.ip || req.socket.remoteAddress || 'desconocida';
  let reserva;

  try {
    const existe = await Producto.exists({ id });
    if (!existe) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    const resultadoReserva = reservarVoto(ip, id, Date.now());
    if (!resultadoReserva.permitido) {
      const mensaje = resultadoReserva.motivo === 'voto_repetido'
        ? 'Ya votaste por este smoothie. Puedes volver a votar después de 24 horas.'
        : 'Llegaste al límite de 20 votos por hora desde esta conexión. Inténtalo más tarde.';
      return res.status(429).json({ mensaje });
    }
    reserva = resultadoReserva.reserva;

    const producto = await Producto.findOneAndUpdate(
      { id },
      { $inc: { votos: 1 } },
      { new: true, runValidators: true }
    ).select('id votos').lean();

    if (!producto) {
      liberarVoto(ip, id, reserva);
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    return res.json({ votos: producto.votos });
  } catch (error) {
    if (reserva) liberarVoto(ip, id, reserva);
    return responderError(res, error, 'No se pudo registrar el voto.');
  }
});

router.post('/', verificarToken, verificarConexion, async (req, res) => {
  const resultado = validarProducto(req.body);

  if (resultado.errores.length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores: resultado.errores });
  }

  try {
    const productoMayor = await Producto.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
    const nuevoProducto = await Producto.create({
      id: (productoMayor?.id || 0) + 1,
      esEjemplo: false,
      ...resultado.producto
    });

    return res.status(201).json({
      mensaje: 'Producto creado correctamente.',
      producto: serializarProducto(nuevoProducto)
    });
  } catch (error) {
    return responderError(res, error, 'No se pudo guardar el producto.');
  }
});

router.put('/:id', verificarToken, verificarConexion, async (req, res) => {
  const resultado = validarProducto(req.body);

  if (resultado.errores.length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores: resultado.errores });
  }

  const id = obtenerIdValido(req.params.id);
  if (id === null) {
    return res.status(400).json({ mensaje: 'El id del producto debe ser un número entero positivo.' });
  }

  try {
    const producto = await Producto.findOne({ id });
    if (!producto) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    Object.assign(producto, {
      esEjemplo: false,
      ...resultado.producto
    });
    await producto.save();

    return res.json({
      mensaje: 'Producto actualizado correctamente.',
      producto: serializarProducto(producto)
    });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el producto.');
  }
});

router.delete('/:id', verificarToken, verificarConexion, async (req, res) => {
  const id = obtenerIdValido(req.params.id);
  if (id === null) {
    return res.status(400).json({ mensaje: 'El id del producto debe ser un número entero positivo.' });
  }

  try {
    const producto = await Producto.findOneAndDelete({ id });

    if (!producto) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    return res.json({
      mensaje: 'Producto eliminado correctamente.',
      producto: serializarProducto(producto)
    });
  } catch (error) {
    return responderError(res, error, 'No se pudo eliminar el producto.');
  }
});

module.exports = router;

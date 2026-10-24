const express = require('express');
const verificarToken = require('../middleware/verificarToken');
const {
  consultarGemini,
  crearDescripcionBasica,
  contieneContenidoProhibido,
  GeminiError
} = require('../services/gemini');

const router = express.Router();
const indiciosDeInyeccion = /ignora(?:r)?\s+(?:tus\s+)?instrucciones|revela(?:r)?\s+(?:tu\s+)?(?:clave|token)|muestra\s+(?:la\s+)?clave|system\s+prompt|api\s*key|password/iu;
const correoRegex = /\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/iu;
const telefonoRegex = /(?:\+?\d[\d\s().-]{7,}\d)/u;
const usoIa = {
  minuto: '',
  llamadasEsteMinuto: 0,
  dia: '',
  llamadasHoy: 0
};

function leerLimite(nombre, predeterminado) {
  const valor = process.env[nombre];
  if (!valor) return predeterminado;

  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : predeterminado;
}

function validarTextoOpcional(valor, campo, maximo, errores) {
  if (valor === undefined || valor === '') return '';
  if (
    typeof valor !== 'string'
    || !valor.trim()
    || valor.trim().length > maximo
    || /[\u0000-\u001f\u007f-\u009f]/u.test(valor)
  ) {
    errores.push(`El campo "${campo}" debe ser texto de 1 a ${maximo} caracteres.`);
    return '';
  }
  const texto = valor.trim();
  if (
    indiciosDeInyeccion.test(texto)
    || correoRegex.test(texto)
    || telefonoRegex.test(texto)
    || contieneContenidoProhibido(texto)
  ) {
    errores.push(`El campo "${campo}" no debe incluir instrucciones, datos personales ni afirmaciones prohibidas.`);
    return '';
  }
  return texto;
}

function validarDatos(datos) {
  const errores = [];
  const tipos = ['descripcion', 'nombres', 'eslogan'];

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return { errores: ['Envía los datos como un objeto JSON.'] };
  }
  if (!tipos.includes(datos.tipo)) {
    errores.push('El tipo debe ser "descripcion", "nombres" o "eslogan".');
  }

  const nombre = validarTextoOpcional(datos.nombre, 'nombre', 60, errores);
  const categoria = validarTextoOpcional(datos.categoria, 'categoria', 40, errores);
  const tonos = ['juvenil', 'familiar'];
  if (!tonos.includes(datos.tono)) {
    errores.push('El tono debe ser "juvenil" o "familiar".');
  }

  let ingredientes = [];
  if (!Array.isArray(datos.ingredientes) || datos.ingredientes.length < 1 || datos.ingredientes.length > 10) {
    errores.push('Ingredientes debe ser una lista de 1 a 10 textos.');
  } else if (datos.ingredientes.some((ingrediente) => (
    typeof ingrediente !== 'string'
    || !ingrediente.trim()
    || ingrediente.trim().length > 40
    || /[\u0000-\u001f\u007f-\u009f]/u.test(ingrediente)
    || indiciosDeInyeccion.test(ingrediente)
    || correoRegex.test(ingrediente)
    || telefonoRegex.test(ingrediente)
    || contieneContenidoProhibido(ingrediente)
  ))) {
    errores.push('Cada ingrediente debe ser texto de 1 a 40 caracteres, sin instrucciones, datos personales ni afirmaciones prohibidas.');
  } else {
    ingredientes = datos.ingredientes.map((ingrediente) => ingrediente.trim());
  }

  if (errores.length) return { errores };
  return {
    producto: {
      nombre,
      ingredientes,
      categoria,
      tono: datos.tono
    },
    tipo: datos.tipo
  };
}

function puedeUsarIa(ahora) {
  const minuto = `${ahora.getUTCFullYear()}-${ahora.getUTCMonth()}-${ahora.getUTCDate()}-${ahora.getUTCHours()}-${ahora.getUTCMinutes()}`;
  const dia = `${ahora.getUTCFullYear()}-${ahora.getUTCMonth()}-${ahora.getUTCDate()}`;

  if (usoIa.minuto !== minuto) {
    usoIa.minuto = minuto;
    usoIa.llamadasEsteMinuto = 0;
  }
  if (usoIa.dia !== dia) {
    usoIa.dia = dia;
    usoIa.llamadasHoy = 0;
  }

  const limitePorMinuto = leerLimite('LIMITE_IA_POR_MINUTO', 5);
  const limiteDiario = leerLimite('LIMITE_IA_DIARIO', 100);
  if (usoIa.llamadasEsteMinuto >= limitePorMinuto || usoIa.llamadasHoy >= limiteDiario) {
    return false;
  }

  usoIa.llamadasEsteMinuto += 1;
  usoIa.llamadasHoy += 1;
  return true;
}

router.post('/admin/generar', verificarToken, async (req, res) => {
  const validacion = validarDatos(req.body);
  if (validacion.errores) {
    return res.status(400).json({
      mensaje: 'Revisa los datos del producto.',
      errores: validacion.errores
    });
  }

  if (!process.env.GEMINI_API_KEY || !process.env.MODELO_IA) {
    try {
      await consultarGemini(validacion.tipo, validacion.producto);
    } catch (error) {
      if (validacion.tipo === 'descripcion') {
        return res.json({ modo: 'basico', opciones: crearDescripcionBasica(validacion.producto) });
      }
      return res.status(error instanceof GeminiError ? error.status : 503).json({
        mensaje: error.message || 'Falta configurar Gemini en el backend.'
      });
    }
  }

  if (!puedeUsarIa(new Date())) {
    return res.status(429).json({
      mensaje: 'Se alcanzó el límite de sugerencias con IA. Inténtalo más tarde.'
    });
  }

  try {
    const opciones = await consultarGemini(validacion.tipo, validacion.producto);
    return res.json({ modo: 'ia', opciones });
  } catch (error) {
    if (validacion.tipo === 'descripcion' && error.codigo !== 'salida_filtrada') {
      return res.json({ modo: 'basico', opciones: crearDescripcionBasica(validacion.producto) });
    }

    const status = error.codigo === 'salida_filtrada' ? 502 : error.status || 502;
    const mensaje = error.codigo === 'salida_filtrada'
      ? error.message
      : error.status === 503
        ? error.message
        : 'La sugerencia no está disponible en este momento. Inténtalo más tarde.';
    return res.status(status).json({
      mensaje
    });
  }
});

module.exports = router;

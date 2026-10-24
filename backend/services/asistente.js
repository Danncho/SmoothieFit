const rutasAccion = {
  contacto: { texto: 'Ir a Contacto', ruta: '/contacto' },
  colegio: { texto: 'Consultar por colegios', ruta: '/contacto?tipo=colegio' },
  tienda: { texto: 'Consultar por tiendas', ruta: '/contacto?tipo=tienda' },
  catalogo: { texto: 'Ver catálogo', ruta: '/smoothies' }
};

const palabrasClave = ['dulce', 'cítrico', 'energía', 'ligero', 'tropical', 'verde', 'cacao'];

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function responderBasico(mensaje, productos) {
  const mensajeNormalizado = normalizarTexto(mensaje);
  const coincidencias = palabrasClave.filter((palabra) => (
    mensajeNormalizado.includes(normalizarTexto(palabra))
  ));

  let seleccionados;
  if (coincidencias.length > 0) {
    seleccionados = productos
      .map((producto) => {
        const textoProducto = normalizarTexto([
          producto.nombre,
          producto.descripcion,
          ...(Array.isArray(producto.ingredientes) ? producto.ingredientes : []),
          producto.categoria
        ].filter(Boolean).join(' '));
        const palabrasCoincidentes = coincidencias.filter((palabra) => (
          textoProducto.includes(normalizarTexto(palabra))
        ));
        return { producto, palabrasCoincidentes };
      })
      .filter((resultado) => resultado.palabrasCoincidentes.length > 0)
      .sort((a, b) => b.palabrasCoincidentes.length - a.palabrasCoincidentes.length)
      .slice(0, 3);
  } else {
    seleccionados = [];
  }

  if (seleccionados.length === 0) {
    seleccionados = productos.slice(0, 3).map((producto) => ({ producto, palabrasCoincidentes: [] }));
  }

  return {
    mensaje: seleccionados.length
      ? '¡Hola! Puedo ayudarte a explorar sabores del catálogo. Para dudas de la marca, escríbenos desde Contacto.'
      : '¡Hola! Ahora no hay productos disponibles para recomendar. Para dudas de la marca, escríbenos desde Contacto.',
    recomendaciones: seleccionados.map(({ producto, palabrasCoincidentes }) => ({
      producto,
      motivo: palabrasCoincidentes.length
        ? `Coincide con: ${palabrasCoincidentes.join(', ')}.`
        : 'Una opción representativa del catálogo.'
    })),
    accion: rutasAccion.contacto
  };
}

module.exports = {
  responderBasico
};

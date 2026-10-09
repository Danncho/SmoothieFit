const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const productsFile = path.join(__dirname, '..', 'data', 'productos.json');

async function leerProductos() {
  const contenido = await fs.readFile(productsFile, 'utf8');
  const productos = JSON.parse(contenido);

  if (!Array.isArray(productos)) {
    throw new Error('El archivo de productos debe contener una lista.');
  }

  return productos;
}

async function guardarProductos(productos) {
  await fs.writeFile(productsFile, `${JSON.stringify(productos, null, 2)}\n`, 'utf8');
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

router.get('/', async (req, res) => {
  try {
    res.json(await leerProductos());
  } catch (error) {
    console.error('Error al leer productos:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron leer los productos.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productos = await leerProductos();
    const producto = productos.find((item) => String(item.id) === req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    return res.json(producto);
  } catch (error) {
    console.error('Error al consultar producto:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo consultar el producto.' });
  }
});

router.post('/', async (req, res) => {
  const resultado = validarProducto(req.body);

  if (resultado.errores.length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores: resultado.errores });
  }

  try {
    const productos = await leerProductos();
    const nuevoId = productos.reduce((mayorId, producto) => Math.max(mayorId, Number(producto.id) || 0), 0) + 1;
    const nuevoProducto = { id: nuevoId, esEjemplo: false, ...resultado.producto };

    productos.push(nuevoProducto);
    await guardarProductos(productos);

    return res.status(201).json({ mensaje: 'Producto creado correctamente.', producto: nuevoProducto });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo guardar el producto.' });
  }
});

router.put('/:id', async (req, res) => {
  const resultado = validarProducto(req.body);

  if (resultado.errores.length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores: resultado.errores });
  }

  try {
    const productos = await leerProductos();
    const indice = productos.findIndex((item) => String(item.id) === req.params.id);

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    const productoActualizado = {
      id: productos[indice].id,
      esEjemplo: false,
      ...resultado.producto
    };

    productos[indice] = productoActualizado;
    await guardarProductos(productos);

    return res.json({ mensaje: 'Producto actualizado correctamente.', producto: productoActualizado });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el producto.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const productos = await leerProductos();
    const indice = productos.findIndex((item) => String(item.id) === req.params.id);

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'No se encontró el producto solicitado.' });
    }

    const [productoEliminado] = productos.splice(indice, 1);
    await guardarProductos(productos);

    return res.json({ mensaje: 'Producto eliminado correctamente.', producto: productoEliminado });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el producto.' });
  }
});

module.exports = router;

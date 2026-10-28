// Este módulo es la fuente única de categorías, límites y tamaños del constructor.
// El precio final suma el tamaño, la base y los demás ingredientes.
// Los precios son valores de ejemplo para este proyecto académico.
const reglasConstructor = {
  categorias: {
    base: 'base',
    frutas: 'frutas',
    verduras: 'verduras',
    extras: 'extras'
  },
  seleccion: {
    basesExactas: 1,
    frutasMinimas: 1,
    frutasYVerdurasMaximas: 4,
    extrasMaximos: 2
  },
  tamanos: [
    { id: 'pequeno', nombre: 'Pequeño', precioBase: 2.5 },
    { id: 'mediano', nombre: 'Mediano', precioBase: 3 },
    { id: 'grande', nombre: 'Grande', precioBase: 3.75 }
  ]
};

function validarCreacion(creacion, ingredientes) {
  const errores = [];

  if (!creacion || typeof creacion !== 'object' || Array.isArray(creacion)) {
    return { errores: ['Envía los datos de la creación como un objeto.'] };
  }
  if (creacion.nombre !== undefined && (
    typeof creacion.nombre !== 'string' || creacion.nombre.trim().length > 40
  )) {
    errores.push('El nombre de la creación debe ser texto de hasta 40 caracteres.');
  }
  if (typeof creacion.tamano !== 'string'
    || !reglasConstructor.tamanos.some((tamano) => tamano.id === creacion.tamano)) {
    errores.push('Selecciona un tamaño válido.');
  }
  if (!Array.isArray(ingredientes)) {
    return { errores: [...errores, 'No se pudo consultar la lista de ingredientes.'] };
  }

  const base = ingredientes.find((ingrediente) => ingrediente.id === creacion.baseId);
  if (!base || base.categoria !== reglasConstructor.categorias.base) {
    errores.push('Selecciona una base válida.');
  }
  if (!Array.isArray(creacion.ingredientesIds)) {
    errores.push('Selecciona los ingredientes como una lista.');
    return { errores };
  }
  if (new Set(creacion.ingredientesIds).size !== creacion.ingredientesIds.length) {
    errores.push('No repitas ingredientes.');
  }

  const seleccionados = creacion.ingredientesIds.map((id) => (
    ingredientes.find((ingrediente) => ingrediente.id === id)
  ));
  if (seleccionados.some((ingrediente) => !ingrediente
    || ![reglasConstructor.categorias.frutas, reglasConstructor.categorias.verduras,
      reglasConstructor.categorias.extras].includes(ingrediente.categoria))) {
    errores.push('Hay un ingrediente que no está disponible para esta selección.');
  }

  const ingredientesValidos = seleccionados.filter(Boolean);
  const frutas = ingredientesValidos.filter(
    (ingrediente) => ingrediente.categoria === reglasConstructor.categorias.frutas
  );
  const frutasYVerduras = ingredientesValidos.filter(
    (ingrediente) => [reglasConstructor.categorias.frutas, reglasConstructor.categorias.verduras]
      .includes(ingrediente.categoria)
  );
  const extras = ingredientesValidos.filter(
    (ingrediente) => ingrediente.categoria === reglasConstructor.categorias.extras
  );

  if (frutas.length < reglasConstructor.seleccion.frutasMinimas) {
    errores.push('Elige al menos una fruta.');
  }
  if (frutasYVerduras.length > reglasConstructor.seleccion.frutasYVerdurasMaximas) {
    errores.push('Elige como máximo cuatro frutas y verduras en total.');
  }
  if (extras.length > reglasConstructor.seleccion.extrasMaximos) {
    errores.push('Elige como máximo dos extras.');
  }

  return {
    errores,
    tamano: reglasConstructor.tamanos.find((item) => item.id === creacion.tamano),
    base,
    ingredientes: ingredientesValidos
  };
}

function calcularPrecio(tamano, base, ingredientes) {
  const centavos = [tamano, base, ...ingredientes]
    .reduce((total, item) => total + Math.round((item.precioBase ?? item.precioExtra) * 100), 0);
  return centavos / 100;
}

reglasConstructor.validarCreacion = validarCreacion;
reglasConstructor.calcularPrecio = calcularPrecio;

module.exports = reglasConstructor;

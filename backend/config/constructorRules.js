// Este módulo es la fuente única de categorías, límites y tamaños del constructor.
// El precio final suma el precio del tamaño y el precioExtra de cada ingrediente.
// Los precios son valores de ejemplo para este proyecto académico.
const reglasConstructor = {
  categorias: {
    base: 'base',
    frutas: 'frutas',
    verduras: 'verduras',
    extras: ['semillas', 'extras']
  },
  seleccion: {
    basesExactas: 1,
    frutasMinimas: 1,
    frutasYVerdurasMaximas: 4,
    semillasYExtrasMaximos: 2
  },
  tamanos: [
    { id: 'pequeno', nombre: 'Pequeño', precioBase: 2.5 },
    { id: 'mediano', nombre: 'Mediano', precioBase: 3.5 },
    { id: 'grande', nombre: 'Grande', precioBase: 4.5 }
  ]
};

module.exports = reglasConstructor;

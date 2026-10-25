export function votosDelProducto(producto) {
  const votos = Number(producto.votos);
  return Number.isFinite(votos) && votos > 0 ? votos : 0;
}

export function ordenarPorVotos(productos) {
  return [...productos].sort((a, b) => (
    votosDelProducto(b) - votosDelProducto(a)
    || (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
  ));
}

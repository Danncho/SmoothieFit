export function tieneCoordenadas(sucursal) {
  return Number.isFinite(sucursal.lat) && Number.isFinite(sucursal.lng);
}

export function crearUrlMapa(sucursal) {
  if (tieneCoordenadas(sucursal)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${sucursal.lat},${sucursal.lng}`;
  }
  if (sucursal.destinoMapa) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sucursal.destinoMapa)}`;
  }
  return null;
}

function crearUrlMapaIncrustado(sucursal) {
  const margen = 0.01;
  const caja = [
    sucursal.lng - margen,
    sucursal.lat - margen,
    sucursal.lng + margen,
    sucursal.lat + margen
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(caja)}&layer=mapnik&marker=${sucursal.lat},${sucursal.lng}`;
}

function SucursalCard({ sucursal }) {
  const esMallDelSol = sucursal.id === 'mall-del-sol';
  const urlMapa = crearUrlMapa(sucursal);
  const conCoordenadas = tieneCoordenadas(sucursal);

  return (
    <article className={`card branch-card${esMallDelSol ? ' branch-card-featured' : ''}`}>
      <h2>{sucursal.nombre}</h2>
      <dl className="branch-details">
        <div><dt>Ciudad</dt><dd>{sucursal.ciudad}</dd></div>
        <div><dt>Zona</dt><dd>{sucursal.zona}</dd></div>
        {sucursal.direccion && <div><dt>Dirección</dt><dd>{sucursal.direccion}</dd></div>}
        <div><dt>Referencia</dt><dd>{sucursal.referencia}</dd></div>
        {sucursal.formato && (
          <div><dt>Formato</dt><dd>{sucursal.formato}</dd></div>
        )}
        {sucursal.horario && <div><dt>Horario</dt><dd>{sucursal.horario}</dd></div>}
        {sucursal.telefono && <div><dt>Teléfono</dt><dd>{sucursal.telefono}</dd></div>}
      </dl>
      {conCoordenadas && (
        <iframe
          className="branch-map"
          title={`Mapa de ${sucursal.nombre}`}
          src={crearUrlMapaIncrustado(sucursal)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      {urlMapa ? (
        <a
          className="button button-secondary branch-directions"
          href={urlMapa}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cómo llegar
        </a>
      ) : null}
    </article>
  );
}

export default SucursalCard;

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const tokenMatch = authorization.match(/^Bearer\s+(\S+)$/);

  if (!tokenMatch) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión para continuar.' });
  }

  try {
    const payload = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
    if (!payload || typeof payload !== 'object' || payload.rol !== 'admin' || !payload.id) {
      return res.status(401).json({ mensaje: 'La sesión no es válida o venció.' });
    }

    req.usuario = { id: payload.id, rol: payload.rol };
    return next();
  } catch {
    return res.status(401).json({ mensaje: 'La sesión no es válida o venció.' });
  }
}

module.exports = verificarToken;

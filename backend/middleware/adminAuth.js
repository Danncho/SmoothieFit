function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;
  const providedKey = req.get('x-admin-key');

  if (!adminKey || providedKey !== adminKey) {
    return res.status(401).json({ mensaje: 'Clave de administrador incorrecta.' });
  }

  return next();
}

module.exports = adminAuth;

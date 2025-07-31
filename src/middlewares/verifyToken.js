const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guarda los datos del token en req.user
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

const allowedIPs = [
         // Tu IP de pruebas (Postman, personal)
  '167.172.142.206',           // IP del servidor
  // Puedes agregar más aquí 
];

const allowedOrigins = [
  'https://transportessjm.com',
  'https://www.transportessjm.com',
  'http://localhost:5173'      // Para desarrollo local
];

module.exports = function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const origin = req.headers.origin || req.headers.referer || '';
  const path = req.originalUrl;

  const ipAutorizada = allowedIPs.includes(ip);
  const originAutorizado = allowedOrigins.some(o => origin.startsWith(o));

  if (ipAutorizada || originAutorizado) {
    return next();
  }

  console.warn(` [BLOQUEADO] IP: ${ip} | Origin: ${origin || 'NULO'} | Path: ${path}`);
  return res.status(403).json({ message: 'Acceso denegado. IP u origen no autorizado.' });
};

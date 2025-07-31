const allowedIPs = [
  '205.164.182.165',            // Tu IP personal (para Postman)
  '167.172.142.206',            // IP de tu servidor si hace peticiones internas
  // Agrega aquí más IPs permitidas según sea necesario
];

const allowedOrigins = [
  'https://transportessjm.com',
  'https://www.transportessjm.com', 
  'http://localhost:5173'
];

module.exports = function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const origin = req.headers.origin || req.headers.referer || '';

  if (
    allowedIPs.includes(ip) ||
    allowedOrigins.some(o => origin.startsWith(o))
  ) {
    return next();
  }

  console.warn(`[❌ BLOQUEADO] IP/Origen no autorizado: ${ip} - ${origin}`);
  return res.status(403).json({ message: 'Acceso denegado. IP u origen no autorizado.' });
};

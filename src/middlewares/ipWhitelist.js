const allowedIPs = [
  '205.164.182.165',      // Tu IP personal
  '167.172.142.206'       // IP de tu servidor
];

const allowedOrigins = [
  'https://transportessjm.com',
  'https://www.transportessjm.com',
  'http://localhost:5173'
];

module.exports = function (req, res, next) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const origin = req.headers.origin;

  if (
    allowedOrigins.includes(origin) ||   // Permitir origen web conocido
    allowedIPs.includes(ip)              // Permitir IP explícita (Postman o backend)
  ) {
    return next();
  }

  console.warn(`[BLOQUEADO] IP/Origen no autorizado: ${ip} - ${origin}`);
  return res.status(403).json({ message: 'Acceso denegado. IP u origen no autorizado.' });
};

// src/middlewares/ipWhitelist.js

const allowedIPs = [
  '205.164.182.167',            // Tu IP personal actual (para Postman)
  '167.172.142.206',            // IP del servidor (puede hacer peticiones internas)
  // 'XXX.XXX.XXX.XXX',         // Agrega aquí cualquier nueva IP cuando cambies
];

const allowedOrigins = [
  'https://transportessjm.com', // Dominio del frontend en producción
  'http://localhost:5173'       // Para desarrollo local (Vite)
];

module.exports = function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const origin = req.headers.origin;

  const ipLimpia = typeof ip === 'string' ? ip.replace('::ffff:', '') : '';

  if (
    allowedIPs.includes(ipLimpia) ||                      // IP permitida
    (origin && allowedOrigins.includes(origin))           // Frontend permitido
  ) {
    return next();
  }

  console.warn(`[BLOQUEADO] IP/Origen no autorizado: ${ipLimpia} - ${origin}`);
  return res.status(403).json({ message: 'Acceso denegado. IP u origen no autorizado.' });
};

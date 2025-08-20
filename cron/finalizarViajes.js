require('dotenv').config();
const mysql = require('mysql2');
const cron = require('node-cron');

// 🔹 Pool independiente con zona horaria de México
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '-06:00', // Esto afecta a MySQL, no a Node
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos para CRON de finalizar viajes:', err.message);
  } else {
    console.log('Conectado a la base de datos MySQL para CRON de finalizar viajes');
    connection.release();
  }
});

// 🔹 Función para obtener fecha/hora en zona horaria de México
function getFechaHoraMX() {
  const now = new Date();

  // Fecha en formato YYYY-MM-DD
  const fechaMX = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .format(now)
    .split('/')
    .reverse()
    .join('-');

  // Hora en formato HH:MM:SS (24h)
  const horaMX = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);

  return { fechaMX, horaMX };
}

// 🔹 Ejecutar cada 2 horas
cron.schedule('0 */2 * * *', () => {
  console.log('Ejecutando CRON para finalizar viajes automáticamente...');

  const { fechaMX, horaMX } = getFechaHoraMX();

  const sql = `
    UPDATE viajes
    SET estado = 'finalizado',
        finalizado_en = ?
    WHERE estado = 'disponible'
      AND (fecha < ? OR (fecha = ? AND hora <= ?))
  `;

  pool.query(sql, [`${fechaMX} ${horaMX}`, fechaMX, fechaMX, horaMX], (err, result) => {
    if (err) {
      console.error('[CRON] ❌ Error al finalizar viajes automáticamente:', err);
    } else if (result.affectedRows > 0) {
      console.log(`[CRON] ✅ ${result.affectedRows} viaje(s) finalizado(s) automáticamente`);
    } else {
      console.log('[CRON] ℹ No hay viajes por finalizar');
    }
  });
});

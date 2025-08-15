require('dotenv').config();
const mysql = require('mysql2');
const cron = require('node-cron');

// 🔹 Pool independiente con zona horaria de México
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '-06:00',
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

// 🔹 Ejecutar cada 2 horas
cron.schedule('0 */2 * * *', () => {
  console.log('Ejecutando CRON para finalizar viajes automáticamente...');

  // Obtener fecha y hora actuales en CDMX desde Node
  const now = new Date();
  const fechaMX = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const horaMX = now.toTimeString().slice(0, 8); // HH:MM:SS

  const sql = `
    UPDATE viajes
    SET estado = 'finalizado',
        finalizado_en = ?
    WHERE estado = 'disponible'
      AND (fecha < ? OR (fecha = ? AND hora <= ?))
  `;

  pool.query(sql, [`${fechaMX} ${horaMX}`, fechaMX, fechaMX, horaMX], (err, result) => {
    if (err) {
      console.error('[CRON]  Error al finalizar viajes automáticamente:', err);
    } else if (result.affectedRows > 0) {
      console.log(`[CRON]  ${result.affectedRows} viaje(s) finalizado(s) automáticamente`);
    } else {
      console.log('[CRON] ℹ No hay viajes por finalizar');
    }
  });
});

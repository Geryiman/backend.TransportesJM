const db = require('../src/config/db');
const cron = require('node-cron');

// ⏰ Ejecutar cada 2 horas
cron.schedule('0 */2 * * *', () => {
  const sql = `
    UPDATE viajes
    SET estado = 'finalizado',
        finalizado_en = NOW()
    WHERE estado = 'disponible'
      AND (fecha < CURDATE() OR (fecha = CURDATE() AND hora <= CURTIME()))
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('[CRON] ❌ Error al finalizar viajes automáticamente:', err);
    } else if (result.affectedRows > 0) {
      console.log(`[CRON] ✅ ${result.affectedRows} viaje(s) finalizado(s) automáticamente`);
    } else {
      console.log('[CRON] ⏳ No hay viajes por finalizar');
    }
  });
});

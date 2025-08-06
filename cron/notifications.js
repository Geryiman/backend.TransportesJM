const cron = require('node-cron');
const db = require('../config/db');
const axios = require('axios');

// Ejecutar cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  console.log('🔔 Ejecutando tareas de notificaciones automáticas...');

  try {
    // 1. Notificar a admin si hay solicitudes pendientes
    const [pendientes] = await db.query("SELECT COUNT(*) as total FROM reservas WHERE estado = 'pendiente'");
    if (pendientes[0].total > 0) {
      await axios.post(`${process.env.FRONTEND_URL}/api/notify/admin`, {
        title: '🚨 Solicitudes pendientes',
        body: `Tienes ${pendientes[0].total} reservas por revisar.`,
        link: '/admin/notificaciones'
      });
    }

    // 2. Notificar a usuarios si su reserva fue aceptada
    const [aceptadas] = await db.query(`
      SELECT r.id_usuario, u.token_notificacion
      FROM reservas r
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.estado = 'confirmada' AND r.notificado = 0
    `);

    for (const row of aceptadas) {
      if (row.token_notificacion) {
        await axios.post(`${process.env.FRONTEND_URL}/api/notify/user`, {
          token: row.token_notificacion,
          title: '🎉 ¡Reserva confirmada!',
          body: 'Tu solicitud ha sido aceptada. ¡Prepárate para el viaje!',
          link: '/usuario/mis-viajes'
        });

        await db.query("UPDATE reservas SET notificado = 1 WHERE id_usuario = ?", [row.id_usuario]);
      }
    }

    // 3. Notificar a conductores de viajes nuevos asignados
    const [asignados] = await db.query(`
      SELECT a.id, a.token_notificacion
      FROM unidades_viaje uv
      JOIN administradores a ON uv.id_conductor = a.id
      WHERE uv.notificado = 0
    `);

    for (const row of asignados) {
      if (row.token_notificacion) {
        await axios.post(`${process.env.FRONTEND_URL}/api/notify/conductor`, {
          token: row.token_notificacion,
          title: '🚌 Nuevo viaje asignado',
          body: 'Tienes un nuevo viaje programado. Revísalo.',
          link: '/conductor/viajes'
        });

        await db.query("UPDATE unidades_viaje SET notificado = 1 WHERE id_conductor = ?", [row.id]);
      }
    }

    console.log('✅ Notificaciones enviadas correctamente.');
  } catch (error) {
    console.error('❌ Error en el CRON de notificaciones:', error);
  }
});

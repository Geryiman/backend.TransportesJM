// cron/notifications.js
const cron = require('node-cron');
const db = require('../src/config/db');
const enviarNotificacion = require('../src/utils/enviarNotificacion');

// Ejecutar cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  console.log('🔔 Ejecutando CRON de notificaciones...');

  try {
    // 1. Notificar a administradores si hay reservas pendientes
    const [pendientes] = await db.promise().query(`
      SELECT COUNT(*) AS total FROM reservas WHERE estado = 'pendiente'
    `);

    if (pendientes[0].total > 0) {
      // Puedes notificar a todos los administradores generales
      const [admins] = await db.promise().query(`
        SELECT id, token_notificacion FROM administradores 
        WHERE rol = 'administrador_general' AND token_notificacion IS NOT NULL
      `);

      for (const admin of admins) {
        await enviarNotificacion(
          admin.token_notificacion,
          '🚨 Reservas pendientes',
          `Tienes ${pendientes[0].total} reservas sin revisar`,
          '/admin/notificaciones'
        );
      }
    }

    // 2. Notificar a usuarios con reservas confirmadas y aún no notificadas
    const [reservasConfirmadas] = await db.promise().query(`
      SELECT r.id, r.id_usuario, u.token_notificacion
      FROM reservas r
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.estado = 'confirmada' AND r.notificado = 0 AND u.token_notificacion IS NOT NULL
    `);

    for (const reserva of reservasConfirmadas) {
      await enviarNotificacion(
        reserva.token_notificacion,
        '🎉 Reserva confirmada',
        'Tu solicitud de viaje ha sido aceptada.',
        '/usuario/mis-viajes'
      );

      await db.promise().query(
        'UPDATE reservas SET notificado = 1 WHERE id = ?',
        [reserva.id]
      );
    }

    // 3. Notificar a conductores con viajes asignados y aún no notificados
    const [viajesAsignados] = await db.promise().query(`
      SELECT uv.id, a.id AS id_conductor, a.token_notificacion
      FROM unidades_viaje uv
      JOIN administradores a ON uv.id_conductor = a.id
      WHERE uv.notificado = 0 AND a.token_notificacion IS NOT NULL
    `);

    for (const viaje of viajesAsignados) {
      await enviarNotificacion(
        viaje.token_notificacion,
        '🚌 Nuevo viaje asignado',
        'Tienes un nuevo viaje pendiente. Revisa tu panel.',
        '/conductor/viajes'
      );

      await db.promise().query(
        'UPDATE unidades_viaje SET notificado = 1 WHERE id = ?',
        [viaje.id]
      );
    }

    console.log('✅ Notificaciones enviadas correctamente.');
  } catch (error) {
    console.error('❌ Error en el CRON de notificaciones:', error);
  }
});

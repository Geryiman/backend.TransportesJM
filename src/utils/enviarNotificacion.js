const admin = require('../config/firebaseAdmin'); // Asegúrate de tener firebaseAdmin.js correctamente

/**
 * Envía una notificación push a un dispositivo específico usando su token FCM.
 * @param {string} token - Token del dispositivo.
 * @param {string} title - Título de la notificación.
 * @param {string} body - Cuerpo del mensaje.
 * @param {string} link - Ruta a la que se debe redirigir al hacer clic (opcional, default "/").
 */
const enviarNotificacion = async (token, title, body, link = '/') => {
  const message = {
    token,
    notification: {
      title,
      body
    },
    data: {
      link // esto lo puedes capturar en frontend (ej: redirigir a la ruta deseada)
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notificación enviada:', response);
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
  }
};

module.exports = enviarNotificacion;

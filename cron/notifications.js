require('dotenv').config();
const mysql = require('mysql2');
const cron = require('node-cron');

// 🔹 Crear pool independiente solo para el cron
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

// 🔹 Probar conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Error conectando a la base de datos para el CRON:', err.message);
  } else {
    console.log('Conectado a la base de datos MySQL para CRON de notificaciones');
    connection.release();
  }
});

// 🔹 Tarea programada cada 5 minutos (ajusta si quieres)
cron.schedule('*/5 * * * *', () => {
  console.log('Ejecutando CRON de notificaciones...');

  try {
    pool.query(
      'SELECT * FROM notificaciones WHERE estado = "pendiente"',
      (err, results) => {
        if (err) {
          console.error(' Error en consulta de notificaciones:', err.message);
          return;
        }

        console.log(` Notificaciones pendientes: ${results.length}`);

        // Aquí procesas las notificaciones (enviar push, correo, etc.)
        results.forEach(notificacion => {
          console.log(`- Notificación ID ${notificacion.id} para ${notificacion.usuario}`);
        });
      }
    );
  } catch (error) {
    console.error('Error en el CRON de notificaciones:', error.message);
  }
});

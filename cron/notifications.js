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



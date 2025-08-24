const mysql = require('mysql2');

// Crear un pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '-06:00',
  waitForConnections: true,   // espera si todas las conexiones están ocupadas
  connectionLimit: 10,        // máximo de conexiones abiertas a la vez
  queueLimit: 0,              // 0 = sin límite de queries en cola
  connectTimeout: 10000       // 10 segundos de espera para conectar
});

// Probar la conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
  } else {
    console.log('✅ Pool de conexiones MySQL listo (hora CDMX)');
    connection.release(); // liberar conexión de prueba
  }
});

// Exportar el pool para usarlo en todo el proyecto
module.exports = pool;

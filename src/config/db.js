const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '-06:00'
});

connection.connect(err => {
  if (err) throw err;
  console.log('✅ Conectado a la base de datos MySQL (hora CDMX)');
});

module.exports = connection;

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuración de tu base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // ajusta tu contraseña si es diferente
  database: 'transportes',
};

async function insertarAdmin() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const nombre = 'German';
    const username = 'German';
    const password = '12';
    const rol = 'administrador_general';

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO administradores (nombre, username, password, rol)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [nombre, username, hashedPassword, rol]);

    console.log('Administrador insertado con éxito. ID:', result.insertId);
    await connection.end();
  } catch (error) {
    console.error('Error al insertar administrador:', error);
  }
}

insertarAdmin();

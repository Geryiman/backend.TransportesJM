const db = require('../config/db');

const User = {
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], callback);
  },

  findByPhone: (telefono, callback) => {
    db.query('SELECT * FROM usuarios WHERE telefono = ?', [telefono], callback);
  },

  create: (data, callback) => {
    const { nombre, apellidos, telefono, username, password, genero } = data;
    db.query(
      'INSERT INTO usuarios (nombre, apellidos, telefono, username, password, genero) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, telefono, username, password, genero],
      callback
    );
  }
};

module.exports = User;

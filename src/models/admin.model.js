const db = require('../config/db');

const Admin = {
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM administradores WHERE username = ?', [username], (err, results) => {
      callback(err, results);
    });
  },

  create: (data, callback) => {
    const { nombre, username, password, rol } = data;
    db.query(
      'INSERT INTO administradores (nombre, username, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, username, password, rol],
      callback
    );
  }
};

module.exports = Admin;

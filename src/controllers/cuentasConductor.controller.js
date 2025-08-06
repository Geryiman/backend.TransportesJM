const db = require('../config/db'); 

// Crear una cuenta del conductor para un viaje
const crearCuentaConductor = (req, res) => {
  const { id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros } = req.body;

  const sql = `
    INSERT INTO cuentas_conductor (id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros], (err, result) => {
    if (err) {
      console.error('Error al insertar cuenta de conductor:', err);
      return res.status(500).json({ error: 'Error al guardar los datos de la cuenta.' });
    }

    res.json({ mensaje: 'Cuenta guardada correctamente', id: result.insertId });
  });
};

// Obtener cuenta del conductor por ID de viaje
const obtenerCuentaConductor = (req, res) => {
  const { id_viaje } = req.params;

  const sql = `
    SELECT * FROM cuentas_conductor WHERE id_viaje = ?
  `;

  db.query(sql, [id_viaje], (err, results) => {
    if (err) {
      console.error('Error al obtener cuenta de conductor:', err);
      return res.status(500).json({ error: 'Error al obtener la cuenta del conductor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró ninguna cuenta para este viaje.' });
    }

    res.json(results[0]);
  });
};

module.exports = {
  crearCuentaConductor,
  obtenerCuentaConductor
};

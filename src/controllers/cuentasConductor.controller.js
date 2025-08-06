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
const obtenerCuentaPorViaje = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM cuentas_conductor
    WHERE id_viaje = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener cuenta:', err);
      return res.status(500).json({ mensaje: 'Error al obtener cuenta' });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'No hay cuenta registrada para este viaje' });
    }

    res.json(results[0]);
  });
};

// Guardar cuenta o actualizar si ya existe
const guardarCuenta = (req, res) => {
  const { id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros } = req.body;

  // Verificar si ya existe una cuenta para ese viaje
  const verificarSQL = `
    SELECT * FROM cuentas_conductor WHERE id_viaje = ?
  `;

  db.query(verificarSQL, [id_viaje], (err, results) => {
    if (err) {
      console.error('❌ Error al verificar cuenta:', err);
      return res.status(500).json({ mensaje: 'Error al verificar cuenta' });
    }

    if (results.length > 0) {
      // Ya existe, hacer UPDATE
      const updateSQL = `
        UPDATE cuentas_conductor
        SET gasolina = ?, casetas = ?, otros = ?, descripcion_otros = ?
        WHERE id_viaje = ?
      `;
      db.query(updateSQL, [gasolina, casetas, otros, descripcion_otros, id_viaje], (err2) => {
        if (err2) {
          console.error('❌ Error al actualizar cuenta:', err2);
          return res.status(500).json({ mensaje: 'Error al actualizar cuenta' });
        }

        res.json({ mensaje: 'Cuenta actualizada correctamente' });
      });

    } else {
      // No existe, hacer INSERT
      const insertSQL = `
        INSERT INTO cuentas_conductor
        (id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(insertSQL, [id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros], (err3) => {
        if (err3) {
          console.error('❌ Error al guardar cuenta:', err3);
          return res.status(500).json({ mensaje: 'Error al guardar cuenta' });
        }

        res.json({ mensaje: 'Cuenta registrada correctamente' });
      });
    }
  });
};

module.exports = {
  crearCuentaConductor,
  obtenerCuentaConductor,
    obtenerCuentaPorViaje,
  guardarCuenta,
};

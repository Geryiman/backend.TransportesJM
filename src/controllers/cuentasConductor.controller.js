const db = require('../config/db'); 

// Obtener datos de cuenta para un viaje
exports.obtenerCuentaViaje = (req, res) => {
  const { id_viaje } = req.params;

  const sql = `
    SELECT *
    FROM cuentas_viaje
    WHERE id_viaje = ?
    LIMIT 1
  `;

  db.query(sql, [id_viaje], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener cuenta:', err);
      return res.status(500).json({ message: 'Error interno' });
    }

    if (results.length === 0) {
      return res.json(null); // No hay cuenta aún
    }

    res.json(results[0]);
  });
};

// Guardar o actualizar cuenta de viaje
exports.guardarCuentaViaje = (req, res) => {
  const {
    id_viaje,
    gasolina = 0,
    casetas = 0,
    otros = 0,
    descripcion_otros = '',
    total_efectivo = 0,
    total_transferencia = 0,
  } = req.body;

  const total_gastos = gasolina + casetas + otros;
  const total_generado = total_efectivo + total_transferencia;
  const total_pendiente_entregar = total_generado - total_gastos;

  // Revisar si ya existe cuenta
  const sqlVerificar = 'SELECT id FROM cuentas_viaje WHERE id_viaje = ? LIMIT 1';

  db.query(sqlVerificar, [id_viaje], (err, result) => {
    if (err) {
      console.error('❌ Error al verificar cuenta:', err);
      return res.status(500).json({ message: 'Error interno' });
    }

    if (result.length > 0) {
      // Actualizar
      const sqlUpdate = `
        UPDATE cuentas_viaje SET
          gasolina = ?, casetas = ?, otros = ?, descripcion_otros = ?,
          total_efectivo = ?, total_transferencia = ?, total_gastos = ?,
          total_generado = ?, total_pendiente_entregar = ?
        WHERE id_viaje = ?
      `;

      const valores = [gasolina, casetas, otros, descripcion_otros, total_efectivo, total_transferencia, total_gastos, total_generado, total_pendiente_entregar, id_viaje];

      db.query(sqlUpdate, valores, err => {
        if (err) {
          console.error('❌ Error al actualizar cuenta:', err);
          return res.status(500).json({ message: 'Error al actualizar cuenta' });
        }

        res.json({ message: '✅ Cuenta actualizada correctamente' });
      });

    } else {
      // Insertar nueva
      const sqlInsert = `
        INSERT INTO cuentas_viaje (
          id_viaje, gasolina, casetas, otros, descripcion_otros,
          total_efectivo, total_transferencia, total_gastos, total_generado, total_pendiente_entregar
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const valores = [id_viaje, gasolina, casetas, otros, descripcion_otros, total_efectivo, total_transferencia, total_gastos, total_generado, total_pendiente_entregar];

      db.query(sqlInsert, valores, err => {
        if (err) {
          console.error('❌ Error al guardar cuenta:', err);
          return res.status(500).json({ message: 'Error al guardar cuenta' });
        }

        res.json({ message: '✅ Cuenta guardada correctamente' });
      });
    }
  });
};

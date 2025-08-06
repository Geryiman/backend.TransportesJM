const db = require('../config/db');
const dbAsync = require('../config/db').promise(); // Solo para funciones async/await

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

  const sql = `SELECT * FROM cuentas_conductor WHERE id_viaje = ?`;

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

// Obtener o crear automáticamente una cuenta si no existe
const obtenerCuentaPorViaje = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si ya existe cuenta
    const [cuentaExistente] = await dbAsync.query('SELECT * FROM cuentas_conductor WHERE id_viaje = ?', [id]);

    if (cuentaExistente.length > 0) {
      return res.json(cuentaExistente[0]);
    }

    // Obtener pasajeros confirmados
    const [resPasajeros] = await dbAsync.query(`
      SELECT COUNT(*) AS total
      FROM reservas
      WHERE estado = 'confirmada'
        AND id_unidad_viaje IN (
          SELECT id FROM unidades_viaje WHERE id_viaje = ?
        )
    `, [id]);

    const total_pasajeros = resPasajeros[0].total;

    if (total_pasajeros === 0) {
      return res.status(404).json({ mensaje: 'No hay pasajeros confirmados para este viaje' });
    }

    // Obtener precio
    const [resPrecio] = await dbAsync.query('SELECT precio FROM viajes WHERE id = ?', [id]);

    if (resPrecio.length === 0) {
      return res.status(404).json({ mensaje: 'Viaje no encontrado' });
    }

    const precio = parseFloat(resPrecio[0].precio);
    const ganancia_total = total_pasajeros * precio;

    // Insertar nueva cuenta automáticamente
    const nuevaCuenta = {
      id_viaje: id,
      total_pasajeros,
      total_efectivo: ganancia_total,
      total_transferencia: 0,
      total_pendiente_entregar: 0,
      total_gastos: 0,
      total_generado: ganancia_total
    };

    await dbAsync.query(`
      INSERT INTO cuentas_conductor 
      (id_viaje, total_pasajeros, total_efectivo, total_transferencia, total_pendiente_entregar, total_gastos, total_generado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      nuevaCuenta.id_viaje,
      nuevaCuenta.total_pasajeros,
      nuevaCuenta.total_efectivo,
      nuevaCuenta.total_transferencia,
      nuevaCuenta.total_pendiente_entregar,
      nuevaCuenta.total_gastos,
      nuevaCuenta.total_generado
    ]);

    return res.status(201).json(nuevaCuenta);

  } catch (error) {
    console.error('❌ Error al obtener o crear cuenta del viaje:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Guardar o actualizar gastos del viaje
const guardarCuenta = (req, res) => {
  const { id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros } = req.body;

  const verificarSQL = `SELECT * FROM cuentas_conductor WHERE id_viaje = ?`;

  db.query(verificarSQL, [id_viaje], (err, results) => {
    if (err) {
      console.error('❌ Error al verificar cuenta:', err);
      return res.status(500).json({ mensaje: 'Error al verificar cuenta' });
    }

    if (results.length > 0) {
      // Actualizar si ya existe
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
      // Insertar si no existe
      const insertSQL = `
        INSERT INTO cuentas_conductor
        (id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(insertSQL, [id_viaje, id_conductor, gasolina, casetas, otros, descripcion_otros], (err3) => {
        if (err3) {
          console.error(' Error al guardar cuenta:', err3);
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

const db = require('../config/db');

// 🔍 Obtener cuenta del viaje (si ya existe)
exports.obtenerCuentaPorViaje = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM cuentas_viaje
    WHERE id_viaje = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al consultar cuenta:', err);
      return res.status(500).json({ message: 'Error interno' });
    }

    if (results.length === 0) {
      return res.json({ cuenta: null });
    }

    return res.json({ cuenta: results[0] });
  });
};

// 📥 Crear cuenta del viaje si no existe
exports.crearCuentaViaje = (req, res) => {
  const { id_viaje, total_efectivo, total_transferencia } = req.body;

  const sql = `
    INSERT INTO cuentas_viaje (id_viaje, total_efectivo, total_transferencia, total_generado)
    VALUES (?, ?, ?, ?)
  `;

  const total_generado = parseFloat(total_efectivo) + parseFloat(total_transferencia);

  db.query(sql, [id_viaje, total_efectivo, total_transferencia, total_generado], (err, result) => {
    if (err) {
      console.error('❌ Error al crear cuenta:', err);
      return res.status(500).json({ message: 'Error al crear cuenta' });
    }

    return res.json({ message: '✅ Cuenta creada correctamente', id: result.insertId });
  });
};

// ✏️ Actualizar gastos de la cuenta
exports.actualizarGastosCuenta = (req, res) => {
  const { id } = req.params;
  const { gasolina, casetas, otros, descripcion_otros } = req.body;

  const gastos = [gasolina, casetas, otros].map(x => parseFloat(x) || 0);
  const total_gastos = gastos.reduce((a, b) => a + b, 0);

  const sql = `
    UPDATE cuentas_viaje
    SET gasolina = ?, casetas = ?, otros = ?, descripcion_otros = ?, total_gastos = ?, total_pendiente_entregar = (total_generado - ?)
    WHERE id = ?
  `;

  db.query(sql, [...gastos, descripcion_otros, total_gastos, total_gastos, id], (err) => {
    if (err) {
      console.error('❌ Error al actualizar cuenta:', err);
      return res.status(500).json({ message: 'Error al actualizar cuenta' });
    }

    return res.json({ message: '✅ Cuenta actualizada correctamente' });
  });
};

// 💰 Obtener precio del asiento del viaje
exports.obtenerPrecioViaje = (req, res) => {
  const { id } = req.params;

  const sql = `SELECT precio FROM viajes WHERE id = ? LIMIT 1`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener precio:', err);
      return res.status(500).json({ message: 'Error al obtener precio' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Viaje no encontrado' });
    }

    return res.json({ precio: result[0].precio });
  });
};


const db = require('../config/db');
// Obtener resumen del viaje
exports.obtenerResumen = (req, res) => {
  const { id_viaje } = req.params;

  const sql = `
    SELECT
      COUNT(*) AS totalPasajeros,
      SUM(CASE WHEN metodo_pago = 'efectivo' THEN monto_efectivo ELSE 0 END) AS totalEfectivo,
      SUM(CASE WHEN metodo_pago = 'transferencia' THEN monto_transferencia ELSE 0 END) AS totalTransferencia,
      SUM(monto_efectivo + monto_transferencia) AS totalGenerado
    FROM reservas
    WHERE id_unidad_viaje IN (
      SELECT id FROM unidades_viaje WHERE id_viaje = ?
    ) AND estado = 'confirmada'
  `;

  db.query(sql, [id_viaje], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener resumen:', err);
      return res.status(500).json({ message: 'Error al obtener resumen' });
    }

    const resumen = result[0];
    const sqlGastos = `SELECT * FROM cuentas_viaje WHERE id_viaje = ? LIMIT 1`;

    db.query(sqlGastos, [id_viaje], (err2, result2) => {
      if (err2) {
        console.error('❌ Error al obtener gastos:', err2);
        return res.status(500).json({ message: 'Error al obtener gastos' });
      }

      const gastos = result2[0] || { gasolina: 0, casetas: 0, otros: 0 };
      const totalGastos = gastos.gasolina + gastos.casetas + gastos.otros;
      const pendienteEntregar = resumen.totalEfectivo - totalGastos;

      res.json({
        totalPasajeros: resumen.totalPasajeros,
        totalEfectivo: resumen.totalEfectivo,
        totalTransferencia: resumen.totalTransferencia,
        totalGenerado: resumen.totalGenerado,
        totalGastos,
        pendienteEntregar,
      });
    });
  });
};

// Guardar cuenta del viaje
exports.guardarCuenta = (req, res) => {
  const { id_viaje } = req.params;
  const { gasolina, casetas, otros, descripcion_otros } = req.body;

  const sql = `
    INSERT INTO cuentas_viaje (id_viaje, gasolina, casetas, otros, descripcion_otros)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    gasolina = VALUES(gasolina),
    casetas = VALUES(casetas),
    otros = VALUES(otros),
    descripcion_otros = VALUES(descripcion_otros)
  `;

  db.query(sql, [id_viaje, gasolina, casetas, otros, descripcion_otros], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar cuenta del viaje:', err);
      return res.status(500).json({ message: 'Error al guardar cuenta' });
    }

    res.json({ message: '✅ Cuenta del viaje guardada correctamente' });
  });
};

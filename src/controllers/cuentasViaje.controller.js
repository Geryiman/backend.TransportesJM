const db = require('../config/db');
// Obtener resumen del viaje
exports.getResumenCuentaViaje = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      COUNT(r.id) AS totalPasajeros,
      SUM(CASE WHEN r.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) AS totalEfectivoPasajeros,
      SUM(CASE WHEN r.metodo_pago = 'transferencia' THEN 1 ELSE 0 END) AS totalTransferenciaPasajeros,
      v.precio * SUM(CASE WHEN r.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) AS totalGenerado,
      (cv.gasolina + cv.casetas + cv.otros) AS totalGastos,
      (v.precio * SUM(CASE WHEN r.metodo_pago = 'efectivo' THEN 1 ELSE 0 END)) -
      (cv.gasolina + cv.casetas + cv.otros) AS pendienteEntregar
    FROM reservas r
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    JOIN cuentas_viaje cv ON cv.id_viaje = v.id AND cv.id_conductor = uv.id_conductor
    WHERE v.id = ? AND r.estado = 'confirmada';
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener resumen:', err);
      return res.status(500).json({ message: 'Error al obtener resumen' });
    }
    res.json(result[0]);
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

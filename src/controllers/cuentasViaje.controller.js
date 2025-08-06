const db = require('../config/db');

exports.obtenerResumenCuenta = (req, res) => {
  const { id_viaje } = req.params;

  const sql = `
    SELECT r.metodo_pago, COUNT(*) AS total_reservas, v.precio
    FROM reservas r
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    WHERE uv.id_viaje = ? AND r.estado = 'confirmada' AND r.metodo_pago = 'efectivo'
    GROUP BY r.metodo_pago, v.precio
  `;

  const sqlGastos = `SELECT * FROM cuentas_viaje WHERE id_viaje = ? LIMIT 1`;

  db.query(sql, [id_viaje], (err, reservas) => {
    if (err) {
      console.error('❌ Error al obtener reservas:', err);
      return res.status(500).json({ message: 'Error al obtener reservas' });
    }

    db.query(sqlGastos, [id_viaje], (err2, cuentas) => {
      if (err2) {
        console.error('❌ Error al obtener cuenta del viaje:', err2);
        return res.status(500).json({ message: 'Error al obtener cuenta del viaje' });
      }

      const totalPasajeros = reservas.length > 0 ? reservas[0].total_reservas : 0;
      const precioPorPasajero = reservas.length > 0 ? reservas[0].precio : 0;

      const totalEfectivo = totalPasajeros * precioPorPasajero;
      const totalTransferencia = 0; // NO se cuentan transferencias
      const totalGenerado = totalEfectivo;
      const totalGastos = cuentas.length > 0 ? (cuentas[0].gasolina + cuentas[0].casetas + cuentas[0].otros) : 0;
      const pendienteEntregar = totalGenerado - totalGastos;

      res.json({
        totalPasajeros,
        totalEfectivo,
        totalTransferencia,
        totalGenerado,
        totalGastos,
        pendienteEntregar
      });
    });
  });
};

const db = require('../config/db'); 

// ✅ Confirmar una sola reserva por ID
exports.confirmarReserva = (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE reservas SET estado = 'confirmada' WHERE id = ? AND estado = 'pendiente'";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al confirmar reserva:', err);
      return res.status(500).json({ message: 'Error al confirmar reserva' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada o ya actualizada' });
    }

    res.json({ message: '✅ Reserva confirmada correctamente' });
  });
};

// ✅ Rechazar una sola reserva por ID
exports.rechazarReserva = (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE reservas SET estado = 'rechazada' WHERE id = ? AND estado = 'pendiente'";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al rechazar reserva:', err);
      return res.status(500).json({ message: 'Error al rechazar reserva' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada o ya actualizada' });
    }

    res.json({ message: '❌ Reserva rechazada correctamente' });
  });
};

// ✅ Rechazar múltiples reservas por array de IDs
exports.rechazarMultiplesReservas = (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de IDs de reservas' });
  }

  const sql = `UPDATE reservas SET estado = 'rechazada' WHERE estado = 'pendiente' AND id IN (?)`;
  db.query(sql, [ids], (err, result) => {
    if (err) {
      console.error('❌ Error al rechazar múltiples reservas:', err);
      return res.status(500).json({ message: 'Error al rechazar reservas' });
    }

    res.json({
      message: `❌ ${result.affectedRows} reserva(s) rechazada(s) correctamente`,
    });
  });
};

// ✅ Confirmar todas las reservas de un pasajero en un viaje
exports.confirmarMultiplesReservas = (req, res) => {
  const { id_viaje, nombre_pasajero } = req.body;

  if (!id_viaje || !nombre_pasajero) {
    return res.status(400).json({ message: 'Faltan datos: id_viaje y nombre_pasajero' });
  }
  const sql = `
    UPDATE reservas r
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    SET r.estado = 'confirmada'
    WHERE uv.id_viaje = ? AND r.nombre_viajero = ? AND r.estado = 'pendiente'
  `;

  db.query(sql, [id_viaje, nombre_pasajero], (err, result) => {
    if (err) {
      console.error('❌ Error SQL:', err);
      return res.status(500).json({ error: 'Error al confirmar reservas' });
    }
    res.json({
      message: '✅ Reservas confirmadas correctamente',
      confirmadas: result.affectedRows,
    });
  });
};

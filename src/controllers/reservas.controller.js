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

  const sqlVerificar = "SELECT estado FROM reservas WHERE id = ?";
  db.query(sqlVerificar, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al verificar reserva:', err);
      return res.status(500).json({ message: 'Error interno' });
    }

    if (result.length === 0 || result[0].estado !== 'pendiente') {
      return res.status(404).json({ message: 'Reserva no encontrada o ya rechazada' });
    }

    // Eliminar la reserva directamente
    const eliminar = "DELETE FROM reservas WHERE id = ?";
    db.query(eliminar, [id], (err2) => {
      if (err2) {
        console.error('❌ Error al eliminar reserva:', err2);
        return res.status(500).json({ message: 'Error al eliminar reserva' });
      }

      res.json({ message: '✅ Reserva rechazada y asiento liberado correctamente' });
    });
  });
};


// ✅ Rechazar (eliminar) múltiples reservas por array de IDs
exports.rechazarMultiplesReservas = (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de IDs de reservas' });
  }

  const sql = `
    DELETE FROM reservas
    WHERE estado = 'pendiente' AND id IN (?)
  `;

  db.query(sql, [ids], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar reservas:', err);
      return res.status(500).json({ message: 'Error al rechazar reservas' });
    }

    res.json({
      message: `✅ ${result.affectedRows} reserva(s) rechazadas y eliminadas correctamente`
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

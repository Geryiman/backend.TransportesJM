const db = require('../config/db'); 

// 🚍 Obtener todos los viajes asignados a un conductor
exports.obtenerViajesAsignados = (req, res) => {
  const { id } = req.params;

 const sql = `
  SELECT 
    v.id AS id_viaje,
    v.origen,
    v.destino,
    v.fecha,
    v.hora,
    v.precio,
    v.estado,
    uv.id AS id_unidad_viaje,
    pu.nombre AS nombre_plantilla
  FROM viajes v
  JOIN unidades_viaje uv ON v.id = uv.id_viaje
  JOIN plantillas_unidad pu ON uv.id_plantilla = pu.id
  WHERE uv.id_conductor = ?
  ORDER BY v.fecha ASC, v.hora ASC
`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener viajes del conductor:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(results);
  });
};

// 👥 Obtener asientos ocupados y pasajeros
exports.obtenerAsientosDelViaje = (req, res) => {
  const { id_unidad } = req.params;

  const sql = `
    SELECT 
      r.asiento,
      r.nombre_viajero,
      r.telefono_viajero,
      r.metodo_pago,
      r.estado
    FROM reservas r
    WHERE r.id_unidad_viaje = ?
    ORDER BY r.asiento ASC
  `;

  db.query(sql, [id_unidad], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener asientos:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(results);
  });
};

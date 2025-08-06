const db = require('../config/db'); 

// Obtener todos los viajes asignados a un conductor
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
      console.error(' Error al obtener viajes del conductor:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(results);
  });
};

// Obtener asientos ocupados y pasajeros
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
      console.error('Error al obtener asientos:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(results);
  });
};

// Obtener detalle completo de un viaje del conductor
exports.detalleViajeConductor = (req, res) => {
  const { id } = req.params; // id_viaje

  // Primero obtener info general del viaje + plantilla usada
  const viajeSql = `
    SELECT 
      v.id AS id_viaje,
      v.origen,
      v.destino,
      v.fecha,
      v.hora,
      pu.nombre AS nombre_plantilla,
      uv.id AS id_unidad_viaje
    FROM viajes v
    JOIN unidades_viaje uv ON v.id = uv.id_viaje
    JOIN plantillas_unidad pu ON uv.id_plantilla = pu.id
    WHERE v.id = ?
    LIMIT 1
  `;

  db.query(viajeSql, [id], (err, viajeResult) => {
    if (err || viajeResult.length === 0) {
      console.error(' Error al obtener viaje:', err);
      return res.status(500).json({ error: 'Error al obtener el viaje' });
    }

    const viaje = viajeResult[0];

    // Obtener estructura visual de la plantilla
    const estructuraSql = `
      SELECT fila, col, tipo, numero
      FROM estructura_asientos
      WHERE plantilla_id = (
        SELECT uv.id_plantilla
        FROM unidades_viaje uv
        WHERE uv.id_viaje = ?
        LIMIT 1
      )
    `;

    db.query(estructuraSql, [id], (err, estructura) => {
      if (err) {
        console.error('Error al obtener estructura:', err);
        return res.status(500).json({ error: 'Error al obtener estructura de asientos' });
      }

      // Obtener reservas de ese viaje
      const reservasSql = `
        SELECT 
          r.asiento,
          r.nombre_viajero,
          r.metodo_pago,
          r.estado,
          r.id_usuario
        FROM reservas r
        WHERE r.id_unidad_viaje = ?
          AND r.estado = 'confirmada'
      `;

      db.query(reservasSql, [viaje.id_unidad_viaje], (err, reservasRaw) => {
        if (err) {
          console.error('Error al obtener reservas:', err);
          return res.status(500).json({ error: 'Error al obtener reservas' });
        }

        // Generar un "grupo" visual por usuario
        const colores = {};
        let grupoId = 1;
        const reservas = reservasRaw.map(r => {
          if (!colores[r.id_usuario]) {
            colores[r.id_usuario] = grupoId++;
          }
          return {
            asiento: r.asiento,
            nombre_viajero: r.nombre_viajero,
            metodo_pago: r.metodo_pago,
            estado: r.estado,
            grupo: colores[r.id_usuario]
          };
        });

        return res.json({
          viaje,
          estructura,
          reservas
        });
      });
    });
  });
};

exports.actualizarMetodoPago = (req, res) => {
  const { ids, metodo_pago, monto_efectivo = 0, monto_transferencia = 0 } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs inválida' });
  }

  if (!['efectivo', 'transferencia', 'mixto'].includes(metodo_pago)) {
    return res.status(400).json({ message: 'Método de pago inválido' });
  }

  if (metodo_pago === 'mixto' && (monto_efectivo + monto_transferencia <= 0)) {
    return res.status(400).json({ message: 'Debes especificar los montos si es mixto' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `
    UPDATE reservas 
    SET metodo_pago = ?, pago_confirmado = 1,
        monto_efectivo = ?, monto_transferencia = ?
    WHERE id IN (${placeholders})
  `;

  db.query(sql, [metodo_pago, monto_efectivo, monto_transferencia, ...ids], (err, result) => {
    if (err) {
      console.error('Error al actualizar método de pago:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    return res.json({ message: 'Método de pago actualizado', result });
  });
};


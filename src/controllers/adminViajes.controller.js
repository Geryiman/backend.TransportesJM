const db = require('../config/db');

// Obtener todos los viajes (con filtro por estado opcional)
exports.obtenerTodosLosViajes = (req, res) => {
  const { estado } = req.query;

  let sql = `
    SELECT 
      v.id, v.origen, v.destino, v.fecha, v.hora, v.precio, v.estado,
      (
        SELECT a.nombre
        FROM unidades_viaje uv
        JOIN administradores a ON uv.id_conductor = a.id
        WHERE uv.id_viaje = v.id
        LIMIT 1
      ) AS nombre_conductor,
      (
        SELECT COUNT(*) 
        FROM unidades_viaje uv 
        WHERE uv.id_viaje = v.id
      ) AS total_unidades
    FROM viajes v
    WHERE 1 = 1
  `;

  const values = [];

  // Aplica el filtro por estado solo si viene en la query y no es "todos"
  if (estado && estado !== 'todos') {
    sql += ` AND v.estado = ?`;
    values.push(estado);
  }

  // Ordenar: primero los más próximos
  sql += `
    ORDER BY 
      CASE 
        WHEN CONCAT(v.fecha, ' ', v.hora) >= NOW() THEN 0 
        ELSE 1 
      END,
      v.fecha ASC, v.hora ASC
  `;

  db.query(sql, values, (err, resultados) => {
    if (err) {
      console.error('❌ Error al obtener viajes:', err);
      return res.status(500).json({ error: 'Error al obtener viajes' });
    }
    res.json(resultados);
  });
};

// Obtener detalle de un viaje con todas sus unidades y reservas confirmadas
exports.obtenerDetalleViaje = (req, res) => {
  const idViaje = req.params.id;

  const sql = `
    SELECT 
      r.id AS id_reserva,
      r.asiento,
      r.nombre_viajero,
      r.telefono_viajero,
      r.sube_en_terminal,
      pe.nombre AS parada_extra,
      r.estado,
      r.id_unidad_viaje,
      u.nombre, u.apellidos,
      v.precio,
      uv.numero_unidad,
      pu.nombre AS plantilla_nombre
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    JOIN plantillas_unidad pu ON uv.id_plantilla = pu.id
    LEFT JOIN plantillas_parada pe ON r.id_parada_extra = pe.id
    WHERE uv.id_viaje = ? AND r.estado = 'confirmada'
    ORDER BY uv.numero_unidad, r.asiento
  `;

  db.query(sql, [idViaje], (err, resultados) => {
    if (err) {
      console.error('❌ Error al obtener detalles del viaje:', err);
      return res.status(500).json({ error: 'Error al obtener detalles del viaje' });
    }

    const unidades = {};
    resultados.forEach(r => {
      const key = r.numero_unidad;
      if (!unidades[key]) {
        unidades[key] = {
          numero_unidad: r.numero_unidad,
          plantilla: r.plantilla_nombre,
          asientos_confirmados: [],
        };
      }

      unidades[key].asientos_confirmados.push({
        id_reserva: r.id_reserva,
        asiento: r.asiento,
        nombre_viajero: r.nombre_viajero,
        telefono: r.telefono_viajero,
        sube_en_terminal: r.sube_en_terminal,
        parada_extra: r.parada_extra,
        usuario: `${r.nombre} ${r.apellidos}`,
        total: Number(r.precio),
      });
    });

    res.json(Object.values(unidades));
  });
};

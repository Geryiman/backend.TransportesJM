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

exports.obtenerTodosLosViajes = (req, res) => {
  const { estado } = req.query;

  let sql = `
    SELECT 
      v.id AS id_viaje,
      v.origen, v.destino, v.fecha, v.hora, v.precio, v.estado,
      uv.id AS id_unidad_viaje,
      uv.numero_unidad,
      a.nombre AS nombre_conductor
    FROM viajes v
    LEFT JOIN unidades_viaje uv ON uv.id_viaje = v.id
    LEFT JOIN administradores a ON uv.id_conductor = a.id
    WHERE 1 = 1
  `;

  const values = [];

  if (estado && estado !== 'todos') {
    sql += ` AND v.estado = ?`;
    values.push(estado);
  }

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

    // Agrupar viajes por ID
    const viajesMap = new Map();

    resultados.forEach(row => {
      const id = row.id_viaje;

      if (!viajesMap.has(id)) {
        viajesMap.set(id, {
          id: row.id_viaje,
          origen: row.origen,
          destino: row.destino,
          fecha: row.fecha,
          hora: row.hora,
          precio: row.precio,
          estado: row.estado,
          unidades: []
        });
      }

      if (row.id_unidad_viaje) {
        viajesMap.get(id).unidades.push({
          id_unidad_viaje: row.id_unidad_viaje,
          numero_unidad: row.numero_unidad,
          nombre_conductor: row.nombre_conductor
        });
      }
    });

    res.json(Array.from(viajesMap.values()));
  });
};

const db = require('../config/db');

// 🔄 Obtener todas las plantillas de unidad
exports.getPlantillasUnidad = (req, res) => {
  db.query('SELECT * FROM plantillas_unidad', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener plantillas de unidad' });
    res.json(results);
  });
};

// 🔄 Obtener todas las plantillas de paradas
exports.getPlantillasParada = (req, res) => {
  db.query('SELECT * FROM plantillas_parada', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener plantillas de parada' });
    res.json(results);
  });
};

exports.crearPlantillaUnidad = (req, res) => {
  const { nombre, tipo, total_asientos, estructura_asientos } = req.body;

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: 'Error al iniciar la transacción' });

    const insertPlantilla = 'INSERT INTO plantillas_unidad (nombre, tipo, total_asientos) VALUES (?, ?, ?)';
    db.query(insertPlantilla, [nombre, tipo, total_asientos], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Error al insertar la plantilla' });
        });
      }

      const plantillaId = result.insertId;
      const insertAsientos = estructura_asientos.map(a => [
        plantillaId, a.fila, a.col, a.tipo, a.numero || null
      ]);

      const insertDetalles = `
        INSERT INTO estructura_asientos (plantilla_id, fila, col, tipo, numero)
        VALUES ?
      `;

      db.query(insertDetalles, [insertAsientos], (err2) => {
        if (err2) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Error al insertar los asientos' });
          });
        }

        db.commit(errCommit => {
          if (errCommit) {
            return db.rollback(() => {
              res.status(500).json({ message: 'Error al confirmar la transacción' });
            });
          }

          res.json({ message: 'Plantilla guardada correctamente', plantillaId });
        });
      });
    });
  });
};


// 🆕 Crear una nueva plantilla de parada adicional
exports.crearPlantillaParada = (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la parada es obligatorio' });
  }

  const sql = 'INSERT INTO plantillas_parada (nombre, descripcion) VALUES (?, ?)';
  db.query(sql, [nombre, descripcion || null], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear plantilla de parada' });
    res.json({ message: 'Plantilla de parada creada correctamente', id: result.insertId });
  });
};

// Crear un nuevo viaje
exports.crearViaje = (req, res) => {
  const {
    origen,
    destino,
    fecha,
    hora,
    precio,
    unidades, // array de { id_plantilla, id_conductor }
    id_parada_subida,
    id_parada_bajada
  } = req.body;

  if (!origen || !destino || !fecha || !hora || !precio || !Array.isArray(unidades) || unidades.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o unidades no válidas' });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: 'Error al iniciar transacción' });
      }

      const sqlViaje = `
        INSERT INTO viajes (origen, destino, fecha, hora, precio, id_parada_subida, id_parada_bajada)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const valuesViaje = [origen, destino, fecha, hora, precio, id_parada_subida || null, id_parada_bajada || null];

      connection.query(sqlViaje, valuesViaje, (err, result) => {
        if (err) {
          console.error('❌ Error al crear viaje:', err);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: 'Error al crear el viaje' });
          });
        }

        const id_viaje = result.insertId;

        const sqlUnidades = `
          INSERT INTO unidades_viaje (id_viaje, id_plantilla, id_conductor, numero_unidad)
          VALUES ?
        `;

        const valuesUnidades = unidades.map((u, i) => [
          id_viaje,
          u.id_plantilla,
          u.id_conductor,
          i + 1
        ]);

        connection.query(sqlUnidades, [valuesUnidades], (err2) => {
          if (err2) {
            console.error('❌ Error al guardar unidades:', err2);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: 'Error al guardar unidades del viaje' });
            });
          }

          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: 'Error al confirmar la transacción' });
              });
            }

            connection.release();
            res.json({
              message: '✅ Viaje y unidades creados correctamente',
              id_viaje
            });
          });
        });
      });
    });
  });
};


// Obtener todas las plantillas con su ID y nombre
exports.listarPlantillasUnidad = (req, res) => {
  const sql = 'SELECT id, nombre, tipo, total_asientos,descripcion FROM plantillas_unidad';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al listar plantillas:', err);
      return res.status(500).json({ error: 'Error al obtener las plantillas' });
    }
    res.json(results);
  });
};

// Eliminar una plantilla y su estructura asociada
exports.eliminarPlantillaUnidad = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM plantillas_unidad WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar la plantilla' });
    res.json({ message: 'Plantilla eliminada correctamente' });
  });
};
// Actualizar el nombre de una plantilla
exports.actualizarNombrePlantilla = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  const sql = 'UPDATE plantillas_unidad SET nombre = ? WHERE id = ?';
  db.query(sql, [nombre, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar el nombre' });
    res.json({ message: 'Nombre actualizado correctamente' });
  });
};

// Obtener la estructura de asientos de una plantilla
exports.getEstructuraPlantilla = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT fila, col, tipo, numero FROM estructura_asientos WHERE plantilla_id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener estructura:', err);
      return res.status(500).json({ error: 'Error al obtener la estructura de la plantilla' });
    }
    res.json(results);
  });
};


///viajes

// Listar todos los viajes
exports.listarViajes = (req, res) => {
  const sql = `
    SELECT v.id, v.origen, v.destino, v.fecha, v.hora, v.precio, v.estado,
           p.nombre AS nombre_parada,
           COUNT(u.id) AS unidades_asignadas
    FROM viajes v
    LEFT JOIN plantillas_parada p ON v.id_parada_extra = p.id
    LEFT JOIN unidades_viaje u ON u.id_viaje = v.id
    GROUP BY v.id
    ORDER BY v.fecha DESC, v.hora ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los viajes' });
    res.json(results);
  });
};

// Obtener detalles de un viaje específico
exports.getUnidadesPorViaje = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT uv.id, uv.numero_unidad, pu.nombre AS plantilla_nombre
    FROM unidades_viaje uv
    INNER JOIN plantillas_unidad pu ON uv.id_plantilla = pu.id
    WHERE uv.id_viaje = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener unidades del viaje' });
    res.json(results);
  });
};

// Actualizar el estado de un viaje
exports.actualizarEstadoViaje = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['disponible', 'finalizado', 'cancelado'];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const sql = 'UPDATE viajes SET estado = ? WHERE id = ?';
  db.query(sql, [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar estado del viaje' });
    res.json({ message: `Estado del viaje actualizado a "${estado}"` });
  });
};

// Eliminar un viaje
exports.eliminarViaje = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM viajes WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar el viaje' });
    res.json({ message: 'Viaje eliminado correctamente' });
  });
};

// Editar un viaje
  exports.editarViaje = (req, res) => {
  const { id } = req.params;
  const { origen, destino, fecha, hora, precio, id_parada_extra } = req.body;

  if (!origen || !destino || !fecha || !hora || !precio) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const sql = `
    UPDATE viajes
    SET origen = ?, destino = ?, fecha = ?, hora = ?, precio = ?, id_parada_extra = ?
    WHERE id = ?`;

  db.query(sql, [origen, destino, fecha, hora, precio, id_parada_extra || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al editar el viaje' });
    res.json({ message: 'Viaje actualizado correctamente' });
  });
};

// Obtener viajes de un conductor específico
exports.getViajesDelConductor = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT v.id, v.origen, v.destino, v.fecha, v.hora, v.estado, v.precio,
           COUNT(r.id) AS asientos_ocupados
    FROM viajes v
    LEFT JOIN unidades_viaje uv ON uv.id_viaje = v.id
    LEFT JOIN reservas r ON r.id_unidad_viaje = uv.id
    WHERE v.id_conductor = ?
    GROUP BY v.id
    ORDER BY v.fecha DESC, v.hora DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener viajes del conductor' });
    res.json(results);
  });
};

// Obtener estadísticas de los conductores
exports.getEstadisticasConductores = (req, res) => {
  const sql = `
    SELECT a.id AS id_conductor, a.nombre, COUNT(DISTINCT v.id) AS total_viajes,
           COUNT(r.id) AS asientos_ocupados,
           COALESCE(SUM(v.precio), 0) AS total_generado
    FROM administradores a
    LEFT JOIN viajes v ON v.id_conductor = a.id
    LEFT JOIN unidades_viaje uv ON uv.id_viaje = v.id
    LEFT JOIN reservas r ON r.id_unidad_viaje = uv.id
    WHERE a.rol = 'conductor'
    GROUP BY a.id
    ORDER BY total_viajes DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener estadísticas' });
    res.json(results);
  });
};

// Obtener todos los conductores activos
exports.getConductores = (req, res) => {
  db.query("SELECT id, nombre FROM administradores WHERE rol = 'conductor' AND estado = 'activo'", (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener conductores' });
    res.json(results);
  });
};

//Obtener los viajes disponibles
exports.getViajesDisponibles = (req, res) => {
  const sql = `
    SELECT v.id AS id_viaje, v.origen, v.destino, v.fecha, v.hora, v.precio,
           v.estado, v.id_parada_subida, v.id_parada_bajada, v.id_conductor,
           uv.id AS id_unidad, uv.numero_unidad, pu.nombre AS plantilla_nombre
    FROM viajes v
    INNER JOIN unidades_viaje uv ON uv.id_viaje = v.id
    INNER JOIN plantillas_unidad pu ON pu.id = uv.id_plantilla
    WHERE v.estado = 'disponible'
    ORDER BY v.fecha ASC, v.hora ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener viajes disponibles' });
    res.json(results);
  });
};


// Obtener la estructura de asientos y los asientos ocupados de un viaje específico
exports.getAsientosPorViaje = (req, res) => {
  const { id } = req.params;

  const sqlUnidades = `
    SELECT uv.id AS id_unidad, uv.numero_unidad, ea.fila, ea.col, ea.tipo, ea.numero
    FROM unidades_viaje uv
    INNER JOIN estructura_asientos ea ON ea.plantilla_id = uv.id_plantilla
    WHERE uv.id_viaje = ?
  `;

const sqlOcupados = `
  SELECT id_unidad_viaje, asiento
  FROM reservas
  WHERE id_unidad_viaje IN (SELECT id FROM unidades_viaje WHERE id_viaje = ?)
    AND estado IN ('pendiente', 'confirmada')
`;


  db.query(sqlUnidades, [id], (err1, estructuras) => {
    if (err1) return res.status(500).json({ error: 'Error al obtener estructuras' });

    db.query(sqlOcupados, [id], (err2, ocupados) => {
      if (err2) return res.status(500).json({ error: 'Error al obtener asientos ocupados' });

      res.json({ estructuras, ocupados });
    });
  });
};

// Crear una nueva reserva
exports.crearReserva = (req, res) => {
  const {
    id_usuario,
    id_unidad_viaje,
    asiento,
    nombre_viajero,
    telefono_viajero,
    sube_en_terminal,
    parada_extra_nombre,       // ← NUEVO
    parada_bajada_nombre,      // ← NUEVO
    metodo_pago                // ← NUEVO
  } = req.body;

  if (!id_usuario || !id_unidad_viaje || !asiento || !nombre_viajero) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const asientoStr = String(asiento);

  const check = `
    SELECT * FROM reservas
    WHERE id_unidad_viaje = ? AND asiento = ? AND estado IN ('pendiente', 'confirmada')
  `;

  db.query(check, [id_unidad_viaje, asientoStr], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al verificar asiento' });
    if (rows.length > 0) return res.status(409).json({ error: 'El asiento ya está reservado' });

    const insert = `
      INSERT INTO reservas (
        id_usuario, id_unidad_viaje, asiento,
        nombre_viajero, telefono_viajero, sube_en_terminal,
        parada_extra_nombre, parada_bajada_nombre,
        metodo_pago, pago_confirmado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insert, [
      id_usuario,
      id_unidad_viaje,
      asientoStr,
      nombre_viajero,
      telefono_viajero || null,
      sube_en_terminal ?? true,
      parada_extra_nombre || null,
      parada_bajada_nombre || null,
      metodo_pago || 'efectivo',
      false // siempre se crea sin pago confirmado
    ], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Error al guardar la reserva' });
      res.json({ message: 'Reserva realizada correctamente', id_reserva: result.insertId });
    });
  });
};

exports.obtenerSolicitudesPendientes = (req, res) => {
  const sql = `
    SELECT r.*, u.nombre AS nombre_usuario, u.telefono, v.origen, v.destino, v.fecha, v.hora
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    WHERE r.estado = 'pendiente'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }

    res.json(results);
  });
};

// Confirmar reserva
exports.confirmarReserva = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE reservas SET estado = "confirmada" WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al confirmar reserva' });
    res.json({ message: 'Reserva confirmada' });
  });
};

// Rechazar reserva
exports.rechazarReserva = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE reservas SET estado = "rechazada" WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al rechazar reserva' });
    res.json({ message: 'Reserva rechazada' });
  });
};

// Obtener reservas pendientes filtradas por nombre o teléfono del usuario
exports.obtenerReservasPendientesFiltradas = (req, res) => {
  const { busqueda } = req.query;
  const filtro = `%${busqueda || ''}%`;

  const sql = `
    SELECT r.*, u.nombre AS nombre_usuario, u.telefono, v.origen, v.destino, v.fecha, v.hora
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    WHERE r.estado = 'pendiente'
      AND (u.nombre LIKE ? OR u.telefono LIKE ?)
  `;

  db.query(sql, [filtro, filtro], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar reservas' });
    res.json(results);
  });
};


// Obtener reservas por estado dinámico (pendiente, confirmada, rechazada)
exports.obtenerReservasPorEstado = (req, res) => {
  const { estado } = req.params;

  const estadosValidos = ['pendiente', 'confirmada', 'rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const sql = `
    SELECT r.*, u.nombre AS nombre_usuario, u.telefono, v.origen, v.destino, v.fecha, v.hora
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    WHERE r.estado = ?
    ORDER BY v.fecha DESC, v.hora DESC
  `;

  db.query(sql, [estado], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener reservas por estado:', err);
      return res.status(500).json({ error: 'Error al obtener reservas' });
    }
    res.json(results);
  });
};



//Reservas por fechas
exports.obtenerReservasPorRango = (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
  }

  const sql = `
    SELECT r.*, u.nombre AS nombre_usuario, u.telefono, v.origen, v.destino, v.fecha, v.hora
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    WHERE v.fecha BETWEEN ? AND ?
  `;

  db.query(sql, [desde, hasta], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener reservas por fecha' });
    res.json(results);
  });
};

// 📦 Filtrar reservas por estado, búsqueda por nombre/teléfono y rango de fechas
exports.filtrarReservas = (req, res) => {
  const { estado, busqueda, fechaDesde, fechaHasta } = req.query;

  const estadosValidos = ['pendiente', 'confirmada', 'rechazada'];
  const condiciones = [];
  const params = [];

  // Estado
  if (estado && estadosValidos.includes(estado)) {
    condiciones.push('r.estado = ?');
    params.push(estado);
  }

  // Búsqueda (nombre o teléfono)
  if (busqueda) {
    condiciones.push('(u.nombre LIKE ? OR u.telefono LIKE ?)');
    params.push(`%${busqueda}%`, `%${busqueda}%`);
  }

  // Rango de fechas
  if (fechaDesde && fechaHasta) {
    condiciones.push('v.fecha BETWEEN ? AND ?');
    params.push(fechaDesde, fechaHasta);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const sql = `
    SELECT r.*, u.nombre AS nombre_usuario, u.telefono, v.origen, v.destino, v.fecha, v.hora
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    ${whereClause}
    ORDER BY v.fecha DESC, v.hora DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error al filtrar reservas:', err);
      return res.status(500).json({ error: 'Error al filtrar reservas' });
    }
    res.json(results);
  });
};

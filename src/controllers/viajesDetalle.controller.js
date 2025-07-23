const db = require('../config/db');

// Obtener resumen general de viajes
const obtenerResumenViajes = (req, res) => {
  const sql = `
    SELECT
      v.id,
      v.origen,
      v.destino,
      v.fecha,
      v.hora,
      v.estado,
      v.precio,
      v.finalizado_en,
      (
        SELECT a.nombre
        FROM unidades_viaje uv
        LEFT JOIN administradores a ON uv.id_conductor = a.id
        WHERE uv.id_viaje = v.id
        LIMIT 1
      ) AS conductor,
      (
        SELECT COUNT(*)
        FROM reservas r
        INNER JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
        WHERE uv.id_viaje = v.id AND r.estado = 'confirmada'
      ) AS confirmados,
      (
        SELECT COUNT(*)
        FROM reservas r
        INNER JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
        WHERE uv.id_viaje = v.id AND r.estado = 'pendiente'
      ) AS pendientes
    FROM viajes v
    ORDER BY
      CASE WHEN v.estado = 'disponible' THEN 0 ELSE 1 END,
      v.fecha ASC,
      v.hora ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener resumen de viajes:', err);
      return res.status(500).json({ error: 'Error al obtener viajes' });
    }

    res.json(rows);
  });
};

// Obtener detalle por viaje
const obtenerDetalleViaje = async (req, res) => {
  const { id } = req.params;

  try {
    const [viajeRows] = await db.promise().query(
      `SELECT * FROM viajes WHERE id = ?`, [id]
    );
    if (viajeRows.length === 0) return res.status(404).json({ error: 'Viaje no encontrado' });

    const viaje = viajeRows[0];

    const [unidadRows] = await db.promise().query(
      `SELECT uv.id AS id_unidad_viaje, uv.id_plantilla, uv.numero_unidad, u.nombre AS nombre_unidad, a.nombre AS conductor
       FROM unidades_viaje uv
       JOIN plantillas_unidad u ON u.id = uv.id_plantilla
       LEFT JOIN administradores a ON a.id = uv.id_conductor
       WHERE uv.id_viaje = ?`, [id]
    );

    const unidades = [];

    for (const unidad of unidadRows) {
      const [plantillaInfo] = await db.promise().query(
        `SELECT nombre, total_asientos FROM plantillas_unidad WHERE id = ?`, [unidad.id_plantilla]
      );

      const [estructura] = await db.promise().query(
        `SELECT fila, col, tipo, numero FROM estructura_asientos WHERE plantilla_id = ?`, [unidad.id_plantilla]
      );

      const [reservas] = await db.promise().query(
        `SELECT
            r.estado,
            r.nombre_viajero AS nombre_pasajero,
            r.parada_extra_nombre AS subida_en,
            r.parada_bajada_nombre AS bajada_en,
            r.asiento AS numero_asiento,
            r.metodo_pago,
            r.pago_confirmado
         FROM reservas r
         WHERE r.id_unidad_viaje = ?`,
        [unidad.id_unidad_viaje]
      );

      const reservasAgrupadas = [];
      reservas.forEach(r => {
        const key = `${r.nombre_pasajero}|${r.estado}|${r.subida_en}|${r.bajada_en}|${r.metodo_pago}|${r.pago_confirmado}`;
        const existente = reservasAgrupadas.find(item => item.key === key);

        if (existente) {
          existente.asientos.push(r.numero_asiento);
        } else {
          reservasAgrupadas.push({
            key,
            estado: r.estado,
            nombre_pasajero: r.nombre_pasajero,
            sube_en: r.subida_en,
            baja_en: r.bajada_en,
            metodo_pago: r.metodo_pago,
            pago_confirmado: r.pago_confirmado,
            asientos: [r.numero_asiento]
          });
        }
      });

      unidades.push({
        id_unidad: unidad.numero_unidad,
        nombre_unidad: unidad.nombre_unidad,
        conductor: unidad.conductor || 'Sin asignar',
        plantilla: {
          nombre: plantillaInfo[0].nombre,
          total_asientos: plantillaInfo[0].total_asientos,
          estructura
        },
        reservas: reservasAgrupadas.map(r => {
          const { key, ...rest } = r;
          return rest;
        })
      });
    }

    res.json({
      id_viaje: viaje.id,
      origen: viaje.origen,
      destino: viaje.destino,
      fecha: viaje.fecha,
      hora: viaje.hora,
      estado: viaje.estado,
      precio: viaje.precio,
      unidades
    });

  } catch (err) {
    console.error('❌ Error al obtener detalle del viaje:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  obtenerResumenViajes,
  obtenerDetalleViaje
};

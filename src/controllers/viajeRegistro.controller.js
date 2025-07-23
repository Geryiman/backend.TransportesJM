const db = require('../config/db');

exports.crearViajeCompleto = (req, res) => {
  const {
    origen,
    destino,
    fecha,
    hora,
    precio,
    unidades,
    id_parada_subida,
    id_parada_bajada
  } = req.body;

  if (!origen || !destino || !fecha || !hora || !precio || !Array.isArray(unidades) || unidades.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o unidades no válidas' });
  }

  const sqlViaje = `
    INSERT INTO viajes (origen, destino, fecha, hora, precio, id_parada_subida, id_parada_bajada)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const valuesViaje = [
    origen,
    destino,
    fecha,
    hora,
    precio,
    id_parada_subida || null,
    id_parada_bajada || null
  ];

  db.query(sqlViaje, valuesViaje, (err, result) => {
    if (err) {
      console.error('❌ Error al crear viaje:', err);
      return res.status(500).json({ error: 'Error al crear el viaje' });
    }

    const id_viaje = result.insertId;

    const sqlUnidades = `
      INSERT INTO unidades_viaje (id_viaje, id_plantilla, id_conductor, numero_unidad)
      VALUES ?
    `;

    const valuesUnidades = unidades.map((u, index) => [
      id_viaje,
      u.id_plantilla,
      u.id_conductor,
      index + 1
    ]);

    db.query(sqlUnidades, [valuesUnidades], (err2) => {
      if (err2) {
        console.error('❌ Error al registrar unidades:', err2);
        return res.status(500).json({ error: 'Error al registrar las unidades del viaje' });
      }

      res.json({
        message: '✅ Viaje y unidades creados correctamente',
        id_viaje
      });
    });
  });
};

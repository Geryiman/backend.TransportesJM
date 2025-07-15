const db = require('../config/db');

// Obtener todas las plantillas de paradas
exports.getParadas = (req, res) => {
  const sql = 'SELECT * FROM plantillas_parada ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener plantillas' });

    const plantillas = results.map(row => {
      let listaParseada = [];

      try {
        if (typeof row.lista === 'string') {
          if (row.lista.trim().startsWith('[')) {
            // JSON válido
            listaParseada = JSON.parse(row.lista);
          } else {
            // Texto plano separado por comas
            listaParseada = row.lista.split(',').map(p => p.trim());
          }
        } else if (Array.isArray(row.lista)) {
          listaParseada = row.lista;
        }
      } catch {
        listaParseada = [];
      }

      return {
        id: row.id,
        nombre: row.nombre,
        lista: listaParseada
      };
    });

    res.json(plantillas);
  });
};

// Crear una nueva plantilla de paradas
exports.crearParada = (req, res) => {
  const { nombre, lista } = req.body;
  if (!nombre || !lista || !Array.isArray(lista)) {
    return res.status(400).json({ error: 'Faltan datos o lista inválida' });
  }

  const sql = 'INSERT INTO plantillas_parada (nombre, lista) VALUES (?, ?)';
  db.query(sql, [nombre, JSON.stringify(lista)], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar la plantilla' });
    res.json({ message: 'Plantilla guardada correctamente', id: result.insertId });
  });
};

// Eliminar una plantilla de paradas
exports.eliminarParada = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM plantillas_parada WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar plantilla' });
    res.json({ message: 'Plantilla eliminada' });
  });
};

// Obtener todos los lugares
exports.getLugares = (req, res) => {
  db.query('SELECT * FROM lugares ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener lugares' });
    res.json(results);
  });
};

// Agregar nuevo lugar
exports.addLugar = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

  db.query('INSERT INTO lugares (nombre) VALUES (?)', [nombre], (err) => {
    if (err) return res.status(500).json({ error: 'Error al agregar lugar' });
    res.json({ message: 'Lugar agregado correctamente' });
  });
};

// Eliminar lugar por ID
exports.deleteLugar = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM lugares WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar lugar' });
    res.json({ message: 'Lugar eliminado' });
  });
};

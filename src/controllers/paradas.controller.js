const db = require('../config/db');

// Obtener todas las plantillas de paradas
exports.getParadas = (req, res) => {
  const sql = 'SELECT * FROM plantillas_parada ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener plantillas' });

    const plantillas = results.map(row => ({
      id: row.id,
      nombre: row.nombre,
      lista: JSON.parse(row.lista)
    }));

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

// GET /api/lugares
exports.getLugares = (req, res) => {
  db.query('SELECT * FROM lugares ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener lugares' });
    res.json(results);
  });
};

// POST /api/lugares
exports.addLugar = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  db.query('INSERT INTO lugares (nombre) VALUES (?)', [nombre], (err) => {
    if (err) return res.status(500).json({ error: 'Error al agregar lugar' });
    res.json({ message: 'Lugar agregado correctamente' });
  });
};

// DELETE /api/lugares/:id
exports.deleteLugar = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM lugares WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar lugar' });
    res.json({ message: 'Lugar eliminado' });
  });
};

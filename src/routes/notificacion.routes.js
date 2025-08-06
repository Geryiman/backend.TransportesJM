const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.put('/notificacion/:tipo/:id', (req, res) => {
  const { tipo, id } = req.params;
  const { token } = req.body;
  const tabla = tipo === 'usuario' ? 'usuarios' : 'administradores';

  console.log(`🔁 Actualizando token para ${tabla} ID ${id}: ${token}`);

  const sql = `UPDATE ${tabla} SET token_notificacion = ? WHERE id = ?`;
  db.query(sql, [token, id], (err) => {
    if (err) {
      console.error('❌ Error al guardar token:', err);
      return res.status(500).json({ error: 'Error al guardar token' });
    }
    res.json({ success: true });
  });
});


module.exports = router;
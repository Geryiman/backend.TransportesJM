const express = require('express');
const router = express.Router();
const paradasController = require('../controllers/paradas.controller');

// Plantillas de paradas
router.get('/', paradasController.getParadas);
router.post('/', paradasController.crearParada);
router.delete('/:id', paradasController.eliminarParada);

// Lugares (para origen/destino)
router.get('/lugares', paradasController.getLugares);
router.post('/lugares', paradasController.addLugar);
router.delete('/lugares/:id', paradasController.deleteLugar);
router.put('/:id', paradasController.editarParada);



module.exports = router;

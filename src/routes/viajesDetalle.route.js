
const express = require('express');
const router = express.Router();
const controller = require('../controllers/viajesDetalle.controller');

router.get('/', controller.obtenerResumenViajes);
router.get('/:id/detalle', controller.obtenerDetalleViaje);

module.exports = router;

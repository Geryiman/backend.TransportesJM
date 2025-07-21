const express = require('express');
const router = express.Router();
const adminViajesController = require('../controllers/adminViajes.controller');

router.get('/admin/viajes', adminViajesController.obtenerTodosLosViajes);
router.get('/admin/viajes/:id', adminViajesController.obtenerDetalleViaje);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuentasConductor.controller');

// GET: Obtener cuenta existente por viaje
router.get('/cuenta/:id', controller.obtenerCuentaPorViaje);

// POST: Crear cuenta nueva
router.post('/cuenta', controller.crearCuentaViaje);

// PUT: Editar gastos
router.put('/cuenta/:id', controller.actualizarGastosCuenta);

// GET: Obtener precio del asiento
router.get('/viaje/:id/precio', controller.obtenerPrecioViaje);

module.exports = router;

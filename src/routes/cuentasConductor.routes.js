const express = require('express');
const router = express.Router();
const cuentasController = require('../controllers/cuentasConductor.controller');

// Crear cuenta de conductor
router.post('/cuentas', cuentasController.crearCuentaConductor);

// Obtener cuenta por id_viaje (modo clásico)
router.get('/cuentas/:id_viaje', cuentasController.obtenerCuentaConductor);

// Obtener o crear automáticamente si no hay cuenta
router.get('/cuentas/viaje/:id', cuentasController.obtenerCuentaPorViaje);

// Guardar o actualizar gastos
router.post('/cuentas/guardar', cuentasController.guardarCuenta);

module.exports = router;

// src/routes/cuentasConductor.routes.js
const express = require('express');
const router = express.Router();


const cuentasController = require('../controllers/cuentasConductor.controller');

// Las funciones deben existir en el controlador
router.post('/', cuentasController.crearCuentaConductor);
router.get('/:id_viaje', cuentasController.obtenerCuentaConductor);
router.get('/viaje/:id', cuentasController.obtenerCuentaPorViaje);
router.post('/cuentas/guardar', cuentasController.guardarCuenta);
router.get('/cuentas/viaje/:id', cuentasController.obtenerCuentaPorViaje);



module.exports = router;

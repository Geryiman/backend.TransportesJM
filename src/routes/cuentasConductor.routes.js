// src/routes/cuentasConductor.routes.js
const express = require('express');
const router = express.Router();


const cuentasController = require('../controllers/cuentasConductor.controller');

// Las funciones deben existir en el controlador
router.post('/', cuentasController.crearCuentaConductor);
router.get('/:id_viaje', cuentasController.obtenerCuentaConductor);

module.exports = router;

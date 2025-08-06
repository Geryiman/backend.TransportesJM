const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuentasViaje.controller');

router.get('/:id_viaje/resumen', controller.obtenerResumenCuenta);

module.exports = router;

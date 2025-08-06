const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuentasViaje.controller');

router.get('/:id_viaje/resumen', controller.obtenerResumen);
router.post('/:id_viaje', controller.guardarCuenta);

module.exports = router;

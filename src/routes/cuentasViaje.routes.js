const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuentasViaje.controller');

router.get('/:id/resumen', controller.obtenerResumenCuenta); // ✅ correcto

router.post('/:id_viaje', controller.guardarCuenta);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuentasViaje.controller');

router.get('/:id_viaje/resumen', controller.obtenerResumenCuenta);

// ✅ PUT: actualizar cuenta
router.put('/:id', controller.actualizarCuenta);
module.exports = router;

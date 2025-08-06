const express = require('express');
const router = express.Router();
const cuentasCtrl = require('../controllers/cuentasConductor.controller');

router.get('/:id_viaje', cuentasCtrl.obtenerCuentaViaje);
router.post('/guardar', cuentasCtrl.guardarCuentaViaje);

module.exports = router;

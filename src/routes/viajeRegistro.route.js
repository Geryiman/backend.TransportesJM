const express = require('express');
const router = express.Router();
const viajeRegistroController = require('../controllers/viajeRegistro.controller');

// Ruta para registrar un nuevo viaje con unidades
router.post('/crear', viajeRegistroController.crearViajeCompleto);

module.exports = router;

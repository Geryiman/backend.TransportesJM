const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/perfil/:id', authController.getPerfil);
router.put('/cambiar-contrasena/', authController.cambiarContrasena);

router.get('/reservas/:id', authController.obtenerReservasUsuario);

module.exports = router;

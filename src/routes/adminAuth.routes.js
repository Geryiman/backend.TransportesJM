const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminAuth.controller');
const verifyAdminToken = require('../middlewares/verifyAdminToken');
const viajesController = require('../controllers/viajes.controller');

// Login público
router.post('/login', adminController.adminLogin);

// Registro y validación protegidas
router.post('/register', verifyAdminToken, adminController.adminRegister);
router.get('/validate-token', verifyAdminToken, adminController.validateToken);
router.get('/accounts', verifyAdminToken, adminController.getAllAccounts);
// Actualizar estado o favorito
router.put('/update-account', verifyAdminToken, adminController.updateAccountStatus);

// Eliminar usuario (solo usuarios)
router.delete('/delete-usuario/:id', verifyAdminToken, adminController.deleteUsuario);
router.delete('/delete-admin/:id', verifyAdminToken, adminController.deleteAdmin);

// Solicitudes de reservas pendientes
router.put('/reservas/:id/confirmar', verifyAdminToken,viajesController.confirmarReserva);
router.put('/reservas/:id/rechazar',verifyAdminToken, viajesController.rechazarReserva);
router.get('/reservas/pendientes', viajesController.obtenerReservasPendientesFiltradas);
router.get('/reservas', viajesController.obtenerReservasPorEstado);
router.get('/reservas/fecha', viajesController.obtenerReservasPorRango);

router.get('/reservas/filtrar', verifyAdminToken, viajesController.filtrarReservas);




module.exports = router;

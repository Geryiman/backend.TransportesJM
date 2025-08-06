const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservas.controller');

// Confirmar una reserva individual por ID
router.put('/:id/confirmar', reservasController.confirmarReserva);

// Rechazar una reserva individual por ID
router.delete('/:id/rechazar', reservasController.rechazarReserva);

// Rechazar múltiples reservas (por IDs)
router.put('/rechazar-multiples', reservasController.rechazarMultiplesReservas);

// Confirmar múltiples reservas de un mismo pasajero en un viaje
router.post('/confirmar-multiples', reservasController.confirmarMultiplesReservas);

module.exports = router;

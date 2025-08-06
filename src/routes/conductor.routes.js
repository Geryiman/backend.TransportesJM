const express = require('express');
const router = express.Router();
const conductorController = require('../controllers/conductor.controller');

// Obtener todos los viajes asignados a un conductor
router.get('/:id/viajes', conductorController.obtenerViajesAsignados);

// Obtener los asientos y pasajeros de una unidad del viaje
router.get('/viaje/:id_unidad/asientos', conductorController.obtenerAsientosDelViaje);

// Detalle del viaje para el conductor
router.get('/viaje/:id/detalle', conductorController.detalleViajeConductor);

module.exports = router;

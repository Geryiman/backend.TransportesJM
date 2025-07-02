const express = require('express');
const router = express.Router();
const viajesController = require('../controllers/viajes.controller');

// 📦 Plantillas
router.get('/plantillas-unidad', viajesController.getPlantillasUnidad);
router.get('/plantillas-parada', viajesController.getPlantillasParada);
router.post('/crear-plantilla-unidad', viajesController.crearPlantillaUnidad);
router.post('/crear-plantilla-parada', viajesController.crearPlantillaParada);
router.get('/plantillas', viajesController.listarPlantillasUnidad);
router.delete('/plantillas/:id', viajesController.eliminarPlantillaUnidad);
router.put('/plantillas/:id', viajesController.actualizarNombrePlantilla);
router.get('/plantillas/:id/estructura', viajesController.getEstructuraPlantilla);

// 🚐 Viajes
router.post('/crear-viaje', viajesController.crearViaje);
router.get('/viajes', viajesController.listarViajes);
router.get('/viajes/:id/unidades', viajesController.getUnidadesPorViaje);
router.put('/viajes/:id/estado', viajesController.actualizarEstadoViaje);
router.delete('/viajes/:id', viajesController.eliminarViaje);
router.put('/viajes/:id', viajesController.editarViaje);
router.get('/viajes/conductor/:id', viajesController.getViajesDelConductor);
router.get('/viajes/estadisticas/conductores', viajesController.getEstadisticasConductores);
router.get('/admins/conductores', viajesController.getConductores);
// ✅ Viajes disponibles para usuarios (con unidades)
router.get('/disponibles', viajesController.getViajesDisponibles);

// ✅ Estructura de asientos y ocupados por viaje
router.get('/:id/asientos', viajesController.getAsientosPorViaje);

// ✅ Crear una nueva reserva
router.post('/reservas', viajesController.crearReserva);


router.get('/reservas/pendientes', viajesController.obtenerSolicitudesPendientes);




module.exports = router;

const express = require('express');
const router = express.Router();
const { crearLinkPago, recibirWebhook } = require('../controllers/pagos.controller');

router.post('/crear', crearLinkPago);
router.post('/webhook', express.json(), recibirWebhook); // MercadoPago envía JSON puro

module.exports = router;

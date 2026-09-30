const express = require('express');
const router = express.Router();
const wellController = require('../controllers/wellController');

// Well State & Telemetry Routes
router.get('/status', wellController.getWellStatus);
router.get('/thermal-history', wellController.getThermalHistory);
router.get('/dynacard/current', wellController.getCurrentDynacard);

// Simulation & Optimization Routes
router.post('/simulate', wellController.simulateScenario);
router.get('/optimize', wellController.getOptimization);

module.exports = router;

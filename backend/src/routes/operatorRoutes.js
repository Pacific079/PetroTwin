const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');

router.post('/action', operatorController.recordOperatorAction);
router.get('/audit-log', operatorController.getAuditLog);

module.exports = router;

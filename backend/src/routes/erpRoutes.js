const express = require('express');
const router = express.Router();
const erpController = require('../controllers/erpController');

// Executive Dashboard
router.get('/dashboard', erpController.getExecutiveDashboard);

// Wells Asset Registry
router.get('/wells', erpController.getWellsPortfolio);

// Production Accounting & Dispatches
router.get('/production', erpController.getProductionAccounting);
router.post('/dispatch', erpController.createDispatchManifest);

// Steam & Energy Management
router.get('/steam-energy', erpController.getSteamEnergy);

// Maintenance & CMMS Work Orders
router.get('/work-orders', erpController.getWorkOrders);
router.post('/work-orders', erpController.createWorkOrder);
router.patch('/work-orders/:id', erpController.updateWorkOrderStatus);

// Warehouse Inventory & Spare Parts
router.get('/inventory', erpController.getInventory);

// Financial Accounting & OPEX
router.get('/financials', erpController.getFinancials);

module.exports = router;

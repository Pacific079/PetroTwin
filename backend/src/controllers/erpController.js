/**
 * Upstream Petroleum ERP Controller
 * Comprehensive Enterprise Resource Planning for Baghewala Field Heavy Oil Asset
 */

const Well = require('../models/Well');
const WorkOrder = require('../models/WorkOrder');
const Inventory = require('../models/Inventory');
const TankBattery = require('../models/TankBattery');
const SteamBoiler = require('../models/SteamBoiler');
const FinancialLedger = require('../models/FinancialLedger');
const { DEMO_LABEL } = require('../services/seedDataService');

/**
 * GET /api/erp/dashboard
 * High-level Enterprise KPI Rollup
 */
exports.getExecutiveDashboard = async (req, res) => {
  try {
    const [wells, openWorkOrders, tankBattery, boilers, financial] = await Promise.all([
      Well.find(),
      WorkOrder.find({ status: { $ne: 'CLOSED' } }),
      TankBattery.findOne({ batteryId: 'BAGH-TB-01' }),
      SteamBoiler.find(),
      FinancialLedger.findOne().sort({ date: -1 }),
    ]);

    const activeProducingWells = wells.filter((w) => w.status === 'PRODUCING').length;
    const steamingWells = wells.filter((w) => w.status === 'STEAM_INJECTION').length;
    const soakingWells = wells.filter((w) => w.status === 'SOAKING').length;

    const criticalWorkOrders = openWorkOrders.filter((wo) => wo.priority === 'CRITICAL').length;
    const lowStockItems = await Inventory.countDocuments({ status: { $in: ['LOW_STOCK', 'CRITICAL_REORDER'] } });

    res.status(200).json({
      success: true,
      data: {
        field: 'Baghewala Field Asset (Oil India Limited)',
        fieldBopd: tankBattery?.dailyNetOilBopd || 355,
        fieldGrossBpd: tankBattery?.dailyGrossInflowBpd || 480,
        totalWells: wells.length,
        wellBreakdown: {
          producing: activeProducingWells,
          steaming: steamingWells,
          soaking: soakingWells,
        },
        tankBattery: {
          totalCapacityBbl: tankBattery?.totalCapacityBbl || 15000,
          netOilStoredBbl: tankBattery?.netOilStoredBbl || 6980,
          producedWaterBbl: tankBattery?.producedWaterBbl || 2470,
          utilizationPercent: tankBattery
            ? Number(((tankBattery.grossFluidStoredBbl / tankBattery.totalCapacityBbl) * 100).toFixed(1))
            : 63.0,
        },
        boilers: {
          totalUnits: boilers.length,
          activeUnits: boilers.filter((b) => b.status === 'ONLINE_INJECTION').length,
          dailySteamTonnes: boilers.reduce((acc, b) => acc + b.currentOutputTonnesDay, 0),
        },
        maintenance: {
          openOrders: openWorkOrders.length,
          criticalAlerts: criticalWorkOrders,
          lowStockAlerts: lowStockItems,
        },
        financials: {
          liftingCostPerBblInr: financial?.totalLiftingCostPerBblInr || 2200,
          realizedPricePerBblInr: financial?.realizedPricePerBblInr || 4750,
          netOperatingIncomeDayInr: financial?.netOperatingIncomeDayInr || 905250,
          currency: 'INR',
        },
        dataSource: DEMO_LABEL,
      },
    });
  } catch (err) {
    console.error('getExecutiveDashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/wells
 * Multi-Well Portfolio Registry
 */
exports.getWellsPortfolio = async (req, res) => {
  try {
    const wells = await Well.find().sort({ wellId: 1 });
    res.status(200).json({ success: true, count: wells.length, wells, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getWellsPortfolio error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/production
 * Tank Battery Storage, BS&W, and Trucking Dispatches
 */
exports.getProductionAccounting = async (req, res) => {
  try {
    const battery = await TankBattery.findOne({ batteryId: 'BAGH-TB-01' });
    res.status(200).json({ success: true, battery, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getProductionAccounting error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/erp/dispatch
 * Log a new crude tanker dispatch manifest
 */
exports.createDispatchManifest = async (req, res) => {
  try {
    const { tankerRegNo, driverName, volumeKl, destination, apiGravity = 16.0 } = req.body;
    const battery = await TankBattery.findOne({ batteryId: 'BAGH-TB-01' });

    if (!battery) {
      return res.status(404).json({ error: 'Tank Battery not found.' });
    }

    const volumeBbl = Number((volumeKl * 6.2898).toFixed(1));
    const manifestId = `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDispatch = {
      manifestId,
      tankerRegNo: tankerRegNo || 'RJ-15-GA-9921',
      driverName: driverName || 'Ramavtar Sharma',
      transporter: 'Rajasthan Petroleum Logistics',
      volumeKl: Number(volumeKl),
      volumeBbl,
      apiGravity: Number(apiGravity),
      bswPercent: 2.1,
      destination: destination || 'Koyali Refinery (IOCL)',
      dispatchedAt: new Date(),
      status: 'IN_TRANSIT',
    };

    battery.dispatches.unshift(newDispatch);
    battery.netOilStoredBbl = Math.max(0, battery.netOilStoredBbl - volumeBbl);
    battery.grossFluidStoredBbl = Math.max(0, battery.grossFluidStoredBbl - volumeBbl);
    await battery.save();

    res.status(201).json({ success: true, manifest: newDispatch, updatedBattery: battery });
  } catch (err) {
    console.error('createDispatchManifest error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/steam-energy
 * OTSG Boilers and Energy Balances
 */
exports.getSteamEnergy = async (req, res) => {
  try {
    const boilers = await SteamBoiler.find().sort({ boilerId: 1 });
    res.status(200).json({ success: true, boilers, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getSteamEnergy error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/work-orders
 * CMMS Maintenance Work Orders
 */
exports.getWorkOrders = async (req, res) => {
  try {
    const { status, priority, wellId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (wellId) query.wellId = wellId;

    const workOrders = await WorkOrder.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: workOrders.length, workOrders, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getWorkOrders error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/erp/work-orders
 * Create new maintenance work order (manual or auto-triggered from Digital Twin)
 */
exports.createWorkOrder = async (req, res) => {
  try {
    const {
      wellId = 'BAGH-104',
      title,
      description,
      type = 'CORRECTIVE',
      priority = 'HIGH',
      assignedCrew = 'Well Surveillance & Automation Team',
      triggeredByDiagnostic = null,
      estimatedCostInr = 45000,
    } = req.body;

    const orderNumber = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const wo = new WorkOrder({
      orderNumber,
      wellId,
      title: title || `Intervention for ${wellId}`,
      description: description || 'Routine operational work order.',
      type,
      priority,
      status: 'OPEN',
      assignedCrew,
      leadEngineer: 'A. Sharma (Senior Production Engineer)',
      estimatedCostInr,
      triggeredByDiagnostic,
      createdAt: new Date(),
    });

    await wo.save();
    res.status(201).json({ success: true, workOrder: wo, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('createWorkOrder error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/erp/work-orders/:id
 * Update status of work order
 */
exports.updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const wo = await WorkOrder.findById(id);
    if (!wo) return res.status(404).json({ error: 'Work order not found.' });

    wo.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      wo.resolvedAt = new Date();
    }
    await wo.save();

    res.status(200).json({ success: true, workOrder: wo });
  } catch (err) {
    console.error('updateWorkOrderStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/inventory
 * Spare Parts & Warehouse Stock
 */
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: items.length, inventory: items, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getInventory error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/erp/financials
 * Field Financial OPEX, Lifting Cost Breakdown & Gross Margin
 */
exports.getFinancials = async (req, res) => {
  try {
    const record = await FinancialLedger.findOne().sort({ date: -1 });
    res.status(200).json({ success: true, financials: record, dataSource: DEMO_LABEL });
  } catch (err) {
    console.error('getFinancials error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Well Controller
 * Handles REST API endpoints for well telemetry, dynacard inversion,
 * what-if simulation, and Pareto optimization.
 */

const Well = require('../models/Well');
const Telemetry = require('../models/Telemetry');
const Dynacard = require('../models/Dynacard');
const simulationService = require('../services/simulationService');
const paretoOptimizer = require('../services/paretoOptimizer');
const { DEMO_LABEL } = require('../services/seedDataService');

/**
 * GET /api/well/status
 * Returns current well state, near-wellbore temperature, crude viscosity,
 * active SPM, pump fillage, and diagnostic badge.
 */
exports.getWellStatus = async (req, res) => {
  try {
    const well = await Well.findOne({ wellId: 'BAGH-104' });
    if (!well) {
      return res.status(404).json({ error: 'Well BAGH-104 not found' });
    }

    const currentTelemetry = await Telemetry.findOne({
      wellId: 'BAGH-104',
      day: well.currentProducingDay,
    });

    // Run real-time simulation snapshot for current state
    const sim = simulationService.runScenario({
      spm: well.currentSpm,
      steamVolumeTonnes: well.steamBaseline.steamVolumeTonnes,
      soakDays: well.steamBaseline.soakDays,
      producingDay: well.currentProducingDay,
    });

    res.status(200).json({
      success: true,
      wellId: well.wellId,
      field: well.field,
      operator: well.operator,
      formation: well.formation,
      depthMeters: well.reservoirDepthMeters,
      apiGravity: well.apiGravity,
      currentProducingDay: well.currentProducingDay,
      cycleDurationDays: well.steamBaseline.cycleDurationDays,
      activeCssCycle: well.activeCssCycle,
      activeSpm: well.currentSpm,
      temperatureC: sim.reservoirTempC,
      viscosityCp: sim.viscosityCp,
      oilRateBopd: sim.oilRateBopd,
      grossRateBpd: sim.grossRateBpd,
      waterCutPercent: sim.waterCutPercent,
      pumpFillagePercent: sim.pumpFillagePercent,
      pprlLbs: sim.pprlLbs,
      mprlLbs: sim.mprlLbs,
      rodFallSafetyMargin: sim.rodFallSafetyMargin,
      isRodFloating: sim.isRodFloating,
      rodFloatProbability: sim.rodFloatProbability,
      electricPowerKw: sim.electricPowerKw,
      kwhPerBbl: sim.kwhPerBbl,
      instantaneousSor: sim.instantaneousSor,
      diagnosticBadge: {
        diagnostic: sim.diagnostic.diagnostic,
        riskLevel: sim.diagnostic.riskLevel,
        severity: sim.diagnostic.severity,
        confidence: sim.diagnostic.confidence,
        rootCause: sim.diagnostic.rootCause,
        explanation: sim.diagnostic.explanation,
        actionRecommended: sim.diagnostic.actionRecommended,
      },
      surfaceUnit: well.surfaceUnit,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('getWellStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/well/thermal-history
 * Returns daily time series (60 days) of reservoir temperature, viscosity, and production.
 */
exports.getThermalHistory = async (req, res) => {
  try {
    const history = await Telemetry.find({ wellId: 'BAGH-104' }).sort({ day: 1 });
    res.status(200).json({
      success: true,
      count: history.length,
      history,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('getThermalHistory error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/well/dynacard/current
 * Returns surface and reconstructed downhole dynacard load arrays (100 normalized points each).
 */
exports.getCurrentDynacard = async (req, res) => {
  try {
    const well = await Well.findOne({ wellId: 'BAGH-104' });
    const currentSpm = well ? well.currentSpm : 4.2;
    const currentDay = well ? well.currentProducingDay : 38;

    // Run solver to guarantee synchronous accuracy
    const sim = simulationService.runScenario({
      spm: currentSpm,
      producingDay: currentDay,
      steamVolumeTonnes: 2000,
      soakDays: 10,
    });

    res.status(200).json({
      success: true,
      wellId: 'BAGH-104',
      day: currentDay,
      spm: currentSpm,
      viscosityCp: sim.viscosityCp,
      temperatureC: sim.reservoirTempC,
      surfaceCard: sim.surfaceCard,
      downholeCard: sim.downholeCard,
      pprlLbs: sim.pprlLbs,
      mprlLbs: sim.mprlLbs,
      rodFallSafetyMargin: sim.rodFallSafetyMargin,
      isRodFloating: sim.isRodFloating,
      diagnostic: sim.diagnostic,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('getCurrentDynacard error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/well/simulate
 * What-if parameter runner: accepts { spm, steamVolumeTonnes, soakDays, producingDay }
 */
exports.simulateScenario = async (req, res) => {
  try {
    const {
      spm = 4.2,
      steamVolumeTonnes = 2000,
      soakDays = 10,
      producingDay = 38,
    } = req.body;

    const sim = simulationService.runScenario({
      spm: Number(spm),
      steamVolumeTonnes: Number(steamVolumeTonnes),
      soakDays: Number(soakDays),
      producingDay: Number(producingDay),
    });

    res.status(200).json({
      success: true,
      simulation: sim,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('simulateScenario error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/well/optimize
 * Multi-objective constrained Pareto optimizer
 */
exports.getOptimization = async (req, res) => {
  try {
    const well = await Well.findOne({ wellId: 'BAGH-104' });
    const currentDay = well ? well.currentProducingDay : 38;
    const currentSpm = well ? well.currentSpm : 4.2;

    const optimization = paretoOptimizer.optimize({
      producingDay: currentDay,
      steamVolumeTonnes: 2000,
      soakDays: 10,
      currentSpm,
    });

    res.status(200).json({
      success: true,
      optimization,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('getOptimization error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Operator Controller
 * Handles operator governance, supervisory setpoint approvals,
 * and immutable audit trail logging.
 */

const AuditLog = require('../models/AuditLog');
const Well = require('../models/Well');
const simulationService = require('../services/simulationService');
const paretoOptimizer = require('../services/paretoOptimizer');
const { DEMO_LABEL } = require('../services/seedDataService');

/**
 * POST /api/operator/action
 * Records operator decision (ACCEPT, MODIFY, REJECT) and updates well setpoint
 */
exports.recordOperatorAction = async (req, res) => {
  try {
    const {
      action, // 'ACCEPT' | 'MODIFY' | 'REJECT'
      targetSpm,
      notes = '',
      operatorName = 'OIL Senior Production Engineer (Shift A)',
    } = req.body;

    if (!action || !['ACCEPT', 'MODIFY', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (ACCEPT, MODIFY, REJECT) is required.' });
    }

    const well = await Well.findOne({ wellId: 'BAGH-104' });
    const previousSpm = well ? well.currentSpm : 4.2;
    const finalSpm = action === 'REJECT' ? previousSpm : Number(targetSpm || previousSpm);

    // Get current recommendation context
    const opt = paretoOptimizer.optimize({
      producingDay: well ? well.currentProducingDay : 38,
      currentSpm: previousSpm,
    });

    const newSim = simulationService.runScenario({
      spm: finalSpm,
      producingDay: well ? well.currentProducingDay : 38,
    });

    // Create Audit Log Entry
    const auditEntry = new AuditLog({
      action,
      wellId: 'BAGH-104',
      previousSpm,
      targetSpm: finalSpm,
      operatorName,
      notes: notes || `Operator executed ${action} action: Setpoint changed from ${previousSpm} to ${finalSpm} SPM.`,
      recommendationGiven: {
        recommendedSpm: opt.recommended ? opt.recommended.spm : 2.75,
        physicalReason: opt.recommended
          ? `Prevent rod floating under ${opt.viscosityCp.toLocaleString()} cP viscosity drag.`
          : 'Optimization safeguard',
        confidence: 0.95,
        expectedPowerDeltaKwh: opt.energySavingsPercent,
        rodFloatingRiskAvoided: !newSim.isRodFloating,
      },
      resultingStatus: action === 'ACCEPT' ? 'AI_OPTIMIZED' : action === 'MODIFY' ? 'OPERATOR_TUNED' : 'OPERATOR_REJECTED',
      timestamp: new Date(),
    });

    await auditEntry.save();

    // Update active well setpoint in MongoDB
    if (well && (action === 'ACCEPT' || action === 'MODIFY')) {
      well.currentSpm = finalSpm;
      well.updatedAt = new Date();
      await well.save();
    }

    res.status(201).json({
      success: true,
      message: `Operator action ${action} successfully committed to immutable audit trail.`,
      auditEntry,
      newWellState: {
        activeSpm: finalSpm,
        isRodFloating: newSim.isRodFloating,
        rodFallSafetyMargin: newSim.rodFallSafetyMargin,
        diagnostic: newSim.diagnostic.diagnostic,
      },
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('recordOperatorAction error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/operator/audit-log
 * Retrieves chronological audit history
 */
exports.getAuditLog = async (req, res) => {
  try {
    const logs = await AuditLog.find({ wellId: 'BAGH-104' }).sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
      dataSource: DEMO_LABEL,
    });
  } catch (err) {
    console.error('getAuditLog error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Coupled CSS-SRP Simulation Service
 * Executes full physics loop: Thermal decline -> Walther viscosity -> Vogel IPR
 * -> Gibbs wave solver -> Diagnostic classification -> Power & Rod mechanics
 */

const thermalEngine = require('../physics/thermalEngine');
const viscosityEngine = require('../physics/viscosityEngine');
const gibbsWaveSolver = require('../physics/gibbsWaveSolver');
const dynacardClassifier = require('./dynacardClassifier');

class SimulationService {
  /**
   * Run coupled physics simulation for specified well operational inputs
   * @param {object} params
   * @param {number} params.spm - Pumping speed (SPM)
   * @param {number} params.steamVolumeTonnes - Injected steam mass
   * @param {number} params.soakDays - Soak duration
   * @param {number} params.producingDay - Day of current CSS production cycle
   * @returns {object} Simulation outputs
   */
  runScenario({
    spm = 4.2,
    steamVolumeTonnes = 2000,
    soakDays = 10,
    producingDay = 38,
  }) {
    // 1. Thermal Boberg-Lantz decline
    const thermal = thermalEngine.calculateTemperature(producingDay, steamVolumeTonnes, soakDays);
    const tempC = thermal.reservoirTempC;

    // 2. Viscosity and Vogel Inflow
    const viscosityCp = viscosityEngine.calculateViscosityCp(tempC);
    const inflow = viscosityEngine.calculateInflow(tempC);

    // 3. Pump barrel kinematics and fillage
    const pumpDisplacementFactor = 70.83; // 2.25" plunger, 120" stroke
    const theoreticalDispBpd = pumpDisplacementFactor * spm;
    const availableGrossBpd = inflow.grossRateBpd;
    let fillagePercent = Math.min(100, (availableGrossBpd / theoreticalDispBpd) * 100);
    fillagePercent = Math.max(45, fillagePercent);

    // 4. Wave mechanics via Gibbs solver
    const wave = gibbsWaveSolver.solveWaveEquation(120, spm, viscosityCp, fillagePercent);

    // 5. Diagnostic classification
    const diagnostic = dynacardClassifier.classify({
      downholeCard: wave.downholeCard,
      fillagePercent,
      rodFallSafetyMargin: wave.rodFallSafetyMargin,
      viscosityCp,
      mprlLbs: wave.mprlLbs,
      pprlLbs: wave.pprlLbs,
    });

    // 6. Actual production and lifting energetics
    const actualGrossBpd = theoreticalDispBpd * (fillagePercent / 100);
    const actualOilBopd = actualGrossBpd * (1 - inflow.waterCutPercent / 100);

    const hydraulicHp = (actualGrossBpd * 1550) / 58700;
    const viscousLossHp = 0.000085 * viscosityCp * Math.pow(spm, 2.1);
    const totalShaftHp = Math.max(4.0, hydraulicHp + viscousLossHp + 4.5);
    const electricKw = (totalShaftHp * 0.7457) / 0.82;
    const kwhPerBbl = actualOilBopd > 0 ? (electricKw * 24) / actualOilBopd : 999;

    // Steam-Oil Ratio
    const dailySteamEquivalentTonnes = steamVolumeTonnes / 60.0;
    const instantaneousSor = actualOilBopd > 0 ? dailySteamEquivalentTonnes / actualOilBopd : 99;

    // Rod float probability (0% to 100%)
    let rodFloatProbability = 0;
    if (wave.rodFallSafetyMargin < 0) {
      rodFloatProbability = Math.min(100, Math.round(50 + Math.abs(wave.rodFallSafetyMargin) * 5));
    } else if (wave.rodFallSafetyMargin < 3.0) {
      rodFloatProbability = Math.round((3.0 - wave.rodFallSafetyMargin) * 15);
    }

    return {
      producingDay,
      spm,
      reservoirTempC: tempC,
      viscosityCp,
      mobility: inflow.mobility,
      oilRateBopd: Number(actualOilBopd.toFixed(1)),
      grossRateBpd: Number(actualGrossBpd.toFixed(1)),
      waterCutPercent: inflow.waterCutPercent,
      pumpFillagePercent: Number(fillagePercent.toFixed(1)),
      surfaceCard: wave.surfaceCard,
      downholeCard: wave.downholeCard,
      pprlLbs: wave.pprlLbs,
      mprlLbs: wave.mprlLbs,
      rodFallSafetyMargin: wave.rodFallSafetyMargin,
      terminalRodFallVelocity: wave.terminalRodFallVelocity,
      maxCarrierBarDownVelocity: wave.maxCarrierBarDownVelocity,
      isRodFloating: wave.isRodFloating,
      rodFloatProbability,
      electricPowerKw: Number(electricKw.toFixed(2)),
      kwhPerBbl: Number(kwhPerBbl.toFixed(2)),
      instantaneousSor: Number(instantaneousSor.toFixed(3)),
      dampingCoefficient: wave.dampingCoefficient,
      diagnostic,
      dataSource: '[DEMO / SIMULATED DATASET: CALIBRATED TO BAGHEWALA JODHPUR SANDSTONE]',
    };
  }
}

module.exports = new SimulationService();

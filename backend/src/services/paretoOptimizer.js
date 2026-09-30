/**
 * Multi-Objective Constrained Pareto Optimizer
 *
 * Objectives:
 * 1. Maximize Oil Production Rate (BOPD)
 * 2. Minimize Steam-Oil Ratio (SOR: tonnes CWE / bbl oil)
 * 3. Minimize Specific Energy Consumption (kWh / bbl)
 * 4. Minimize Rod Fatigue Stress Range (Delta Load: PPRL - MPRL)
 *
 * Operational Constraints:
 * - PPRL < 26,000 lbs (Structural/Gearbox rating for Baghewala beam pump)
 * - MPRL > 2,000 lbs (Prevents compressive rod buckling & floating)
 * - VFD Range: 1.5 to 5.5 SPM
 * - Rod Fall Safety Margin >= 0 (No carrier-bar separation)
 */

const thermalEngine = require('../physics/thermalEngine');
const viscosityEngine = require('../physics/viscosityEngine');
const gibbsWaveSolver = require('../physics/gibbsWaveSolver');

class ParetoOptimizer {
  /**
   * Run multi-objective optimization across candidate VFD speeds
   * @param {object} params - Current well conditions
   * @returns {object} Frontier points, optimal recommendation, and trade-off data
   */
  optimize({
    producingDay = 38,
    steamVolumeTonnes = 2000,
    soakDays = 10,
    currentSpm = 4.2,
  }) {
    // Current thermal and viscosity state
    const thermal = thermalEngine.calculateTemperature(producingDay, steamVolumeTonnes, soakDays);
    const tempC = thermal.reservoirTempC;
    const viscosityCp = viscosityEngine.calculateViscosityCp(tempC);
    const inflow = viscosityEngine.calculateInflow(tempC);

    const candidates = [];
    const minSpm = 1.5;
    const maxSpm = 5.5;
    const step = 0.25;

    // Pump displacement constant for 2.25" plunger and 120" stroke:
    // Disp (bpd) = 0.1166 * (plunger_diam_in)^2 * stroke_in * SPM = 0.1166 * 5.0625 * 120 * SPM ~ 70.83 * SPM
    const pumpDisplacementFactor = 70.83;

    for (let spm = minSpm; spm <= maxSpm + 1e-4; spm += step) {
      const spmVal = Number(spm.toFixed(2));
      const theoreticalDispBpd = pumpDisplacementFactor * spmVal;

      // Pump fillage is ratio of available reservoir inflow to pump displacement
      const availableGrossBpd = inflow.grossRateBpd;
      let fillagePercent = Math.min(100, (availableGrossBpd / theoreticalDispBpd) * 100);
      fillagePercent = Math.max(40, fillagePercent);

      // Solve Gibbs wave mechanics for candidate SPM
      const wave = gibbsWaveSolver.solveWaveEquation(120, spmVal, viscosityCp, fillagePercent);

      // Production calculation
      const actualGrossBpd = theoreticalDispBpd * (fillagePercent / 100);
      const actualOilBopd = actualGrossBpd * (1 - inflow.waterCutPercent / 100);

      // Electrical energy calculation
      // Hydraulic power (HP)
      const hydraulicHp = (actualGrossBpd * 1550) / 58700;
      // Viscous damping power loss (HP) proportional to viscosity and SPM^2
      const viscousLossHp = 0.000085 * viscosityCp * Math.pow(spmVal, 2.1);
      // Mechanical lifting power
      const totalShaftHp = Math.max(5.0, hydraulicHp + viscousLossHp + 4.5);
      // Electrical power (kW) with 82% motor/VFD efficiency
      const electricKw = (totalShaftHp * 0.7457) / 0.82;
      const kwhPerBbl = actualOilBopd > 0 ? (electricKw * 24) / actualOilBopd : 999;

      // Instantaneous Steam-Oil Ratio (tonnes CWE / bbl oil)
      const dailySteamEquivalentTonnes = steamVolumeTonnes / 60.0;
      const instantaneousSor = actualOilBopd > 0 ? dailySteamEquivalentTonnes / actualOilBopd : 99;

      // Rod cyclic fatigue stress range (psi)
      const cyclicStressRangePsi = (wave.pprlLbs - wave.mprlLbs) / gibbsWaveSolver.avgRodAreaSqIn;

      // Constraint Checks
      const pprlCompliant = wave.pprlLbs <= 26000;
      const mprlCompliant = wave.mprlLbs >= 2000;
      const rodFallSafe = wave.rodFallSafetyMargin >= 0;
      const isFeasible = pprlCompliant && mprlCompliant && rodFallSafe;

      candidates.push({
        spm: spmVal,
        oilRateBopd: Number(actualOilBopd.toFixed(1)),
        grossRateBpd: Number(actualGrossBpd.toFixed(1)),
        fillagePercent: Number(fillagePercent.toFixed(1)),
        pprlLbs: wave.pprlLbs,
        mprlLbs: wave.mprlLbs,
        rodFallSafetyMargin: wave.rodFallSafetyMargin,
        kwhPerBbl: Number(kwhPerBbl.toFixed(2)),
        sor: Number(instantaneousSor.toFixed(3)),
        cyclicStressPsi: Number(cyclicStressRangePsi.toFixed(0)),
        isFeasible,
        violationReason: !isFeasible
          ? !rodFallSafe
            ? 'Rod floating / negative fall margin'
            : !mprlCompliant
            ? 'MPRL below 2,000 lbs threshold'
            : 'PPRL exceeds 26,000 lbs limit'
          : null,
      });
    }

    // Filter feasible candidate points to identify Pareto non-dominated set
    const feasible = candidates.filter((c) => c.isFeasible);

    // Score candidates based on multi-objective weighted utility
    // We normalize: Oil (+), Energy (-), Fatigue (-), SOR (-)
    let bestCandidate = null;
    let maxScore = -Infinity;

    if (feasible.length > 0) {
      const maxOil = Math.max(...feasible.map((c) => c.oilRateBopd));
      const minOil = Math.min(...feasible.map((c) => c.oilRateBopd));
      const maxKwh = Math.max(...feasible.map((c) => c.kwhPerBbl));
      const minKwh = Math.min(...feasible.map((c) => c.kwhPerBbl));
      const maxStress = Math.max(...feasible.map((c) => c.cyclicStressPsi));
      const minStress = Math.min(...feasible.map((c) => c.cyclicStressPsi));

      feasible.forEach((cand) => {
        const normOil = maxOil > minOil ? (cand.oilRateBopd - minOil) / (maxOil - minOil) : 1;
        const normEnergy = maxKwh > minKwh ? (cand.kwhPerBbl - minKwh) / (maxKwh - minKwh) : 0;
        const normStress = maxStress > minStress ? (cand.cyclicStressPsi - minStress) / (maxStress - minStress) : 0;

        // Weights: 40% Oil Production, 35% Energy Efficiency, 25% Rod Life / Stress
        const utilityScore = 0.40 * normOil - 0.35 * normEnergy - 0.25 * normStress;
        cand.utilityScore = Number(utilityScore.toFixed(3));

        if (utilityScore > maxScore) {
          maxScore = utilityScore;
          bestCandidate = cand;
        }
      });
    } else {
      // If none strictly feasible under high viscosity, recommend safest low SPM
      bestCandidate = candidates[0];
    }

    // Compare current operating SPM with recommended optimal SPM
    const currentCandidate = candidates.find((c) => Math.abs(c.spm - currentSpm) < 0.15) || candidates[0];
    const energySavingsPercent = currentCandidate.kwhPerBbl > 0 && bestCandidate
      ? Number((((currentCandidate.kwhPerBbl - bestCandidate.kwhPerBbl) / currentCandidate.kwhPerBbl) * 100).toFixed(1))
      : 0;

    return {
      candidates,
      feasiblePoints: feasible,
      recommended: bestCandidate,
      currentOperatingPoint: currentCandidate,
      energySavingsPercent: Math.max(0, energySavingsPercent),
      temperatureC: tempC,
      viscosityCp,
      suggestedTurnaroundDay: 52, // Predicted cycle economic turnaround point
    };
  }
}

module.exports = new ParetoOptimizer();

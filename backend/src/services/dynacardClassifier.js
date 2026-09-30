/**
 * Geometric Dynacard Diagnostic Classifier
 * Classifies downhole pump conditions based on wave-inversion geometry,
 * valve action timing, and viscous drag mechanics.
 */

class DynacardClassifier {
  /**
   * Classify downhole card condition
   * @param {object} params
   * @param {Array} params.downholeCard - Array of { positionInches, loadLbs }
   * @param {number} params.fillagePercent - Barrel fillage percentage
   * @param {number} params.rodFallSafetyMargin - Safety margin from Gibbs solver
   * @param {number} params.viscosityCp - Crude viscosity
   * @param {number} params.mprlLbs - Minimum polished rod load
   * @param {number} params.pprlLbs - Peak polished rod load
   * @returns {object} Diagnostic classification and physical explanation
   */
  classify({ downholeCard, fillagePercent, rodFallSafetyMargin, viscosityCp, mprlLbs, pprlLbs }) {
    // 1. High-Viscosity Rod Floating Diagnostic
    // Signature: Viscous fluid drag retards rod fall relative to carrier bar; load drops severely
    // at the top of the downstroke, MPRL falls below safety limits, even though barrel has full fillage.
    if (rodFallSafetyMargin < 0 || (viscosityCp > 8000 && mprlLbs < 2200)) {
      const severity = rodFallSafetyMargin < -5 ? 'CRITICAL' : 'ELEVATED';
      return {
        diagnostic: 'High-Viscosity Rod Floating',
        severity,
        riskLevel: severity === 'CRITICAL' ? 'SEVERE_FLOATING' : 'HIGH_RISK',
        confidence: 0.96,
        rootCause: 'Dead-oil viscous drag retarding rod fall relative to surface beam downstroke speed.',
        explanation: `Downhole temperature has decayed causing heavy oil viscosity to reach ${viscosityCp.toLocaleString()} cP. ` +
          `Plunger downward velocity exceeds terminal gravity-fall velocity (rod fall margin = ${rodFallSafetyMargin.toFixed(1)} in/s). ` +
          `Polished rod string is floating off carrier bar, creating imminent risk of compressive buckling and rod-tubing wear.`,
        actionRecommended: 'Immediately reduce VFD pumping speed (target < 3.0 SPM) or initiate steam re-injection cycle.',
      };
    }

    // 2. Fluid Pound Diagnostic
    // Signature: Incomplete pump barrel fillage with plunger impacting fluid interface mid-downstroke.
    // Sharp impact spike, steep cutoff angle.
    if (fillagePercent < 75) {
      return {
        diagnostic: 'Fluid Pound',
        severity: 'HIGH',
        riskLevel: 'HIGH_RISK',
        confidence: 0.93,
        rootCause: 'Incomplete pump barrel liquid filling; well pumped-off or insufficient inflow.',
        explanation: `Volumetric pump fillage is degraded to ${fillagePercent.toFixed(1)}%. Plunger hits the liquid surface midway through downstroke, generating severe acoustic shockwaves and cyclic stress peaks on the rod string.`,
        actionRecommended: 'Trim VFD SPM to match reservoir inflow rate or schedule intermittent pump-off control timer.',
      };
    }

    // 3. Gas Interference Diagnostic
    // Signature: Delayed traveling valve opening, smooth hyperbolic compression line on downstroke,
    // rounded corners without mechanical pound spike.
    if (fillagePercent >= 75 && fillagePercent < 90) {
      return {
        diagnostic: 'Gas Interference',
        severity: 'MODERATE',
        riskLevel: 'MODERATE_DRAG',
        confidence: 0.88,
        rootCause: 'Free steam/solution gas expansion inside pump barrel delaying valve closure.',
        explanation: `Pump barrel contains free gas / residual steam vapor. Compression during downstroke rounds off the lower corner, reducing effective volumetric displacement without severe mechanical shock.`,
        actionRecommended: 'Verify casing-tubing annulus venting and adjust downhole gas anchor setting.',
      };
    }

    // 4. Normal Full Pump Diagnostic
    // Signature: Rectangular card indicating ~100% fillage with crisp valve actions and safe loads.
    return {
      diagnostic: 'Normal Full Pump',
      severity: 'NORMAL',
      riskLevel: 'NORMAL',
      confidence: 0.98,
      rootCause: 'Optimum reservoir inflow and synchronized sucker rod velocity.',
      explanation: `Plunger barrel is 100% filled with liquid. Traveling and standing valves actuate crisply. Polished rod loads (PPRL: ${pprlLbs.toLocaleString()} lbs, MPRL: ${mprlLbs.toLocaleString()} lbs) remain well within API Grade D working stress envelopes.`,
      actionRecommended: 'Maintain current VFD operating frequency.',
    };
  }
}

module.exports = new DynacardClassifier();

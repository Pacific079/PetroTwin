/**
 * Heavy Oil Viscosity-Mobility & Inflow Performance Relationship (IPR) Engine
 * Calibrated specifically for Baghewala Field Jodhpur Sandstone 16° API Heavy Crude
 *
 * Modified Walther Equation:
 * log10(log10(nu + 0.7)) = A - B * log10(T + 273.15)
 *
 * Viscosity Benchmarks (Baghewala):
 * - 45 °C: ~24,000 cP
 * - 50 °C: ~12,000 cP
 * - 65 °C: ~1,200 cP
 * - 120 °C: ~45-50 cP
 * - >180 °C: < 15 cP
 */

class ViscosityEngine {
  constructor() {
    this.apiGravity = 16.0;
    // Specific gravity of 16 API crude
    this.specificGravity = 141.5 / (131.5 + this.apiGravity); // ~0.9593
    this.densityKgM3 = this.specificGravity * 1000;

    // Walther parameters calibrated to Baghewala experimental PVT data
    this.waltherA = 11.982;
    this.waltherB = 4.531;

    // Reservoir formation flow properties
    this.permeabilityMd = 1200; // High permeability Jodhpur sandstone
    this.netPayThicknessM = 15;
    this.drainageRadiusM = 150;
    this.wellboreRadiusM = 0.108; // 8.5" wellbore
    this.skinFactor = 1.5;
    this.reservoirPressurePsi = 1450; // Native pressure at 1,150 m depth
    this.flowingBhpPsi = 350; // Standard pumped-off bottomhole flowing pressure
  }

  /**
   * Convert dynamic viscosity (cP) to kinematic viscosity (cSt)
   */
  dynamicToKinematic(viscosityCp) {
    return viscosityCp / this.specificGravity;
  }

  /**
   * Convert kinematic viscosity (cSt) to dynamic viscosity (cP)
   */
  kinematicToDynamic(viscosityCSt) {
    return viscosityCSt * this.specificGravity;
  }

  /**
   * Compute dead oil viscosity (cP) at a given temperature (°C) using Walther equation
   * @param {number} tempC - Temperature in Celsius
   * @returns {number} Dynamic dead oil viscosity in centipoise (cP)
   */
  calculateViscosityCp(tempC) {
    const kelvin = Math.max(273.15 + 30, tempC + 273.15);
    const logK = Math.log10(kelvin);
    const logLogVal = this.waltherA - this.waltherB * logK;

    // Inverse Walther: nu = 10^(10^(logLogVal)) - 0.7
    const innerExp = Math.pow(10, logLogVal);
    const kinematicViscCSt = Math.max(1.0, Math.pow(10, innerExp) - 0.7);
    const dynamicViscCp = kinematicViscCSt * this.specificGravity;

    // Bound dynamically within realistic petroleum physics bounds for Baghewala
    return Math.max(8.0, Math.min(85000.0, dynamicViscCp));
  }

  /**
   * Calculate effective oil mobility lambda_o = k * k_ro / mu(T)
   * @param {number} viscosityCp - Dynamic viscosity in cP
   * @param {number} waterCutPercent - Water cut (0-100)
   * @returns {number} Effective mobility (mD / cP)
   */
  calculateOilMobility(viscosityCp, waterCutPercent = 35) {
    // Relative permeability based on Corey exponent for heavy oil
    const Sw = Math.min(0.85, Math.max(0.20, waterCutPercent / 100));
    const kro = Math.max(0.05, Math.pow((1 - Sw) / (1 - 0.20), 2.2));
    const effectivePermeability = this.permeabilityMd * kro;
    const mobility = effectivePermeability / viscosityCp; // mD / cP
    return mobility;
  }

  /**
   * Vogel Composite Inflow Performance Relationship (IPR)
   * Coupled with temperature-dependent heavy oil mobility
   *
   * @param {number} tempC - Reservoir temperature (°C)
   * @param {number} pWfPsi - Bottom-hole flowing pressure (psi)
   * @returns {object} Inflow rates and productivity metrics
   */
  calculateInflow(tempC, pWfPsi = 350) {
    const viscosityCp = this.calculateViscosityCp(tempC);
    const mobility = this.calculateOilMobility(viscosityCp, 35);

    // Productivity Index J (STB/day/psi) based on radial Darcy flow
    // J = (2 * pi * k * h) / (mu * ln(re/rw) + S)
    const lnReRw = Math.log(this.drainageRadiusM / this.wellboreRadiusM);
    // Unit conversion constant for field units (bbl/day/psi)
    const darcyFactor = 0.00708 * (this.netPayThicknessM * 3.28084); // h in ft
    const J_base = (darcyFactor * (this.permeabilityMd * 0.75)) / (lnReRw + this.skinFactor);
    // Modulate J inversely with viscosity relative to 100 cP reference
    const J_thermal = (J_base * (100.0 / viscosityCp));

    // Maximum theoretical inflow at zero backpressure (Pwf = 0)
    const qMax = (J_thermal * this.reservoirPressurePsi) / 1.8;

    // Vogel equation for two-phase / solution gas drive flow:
    // q / qMax = 1 - 0.2 * (Pwf / Pr) - 0.8 * (Pwf / Pr)^2
    const pressureRatio = Math.min(1.0, Math.max(0.0, pWfPsi / this.reservoirPressurePsi));
    const vogelFraction = 1.0 - 0.2 * pressureRatio - 0.8 * Math.pow(pressureRatio, 2);

    const grossRateBpd = Math.max(15, qMax * vogelFraction);
    // Heavy oil water cut typically 25% at hot cycle start, climbing to 55% as steam condenses
    const waterCut = Math.min(65, 25 + (120 - Math.min(120, tempC)) * 0.45);
    const oilRateBopd = grossRateBpd * (1 - waterCut / 100);

    return {
      tempC,
      viscosityCp: Number(viscosityCp.toFixed(1)),
      mobility: Number(mobility.toFixed(4)),
      productivityIndex: Number(J_thermal.toFixed(4)),
      grossRateBpd: Number(grossRateBpd.toFixed(1)),
      oilRateBopd: Number(oilRateBopd.toFixed(1)),
      waterCutPercent: Number(waterCut.toFixed(1)),
    };
  }
}

module.exports = new ViscosityEngine();

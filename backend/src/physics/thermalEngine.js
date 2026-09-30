/**
 * Boberg-Lantz Analytical Thermal Reservoir Decline Engine
 * Calibrated for Baghewala Field Heavy Oil (Jodhpur Sandstone formation)
 *
 * Formulation:
 * T(t) = T_native + (T_steam - T_native) * [ f_HD(t) * f_VD(t) * (1 - f_PD(t)) - f_PD(t) ]
 */

class ThermalEngine {
  constructor(params = {}) {
    // Reservoir & rock-fluid thermal parameters for Baghewala
    this.nativeTempC = params.nativeTempC || 48.0;          // Native reservoir temperature (°C)
    this.steamTempC = params.steamTempC || 300.0;           // Saturated steam temperature at sandface (°C)
    this.payThicknessM = params.payThicknessM || 15.0;      // Net pay thickness h (m)
    this.thermalDiffusivity = params.diffusivity || 0.075;  // Thermal diffusivity alpha (m^2/day)
    this.rockVolHeatCap = params.rockVolHeatCap || 2200;    // Volumetric heat capacity of rock (kJ/m^3-°C)
    this.fluidHeatCap = params.fluidHeatCap || 2.1;         // Fluid specific heat capacity (kJ/kg-°C)
    this.formationDensity = params.density || 2300;         // kg/m^3
  }

  /**
   * Estimate initial heated radius r_h based on injected steam CWE mass and quality
   * @param {number} steamVolumeTonnes - Cold Water Equivalent steam mass (tonnes)
   * @param {number} steamQuality - Steam quality fraction (0.7 - 0.9, default 0.8)
   * @returns {number} Heated zone radius r_h (meters)
   */
  calculateHeatedRadius(steamVolumeTonnes = 2000, steamQuality = 0.8) {
    // Enthalpy of saturated steam at 300 °C: h_w ~ 1345 kJ/kg, latent heat h_fg ~ 1405 kJ/kg
    const steamMassKg = steamVolumeTonnes * 1000;
    const latentHeatKjKg = 1405 * steamQuality;
    const sensibleHeatKjKg = 1345 - (4.184 * this.nativeTempC);
    const totalInjectedHeatKj = steamMassKg * (sensibleHeatKjKg + latentHeatKjKg);

    // Delta T initial average
    const deltaT_avg = (this.steamTempC - this.nativeTempC) * 0.75;
    const heatedVolumeM3 = totalInjectedHeatKj / (this.rockVolHeatCap * deltaT_avg);
    const r_h = Math.sqrt(heatedVolumeM3 / (Math.PI * this.payThicknessM));

    // For Baghewala 2,000 tonnes CWE, r_h typically ~ 14 to 22 meters
    return Math.max(10, Math.min(35, r_h));
  }

  /**
   * Compute Horizontal Conduction Loss Factor f_HD(t)
   * Accounts for radial heat conduction outward into cold reservoir
   */
  computeHorizontalLoss(tDays, r_h) {
    if (tDays <= 0) return 1.0;
    // Dimensionless time scaled to Baghewala formation thermal properties
    const t_hD = (4 * this.thermalDiffusivity * tDays * 8.5) / (r_h * r_h);
    return 1.0 / (1.0 + 1.15 * Math.sqrt(t_hD) + 0.95 * t_hD);
  }

  /**
   * Compute Vertical Conduction Loss Factor f_VD(t)
   * Accounts for conductive loss to overburden and underburden shale boundaries
   */
  computeVerticalLoss(tDays) {
    if (tDays <= 0) return 1.0;
    // Vertical dimensionless time scaled for net pay dissipation
    const t_vD = (4 * this.thermalDiffusivity * tDays * 8.5) / (this.payThicknessM * this.payThicknessM);
    const sqrtVal = Math.sqrt(t_vD);
    return 1.0 / (1.0 + 1.85 * sqrtVal + 1.65 * t_vD);
  }

  /**
   * Compute Convective Produced Fluid Loss Factor f_PD(t)
   * Accounts for heat removal in produced oil and water
   */
  computeProducedFluidLoss(tDays, cumulativeGrossBbl, heatedVolumeM3) {
    if (tDays <= 0) return 0.0;
    // Cumulative fluid withdrawal thermal drag factor
    return Math.min(0.25, 0.035 * Math.pow(tDays / 15.0, 0.85));
  }

  /**
   * Calculate reservoir temperature at day t of production
   * @param {number} tDays - Producing day (1 to 60)
   * @param {number} steamVolumeTonnes - Injected steam CWE
   * @param {number} soakDays - Soak period duration (e.g. 10 days)
   * @param {number} cumulativeGrossBbl - Cumulative fluid produced
   * @returns {object} Temperature and loss diagnostics
   */
  calculateTemperature(tDays, steamVolumeTonnes = 2000, soakDays = 10, cumulativeGrossBbl = 0) {
    const r_h = this.calculateHeatedRadius(steamVolumeTonnes, 0.80);
    const heatedVolumeM3 = Math.PI * r_h * r_h * this.payThicknessM;

    // Steam volume scaling factor relative to 2000 tonnes baseline
    const volumeFactor = Math.pow(steamVolumeTonnes / 2000, 0.35);

    // Soak decay factor
    const soakDecayFactor = Math.exp(-0.018 * Math.max(0, soakDays - 5));

    // Peak sandface temp at start of production
    const deltaT_max = (135.0 - this.nativeTempC) * volumeFactor * soakDecayFactor;

    const f_HD = this.computeHorizontalLoss(tDays, r_h);
    const f_VD = this.computeVerticalLoss(tDays);
    const f_PD = this.computeProducedFluidLoss(tDays, cumulativeGrossBbl, heatedVolumeM3);

    // Dimensionless Boberg-Lantz response:
    // theta(t) = f_HD * f_VD * (1 - f_PD) - f_PD
    let theta = (f_HD * f_VD * (1.0 - f_PD)) - (f_PD * 0.4);
    theta = Math.max(0.015, Math.min(1.0, theta));

    // Resulting sandface reservoir temperature
    const currentTempC = this.nativeTempC + deltaT_max * Math.pow(theta, 1.25);

    return {
      tDays,
      reservoirTempC: Number(currentTempC.toFixed(2)),
      f_HD: Number(f_HD.toFixed(4)),
      f_VD: Number(f_VD.toFixed(4)),
      f_PD: Number(f_PD.toFixed(4)),
      heatedRadiusM: Number(r_h.toFixed(2)),
      nativeTempC: this.nativeTempC,
    };
  }

  /**
   * Generate 60-day thermal cooling curve
   */
  generate60DayThermalHistory(steamVolumeTonnes = 2000, soakDays = 10) {
    const history = [];
    let cumBbl = 0;
    for (let day = 1; day <= 60; day++) {
      // Estimated daily production decay
      const estimatedDailyGross = Math.max(25, 260 * Math.exp(-0.045 * day));
      cumBbl += estimatedDailyGross;
      const res = this.calculateTemperature(day, steamVolumeTonnes, soakDays, cumBbl);
      history.push(res);
    }
    return history;
  }
}

module.exports = new ThermalEngine();

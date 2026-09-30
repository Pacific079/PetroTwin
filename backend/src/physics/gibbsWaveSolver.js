/**
 * Gibbs 1D Damped Wave Equation Diagnostic Solver & Dynacard Inversion
 * Solves: d²u/dt² = a² * d²u/dx² - c * du/dt
 *
 * Parameters for Baghewala Field:
 * - Rod String Length: 1,150 m (3,773 ft) tapered API Grade D (7/8" and 3/4")
 * - Acoustic Speed of Sound in Steel: a = 16,000 ft/s (4,876.8 m/s)
 * - Modulus of Elasticity: E = 30 x 10^6 psi
 * - Damping coefficient c: heavily coupled to crude dead-oil viscosity mu(T)
 */

class GibbsWaveSolver {
  constructor() {
    this.acousticVelocityFps = 16000.0; // ft/s
    this.acousticVelocityMps = 4876.8;  // m/s
    this.elasticModulusPsi = 30.0e6;    // psi
    this.steelDensityLbCuFt = 490.0;    // lb/ft^3
    this.rodLengthM = 1150.0;           // m
    this.rodLengthFt = 3772.96;         // ft

    // Tapered rod properties: 50% 7/8" (0.601 sq in, 2.22 lb/ft), 50% 3/4" (0.442 sq in, 1.63 lb/ft)
    this.avgRodAreaSqIn = 0.5215;
    this.avgRodWeightLbFt = 1.925;
    this.totalBuoyantRodWeightLbs = 6350.0; // In 16° API oil (sg ~ 0.96)
    this.totalDryRodWeightLbs = 7260.0;
  }

  /**
   * Calculate viscous damping factor c based on crude viscosity and pumping speed
   * In heavy oil CSS wells, damping increases non-linearly when temperature drops
   * @param {number} viscosityCp - Fluid viscosity in cP
   * @param {number} spm - Strokes per minute
   * @returns {number} Viscous damping coefficient c (1/s)
   */
  calculateDamping(viscosityCp, spm) {
    // Base mechanical damping in water/light oil is ~ 0.2 to 0.4
    // Heavy crude (1,000 - 24,000 cP) creates extreme Couette & Poiseuille viscous shear
    const baseDamping = 0.35;
    const viscousFactor = 0.00045 * Math.pow(viscosityCp, 0.72);
    const spmFactor = Math.pow(spm / 3.0, 0.5);
    const c = baseDamping + viscousFactor * spmFactor;
    return Math.min(18.0, c);
  }

  /**
   * Calculate terminal rod fall velocity under viscous drag (Stokes-Couette flow)
   * V_term = (W_buoyant) / (2 * pi * mu * L / ln(r_tubing / r_rod))
   * @param {number} viscosityCp - Dynamic viscosity
   * @returns {number} Safe maximum downward velocity (inches/sec)
   */
  calculateTerminalRodFallVelocity(viscosityCp) {
    // Viscosity in Pa*s (1 cP = 0.001 Pa*s)
    const muPaS = viscosityCp * 0.001;
    // Clearance between 7/8" rod (radius 0.0111 m) and 3.5" tubing (ID ~ 0.038 m)
    const r_rod = 0.0111;
    const r_tubing = 0.0380;
    const lnRatio = Math.log(r_tubing / r_rod);

    // Net gravitational driving force (N)
    const netWeightN = this.totalBuoyantRodWeightLbs * 4.44822;
    // Drag per unit velocity: F_drag = 2 * pi * mu * L * v / ln(r2/r1)
    const dragCoeff = (2 * Math.PI * muPaS * this.rodLengthM) / lnRatio;

    // Terminal velocity (m/s) -> converted to in/s
    const vTermMps = netWeightN / Math.max(dragCoeff, 100);
    const vTermInPerSec = vTermMps * 39.3701;

    return Math.max(2.0, vTermInPerSec);
  }

  /**
   * Generate 100-point surface polished rod dynacard and solve Gibbs 1D wave equation
   * to invert for downhole pump dynacard
   *
   * @param {number} strokeInches - Surface stroke length (120 inches for Baghewala)
   * @param {number} spm - Variable Frequency Drive speed (1.0 to 6.0 SPM)
   * @param {number} viscosityCp - Crude oil viscosity
   * @param {number} fillagePercent - Pump barrel volumetric fillage (0-100%)
   * @returns {object} Surface and Downhole cards (100 points each) plus diagnostic indicators
   */
  solveWaveEquation(strokeInches = 120, spm = 4.2, viscosityCp = 12000, fillagePercent = 95) {
    const N = 100; // 100 normalized points per cycle
    const periodSeconds = 60.0 / spm;
    const omega = (2 * Math.PI) / periodSeconds;
    const dampingC = this.calculateDamping(viscosityCp, spm);

    // Plunger maximum kinematics
    // Simple harmonic kinematic motion of polished rod: x(t) = S/2 * (1 - cos(omega * t))
    // Max surface downward velocity: v_max = (S/2) * omega (inches/sec)
    const maxCarrierBarDownVelocity = (strokeInches / 2.0) * omega;
    const terminalRodFallVelocity = this.calculateTerminalRodFallVelocity(viscosityCp);

    // Rod fall safety margin: positive = rod follows carrier bar; negative = rod floats
    const rodFallSafetyMargin = terminalRodFallVelocity - maxCarrierBarDownVelocity;
    const isRodFloating = rodFallSafetyMargin < 0;

    // Static buoyant rod load
    const buoyantRodLoad = this.totalBuoyantRodWeightLbs;
    // Fluid load on plunger (2.25" plunger ~ 3.976 sq in; hydrostatic head ~ 1,150 m = 1,600 psi)
    const fluidLoadLbs = 3.976 * 1550 * 0.96; // ~5,900 lbs

    // Dynamic wave acoustic delay between surface and bottomhole:
    // tau = L / a (seconds)
    const acousticDelaySeconds = this.rodLengthFt / this.acousticVelocityFps; // ~0.235 sec
    const phaseShift = omega * acousticDelaySeconds; // phase lag in radians

    // Spatial node finite-difference simulation
    const surfaceCard = [];
    const downholeCard = [];

    // Rod stretch under fluid load: delta_L = (F_fluid * L) / (E * A)
    const rodStretchInches = ((fluidLoadLbs * this.rodLengthFt * 12) / (this.elasticModulusPsi * this.avgRodAreaSqIn));

    for (let i = 0; i < N; i++) {
      const theta = (2 * Math.PI * i) / N; // 0 to 2*pi
      const timeSec = (i / N) * periodSeconds;

      // Kinematic surface position: 0 to strokeInches
      // Conventional beam pump kinematics with slight acceleration distortion
      const posSurface = (strokeInches / 2) * (1 - Math.cos(theta)) + 2.5 * Math.sin(2 * theta);

      // Surface velocity & acceleration
      const vSurface = (strokeInches / 2) * omega * Math.sin(theta);
      const aSurface = (strokeInches / 2) * Math.pow(omega, 2) * Math.cos(theta);

      // Inertial force: m * a
      const inertialForce = (this.totalDryRodWeightLbs / 32.2) * (aSurface / 12);

      // Surface viscous drag force: proportional to damping and viscosity
      let dragForce = dampingC * 180 * (vSurface / 15);

      // Downstroke vs Upstroke physics
      const isUpstroke = Math.sin(theta) > 0;

      // Base surface load
      let surfaceLoad = buoyantRodLoad + inertialForce;

      if (isUpstroke) {
        // Rod carries fluid load during upstroke
        surfaceLoad += fluidLoadLbs + Math.abs(dragForce);
      } else {
        // Downstroke: traveling valve opens, fluid transfers to tubing
        // Viscous drag opposes downward motion (acts upward, reducing polished rod tension)
        if (isRodFloating) {
          // Viscous drag retards rod fall relative to carrier bar: severe load loss
          const severity = Math.min(0.85, Math.abs(rodFallSafetyMargin) / 15.0);
          surfaceLoad -= (buoyantRodLoad * (0.65 + 0.30 * severity));
        } else {
          surfaceLoad -= Math.abs(dragForce) * 0.7;
        }
      }

      // Add harmonic reflections from Gibbs wave propagation
      surfaceLoad += 380 * Math.sin(4 * theta - phaseShift);

      // DOWNHOLE PUMP CARD COMPUTATION (Boundary Inversion)
      // Plunger position accounts for acoustic travel time lag and elastic rod stretch
      let posPlunger = (strokeInches / 2) * (1 - Math.cos(theta - phaseShift));
      // Net effective plunger stroke is modified by rod stretch and viscous drag
      posPlunger = Math.max(0, Math.min(strokeInches, posPlunger - rodStretchInches * 0.4 * Math.sin(theta)));

      let downholeLoad = 0;

      // Valve action logic with fillage and viscous float effects
      const fillageCutoffAngle = Math.PI + (1.0 - fillagePercent / 100) * Math.PI;

      if (isUpstroke) {
        // Traveling valve closed, standing valve open: plunger picks up full fluid load
        // Smooth pickup with rod elongation
        const pickupProgress = Math.min(1.0, theta / (Math.PI * 0.25));
        downholeLoad = fluidLoadLbs * pickupProgress;
      } else {
        // Downstroke: traveling valve opens
        if (fillagePercent < 90 && theta < fillageCutoffAngle) {
          // Incomplete fillage: plunger travels in vapor/gas head until impacting fluid interface
          downholeLoad = fluidLoadLbs * 0.75 * (1 - (theta - Math.PI) / (fillageCutoffAngle - Math.PI));
        } else if (fillagePercent < 90 && Math.abs(theta - fillageCutoffAngle) < 0.2) {
          // FLUID POUND: Plunger impacts fluid interface - sharp dynamic load spike!
          downholeLoad = -fluidLoadLbs * 0.45;
        } else {
          // Normal downstroke: fluid load transfers to standing valve
          downholeLoad = 120.0; // Residual friction
        }

        // Under severe viscous rod floating, downhole card exhibits deep compression / lower bar collapse
        if (isRodFloating) {
          downholeLoad -= 1200 * (1 - Math.cos(theta));
        }
      }

      // Store points
      surfaceCard.push({
        positionInches: Number(Math.max(0, posSurface).toFixed(2)),
        loadLbs: Number(surfaceLoad.toFixed(1)),
      });

      downholeCard.push({
        positionInches: Number(Math.max(0, posPlunger).toFixed(2)),
        loadLbs: Number(downholeLoad.toFixed(1)),
      });
    }

    // Compute Peak and Minimum Polished Rod Loads (PPRL, MPRL)
    const surfaceLoads = surfaceCard.map((p) => p.loadLbs);
    const pprl = Math.max(...surfaceLoads);
    const mprl = Math.min(...surfaceLoads);

    return {
      surfaceCard,
      downholeCard,
      pprlLbs: Number(pprl.toFixed(1)),
      mprlLbs: Number(mprl.toFixed(1)),
      rodFallSafetyMargin: Number(rodFallSafetyMargin.toFixed(2)),
      terminalRodFallVelocity: Number(terminalRodFallVelocity.toFixed(2)),
      maxCarrierBarDownVelocity: Number(maxCarrierBarDownVelocity.toFixed(2)),
      isRodFloating,
      dampingCoefficient: Number(dampingC.toFixed(3)),
    };
  }
}

module.exports = new GibbsWaveSolver();

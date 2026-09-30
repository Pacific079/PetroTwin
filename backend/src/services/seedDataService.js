/**
 * Enhanced Demonstration Dataset Generation Service
 * Seeds calibrated 60-day CSS cycle data and full Upstream Petroleum ERP Suite
 * for Baghewala Field Jodhpur Sandstone (Oil India Limited)
 */

const Well = require('../models/Well');
const Telemetry = require('../models/Telemetry');
const Dynacard = require('../models/Dynacard');
const AuditLog = require('../models/AuditLog');
const WorkOrder = require('../models/WorkOrder');
const Inventory = require('../models/Inventory');
const TankBattery = require('../models/TankBattery');
const SteamBoiler = require('../models/SteamBoiler');
const FinancialLedger = require('../models/FinancialLedger');
const simulationService = require('./simulationService');

const DEMO_LABEL = '[DEMO / SIMULATED DATASET: CALIBRATED TO BAGHEWALA JODHPUR SANDSTONE]';

const seedDatabase = async () => {
  try {
    const existingWell = await Well.findOne({ wellId: 'BAGH-104' });
    if (existingWell) {
      console.log('[SEED] Database already contains initial well data. Ensuring ERP records are seeded...');
      await seedErpModules();
      return;
    }

    console.log('[SEED] Initializing full Baghewala Field Upstream ERP demonstration dataset...');

    // 1. Seed Multi-Well Portfolio
    const wells = [
      {
        wellId: 'BAGH-101',
        field: 'Baghewala (Western Rajasthan Basin)',
        operator: 'Oil India Limited (OIL)',
        formation: 'Jodhpur Sandstone',
        reservoirDepthMeters: 1140,
        nativeReservoirTempC: 48,
        apiGravity: 15.8,
        activeCssCycle: 4,
        currentProducingDay: 18,
        currentSpm: 4.8,
        status: 'PRODUCING',
      },
      {
        wellId: 'BAGH-102',
        field: 'Baghewala (Western Rajasthan Basin)',
        operator: 'Oil India Limited (OIL)',
        formation: 'Jodhpur Sandstone',
        reservoirDepthMeters: 1155,
        nativeReservoirTempC: 48,
        apiGravity: 16.2,
        activeCssCycle: 3,
        currentProducingDay: 54,
        currentSpm: 2.2,
        status: 'PRODUCING',
      },
      {
        wellId: 'BAGH-104', // The Primary Digital Twin Demonstration Well
        field: 'Baghewala (Western Rajasthan Basin)',
        operator: 'Oil India Limited (OIL)',
        formation: 'Jodhpur Sandstone (Cambrian heavy oil play)',
        reservoirDepthMeters: 1150,
        nativeReservoirTempC: 48,
        apiGravity: 16.0,
        permeabilityMd: 1200,
        payThicknessMeters: 15,
        drainageRadiusMeters: 150,
        wellboreRadiusMeters: 0.108,
        casingDiameterInches: 7.0,
        tubingDiameterInches: 3.5,
        pumpPlungerDiameterInches: 2.25,
        rodTaperString: [
          {
            taperNumber: 1,
            diameterInch: 0.875,
            lengthMeters: 575,
            grade: 'API Grade D',
            weightLbFt: 2.22,
            rodAreaSqIn: 0.601,
          },
          {
            taperNumber: 2,
            diameterInch: 0.75,
            lengthMeters: 575,
            grade: 'API Grade D',
            weightLbFt: 1.63,
            rodAreaSqIn: 0.442,
          },
        ],
        surfaceUnit: {
          type: 'Conventional Beam Pump (C-640D-305-120)',
          vfdEquipped: true,
          strokeLengthInches: 120,
          minSpm: 1.0,
          maxSpm: 6.0,
          gearboxRatingInLbs: 640000,
          structureRatingLbs: 30500,
        },
        steamBaseline: {
          qualityPercent: 80,
          steamVolumeTonnes: 2000,
          steamTemperatureC: 310,
          soakDays: 10,
          cycleDurationDays: 60,
        },
        activeCssCycle: 3,
        currentProducingDay: 38,
        currentSpm: 4.2,
        status: 'PRODUCING',
      },
      {
        wellId: 'BAGH-108',
        field: 'Baghewala (Western Rajasthan Basin)',
        operator: 'Oil India Limited (OIL)',
        formation: 'Jodhpur Sandstone',
        reservoirDepthMeters: 1162,
        nativeReservoirTempC: 48,
        apiGravity: 16.1,
        activeCssCycle: 3,
        currentProducingDay: 0,
        currentSpm: 0.0,
        status: 'STEAM_INJECTION', // Actively receiving steam from OTSG-01
      },
      {
        wellId: 'BAGH-112',
        field: 'Baghewala (Western Rajasthan Basin)',
        operator: 'Oil India Limited (OIL)',
        formation: 'Jodhpur Sandstone',
        reservoirDepthMeters: 1148,
        nativeReservoirTempC: 48,
        apiGravity: 15.9,
        activeCssCycle: 2,
        currentProducingDay: 0,
        currentSpm: 0.0,
        status: 'SOAKING', // 10-day heat diffusion soak phase
      },
    ];
    await Well.insertMany(wells);

    // 2. Generate 60 Days of Telemetry for BAGH-104
    const telemetryDocs = [];
    let cumulativeOil = 0;
    const baseSpm = 4.2;

    for (let day = 1; day <= 60; day++) {
      const sim = simulationService.runScenario({
        spm: baseSpm,
        steamVolumeTonnes: 2000,
        soakDays: 10,
        producingDay: day,
      });

      cumulativeOil += sim.oilRateBopd;
      const cumSteam = (2000 / 60) * day;
      const cumulativeSor = cumulativeOil > 0 ? cumSteam / cumulativeOil : 0;

      telemetryDocs.push({
        wellId: 'BAGH-104',
        cycle: 3,
        day,
        reservoirTempC: sim.reservoirTempC,
        deadOilViscosityCp: sim.viscosityCp,
        oilRateBopd: sim.oilRateBopd,
        grossRateBpd: sim.grossRateBpd,
        waterCutPercent: sim.waterCutPercent,
        spm: baseSpm,
        cumulativeOilBbl: Number(cumulativeOil.toFixed(1)),
        cweSteamTonnes: Number(cumSteam.toFixed(1)),
        instantaneousSor: sim.instantaneousSor,
        cumulativeSor: Number(cumulativeSor.toFixed(3)),
        powerConsumptionKwhBbl: sim.kwhPerBbl,
        pumpFillagePercent: sim.pumpFillagePercent,
        pprlLbs: sim.pprlLbs,
        mprlLbs: sim.mprlLbs,
        rodFallSafetyMargin: sim.rodFallSafetyMargin,
        rodFloatingRisk: sim.diagnostic.riskLevel,
        diagnosticLabel: sim.diagnostic.diagnostic,
        timestamp: new Date(Date.now() - (60 - day) * 86400000),
      });
    }
    await Telemetry.insertMany(telemetryDocs);

    // 3. Current Day 38 Dynacard Document for BAGH-104
    const currentSim = simulationService.runScenario({
      spm: 4.2,
      steamVolumeTonnes: 2000,
      soakDays: 10,
      producingDay: 38,
    });

    const currentDynacard = new Dynacard({
      wellId: 'BAGH-104',
      day: 38,
      spm: 4.2,
      viscosityCp: currentSim.viscosityCp,
      temperatureC: currentSim.reservoirTempC,
      surfaceCard: currentSim.surfaceCard,
      downholeCard: currentSim.downholeCard,
      pprlLbs: currentSim.pprlLbs,
      mprlLbs: currentSim.mprlLbs,
      pumpStrokeInches: 120,
      dampingFactor: currentSim.dampingCoefficient,
      diagnostic: currentSim.diagnostic.diagnostic,
      diagnosticConfidence: currentSim.diagnostic.confidence,
      diagnosticDetails: currentSim.diagnostic.explanation,
      isCurrent: true,
    });
    await currentDynacard.save();

    // 4. Initial Audit Log
    const auditLogs = [
      {
        action: 'ACCEPT',
        wellId: 'BAGH-104',
        previousSpm: 4.8,
        targetSpm: 4.2,
        operatorName: 'A. Sharma (OIL Chief Production Eng)',
        notes: 'CSS Cycle 3 Day 25: Accepted AI recommendation to step down SPM from 4.8 to 4.2 as reservoir cooled below 80 °C.',
        recommendationGiven: {
          recommendedSpm: 4.2,
          physicalReason: 'Viscosity increase to 750 cP; prevent polished rod shock.',
          confidence: 0.94,
          expectedPowerDeltaKwh: -2.3,
          rodFloatingRiskAvoided: true,
        },
        resultingStatus: 'OPTIMAL_TRACKING',
        timestamp: new Date(Date.now() - 13 * 86400000),
      },
    ];
    await AuditLog.insertMany(auditLogs);

    // 5. Seed ERP Specific Modules
    await seedErpModules();

    console.log('[SEED] Full Baghewala Upstream ERP demonstration dataset seeded successfully!');
  } catch (err) {
    console.error('[SEED] Error seeding dataset:', err.message);
  }
};

/**
 * Seed ERP Submodules (Work Orders, Inventory, Tank Battery, Boilers, Financials)
 */
async function seedErpModules() {
  // Ensure all portfolio wells exist
  const portfolioWells = [
    {
      wellId: 'BAGH-101',
      field: 'Baghewala (Western Rajasthan Basin)',
      operator: 'Oil India Limited (OIL)',
      formation: 'Jodhpur Sandstone',
      reservoirDepthMeters: 1140,
      nativeReservoirTempC: 48,
      apiGravity: 15.8,
      activeCssCycle: 4,
      currentProducingDay: 18,
      currentSpm: 4.8,
      status: 'PRODUCING',
    },
    {
      wellId: 'BAGH-102',
      field: 'Baghewala (Western Rajasthan Basin)',
      operator: 'Oil India Limited (OIL)',
      formation: 'Jodhpur Sandstone',
      reservoirDepthMeters: 1155,
      nativeReservoirTempC: 48,
      apiGravity: 16.2,
      activeCssCycle: 3,
      currentProducingDay: 54,
      currentSpm: 2.2,
      status: 'PRODUCING',
    },
    {
      wellId: 'BAGH-108',
      field: 'Baghewala (Western Rajasthan Basin)',
      operator: 'Oil India Limited (OIL)',
      formation: 'Jodhpur Sandstone',
      reservoirDepthMeters: 1162,
      nativeReservoirTempC: 48,
      apiGravity: 16.1,
      activeCssCycle: 3,
      currentProducingDay: 0,
      currentSpm: 0.0,
      status: 'STEAM_INJECTION',
    },
    {
      wellId: 'BAGH-112',
      field: 'Baghewala (Western Rajasthan Basin)',
      operator: 'Oil India Limited (OIL)',
      formation: 'Jodhpur Sandstone',
      reservoirDepthMeters: 1148,
      nativeReservoirTempC: 48,
      apiGravity: 15.9,
      activeCssCycle: 2,
      currentProducingDay: 0,
      currentSpm: 0.0,
      status: 'SOAKING',
    },
  ];

  for (const pw of portfolioWells) {
    const exists = await Well.findOne({ wellId: pw.wellId });
    if (!exists) {
      await Well.create(pw);
    }
  }

  // 1. Work Orders (CMMS)
  const existingWo = await WorkOrder.countDocuments();
  if (existingWo === 0) {
    await WorkOrder.insertMany([
      {
        orderNumber: 'WO-2026-4089',
        wellId: 'BAGH-104',
        title: 'Viscous Rod Drag Mitigation & VFD Inverter Calibration',
        description: 'Automated alert from Gibbs wave diagnostic: downhole temperature decay to 53.4°C caused 7,646 cP dead-oil drag. Verify VFD frequency modulation to 2.75 SPM to prevent compressive rod buckling.',
        type: 'VFD_OPTIMIZATION',
        priority: 'CRITICAL',
        status: 'OPEN',
        assignedCrew: 'Well Surveillance & Automation Team',
        leadEngineer: 'A. Sharma (Senior Production Engineer)',
        partsRequired: [
          { partSku: 'SKU-VFD-INV-01', partName: 'ABB ACS880 VFD Control Card', quantity: 1, costInr: 35000 },
        ],
        estimatedCostInr: 35000,
        triggeredByDiagnostic: 'High-Viscosity Rod Floating',
        createdAt: new Date(),
      },
      {
        orderNumber: 'WO-2026-4082',
        wellId: 'BAGH-108',
        title: 'High-Pressure Steam Injection Manifold Seal Replacement',
        description: 'Scheduled thermal seal replacement on casing head and high-temperature steam packer prior to initiating 2,000 tonnes CWE injection.',
        type: 'STEAM_INSPECTION',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedCrew: 'Thermal Stimulation Crew B',
        leadEngineer: 'V. K. Meena (Thermal Specialist)',
        partsRequired: [
          { partSku: 'SKU-STM-SEAL-04', partName: 'Grafoil High-Temp Flange Gasket Set', quantity: 4, costInr: 18000 },
        ],
        estimatedCostInr: 28000,
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        orderNumber: 'WO-2026-4075',
        wellId: 'BAGH-101',
        title: 'Sucker Rod Guide & Polished Rod Stuffing Box Repacking',
        description: 'Routine 90-day preventative maintenance. Repack Teflon-impregnated stuffing box rings to prevent heavy crude weeping.',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assignedCrew: 'Wellhead Maintenance Gang 2',
        leadEngineer: 'D. Sen (Field Operations)',
        partsRequired: [
          { partSku: 'SKU-STF-BX-02', partName: 'Dura-Packing Cone Rings 1.5"', quantity: 2, costInr: 6500 },
        ],
        estimatedCostInr: 12000,
        createdAt: new Date(Date.now() - 8 * 86400000),
        resolvedAt: new Date(Date.now() - 6 * 86400000),
      },
    ]);
  }

  // 2. Inventory / Spare Parts Warehouse
  const existingInv = await Inventory.countDocuments();
  if (existingInv === 0) {
    await Inventory.insertMany([
      {
        sku: 'SKU-ROD-78-D',
        name: 'API Grade D Sucker Rod 7/8" x 25ft (Taper 1)',
        category: 'Sucker Rods & Guides',
        quantityOnHand: 145,
        unit: 'rods',
        minReorderLevel: 50,
        unitCostInr: 4200,
        status: 'IN_STOCK',
      },
      {
        sku: 'SKU-ROD-34-D',
        name: 'API Grade D Sucker Rod 3/4" x 25ft (Taper 2)',
        category: 'Sucker Rods & Guides',
        quantityOnHand: 180,
        unit: 'rods',
        minReorderLevel: 60,
        unitCostInr: 3600,
        status: 'IN_STOCK',
      },
      {
        sku: 'SKU-PUMP-225',
        name: 'API Heavy-Wall Subsurface Plunger Barrel (2-1/4" Bore)',
        category: 'Subsurface Pumps & Valves',
        quantityOnHand: 8,
        unit: 'assemblies',
        minReorderLevel: 5,
        unitCostInr: 85000,
        status: 'IN_STOCK',
      },
      {
        sku: 'SKU-VALVE-TRV',
        name: 'Tungsten Carbide Traveling & Standing Valve Ball/Seat Set',
        category: 'Subsurface Pumps & Valves',
        quantityOnHand: 14,
        unit: 'sets',
        minReorderLevel: 10,
        unitCostInr: 12500,
        status: 'IN_STOCK',
      },
      {
        sku: 'SKU-VFD-INV-01',
        name: 'ABB ACS880 Low Harmonic Heavy-Duty Drive Module 75kW',
        category: 'Surface Pumping Units & VFDs',
        quantityOnHand: 2,
        unit: 'units',
        minReorderLevel: 2,
        unitCostInr: 480000,
        status: 'LOW_STOCK',
      },
      {
        sku: 'SKU-CHEM-DEMUL',
        name: 'Nalco Heavy Crude Demulsifier / Viscosity Breaker Additive',
        category: 'Chemicals & Demulsifiers',
        quantityOnHand: 18,
        unit: 'drums (200L)',
        minReorderLevel: 12,
        unitCostInr: 28500,
        status: 'IN_STOCK',
      },
    ]);
  }

  // 3. Tank Battery & Dispatches
  const existingTb = await TankBattery.countDocuments();
  if (existingTb === 0) {
    await TankBattery.create({
      batteryId: 'BAGH-TB-01',
      name: 'Baghewala Central Production Gathering Station (GGS-1)',
      totalCapacityBbl: 15000,
      grossFluidStoredBbl: 9450,
      netOilStoredBbl: 6980,
      producedWaterBbl: 2470,
      avgBswPercent: 26.1,
      dailyGrossInflowBpd: 480,
      dailyNetOilBopd: 355,
      dispatches: [
        {
          manifestId: 'DISP-2026-0894',
          tankerRegNo: 'RJ-15-GB-4421',
          driverName: 'Mukesh Meena',
          transporter: 'Rajasthan Petroleum Logistics',
          volumeKl: 24.0,
          volumeBbl: 151.0,
          apiGravity: 16.1,
          bswPercent: 2.2,
          destination: 'Koyali Refinery (IOCL, Vadodara)',
          dispatchedAt: new Date(Date.now() - 4 * 3600000),
          status: 'IN_TRANSIT',
        },
        {
          manifestId: 'DISP-2026-0893',
          tankerRegNo: 'RJ-15-GC-1190',
          driverName: 'Harish Chander',
          transporter: 'Desert Oil Carriers Ltd',
          volumeKl: 24.0,
          volumeBbl: 151.0,
          apiGravity: 15.9,
          bswPercent: 2.5,
          destination: 'Mathura Refinery (IOCL)',
          dispatchedAt: new Date(Date.now() - 18 * 3600000),
          status: 'DELIVERED',
        },
        {
          manifestId: 'DISP-2026-0895',
          tankerRegNo: 'RJ-19-BA-8702',
          driverName: 'Jaswant Singh',
          transporter: 'Rajasthan Petroleum Logistics',
          volumeKl: 28.0,
          volumeBbl: 176.0,
          apiGravity: 16.0,
          bswPercent: 2.0,
          destination: 'Bhatinda Refinery (HMEL)',
          dispatchedAt: new Date(Date.now() + 2 * 3600000),
          status: 'SCHEDULED',
        },
      ],
    });
  }

  // 4. OTSG Steam Boilers
  const existingBoilers = await SteamBoiler.countDocuments();
  if (existingBoilers === 0) {
    await SteamBoiler.insertMany([
      {
        boilerId: 'OTSG-01',
        name: 'Thermotech 50 MMBtu/hr Once-Through Steam Generator #1',
        ratingMmBtuHr: 50,
        status: 'ONLINE_INJECTION',
        currentOutputTonnesDay: 395,
        steamQualityPercent: 81.2,
        operatingPressurePsi: 2180,
        steamTemperatureC: 312,
        feedwaterFlowM3Day: 435,
        fuelGasRateSm3Day: 29200,
        thermalEfficiencyPercent: 85.1,
        costPerTonneInr: 1840,
        assignedWellTarget: 'BAGH-108',
        cumulativeSteamDeliveredTonnes: 54200,
      },
      {
        boilerId: 'OTSG-02',
        name: 'Babcock-Borsig 40 MMBtu/hr Steam Generator #2',
        ratingMmBtuHr: 40,
        status: 'STANDBY',
        currentOutputTonnesDay: 0,
        steamQualityPercent: 80.0,
        operatingPressurePsi: 1950,
        steamTemperatureC: 305,
        feedwaterFlowM3Day: 0,
        fuelGasRateSm3Day: 1200,
        thermalEfficiencyPercent: 83.9,
        costPerTonneInr: 1910,
        assignedWellTarget: 'BAGH-104 (Cycle #4 Prep)',
        cumulativeSteamDeliveredTonnes: 41800,
      },
    ]);
  }

  // 5. Financial Ledger
  const existingFin = await FinancialLedger.countDocuments();
  if (existingFin === 0) {
    await FinancialLedger.create({
      field: 'Baghewala Heavy Oil Asset (Oil India Limited)',
      oilProductionBopd: 355,
      realizedPricePerBblInr: 4750,
      realizedPricePerBblUsd: 56.5,
      exchangeRateUsdInr: 84.1,
      costsPerBblInr: {
        steamGeneration: 1590,
        electricalLifting: 225,
        chemicalTreatment: 85,
        routineWellService: 180,
        fieldGgsOverhead: 120,
      },
      totalLiftingCostPerBblInr: 2200,
      netMarginPerBblInr: 2550,
      grossRevenueDayInr: 1686250,
      operatingExpenditureDayInr: 781000,
      netOperatingIncomeDayInr: 905250,
    });
  }
}

module.exports = { seedDatabase, DEMO_LABEL };

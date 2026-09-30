const mongoose = require('mongoose');

const SteamBoilerSchema = new mongoose.Schema({
  boilerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ratingMmBtuHr: { type: Number, default: 50 },
  status: {
    type: String,
    enum: ['ONLINE_INJECTION', 'STANDBY', 'MAINTENANCE', 'BLOWDOWN'],
    default: 'ONLINE_INJECTION',
  },
  currentOutputTonnesDay: { type: Number, default: 380 },
  steamQualityPercent: { type: Number, default: 80.5 },
  operatingPressurePsi: { type: Number, default: 2150 },
  steamTemperatureC: { type: Number, default: 310 },
  feedwaterFlowM3Day: { type: Number, default: 420 },
  fuelGasRateSm3Day: { type: Number, default: 28500 },
  thermalEfficiencyPercent: { type: Number, default: 84.8 },
  costPerTonneInr: { type: Number, default: 1850 }, // Steam generation cost per tonne CWE
  assignedWellTarget: { type: String, default: 'BAGH-108' },
  cumulativeSteamDeliveredTonnes: { type: Number, default: 48500 },
  lastInspectionDate: { type: Date, default: () => new Date(Date.now() - 45 * 86400000) },
  nextInspectionDue: { type: Date, default: () => new Date(Date.now() + 45 * 86400000) },
});

module.exports = mongoose.model('SteamBoiler', SteamBoilerSchema);

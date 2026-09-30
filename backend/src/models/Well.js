const mongoose = require('mongoose');

const RodTaperSchema = new mongoose.Schema({
  taperNumber: { type: Number, required: true },
  diameterInch: { type: Number, required: true }, // e.g. 0.875 (7/8") or 0.75 (3/4")
  lengthMeters: { type: Number, required: true },
  grade: { type: String, default: 'API Grade D' },
  weightLbFt: { type: Number, required: true },
  rodAreaSqIn: { type: Number, required: true },
});

const WellSchema = new mongoose.Schema({
  wellId: { type: String, required: true, unique: true, default: 'BAGH-104' },
  field: { type: String, default: 'Baghewala' },
  operator: { type: String, default: 'Oil India Limited (OIL)' },
  formation: { type: String, default: 'Jodhpur Sandstone' },
  reservoirDepthMeters: { type: Number, default: 1150 },
  nativeReservoirTempC: { type: Number, default: 48 },
  apiGravity: { type: Number, default: 16 },
  permeabilityMd: { type: Number, default: 1200 },
  payThicknessMeters: { type: Number, default: 15 },
  drainageRadiusMeters: { type: Number, default: 150 },
  wellboreRadiusMeters: { type: Number, default: 0.108 }, // 8.5" hole
  casingDiameterInches: { type: Number, default: 7.0 },
  tubingDiameterInches: { type: Number, default: 3.5 },
  pumpPlungerDiameterInches: { type: Number, default: 2.25 },
  rodTaperString: [RodTaperSchema],
  surfaceUnit: {
    type: { type: String, default: 'Conventional Beam Pump (Mark II/Air Balanced)' },
    vfdEquipped: { type: Boolean, default: true },
    strokeLengthInches: { type: Number, default: 120 },
    minSpm: { type: Number, default: 1.0 },
    maxSpm: { type: Number, default: 6.0 },
    gearboxRatingInLbs: { type: Number, default: 640000 },
    structureRatingLbs: { type: Number, default: 30500 },
  },
  steamBaseline: {
    qualityPercent: { type: Number, default: 80 },
    steamVolumeTonnes: { type: Number, default: 2000 },
    steamTemperatureC: { type: Number, default: 310 },
    soakDays: { type: Number, default: 10 },
    cycleDurationDays: { type: Number, default: 60 },
  },
  activeCssCycle: { type: Number, default: 3 },
  currentProducingDay: { type: Number, default: 38 },
  currentSpm: { type: Number, default: 4.2 },
  status: { type: String, enum: ['PRODUCING', 'SOAKING', 'STEAM_INJECTION', 'SHUT_IN'], default: 'PRODUCING' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Well', WellSchema);

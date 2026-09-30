const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  wellId: { type: String, required: true, index: true },
  cycle: { type: Number, default: 3 },
  day: { type: Number, required: true, index: true },
  reservoirTempC: { type: Number, required: true },
  deadOilViscosityCp: { type: Number, required: true },
  oilRateBopd: { type: Number, required: true },
  grossRateBpd: { type: Number, required: true },
  waterCutPercent: { type: Number, required: true },
  spm: { type: Number, required: true },
  cumulativeOilBbl: { type: Number, required: true },
  cweSteamTonnes: { type: Number, required: true },
  instantaneousSor: { type: Number, required: true },
  cumulativeSor: { type: Number, required: true },
  powerConsumptionKwhBbl: { type: Number, required: true },
  pumpFillagePercent: { type: Number, required: true },
  pprlLbs: { type: Number, required: true },
  mprlLbs: { type: Number, required: true },
  rodFallSafetyMargin: { type: Number, required: true }, // positive: safe, negative: floating
  rodFloatingRisk: {
    type: String,
    enum: ['NORMAL', 'MODERATE_DRAG', 'HIGH_RISK', 'SEVERE_FLOATING'],
    default: 'NORMAL',
  },
  diagnosticLabel: { type: String, default: 'Normal Full Pump' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);

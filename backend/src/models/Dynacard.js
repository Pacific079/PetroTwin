const mongoose = require('mongoose');

const DynacardPointSchema = new mongoose.Schema(
  {
    positionInches: { type: Number, required: true },
    loadLbs: { type: Number, required: true },
  },
  { _id: false }
);

const DynacardSchema = new mongoose.Schema({
  wellId: { type: String, required: true, index: true },
  day: { type: Number, required: true },
  spm: { type: Number, required: true },
  viscosityCp: { type: Number, required: true },
  temperatureC: { type: Number, required: true },
  surfaceCard: [DynacardPointSchema],
  downholeCard: [DynacardPointSchema],
  pprlLbs: { type: Number, required: true },
  mprlLbs: { type: Number, required: true },
  pumpStrokeInches: { type: Number, default: 120 },
  dampingFactor: { type: Number, required: true },
  diagnostic: {
    type: String,
    enum: [
      'Normal Full Pump',
      'High-Viscosity Rod Floating',
      'Fluid Pound',
      'Gas Interference',
      'Tubing Movement/Friction',
    ],
    default: 'Normal Full Pump',
  },
  diagnosticConfidence: { type: Number, default: 0.95 },
  diagnosticDetails: { type: String },
  isCurrent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dynacard', DynacardSchema);

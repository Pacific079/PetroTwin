const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['ACCEPT', 'MODIFY', 'REJECT', 'PARAM_OVERRIDE'],
    required: true,
  },
  wellId: { type: String, required: true, default: 'BAGH-104' },
  previousSpm: { type: Number, required: true },
  targetSpm: { type: Number, required: true },
  operatorName: { type: String, default: 'OIL Senior Production Engineer (Shift A)' },
  notes: { type: String, default: '' },
  recommendationGiven: {
    recommendedSpm: Number,
    physicalReason: String,
    confidence: Number,
    expectedPowerDeltaKwh: Number,
    rodFloatingRiskAvoided: Boolean,
  },
  resultingStatus: { type: String, default: 'OPTIMAL_TRACKING' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);

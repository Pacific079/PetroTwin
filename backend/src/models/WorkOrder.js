const mongoose = require('mongoose');

const WorkOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  wellId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['PREVENTIVE', 'CORRECTIVE', 'VFD_OPTIMIZATION', 'PUMP_OVERHAUL', 'STEAM_INSPECTION'],
    default: 'CORRECTIVE',
  },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
  },
  status: {
    type: String,
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  },
  assignedCrew: { type: String, default: 'Rigless Well Service Crew Alpha' },
  leadEngineer: { type: String, default: 'R. K. Rathore (OIL Production)' },
  partsRequired: [
    {
      partSku: String,
      partName: String,
      quantity: Number,
      costInr: Number,
    },
  ],
  estimatedCostInr: { type: Number, default: 45000 },
  triggeredByDiagnostic: { type: String, default: null }, // e.g., 'High-Viscosity Rod Floating'
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

module.exports = mongoose.model('WorkOrder', WorkOrderSchema);

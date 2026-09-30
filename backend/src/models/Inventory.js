const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Sucker Rods & Guides',
      'Subsurface Pumps & Valves',
      'Surface Pumping Units & VFDs',
      'Wellhead & Packings',
      'Chemicals & Demulsifiers',
      'Steam Tubulars & Insulated Piping',
    ],
    required: true,
  },
  quantityOnHand: { type: Number, required: true },
  unit: { type: String, default: 'units' },
  minReorderLevel: { type: Number, required: true },
  unitCostInr: { type: Number, required: true },
  warehouseLocation: { type: String, default: 'Baghewala Field Central Supply Depot' },
  status: {
    type: String,
    enum: ['IN_STOCK', 'LOW_STOCK', 'CRITICAL_REORDER', 'ON_ORDER'],
    default: 'IN_STOCK',
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Inventory', InventorySchema);

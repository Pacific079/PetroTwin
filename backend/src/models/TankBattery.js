const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  manifestId: { type: String, required: true },
  tankerRegNo: { type: String, required: true },
  driverName: { type: String, required: true },
  transporter: { type: String, default: 'Rajasthan Petroleum Logistics' },
  volumeKl: { type: Number, required: true }, // 1 kL ~ 6.29 bbl
  volumeBbl: { type: Number, required: true },
  apiGravity: { type: Number, default: 16.0 },
  bswPercent: { type: Number, default: 2.5 },
  destination: { type: String, default: 'Koyali Refinery (IOCL, Vadodara)' },
  dispatchedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['SCHEDULED', 'LOADING', 'IN_TRANSIT', 'DELIVERED'],
    default: 'IN_TRANSIT',
  },
});

const TankBatterySchema = new mongoose.Schema({
  batteryId: { type: String, required: true, unique: true, default: 'BAGH-TB-01' },
  name: { type: String, default: 'Baghewala Central Gathering Station (GGS-1)' },
  totalCapacityBbl: { type: Number, default: 15000 },
  grossFluidStoredBbl: { type: Number, default: 9240 },
  netOilStoredBbl: { type: Number, default: 6850 },
  producedWaterBbl: { type: Number, default: 2390 },
  avgBswPercent: { type: Number, default: 25.8 },
  dailyGrossInflowBpd: { type: Number, default: 480 },
  dailyNetOilBopd: { type: Number, default: 355 },
  dispatches: [DispatchSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TankBattery', TankBatterySchema);

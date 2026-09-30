const mongoose = require('mongoose');

const FinancialLedgerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  field: { type: String, default: 'Baghewala Heavy Oil Asset' },
  oilProductionBopd: { type: Number, default: 355 },
  realizedPricePerBblInr: { type: Number, default: 4750 }, // Realized heavy crude price (~$56.5/bbl)
  realizedPricePerBblUsd: { type: Number, default: 56.5 },
  exchangeRateUsdInr: { type: Number, default: 84.1 },
  costsPerBblInr: {
    steamGeneration: { type: Number, default: 1590 },
    electricalLifting: { type: Number, default: 225 },
    chemicalTreatment: { type: Number, default: 85 },
    routineWellService: { type: Number, default: 180 },
    fieldGgsOverhead: { type: Number, default: 120 },
  },
  totalLiftingCostPerBblInr: { type: Number, default: 2200 },
  netMarginPerBblInr: { type: Number, default: 2550 },
  grossRevenueDayInr: { type: Number, default: 1686250 },
  operatingExpenditureDayInr: { type: Number, default: 781000 },
  netOperatingIncomeDayInr: { type: Number, default: 905250 },
});

module.exports = mongoose.model('FinancialLedger', FinancialLedgerSchema);

import React from 'react';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export default function FinancialOpexView({ financialData }) {
  const f = financialData?.financials || {};
  const costs = f.costsPerBblInr || {
    steamGeneration: 1590,
    electricalLifting: 225,
    chemicalTreatment: 85,
    routineWellService: 180,
    fieldGgsOverhead: 120,
  };

  const totalOpex = f.totalLiftingCostPerBblInr || 2200;
  const realizedPrice = f.realizedPricePerBblInr || 4750;
  const netMargin = f.netMarginPerBblInr || 2550;
  const marginPct = Math.round((netMargin / realizedPrice) * 100);

  const dailyRev = f.grossRevenueDayInr || 1686250;
  const dailyOpex = f.operatingExpenditureDayInr || 781000;
  const dailyNoi = f.netOperatingIncomeDayInr || 905250;

  const costItems = [
    { label: 'Steam Generation (OTSG Fuel & Feedwater)', cost: costs.steamGeneration, pct: Math.round((costs.steamGeneration / totalOpex) * 100), color: 'bg-rose-500' },
    { label: 'Electrical Lifting (VFD Motor & Grid Tariffs)', cost: costs.electricalLifting, pct: Math.round((costs.electricalLifting / totalOpex) * 100), color: 'bg-blue-500' },
    { label: 'Routine Wellhead & Rigless Servicing', cost: costs.routineWellService, pct: Math.round((costs.routineWellService / totalOpex) * 100), color: 'bg-amber-500' },
    { label: 'Chemical Demulsifiers & Heavy Oil Flow Improvers', cost: costs.chemicalTreatment, pct: Math.round((costs.chemicalTreatment / totalOpex) * 100), color: 'bg-purple-500' },
    { label: 'GGS Gathering Station & Disposal Overheads', cost: costs.fieldGgsOverhead, pct: Math.round((costs.fieldGgsOverhead / totalOpex) * 100), color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
              Baghewala Heavy Oil Asset Financial Accounting & OPEX Analytics
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Hydrocarbon Net Margin, Steam Lifting Cost Structure & Cashflow Projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="neu-card-sm px-3 py-1 text-slate-700 font-semibold">
            Indian Heavy Basket: ~$56.5/bbl
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
            Net Margin: {marginPct}%
          </span>
        </div>
      </div>

      {/* Top 3 High Level P&L Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="neu-card p-6">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-1">GROSS DAILY REVENUE</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">₹{(dailyRev / 100000).toFixed(2)}L</span>
            <span className="text-xs font-mono text-slate-500">/day</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            355 BOPD @ ₹4,750/bbl (USD $56.50/bbl)
          </p>
        </div>

        <div className="neu-card p-6">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-1">DAILY OPERATING COST (OPEX)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-600">₹{(dailyOpex / 100000).toFixed(2)}L</span>
            <span className="text-xs font-mono text-slate-500">/day</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Lifting Cost: ₹{totalOpex} /bbl (~$26.16/bbl)
          </p>
        </div>

        <div className="neu-card p-6 border-2 border-emerald-300">
          <span className="text-xs font-mono font-bold text-emerald-800 block mb-1">
            NET OPERATING INCOME (NOI)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-700">₹{(dailyNoi / 100000).toFixed(2)}L</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">/day</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-mono">
            Monthly Field Cashflow: <strong className="text-slate-900">₹2.71 Crores</strong>
          </p>
        </div>
      </div>

      {/* Lifting Cost per Barrel Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
            <h3 className="text-sm font-bold font-mono text-slate-900 uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span>Unit Lifting Cost Breakdown (₹{totalOpex} / bbl)</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 font-bold">Per Net Barrel</span>
          </div>

          <div className="space-y-4">
            {costItems.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">{item.label}</span>
                  <span className="font-bold text-slate-900">₹{item.cost} <span className="text-slate-500">({item.pct}%)</span></span>
                </div>
                <div className="w-full h-2.5 neu-inset rounded-full overflow-hidden p-0.5">
                  <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Economic Turnaround */}
        <div className="neu-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-3">
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>CSS Economic Turnaround & Cycle Optimization</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              As Baghewala formation cools over the 60-day CSS cycle, crude viscosity escalates from 100 cP to over 12,000 cP. The economic breakeven threshold occurs when cumulative lifting energy exceeds daily revenue.
            </p>

            <div className="neu-inset p-4 rounded-2xl space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600">Predicted Economic Turnaround Date:</span>
                <span className="font-bold text-amber-800">Cycle Day 52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Recommended Next Cycle Prep:</span>
                <span className="font-bold text-orange-700">Cycle #4 Injection (OTSG-02)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Digital Twin VFD Optimization Gain:</span>
                <span className="font-bold text-emerald-700">₹24.80 / bbl Saved</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#dfd6c4]/70 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Corporate Tax & Royalty: 18% GST Applicable</span>
            <span className="text-slate-800 font-bold">Oil India Limited ERP Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}

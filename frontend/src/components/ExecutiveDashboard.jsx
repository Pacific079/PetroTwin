import React from 'react';
import {
  TrendingUp,
  Droplets,
  Layers,
  Flame,
  DollarSign,
  AlertOctagon,
  ArrowUpRight,
  Fuel,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function ExecutiveDashboard({
  dashboardData,
  onNavigate,
  isRodFloating = false
}) {
  const d = dashboardData?.data || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Alert if Rod Floating is detected on field */}
      {isRodFloating && (
        <div className="neu-card p-5 border-l-4 border-l-rose-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
                CRITICAL ASSET ALERT: HIGH-VISCOSITY ROD FLOATING ON BAGH-104
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Downhole dead-oil viscosity has decayed to ~7,646 cP. Polished rod fall margin is negative (-1.62 in/s), risking compressive rod buckling.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('digital_twin')}
              className="neu-orange-btn px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Digital Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('maintenance')}
              className="neu-btn px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-mono font-bold cursor-pointer"
            >
              <span>View CMMS Work Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Enterprise KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Field Oil Rate */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Field Net Oil</span>
            <Droplets className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{d.fieldBopd || 355}</span>
              <span className="text-xs font-mono text-slate-500">BOPD</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Gross: {d.fieldGrossBpd || 480} BPD</p>
          </div>
        </div>

        {/* Active Asset Status */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Well Portfolio</span>
            <Layers className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{d.totalWells || 5}</span>
              <span className="text-xs font-mono text-slate-500">Wells</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {d.wellBreakdown?.producing || 3} Prod | {d.wellBreakdown?.steaming || 1} Steam
            </p>
          </div>
        </div>

        {/* Tank Storage */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Tank Storage</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-blue-600">{d.tankBattery?.utilizationPercent || 63}%</span>
              <span className="text-xs font-mono text-slate-500">Capacity</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Net: {(d.tankBattery?.netOilStoredBbl || 6980).toLocaleString()} bbl
            </p>
          </div>
        </div>

        {/* Steam Generation */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Daily Steam</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-rose-600">{d.boilers?.dailySteamTonnes || 395}</span>
              <span className="text-xs font-mono text-slate-500">Tonnes</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">OTSG-01 Online (81% Qual)</p>
          </div>
        </div>

        {/* Lifting Cost */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Lifting OPEX</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-700">₹{d.financials?.liftingCostPerBblInr || 2200}</span>
              <span className="text-xs font-mono text-slate-500">/bbl</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">~$26.2 /bbl Heavy</p>
          </div>
        </div>

        {/* Daily Net Operating Income */}
        <div className="neu-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Net Op Income</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-purple-700">₹9.05L</span>
              <span className="text-xs font-mono text-slate-500">/day</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Realized: ₹4,750 /bbl</p>
          </div>
        </div>
      </div>

      {/* Main Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Status & Map Layout */}
        <div className="lg:col-span-2 neu-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                Baghewala Heavy Oil Asset Overview & CSS Cycle Allocation
              </h3>
            </div>
            <button
              onClick={() => onNavigate('wells')}
              className="text-xs font-mono font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All 5 Wells</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="neu-inset p-4 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1.5">PRODUCING WELLS (3)</span>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-orange-700 font-bold">BAGH-104 (Twin)</span>
                  <span className="text-rose-600 font-bold">Day 38 | 4.2 SPM</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-800">BAGH-101</span>
                  <span className="text-emerald-700 font-bold">Day 18 | 4.8 SPM</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-800">BAGH-102</span>
                  <span className="text-amber-700 font-bold">Day 54 | 2.2 SPM</span>
                </div>
              </div>
            </div>

            <div className="neu-inset p-4 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1.5">THERMAL STIMULATION (1)</span>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-rose-700 font-bold">BAGH-108</span>
                  <span className="text-rose-600 font-bold">Steam Injection</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Target: 2,000 tonnes CWE @ 80% quality. Connected to OTSG-01.
                </p>
              </div>
            </div>

            <div className="neu-inset p-4 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1.5">SOAKING PHASE (1)</span>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-indigo-700 font-bold">BAGH-112</span>
                  <span className="text-indigo-600 font-bold">Day 6 / 10 Soak</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Heat chamber diffusion active. Projected startup in 4 days.
                </p>
              </div>
            </div>
          </div>

          <div className="neu-card-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-700">
              Need immediate digital twin simulation for BAGH-104 rod floating?
            </span>
            <button
              onClick={() => onNavigate('digital_twin')}
              className="neu-orange-btn px-4 py-2 rounded-xl font-bold cursor-pointer"
            >
              Open Digital Twin & SCADA
            </button>
          </div>
        </div>

        {/* Quick Operations Summary */}
        <div className="neu-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-3">
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                Plant & Dispatch Summary
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OISD Compliant</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 rounded-xl neu-inset">
                <span className="text-slate-500">GGS-1 Tank Inventory:</span>
                <span className="font-bold text-slate-900">6,980 / 15,000 bbl</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl neu-inset">
                <span className="text-slate-500">Truck Dispatches Today:</span>
                <span className="font-bold text-orange-600">3 Tankers (453 bbl)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl neu-inset">
                <span className="text-slate-500">Active Boiler Efficiency:</span>
                <span className="font-bold text-rose-600">85.1% Thermal</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl neu-inset">
                <span className="text-slate-500">Open CMMS Work Orders:</span>
                <span className="font-bold text-amber-700">3 Orders (1 Critical)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#dfd6c4]/70 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Asset: Oil India Limited</span>
            <button
              onClick={() => onNavigate('financials')}
              className="text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
            >
              View Full P&L Statement →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

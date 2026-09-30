import React from 'react';
import { Flame, Zap } from 'lucide-react';

export default function SteamEnergyView({ boilers = [] }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
              Once-Through Steam Generator (OTSG) Central Plant & Energy Management
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              High-Pressure Saturated Steam Generation for Cyclic Steam Stimulation (CSS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="neu-card-sm px-3 py-1 text-slate-700 font-semibold">
            Fuel: Natural Gas / CBM
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
            Plant Efficiency: 85.1%
          </span>
        </div>
      </div>

      {/* Boilers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boilers.map((boiler) => {
          const isOnline = boiler.status === 'ONLINE_INJECTION';

          return (
            <div
              key={boiler.boilerId}
              className={`neu-card p-6 flex flex-col justify-between ${
                isOnline ? 'border-2 border-rose-300' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-2xl ${
                        isOnline ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-mono text-slate-900">{boiler.name}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {boiler.boilerId} • Rating: {boiler.ratingMmBtuHr} MMBtu/hr
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      isOnline
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {boiler.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Operating Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">STEAM OUTPUT</span>
                    <span className="text-base font-bold text-rose-600">
                      {boiler.currentOutputTonnesDay} t/day
                    </span>
                  </div>

                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">STEAM QUALITY</span>
                    <span className="text-base font-bold text-slate-900">
                      {boiler.steamQualityPercent}% CWE
                    </span>
                  </div>

                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">PRESSURE</span>
                    <span className="text-base font-bold text-blue-600">
                      {boiler.operatingPressurePsi} psi
                    </span>
                  </div>

                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">SANDFACE TEMP</span>
                    <span className="text-base font-bold text-amber-700">
                      {boiler.steamTemperatureC}°C
                    </span>
                  </div>

                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">FUEL GAS RATE</span>
                    <span className="text-base font-bold text-slate-800">
                      {boiler.fuelGasRateSm3Day?.toLocaleString()} Sm³/d
                    </span>
                  </div>

                  <div className="neu-card-sm p-3 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] font-bold block">UNIT COST</span>
                    <span className="text-base font-bold text-emerald-700">
                      ₹{boiler.costPerTonneInr} /t
                    </span>
                  </div>
                </div>

                <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-semibold">Active Injection Target:</span>
                  <span className="font-bold text-orange-700">{boiler.assignedWellTarget}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#dfd6c4]/70 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Cumulative Steam: {boiler.cumulativeSteamDeliveredTonnes?.toLocaleString()} Tonnes</span>
                <span className="text-emerald-700 font-bold">Thermal Eff: {boiler.thermalEfficiencyPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy & SOR Economics Breakdown */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
              Field Energy Consumption & Steam-Oil Ratio (SOR) Economics
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">Grid Tariff: ₹9.0 / kWh</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="neu-inset p-4 rounded-2xl">
            <span className="text-slate-500 font-bold block mb-1">CUMULATIVE STEAM-OIL RATIO (CSOR)</span>
            <span className="text-xl font-bold text-rose-600">0.86 tonnes / bbl</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Equivalent to ₹1,590 steam energy cost per barrel of heavy oil produced.
            </p>
          </div>

          <div className="neu-inset p-4 rounded-2xl">
            <span className="text-slate-500 font-bold block mb-1">SRP LIFTING SPECIFIC ENERGY</span>
            <span className="text-xl font-bold text-blue-600">25.0 kWh / bbl</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Downhole viscous drag drives electrical consumption. Optimized SPM saves ~11% (₹25/bbl).
            </p>
          </div>

          <div className="neu-inset p-4 rounded-2xl">
            <span className="text-slate-500 font-bold block mb-1">TOTAL THERMAL ENERGY INPUT</span>
            <span className="text-xl font-bold text-amber-700">1.12 MMBtu / bbl</span>
            <p className="text-[11px] text-slate-600 mt-1">
              80% quality steam provides optimal latent heat without premature reservoir quenching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

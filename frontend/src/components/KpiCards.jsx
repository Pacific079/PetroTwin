import React from 'react';
import { Thermometer, Droplets, Gauge, AlertTriangle, Zap, TrendingDown } from 'lucide-react';

export default function KpiCards({ status }) {
  if (!status) return null;

  const temp = status.temperatureC || 52.0;
  const visc = status.viscosityCp || 11500;
  const spm = status.activeSpm || 4.2;
  const margin = status.rodFallSafetyMargin || -2.4;
  const isFloating = status.isRodFloating;
  const oilRate = status.oilRateBopd || 38.5;
  const grossRate = status.grossRateBpd || 78.2;
  const kwh = status.kwhPerBbl || 24.8;
  const sor = status.instantaneousSor || 0.86;
  const fillage = status.pumpFillagePercent || 92.5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Sandface Temperature */}
      <div className="neu-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Sandface Temp</span>
          <Thermometer className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{temp.toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-500">°C</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-amber-600" />
            <span>Native: 48.0 °C</span>
          </p>
        </div>
      </div>

      {/* 2. Dead Oil Viscosity */}
      <div className={`neu-card p-4 flex flex-col justify-between ${visc > 10000 ? 'border border-amber-300' : ''}`}>
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Oil Viscosity</span>
          <Droplets className="w-4 h-4 text-amber-600" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${visc > 10000 ? 'text-amber-700' : 'text-slate-900'}`}>
              {visc > 1000 ? `${(visc / 1000).toFixed(1)}k` : visc.toFixed(0)}
            </span>
            <span className="text-xs font-mono text-slate-500">cP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Walther: {visc.toLocaleString()} cP
          </p>
        </div>
      </div>

      {/* 3. VFD Operating SPM */}
      <div className="neu-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">VFD Speed</span>
          <Gauge className="w-4 h-4 text-orange-600" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-orange-600">{spm.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-500">SPM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Stroke: 120" | Fill: {fillage}%
          </p>
        </div>
      </div>

      {/* 4. Rod Fall Safety Margin & Risk */}
      <div className={`neu-card p-4 flex flex-col justify-between ${isFloating ? 'neu-danger' : 'neu-safe'}`}>
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Rod Fall Margin</span>
          <AlertTriangle className={`w-4 h-4 ${isFloating ? 'text-rose-600' : 'text-emerald-600'}`} />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${isFloating ? 'text-rose-600' : 'text-emerald-700'}`}>
              {margin > 0 ? `+${margin.toFixed(1)}` : margin.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">in/s</span>
          </div>
          <p className={`text-[11px] font-mono font-bold mt-1 ${isFloating ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isFloating ? 'ROD FLOATING' : 'SYNCHRONIZED'}
          </p>
        </div>
      </div>

      {/* 5. Production Inflow */}
      <div className="neu-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Oil Production</span>
          <Droplets className="w-4 h-4 text-yellow-600" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{oilRate.toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-500">BOPD</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Gross: {grossRate.toFixed(1)} BPD
          </p>
        </div>
      </div>

      {/* 6. Power & SOR Efficiency */}
      <div className="neu-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Specific Energy</span>
          <Zap className="w-4 h-4 text-blue-600" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{kwh.toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-500">kWh/bbl</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            SOR: {sor.toFixed(3)} t/bbl
          </p>
        </div>
      </div>
    </div>
  );
}

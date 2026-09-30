import React from 'react';
import { ArrowRight, Flame, Droplets, ShieldAlert, Cpu, Layers } from 'lucide-react';

export default function LandingHero({
  onLaunchTwin,
  onLaunchErp,
  wellStatus,
  isRodFloating = false
}) {
  const currentSpm = wellStatus?.activeSpm || 4.2;
  const temp = wellStatus?.temperatureC || 53.4;
  const visc = wellStatus?.viscosityCp || 7646;

  // 5 Field Wells with Neumorphic Status Pillars matching the reference image
  const wellsPillars = [
    { id: 'BAGH-101', label: 'Well 101', status: 'normal', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50', desc: 'Producing' },
    { id: 'BAGH-102', label: 'Well 102', status: 'cooling', color: 'bg-amber-500', glow: 'shadow-amber-500/50', desc: 'Cooling' },
    { id: 'BAGH-104', label: 'Well 104', status: 'alert', color: isRodFloating ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500', glow: 'shadow-rose-500/50', desc: isRodFloating ? 'Rod Float' : 'Nominal' },
    { id: 'BAGH-108', label: 'Well 108', status: 'steaming', color: 'bg-orange-500 animate-pulse', glow: 'shadow-orange-500/50', desc: 'Steaming' },
    { id: 'BAGH-112', label: 'Well 112', status: 'soaking', color: 'bg-blue-500', glow: 'shadow-blue-500/50', desc: 'Soaking' },
  ];

  return (
    <div className="relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Ambient Warm Blobs matching reference image */}
      <div className="ambient-glow-orange top-0 right-10 -z-10" />
      <div className="ambient-glow-orange bottom-10 left-10 -z-10" />

      {/* Main Hero Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[460px]">
        {/* Left Typography & CTAs (Matches reference image style) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-[#E65100] tracking-tight leading-none">
              PetroTwin
            </h1>
            <div className="w-24 h-1.5 bg-[#FF6D00] rounded-full mt-3.5 mb-6" />
          </div>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
            Revolutionizing heavy oil recovery with{' '}
            <strong className="text-[#D84315] font-semibold">AI-powered Gibbs wave dynamics</strong>{' '}
            and intelligent field-to-surface ERP optimization for{' '}
            <strong className="text-slate-800 font-semibold">Oil India Limited</strong>.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchTwin}
              className="neu-orange-btn px-7 py-3.5 rounded-2xl font-mono text-sm font-semibold flex items-center gap-2.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchErp}
              className="neu-btn px-6 py-3.5 rounded-2xl font-mono text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-2"
            >
              <span>Asset ERP Suite</span>
              <span className="text-slate-400">→</span>
            </button>
          </div>
        </div>

        {/* Right Neumorphic Showcase Card (Matches reference card frame) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="neu-card p-6 w-full max-w-md relative group">
            {/* Inner Recessed Display Window */}
            <div className="neu-inset p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    PROJECT PETROTWIN
                  </span>
                  <h3 className="text-sm font-bold font-mono text-slate-800">
                    CSS-SRP Heavy Oil Dynamics
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-mono font-bold">
                  SIH 26120
                </span>
              </div>

              {/* Dynamic Live Telemetry Visualization */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Demo Well ID:</span>
                  <strong className="text-slate-800">BAGH-104 (Jodhpur Sandstone)</strong>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Reservoir Sandface Temp:</span>
                  <span className="font-bold text-rose-600">{temp.toFixed(1)} °C</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Dead Oil Viscosity:</span>
                  <span className="font-bold text-amber-700">{visc.toLocaleString()} cP</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">VFD Pumping Speed:</span>
                  <span className="font-bold text-orange-600">{currentSpm.toFixed(2)} SPM</span>
                </div>

                {/* Status Bar */}
                <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono mt-3 ${
                  isRodFloating
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRodFloating ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                    {isRodFloating ? 'ROD FLOATING DETECTED' : 'SYNCHRONIZED PUMPING'}
                  </span>
                  <span className="text-[11px] font-semibold">
                    {wellStatus?.rodFallSafetyMargin !== undefined ? `${wellStatus.rodFallSafetyMargin} in/s` : 'Negative Margin'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Boberg-Lantz & Walther PVT</span>
              <span className="text-orange-600 font-semibold cursor-pointer" onClick={onLaunchTwin}>
                Explore Wave Card →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Neumorphic Pillars Section (Matches the 4 traffic lights from reference image) */}
      <div className="pt-16 pb-6 text-center space-y-5">
        <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
          {wellsPillars.map((w) => (
            <div key={w.id} className="flex flex-col items-center space-y-2.5 cursor-pointer" onClick={onLaunchTwin}>
              {/* Pillar Body */}
              <div className="neu-pillar w-11 h-20 flex flex-col items-center justify-center p-1.5 space-y-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-700/80 inline-block" />
                <span className="w-4 h-4 rounded-full bg-slate-700/80 inline-block" />
                <span className={`w-4 h-4 rounded-full ${w.color} shadow-lg ${w.glow} inline-block`} />
              </div>
              {/* Labels */}
              <div className="text-center">
                <span className="text-xs font-bold font-mono text-slate-800 block">{w.id}</span>
                <span className="text-[10px] font-mono text-slate-500">{w.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-mono text-slate-600 tracking-wide">
          Real-time adaptive control for optimal thermal heavy oil flow
        </p>
      </div>
    </div>
  );
}

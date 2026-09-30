import React from 'react';
import { Flame, RefreshCw, Cpu, Layers, ShieldAlert, GitBranch } from 'lucide-react';

export default function Navbar({
  wellStatus,
  onRefresh,
  loading,
  activeTab,
  onTabChange
}) {
  const isFloating = wellStatus?.isRodFloating;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6EE]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-[#dfd6c4]/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Branding (Matches Reference Image Style) */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onTabChange('hero')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/30 neu-btn">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-[#E65100] tracking-tight">
              PetroTwin
            </span>
            <span className="text-[10px] font-mono text-slate-500 block leading-none">
              BAGHEWALA • OIL INDIA
            </span>
          </div>
        </div>

        {/* Center / Navigation Links (Matches Reference Image: Home, Dashboard, SOS, Git) */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => onTabChange('hero')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'hero'
                ? 'neu-btn-pressed text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 neu-btn'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onTabChange('executive')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'executive'
                ? 'neu-btn-pressed text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 neu-btn'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('digital_twin')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'digital_twin'
                ? 'neu-btn-pressed text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 neu-btn'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-orange-600" />
            <span>Digital Twin</span>
            {isFloating && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onTabChange('wells')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'wells'
                ? 'neu-btn-pressed text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 neu-btn'
            }`}
          >
            Wells
          </button>

          <button
            onClick={() => onTabChange('maintenance')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'maintenance'
                ? 'neu-btn-pressed text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 neu-btn'
            }`}
          >
            CMMS
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="neu-btn px-3 py-1.5 rounded-xl text-xs font-mono text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <div className="neu-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer" title="SIH Problem Statement 26120">
            <span className="text-xs font-mono font-bold text-orange-600">SIH</span>
          </div>
        </div>
      </div>
    </header>
  );
}

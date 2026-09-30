import React, { useState } from 'react';
import { Layers, Search, Cpu, ArrowUpRight, CheckCircle2, Flame, Clock } from 'lucide-react';

export default function WellRegistryView({ wells = [], onSelectWellForTwin }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredWells = wells.filter((w) => {
    const matchesFilter = filter === 'ALL' || w.status === filter;
    const matchesSearch =
      w.wellId.toLowerCase().includes(search.toLowerCase()) ||
      w.formation?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRODUCING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            PRODUCING
          </span>
        );
      case 'STEAM_INJECTION':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            STEAM INJECTION
          </span>
        );
      case 'SOAKING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            SOAKING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-200 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-orange-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
              Baghewala Field Well Portfolio Registry
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Jodhpur Sandstone Formation • 16° API Heavy Oil Play (Oil India Limited)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search well ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neu-inset rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-orange-500 w-44 sm:w-52"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 neu-inset p-1 rounded-xl text-xs font-mono">
            {['ALL', 'PRODUCING', 'STEAM_INJECTION', 'SOAKING'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg transition font-bold ${
                  filter === st
                    ? 'neu-orange-btn text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Well Portfolio Table */}
      <div className="neu-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#F3ECE0] text-slate-600 border-b border-[#dfd6c4]">
            <tr>
              <th className="py-3 px-3">WELL IDENTIFIER</th>
              <th className="py-3 px-3">FORMATION & DEPTH</th>
              <th className="py-3 px-3">CRUDE GRAVITY</th>
              <th className="py-3 px-3">CSS CYCLE & DAY</th>
              <th className="py-3 px-3">ACTIVE PUMP VFD</th>
              <th className="py-3 px-3">OPERATIONAL STATUS</th>
              <th className="py-3 px-3 text-right">DIGITAL TWIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfd6c4]/60 text-slate-700">
            {filteredWells.map((well) => (
              <tr key={well.wellId} className="hover:bg-[#F3ECE0]/50 transition">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{well.wellId}</span>
                    {well.wellId === 'BAGH-104' && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 text-[10px] font-bold">
                        PRIMARY TWIN
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block">{well.field}</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-slate-800 block font-bold">{well.formation}</span>
                  <span className="text-slate-500 text-[11px]">{well.reservoirDepthMeters} m TVD</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-amber-800 font-bold">{well.apiGravity}° API</span>
                  <span className="text-slate-500 text-[11px] block">Heavy Crude</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="font-bold text-slate-800">Cycle #{well.activeCssCycle}</span>
                  <span className="text-slate-500 text-[11px] block">
                    {well.status === 'PRODUCING' ? `Day ${well.currentProducingDay} of 60` : well.status}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  {well.currentSpm > 0 ? (
                    <div>
                      <span className="text-orange-600 font-bold">{well.currentSpm.toFixed(2)} SPM</span>
                      <span className="text-slate-500 text-[10px] block">120" Stroke</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Shut-In / Steaming</span>
                  )}
                </td>
                <td className="py-3.5 px-3">{getStatusBadge(well.status)}</td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => onSelectWellForTwin(well.wellId)}
                    className="neu-orange-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Launch Twin</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Truck, Plus, Send, Fuel, X } from 'lucide-react';

export default function ProductionAccountingView({
  batteryData,
  onDispatch,
  actionLoading
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tankerReg, setTankerReg] = useState('RJ-15-GA-4412');
  const [driverName, setDriverName] = useState('Rajendra Prasad');
  const [volumeKl, setVolumeKl] = useState(24.0);
  const [destination, setDestination] = useState('Koyali Refinery (IOCL, Vadodara)');

  const b = batteryData?.battery || {};
  const dispatches = b.dispatches || [];
  const totalCap = b.totalCapacityBbl || 15000;
  const netOil = b.netOilStoredBbl || 6980;
  const water = b.producedWaterBbl || 2470;
  const gross = netOil + water;
  const fillPct = Math.round((gross / totalCap) * 100);

  const handleSubmitDispatch = async (e) => {
    e.preventDefault();
    await onDispatch({
      tankerRegNo: tankerReg,
      driverName,
      volumeKl: Number(volumeKl),
      destination,
      apiGravity: 16.0,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Tank Battery Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Battery Storage Gauge */}
        <div className="neu-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
            <div className="flex items-center gap-2.5">
              <Fuel className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
                {b.name || 'Baghewala Central Production Gathering Station (GGS-1)'}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              Capacity: {totalCap.toLocaleString()} bbl
            </span>
          </div>

          {/* Visual Tank Fill Bar */}
          <div className="space-y-2.5 mb-5">
            <div className="flex justify-between text-xs font-mono text-slate-600 font-semibold">
              <span>Gross Stored: {gross.toLocaleString()} bbl ({fillPct}%)</span>
              <span>Available Headspace: {(totalCap - gross).toLocaleString()} bbl</span>
            </div>
            <div className="w-full h-6 neu-inset rounded-xl overflow-hidden flex p-0.5">
              {/* Net Oil Portion */}
              <div
                style={{ width: `${(netOil / totalCap) * 100}%` }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-l-lg transition-all"
                title={`Net Oil: ${netOil.toLocaleString()} bbl`}
              />
              {/* Produced Water Portion */}
              <div
                style={{ width: `${(water / totalCap) * 100}%` }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-r-lg transition-all"
                title={`Produced Water: ${water.toLocaleString()} bbl`}
              />
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>Net Heavy Oil: <strong className="text-slate-900">{netOil.toLocaleString()} bbl</strong></span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                <span>Produced Water: <strong className="text-slate-900">{water.toLocaleString()} bbl</strong></span>
              </span>
              <span className="text-slate-400">|</span>
              <span>Avg BS&W: <strong className="text-amber-700">{b.avgBswPercent || 26.1}%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#dfd6c4]/70 text-xs font-mono">
            <div className="neu-card-sm p-3">
              <span className="text-slate-500 text-[10px] font-bold block">DAILY NET OIL</span>
              <span className="font-bold text-slate-900 text-sm">{b.dailyNetOilBopd || 355} BOPD</span>
            </div>
            <div className="neu-card-sm p-3">
              <span className="text-slate-500 text-[10px] font-bold block">DAILY GROSS FLUID</span>
              <span className="font-bold text-slate-900 text-sm">{b.dailyGrossInflowBpd || 480} BPD</span>
            </div>
            <div className="neu-card-sm p-3">
              <span className="text-slate-500 text-[10px] font-bold block">WATER INJECTION</span>
              <span className="font-bold text-blue-600 text-sm">125 BPD Re-Injected</span>
            </div>
            <div className="neu-card-sm p-3">
              <span className="text-slate-500 text-[10px] font-bold block">STORAGE RETENTION</span>
              <span className="font-bold text-emerald-700 text-sm">19.6 Days</span>
            </div>
          </div>
        </div>

        {/* Dispatch Action Panel */}
        <div className="neu-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-3">
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <span>Crude Dispatch Logistics</span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              Baghewala 16° API heavy crude is heated to 60°C at GGS-1 and dispatched via insulated road tankers to IOCL Koyali / Mathura refineries.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="neu-orange-btn w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Tanker Dispatch Manifest</span>
          </button>
        </div>
      </div>

      {/* Dispatches Manifests Table */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
          <h3 className="text-sm font-bold font-mono text-slate-900 uppercase flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Recent Tanker Consignment Manifests</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {dispatches.length} Shipments Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F3ECE0] text-slate-600 border-b border-[#dfd6c4]">
              <tr>
                <th className="py-2.5 px-3">MANIFEST ID</th>
                <th className="py-2.5 px-3">TANKER REG / DRIVER</th>
                <th className="py-2.5 px-3">VOLUME (kL / bbl)</th>
                <th className="py-2.5 px-3">API GRAVITY / BS&W</th>
                <th className="py-2.5 px-3">DESTINATION REFINERY</th>
                <th className="py-2.5 px-3">DISPATCH TIME</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd6c4]/60 text-slate-700">
              {dispatches.map((disp, idx) => (
                <tr key={disp.manifestId || idx} className="hover:bg-[#F3ECE0]/50 transition">
                  <td className="py-3 px-3 font-bold text-orange-600">{disp.manifestId}</td>
                  <td className="py-3 px-3">
                    <span className="text-slate-900 block font-bold">{disp.tankerRegNo}</span>
                    <span className="text-slate-500 text-[10px]">{disp.driverName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-amber-800 font-bold">{disp.volumeBbl} bbl</span>
                    <span className="text-slate-500 text-[10px] block">({disp.volumeKl} kL)</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-900 font-semibold">{disp.apiGravity}° API</span>
                    <span className="text-slate-500 text-[10px] block">{disp.bswPercent}% BS&W</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{disp.destination}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(disp.dispatchedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      disp.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : disp.status === 'IN_TRANSIT'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {disp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for New Dispatch */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="neu-card p-6 max-w-md w-full bg-[#FAF6EE] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <span>NEW CRUDE TANKER DISPATCH MANIFEST</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispatch} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">TANKER VEHICLE REG NUMBER</label>
                <input
                  type="text"
                  value={tankerReg}
                  onChange={(e) => setTankerReg(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">DRIVER NAME / TRANSPORTER</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">VOLUME IN KILOLITRES (kL)</label>
                <input
                  type="number"
                  step="0.5"
                  value={volumeKl}
                  onChange={(e) => setVolumeKl(parseFloat(e.target.value))}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-orange-600 font-bold focus:outline-none focus:border-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Equivalent to ~{(volumeKl * 6.2898).toFixed(1)} Barrels (bbl)
                </span>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">DESTINATION REFINERY</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Koyali Refinery (IOCL, Vadodara)">Koyali Refinery (IOCL, Vadodara)</option>
                  <option value="Mathura Refinery (IOCL, UP)">Mathura Refinery (IOCL, UP)</option>
                  <option value="Bhatinda Refinery (HMEL, Punjab)">Bhatinda Refinery (HMEL, Punjab)</option>
                  <option value="Panipat Refinery (IOCL)">Panipat Refinery (IOCL)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#dfd6c4]/70 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="neu-btn px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="neu-orange-btn px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Tanker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

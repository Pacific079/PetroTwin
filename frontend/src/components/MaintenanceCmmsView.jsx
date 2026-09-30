import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Plus,
  Package,
  Send,
  X
} from 'lucide-react';

export default function MaintenanceCmmsView({
  workOrders = [],
  inventory = [],
  onCreateWorkOrder,
  onUpdateStatus,
  actionLoading,
  isRodFloating = false
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [wellId, setWellId] = useState('BAGH-104');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [type, setType] = useState('VFD_OPTIMIZATION');

  const [activeTab, setActiveTab] = useState('orders');

  const handleOpenAutoWo = () => {
    setWellId('BAGH-104');
    setTitle('Immediate VFD Speed Trim & Sucker Rod Buckling Prevention');
    setDescription(
      'Triggered by Gibbs 1D wave solver: Dead oil viscosity reached 7,646 cP on Day 38. Rod fall margin is negative (-1.62 in/s), creating severe fluid drag retarding rod fall. Trim VFD to 2.75 SPM.'
    );
    setPriority('CRITICAL');
    setType('VFD_OPTIMIZATION');
    setModalOpen(true);
  };

  const handleSubmitWo = async (e) => {
    e.preventDefault();
    await onCreateWorkOrder({
      wellId,
      title,
      description,
      priority,
      type,
      triggeredByDiagnostic: isRodFloating ? 'High-Viscosity Rod Floating' : null,
      estimatedCostInr: priority === 'CRITICAL' ? 45000 : 25000,
    });
    setModalOpen(false);
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700">
            {p}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
              Field Maintenance Management System (CMMS) & Spare Parts Depot
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Computerized Work Orders, Sucker Rod Spares & Preventive Overhaul Scheduling
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isRodFloating && (
            <button
              onClick={handleOpenAutoWo}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Auto-Generate Rod Floating Work Order</span>
            </button>
          )}

          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setModalOpen(true);
            }}
            className="neu-orange-btn px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#dfd6c4]/70 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'orders'
              ? 'neu-btn-pressed text-orange-950 font-bold'
              : 'neu-btn text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Active Work Orders ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'neu-btn-pressed text-orange-950 font-bold'
              : 'neu-btn text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Spare Parts Warehouse ({inventory.length} SKUs)</span>
        </button>
      </div>

      {/* TAB 1: WORK ORDERS */}
      {activeTab === 'orders' && (
        <div className="neu-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F3ECE0] text-slate-600 border-b border-[#dfd6c4]">
              <tr>
                <th className="py-2.5 px-3">ORDER #</th>
                <th className="py-2.5 px-3">WELL TARGET</th>
                <th className="py-2.5 px-3">TITLE & TECHNICAL DETAILS</th>
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">ASSIGNED CREW</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd6c4]/60 text-slate-700">
              {workOrders.map((wo) => (
                <tr key={wo._id || wo.orderNumber} className="hover:bg-[#F3ECE0]/50 transition">
                  <td className="py-3 px-3 font-bold text-orange-600 whitespace-nowrap">
                    {wo.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-900 font-bold block">{wo.wellId}</span>
                    <span className="text-slate-500 text-[10px]">{wo.type}</span>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <span className="font-bold text-slate-800 block truncate" title={wo.title}>
                      {wo.title}
                    </span>
                    <span className="text-slate-500 text-[11px] line-clamp-1 truncate" title={wo.description}>
                      {wo.description}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{getPriorityBadge(wo.priority)}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                    <span className="block font-semibold">{wo.assignedCrew}</span>
                    <span className="text-slate-500 text-[10px]">{wo.leadEngineer}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={wo.status}
                      onChange={(e) => onUpdateStatus(wo._id, e.target.value)}
                      className={`neu-inset text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none ${
                        wo.status === 'OPEN'
                          ? 'text-rose-700'
                          : wo.status === 'IN_PROGRESS'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="text-slate-500 text-[11px] font-bold">
                      Est: ₹{wo.estimatedCostInr?.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: INVENTORY & SPARE PARTS */}
      {activeTab === 'inventory' && (
        <div className="neu-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F3ECE0] text-slate-600 border-b border-[#dfd6c4]">
              <tr>
                <th className="py-2.5 px-3">SKU CODE</th>
                <th className="py-2.5 px-3">ITEM SPECIFICATION</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">STOCK ON HAND</th>
                <th className="py-2.5 px-3">MIN REORDER</th>
                <th className="py-2.5 px-3">UNIT COST (INR)</th>
                <th className="py-2.5 px-3">INVENTORY STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd6c4]/60 text-slate-700">
              {inventory.map((item) => (
                <tr key={item.sku} className="hover:bg-[#F3ECE0]/50 transition">
                  <td className="py-3 px-3 font-bold text-orange-600">{item.sku}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-3 text-slate-500">{item.category}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {item.quantityOnHand} {item.unit}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{item.minReorderLevel} {item.unit}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    ₹{item.unitCostInr?.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'IN_STOCK'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="neu-card p-6 max-w-lg w-full bg-[#FAF6EE] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-600" />
                <span>CREATE CMMS WORK ORDER</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitWo} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">TARGET WELL</label>
                  <select
                    value={wellId}
                    onChange={(e) => setWellId(e.target.value)}
                    className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    <option value="BAGH-104">BAGH-104 (Primary Twin)</option>
                    <option value="BAGH-101">BAGH-101</option>
                    <option value="BAGH-102">BAGH-102</option>
                    <option value="BAGH-108">BAGH-108</option>
                    <option value="BAGH-112">BAGH-112</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full neu-inset rounded-xl px-3 py-2 text-rose-700 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">WORK ORDER TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sucker Rod Drag Mitigation & VFD Calibration"
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">TECHNICAL DESCRIPTION</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe root cause, engineering instructions, and safety controls..."
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
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
                  <span>Issue Work Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

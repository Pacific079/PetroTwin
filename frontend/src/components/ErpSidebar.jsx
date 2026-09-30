import React from 'react';
import {
  Home,
  LayoutDashboard,
  Cpu,
  Layers,
  Droplets,
  Flame,
  Wrench,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function ErpSidebar({
  activeTab,
  onTabChange,
  openWorkOrdersCount = 0,
  criticalAlert = false,
  userRole,
  onRoleChange
}) {
  const navItems = [
    {
      id: 'hero',
      label: 'Home Portal',
      subtitle: 'Landing & Asset Hero',
      icon: Home,
    },
    {
      id: 'executive',
      label: 'Executive Overview',
      subtitle: 'Field-Wide KPIs & Asset Rollup',
      icon: LayoutDashboard,
    },
    {
      id: 'digital_twin',
      label: 'Digital Twin & SCADA',
      subtitle: 'Gibbs Wave & Real-Time Physics',
      icon: Cpu,
      badge: criticalAlert ? 'RISK' : 'LIVE',
      badgeColor: criticalAlert ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-orange-100 text-orange-700 border-orange-300',
    },
    {
      id: 'wells',
      label: 'Well Portfolio Registry',
      subtitle: '5 Wells | Baghewala Asset',
      icon: Layers,
    },
    {
      id: 'production',
      label: 'Production & Tank Battery',
      subtitle: 'Storage & Trucking Dispatches',
      icon: Droplets,
    },
    {
      id: 'steam',
      label: 'Steam & Energy (CSS)',
      subtitle: 'OTSG Boilers & Fuel Tracking',
      icon: Flame,
    },
    {
      id: 'maintenance',
      label: 'Maintenance & CMMS',
      subtitle: 'Work Orders & Warehouse Spares',
      icon: Wrench,
      badge: openWorkOrdersCount > 0 ? `${openWorkOrdersCount} Open` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'financials',
      label: 'Financials & OPEX',
      subtitle: '₹/bbl Lifting Cost & Net Margin',
      icon: DollarSign,
    },
    {
      id: 'audit',
      label: 'Compliance & Audit',
      subtitle: 'Immutable Governance Ledger',
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#FAF6EE] border-b lg:border-b-0 lg:border-r border-[#dfd6c4]/70 flex flex-col shrink-0">
      {/* Role & Credential Panel */}
      <div className="p-4 border-b border-[#dfd6c4]/60 bg-[#F5EFE4]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            ACTIVE ERP PROFILE
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full bg-[#FAF6EE] border border-[#dfd6c4] text-xs font-mono text-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500 shadow-sm"
          >
            <option value="Senior Production Engineer (Shift A)">Senior Production Engineer</option>
            <option value="Asset Director (Western Onshore OIL)">Asset Director (Executive)</option>
            <option value="Field SCADA & Automation Specialist">Field SCADA Specialist</option>
            <option value="Maintenance & Workover Lead">Maintenance & Workover Lead</option>
          </select>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'neu-btn-pressed text-orange-950 font-semibold'
                  : 'neu-btn text-slate-700 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-[#F2EAE0] text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold font-mono truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-600" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#dfd6c4]/60 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>Baghewala Field (OIL)</span>
        <span className="text-emerald-700 font-bold">ONLINE</span>
      </div>
    </aside>
  );
}

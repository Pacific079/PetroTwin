import React from 'react';
import { History, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function AuditTrailTable({ logs = [], loading }) {
  const getActionBadge = (action) => {
    switch (action) {
      case 'ACCEPT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            ACCEPT
          </span>
        );
      case 'MODIFY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            MODIFY
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            REJECT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-200 text-slate-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="neu-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-orange-600" />
          <h2 className="text-sm font-bold tracking-wide text-slate-900 font-mono uppercase">
            Immutable Supervisory Audit Trail (MongoDB Ledger)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{logs.length} Logged Governance Events</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#F3ECE0] text-slate-600 sticky top-0 border-b border-[#dfd6c4] z-10">
            <tr>
              <th className="py-2.5 px-3">TIMESTAMP</th>
              <th className="py-2.5 px-3">OPERATOR / CREDENTIAL</th>
              <th className="py-2.5 px-3">ACTION</th>
              <th className="py-2.5 px-3">VFD TRANSITION</th>
              <th className="py-2.5 px-3">RESULTING STATE</th>
              <th className="py-2.5 px-3">PHYSICAL JUSTIFICATION & NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfd6c4]/60 text-slate-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-400 font-mono">
                  {loading ? 'Loading audit trail from MongoDB Atlas...' : 'No operator decisions recorded yet.'}
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => {
                const dateStr = new Date(log.timestamp).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={log._id || idx} className="hover:bg-[#F3ECE0]/50 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{dateStr}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-800">
                      {log.operatorName || 'Senior Production Engineer'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold">
                      <span className="text-slate-500">{log.previousSpm}</span>
                      <span className="text-orange-600 mx-1.5">→</span>
                      <span className="text-emerald-700">{log.targetSpm} SPM</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#F3ECE0] text-slate-700 border border-[#dfd6c4] text-[10px] font-bold">
                        {log.resultingStatus || 'RECORDED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md truncate" title={log.notes}>
                      {log.notes || 'Routine VFD optimization commit.'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

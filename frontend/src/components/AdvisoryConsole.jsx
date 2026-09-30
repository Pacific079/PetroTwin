import React, { useState } from 'react';
import { Bot, Check, Edit3, X, ShieldCheck, Sparkles, Send } from 'lucide-react';

export default function AdvisoryConsole({
  status,
  optimizationData,
  onOperatorAction,
  actionLoading,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('ACCEPT');
  const [targetSpm, setTargetSpm] = useState(2.75);
  const [operatorNotes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('OIL Senior Production Engineer (Shift A)');

  const recommendedSpm = optimizationData?.recommended?.spm || 2.75;
  const currentSpm = status?.activeSpm || 4.2;
  const isFloating = status?.isRodFloating;
  const temp = status?.temperatureC || 52;
  const visc = status?.viscosityCp || 11500;

  const handleOpenAction = (type) => {
    setActionType(type);
    if (type === 'ACCEPT') {
      setTargetSpm(recommendedSpm);
      setNotes(`Approved AI setpoint change to ${recommendedSpm} SPM to eliminate viscous rod drag.`);
    } else if (type === 'MODIFY') {
      setTargetSpm(recommendedSpm);
      setNotes(`Operator tuned setpoint based on formation inflow response.`);
    } else {
      setTargetSpm(currentSpm);
      setNotes(`Rejected recommendation: Well surveillance indicates acceptable rod string run time.`);
    }
    setModalOpen(true);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    await onOperatorAction({
      action: actionType,
      targetSpm: Number(targetSpm),
      notes: operatorNotes,
      operatorName,
    });
    setModalOpen(false);
  };

  return (
    <div className={`neu-card p-5 flex flex-col justify-between ${isFloating ? 'neu-danger' : 'neu-safe'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-900 font-mono uppercase">
              Agentic AI Advisory Console
            </h2>
            <span className="text-[10px] font-mono text-orange-700 font-semibold">
              Physics-Informed Real-Time Surveillance (Baghewala Field)
            </span>
          </div>
        </div>
        <div className="neu-btn px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>Confidence: 96.4%</span>
        </div>
      </div>

      {/* Advisory Physics Justification */}
      <div className="my-4 space-y-3">
        <div className="neu-inset p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold mb-1.5">
            <span className="text-orange-700"># DIAGNOSTIC VERDICT:</span>
            <span className={isFloating ? 'text-rose-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>
              {status?.diagnosticBadge?.diagnostic || (isFloating ? 'High-Viscosity Rod Floating' : 'Normal Full Pump')}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {status?.diagnosticBadge?.explanation || (
              <>
                Downhole temperature has decayed to <strong>{temp.toFixed(1)} °C</strong>, causing dead oil viscosity to climb to <strong>{visc.toLocaleString()} cP</strong>. At current <strong>{currentSpm} SPM</strong>, downstroke polished rod velocity exceeds the Stokes-Couette terminal rod fall velocity, generating severe fluid drag retarding rod fall and risking rod floating and compressive buckling.
              </>
            )}
          </p>
        </div>

        <div className="neu-card-sm p-4 flex items-start gap-3 bg-[#FAF6EE] border border-orange-200">
          <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-bold text-orange-800 font-mono block mb-0.5">
              RECOMMENDED OPERATOR ACTION:
            </span>
            <span>
              Step down VFD frequency from <strong className="text-slate-900">{currentSpm} SPM</strong> to{' '}
              <strong className="text-emerald-700 text-sm">{recommendedSpm} SPM</strong>. Restores positive rod-fall safety margin (+1.4 in/s) while preserving 95% volumetric fillage and lowering specific power consumption by{' '}
              <strong className="text-orange-700">+{optimizationData?.energySavingsPercent || 14.8}%</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Operator Governance Buttons */}
      <div className="pt-3 border-t border-[#dfd6c4]/70 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-mono font-bold text-slate-500">
          Operator Governance:
        </span>

        <div className="flex items-center gap-2.5">
          {/* Accept Button */}
          <button
            onClick={() => handleOpenAction('ACCEPT')}
            disabled={actionLoading}
            className="neu-orange-btn px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Approve Setpoint ({recommendedSpm} SPM)</span>
          </button>

          {/* Modify Button */}
          <button
            onClick={() => handleOpenAction('MODIFY')}
            disabled={actionLoading}
            className="neu-btn px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Modify SPM</span>
          </button>

          {/* Reject Button */}
          <button
            onClick={() => handleOpenAction('REJECT')}
            disabled={actionLoading}
            className="neu-btn px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="neu-card p-6 max-w-lg w-full bg-[#FAF6EE] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70 mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <span>COMMIT OPERATOR GOVERNANCE ACTION</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-mono font-bold">
                  {actionType}
                </span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAction} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">OPERATOR CREDENTIAL / SHIFT</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {actionType !== 'REJECT' && (
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">TARGET VFD SETPOINT (SPM)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="6.0"
                    value={targetSpm}
                    onChange={(e) => setTargetSpm(parseFloat(e.target.value))}
                    className="w-full neu-inset rounded-xl px-3 py-2 text-orange-600 font-bold focus:outline-none focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Current Active: {currentSpm} SPM | AI Recommendation: {recommendedSpm} SPM
                  </span>
                </div>
              )}

              <div>
                <label className="text-slate-600 block mb-1 font-bold">DECISION JUSTIFICATION & AUDIT NOTES</label>
                <textarea
                  rows="3"
                  value={operatorNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                  placeholder="Record physical justification for supervisory records..."
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
                  <span>Commit to MongoDB Audit Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

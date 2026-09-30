import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WhatIfSimulator({
  currentValues = { spm: 4.2, steamVolumeTonnes: 2000, soakDays: 10, producingDay: 38 },
  onSimulate,
  simulationResult,
  loading,
}) {
  const [spm, setSpm] = useState(currentValues.spm);
  const [steamTonnes, setSteamTonnes] = useState(currentValues.steamVolumeTonnes);
  const [soakDays, setSoakDays] = useState(currentValues.soakDays);
  const [producingDay, setProducingDay] = useState(currentValues.producingDay);

  useEffect(() => {
    if (currentValues) {
      setSpm(currentValues.spm);
      setSteamTonnes(currentValues.steamVolumeTonnes);
      setSoakDays(currentValues.soakDays);
      setProducingDay(currentValues.producingDay);
    }
  }, [currentValues.spm, currentValues.producingDay]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSimulate({
        spm: Number(spm),
        steamVolumeTonnes: Number(steamTonnes),
        soakDays: Number(soakDays),
        producingDay: Number(producingDay),
      });
    }, 120);

    return () => clearTimeout(handler);
  }, [spm, steamTonnes, soakDays, producingDay]);

  const handleReset = () => {
    setSpm(currentValues.spm);
    setSteamTonnes(currentValues.steamVolumeTonnes);
    setSoakDays(currentValues.soakDays);
    setProducingDay(currentValues.producingDay);
  };

  const isSimFloating = simulationResult?.isRodFloating;
  const simMargin = simulationResult?.rodFallSafetyMargin;
  const simProb = simulationResult?.rodFloatProbability || 0;

  return (
    <div className={`neu-card p-5 flex flex-col justify-between ${isSimFloating ? 'neu-danger' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-orange-600" />
          <h2 className="text-sm font-bold tracking-wide text-slate-800 font-mono uppercase">
            What-If Scenario Simulator
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="neu-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-mono font-semibold transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Slider 1: VFD Pumping Speed */}
        <div className="neu-inset p-3.5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-bold text-slate-700">VFD PUMPING SPEED</label>
            <span className="neu-btn px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono text-orange-600">
              {Number(spm).toFixed(2)} SPM
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.1"
            value={spm}
            onChange={(e) => setSpm(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#dfd6c4] rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>1.0 SPM (Safe)</span>
            <span>Target: 2.75</span>
            <span>6.0 SPM (Severe Drag)</span>
          </div>
        </div>

        {/* Slider 2: Producing Day */}
        <div className="neu-inset p-3.5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-bold text-slate-700">CYCLE PRODUCING DAY</label>
            <span className="neu-btn px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono text-amber-700">
              Day {producingDay}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={producingDay}
            onChange={(e) => setProducingDay(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#dfd6c4] rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>Day 1 (Hot ~101°C)</span>
            <span>Turnaround ~Day 52</span>
            <span>Day 60 (Cold ~49°C)</span>
          </div>
        </div>

        {/* Slider 3: Injected Steam CWE Volume */}
        <div className="neu-inset p-3.5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-bold text-slate-700">STEAM VOLUME (CWE)</label>
            <span className="neu-btn px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono text-blue-600">
              {steamTonnes.toLocaleString()} Tonnes
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="3500"
            step="100"
            value={steamTonnes}
            onChange={(e) => setSteamTonnes(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#dfd6c4] rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>1,000 t</span>
            <span>Baseline: 2,000 t</span>
            <span>3,500 t</span>
          </div>
        </div>

        {/* Slider 4: Soak Days */}
        <div className="neu-inset p-3.5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-bold text-slate-700">STEAM SOAK DURATION</label>
            <span className="neu-btn px-2.5 py-0.5 rounded-lg text-sm font-bold font-mono text-indigo-600">
              {soakDays} Days
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={soakDays}
            onChange={(e) => setSoakDays(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#dfd6c4] rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>5 Days</span>
            <span>Optimum: 10 Days</span>
            <span>20 Days</span>
          </div>
        </div>
      </div>

      {/* Real-time What-If Response Readout */}
      {simulationResult && (
        <div className="neu-card-sm p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-700 font-bold uppercase">
              Predicted Dynamic Response:
            </span>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isSimFloating
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {isSimFloating ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isSimFloating ? `ROD FLOATING (${simProb}% RISK)` : 'SAFE ROD STROKE'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-[#dfd6c4]/60">
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">PREDICTED OIL</span>
              <span className="font-bold text-yellow-700">{simulationResult.oilRateBopd} BOPD</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">ROD FALL MARGIN</span>
              <span className={`font-bold ${simMargin < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {simMargin > 0 ? `+${simMargin.toFixed(1)}` : simMargin?.toFixed(1)} in/s
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">POWER DRAW</span>
              <span className="font-bold text-blue-600">{simulationResult.electricPowerKw} kW</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">VISCOSITY (DAY {producingDay})</span>
              <span className="font-bold text-amber-700">{simulationResult.viscosityCp?.toLocaleString()} cP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

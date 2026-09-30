import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Activity, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function DynacardViewer({ dynacardData, title = "Dynacard Inversion (Gibbs 1D Wave Solver)" }) {
  const plotRef = useRef(null);

  const surfaceCard = dynacardData?.surfaceCard || [];
  const downholeCard = dynacardData?.downholeCard || [];
  const pprl = dynacardData?.pprlLbs || 0;
  const mprl = dynacardData?.mprlLbs || 0;
  const isFloating = dynacardData?.isRodFloating;
  const diagnostic = dynacardData?.diagnostic?.diagnostic || dynacardData?.diagnostic || 'Normal Full Pump';
  const confidence = dynacardData?.diagnostic?.confidence || 0.95;

  useEffect(() => {
    if (!plotRef.current || surfaceCard.length === 0) return;

    const surfaceX = surfaceCard.map((p) => p.positionInches);
    const surfaceY = surfaceCard.map((p) => p.loadLbs);

    const downholeX = downholeCard.map((p) => p.positionInches);
    const downholeY = downholeCard.map((p) => p.loadLbs);

    // Ensure closed loop
    if (surfaceX.length > 0 && surfaceX[0] !== surfaceX[surfaceX.length - 1]) {
      surfaceX.push(surfaceX[0]);
      surfaceY.push(surfaceY[0]);
    }
    if (downholeX.length > 0 && downholeX[0] !== downholeX[downholeX.length - 1]) {
      downholeX.push(downholeX[0]);
      downholeY.push(downholeY[0]);
    }

    const traces = [
      // Surface Card
      {
        x: surfaceX,
        y: surfaceY,
        name: 'Surface Card (Polished Rod)',
        mode: 'lines',
        line: {
          color: '#2563EB', // Blue
          width: 2.5,
        },
        type: 'scatter',
        hoverinfo: 'x+y+name',
      },
      // Downhole Pump Dynacard
      {
        x: downholeX,
        y: downholeY,
        name: 'Downhole Card (Pump Plunger)',
        mode: 'lines',
        line: {
          color: isFloating ? '#E11D48' : '#EA580C', // Rose if floating, Warm Orange if nominal
          width: 3.0,
        },
        fill: 'toself',
        fillcolor: isFloating ? 'rgba(225, 29, 72, 0.12)' : 'rgba(234, 88, 12, 0.12)',
        type: 'scatter',
        hoverinfo: 'x+y+name',
      },
      // PPRL Limit Line
      {
        x: [0, 125],
        y: [26000, 26000],
        name: 'PPRL Limit (26k lbs)',
        mode: 'lines',
        line: {
          color: '#DC2626',
          width: 1.5,
          dash: 'dash',
        },
        type: 'scatter',
        hoverinfo: 'name',
      },
      // MPRL Limit Line
      {
        x: [0, 125],
        y: [2000, 2000],
        name: 'MPRL Limit (2k lbs)',
        mode: 'lines',
        line: {
          color: '#D97706',
          width: 1.5,
          dash: 'dot',
        },
        type: 'scatter',
        hoverinfo: 'name',
      },
    ];

    const layout = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(245, 239, 228, 0.5)',
      margin: { l: 60, r: 25, t: 25, b: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        font: { color: '#334155', size: 10, family: 'Plus Jakarta Sans' },
        bgcolor: 'rgba(250, 246, 238, 0.9)',
        bordercolor: '#dfd6c4',
        borderwidth: 1,
      },
      xaxis: {
        title: { text: 'Stroke Position (Inches)', font: { color: '#475569', size: 11 } },
        range: [-5, 130],
        gridcolor: 'rgba(223, 214, 196, 0.7)',
        zerolinecolor: '#cbd5e1',
        tickfont: { color: '#475569', size: 10, family: 'JetBrains Mono' },
      },
      yaxis: {
        title: { text: 'Rod Load (lbs)', font: { color: '#475569', size: 11 } },
        range: [-3000, 28000],
        gridcolor: 'rgba(223, 214, 196, 0.7)',
        zerolinecolor: '#cbd5e1',
        tickfont: { color: '#475569', size: 10, family: 'JetBrains Mono' },
      },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.react(plotRef.current, traces, layout, config);

    const handleResize = () => {
      if (plotRef.current) {
        Plotly.Plots.resize(plotRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [surfaceCard, downholeCard, isFloating, pprl, mprl]);

  return (
    <div className={`neu-card p-5 flex flex-col h-full ${isFloating ? 'neu-danger' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#dfd6c4]/70 gap-2">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isFloating ? 'text-rose-600' : 'text-orange-600'}`} />
          <h2 className="text-sm font-bold tracking-wide text-slate-800 font-mono uppercase">
            {title}
          </h2>
        </div>

        {/* Diagnostic Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
            isFloating
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            {isFloating ? <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{diagnostic} ({(confidence * 100).toFixed(0)}%)</span>
          </span>
        </div>
      </div>

      {/* Plot Area */}
      <div className="relative w-full h-[360px] my-2 neu-inset rounded-2xl p-2">
        <div ref={plotRef} className="w-full h-full" />
      </div>

      {/* Load Footer Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#dfd6c4]/70 text-xs font-mono">
        <div className="neu-card-sm p-2.5">
          <span className="text-slate-500 block text-[10px] font-bold">MEASURED PPRL</span>
          <span className="font-bold text-slate-900">{pprl.toLocaleString()} lbs</span>
        </div>
        <div className="neu-card-sm p-2.5">
          <span className="text-slate-500 block text-[10px] font-bold">MINIMUM LOAD (MPRL)</span>
          <span className={`font-bold ${mprl < 2000 ? 'text-rose-600' : 'text-slate-900'}`}>
            {mprl.toLocaleString()} lbs
          </span>
        </div>
        <div className="neu-card-sm p-2.5">
          <span className="text-slate-500 block text-[10px] font-bold">ROD FALL MARGIN</span>
          <span className={`font-bold ${isFloating ? 'text-rose-600' : 'text-emerald-700'}`}>
            {dynacardData?.rodFallSafetyMargin !== undefined ? `${dynacardData.rodFallSafetyMargin} in/s` : 'N/A'}
          </span>
        </div>
        <div className="neu-card-sm p-2.5">
          <span className="text-slate-500 block text-[10px] font-bold">WAVE VELOCITY / DAMPING</span>
          <span className="font-bold text-slate-700">
            16k ft/s | c={dynacardData?.dampingCoefficient || 3.8}
          </span>
        </div>
      </div>
    </div>
  );
}

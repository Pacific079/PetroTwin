import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Target, Award, ArrowRight } from 'lucide-react';

export default function ParetoOptimizerView({ optimizationData, onApplySpm }) {
  const plotRef = useRef(null);

  const candidates = optimizationData?.candidates || [];
  const recommended = optimizationData?.recommended;
  const current = optimizationData?.currentOperatingPoint;
  const energySavings = optimizationData?.energySavingsPercent || 0;

  useEffect(() => {
    if (!plotRef.current || candidates.length === 0) return;

    const feasible = candidates.filter((c) => c.isFeasible);
    const infeasible = candidates.filter((c) => !c.isFeasible);

    const traces = [
      // Infeasible
      {
        x: infeasible.map((c) => c.kwhPerBbl),
        y: infeasible.map((c) => c.oilRateBopd),
        text: infeasible.map((c) => `${c.spm} SPM: ${c.violationReason}`),
        name: 'Constrained Points',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: '#DC2626',
          size: 7,
          symbol: 'x',
        },
        hoverinfo: 'x+y+text',
      },
      // Feasible Pareto Candidates
      {
        x: feasible.map((c) => c.kwhPerBbl),
        y: feasible.map((c) => c.oilRateBopd),
        text: feasible.map((c) => `${c.spm} SPM (Stress: ${c.cyclicStressPsi} psi)`),
        name: 'Feasible Trade-off',
        mode: 'lines+markers',
        type: 'scatter',
        line: { color: '#0284C7', width: 2, dash: 'dot' },
        marker: {
          color: '#0284C7',
          size: 9,
        },
        hoverinfo: 'x+y+text',
      },
      // Current Operating Point
      ...(current
        ? [
            {
              x: [current.kwhPerBbl],
              y: [current.oilRateBopd],
              text: [`Current: ${current.spm} SPM`],
              name: `Current (${current.spm} SPM)`,
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: '#D97706',
                size: 13,
                symbol: 'star',
                line: { color: '#FFFFFF', width: 1.5 },
              },
              hoverinfo: 'x+y+text',
            },
          ]
        : []),
      // Recommended Optimal Point
      ...(recommended
        ? [
            {
              x: [recommended.kwhPerBbl],
              y: [recommended.oilRateBopd],
              text: [`Recommended: ${recommended.spm} SPM (Optimal)`],
              name: `Recommended (${recommended.spm} SPM)`,
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: '#10B981',
                size: 15,
                symbol: 'diamond',
                line: { color: '#FFFFFF', width: 2 },
              },
              hoverinfo: 'x+y+text',
            },
          ]
        : []),
    ];

    const layout = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(245, 239, 228, 0.5)',
      margin: { l: 55, r: 25, t: 25, b: 50 },
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
        title: { text: 'Specific Energy Consumption (kWh / bbl)', font: { color: '#475569', size: 11 } },
        gridcolor: 'rgba(223, 214, 196, 0.7)',
        tickfont: { color: '#475569', size: 10, family: 'JetBrains Mono' },
      },
      yaxis: {
        title: { text: 'Oil Production Rate (BOPD)', font: { color: '#475569', size: 11 } },
        gridcolor: 'rgba(223, 214, 196, 0.7)',
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
  }, [candidates, recommended, current]);

  return (
    <div className="neu-card p-5 flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#dfd6c4]/70 gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold tracking-wide text-slate-800 font-mono uppercase">
            Multi-Objective Pareto Optimization Frontier
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
          Constraints: PPRL &lt; 26k lbs | MPRL &gt; 2k lbs
        </span>
      </div>

      {/* Plot Area */}
      <div className="relative w-full h-[320px] my-2 neu-inset rounded-2xl p-2">
        <div ref={plotRef} className="w-full h-full" />
      </div>

      {/* Recommended Recommendation Pill */}
      {recommended && (
        <div className="neu-card-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  OPTIMAL VFD SETPOINT: {recommended.spm} SPM
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  +{energySavings}% Efficiency
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                Produces {recommended.oilRateBopd} BOPD | Zero Rod Floating Margin (+{recommended.rodFallSafetyMargin} in/s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onApplySpm(recommended.spm)}
              className="neu-orange-btn px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Load AI Setpoint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

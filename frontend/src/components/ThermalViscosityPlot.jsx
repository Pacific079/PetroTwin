import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Flame } from 'lucide-react';

export default function ThermalViscosityPlot({ history = [], currentDay = 38 }) {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!plotRef.current || history.length === 0) return;

    const days = history.map((d) => d.day);
    const temps = history.map((d) => d.reservoirTempC);
    const viscosities = history.map((d) => d.deadOilViscosityCp);

    const traces = [
      // Temperature trace (Left Y-axis)
      {
        x: days,
        y: temps,
        name: 'Reservoir Temp (°C)',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#E11D48', width: 2.5 },
        marker: { size: 4, color: '#E11D48' },
        yaxis: 'y1',
        hoverinfo: 'x+y+name',
      },
      // Viscosity trace (Right Y-axis, Logarithmic)
      {
        x: days,
        y: viscosities,
        name: 'Dead Oil Viscosity (cP)',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#D97706', width: 2.5, dash: 'dot' },
        marker: { size: 4, color: '#D97706' },
        yaxis: 'y2',
        hoverinfo: 'x+y+name',
      },
      // Current Day Indicator Vertical Line
      {
        x: [currentDay, currentDay],
        y: [0, 160],
        name: `Current Day ${currentDay}`,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#EA580C', width: 2, dash: 'dash' },
        yaxis: 'y1',
        hoverinfo: 'name',
      },
    ];

    const layout = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(245, 239, 228, 0.5)',
      margin: { l: 50, r: 60, t: 25, b: 50 },
      showlegend: true,
      legend: {
        x: 0.1,
        y: 1.15,
        orientation: 'h',
        font: { color: '#334155', size: 10, family: 'Plus Jakarta Sans' },
        bgcolor: 'transparent',
      },
      xaxis: {
        title: { text: 'Cycle Producing Day (t)', font: { color: '#475569', size: 11 } },
        range: [0, 62],
        gridcolor: 'rgba(223, 214, 196, 0.7)',
        tickfont: { color: '#475569', size: 10, family: 'JetBrains Mono' },
      },
      yaxis: {
        title: { text: 'Temperature (°C)', font: { color: '#E11D48', size: 11 } },
        range: [40, 150],
        gridcolor: 'rgba(223, 214, 196, 0.7)',
        tickfont: { color: '#E11D48', size: 10, family: 'JetBrains Mono' },
      },
      yaxis2: {
        title: { text: 'Viscosity (cP, Log Scale)', font: { color: '#D97706', size: 11 } },
        type: 'log',
        overlaying: 'y',
        side: 'right',
        tickfont: { color: '#D97706', size: 10, family: 'JetBrains Mono' },
      },
      annotations: [
        {
          x: currentDay,
          y: 135,
          xref: 'x',
          yref: 'y1',
          text: `Day ${currentDay}`,
          showarrow: true,
          arrowhead: 2,
          arrowcolor: '#EA580C',
          font: { color: '#EA580C', size: 10, family: 'JetBrains Mono' },
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          bordercolor: '#EA580C',
          borderwidth: 1,
        },
      ],
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
  }, [history, currentDay]);

  return (
    <div className="neu-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd6c4]/70">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-bold tracking-wide text-slate-800 font-mono uppercase">
            Thermal Decline & Viscosity Transient (60-Day CSS Cycle)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Boberg-Lantz & Walther Models</span>
      </div>

      <div className="relative w-full h-[360px] my-2 neu-inset rounded-2xl p-2">
        <div ref={plotRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#dfd6c4]/70 text-[11px] font-mono text-slate-500">
        <span>Initial Hot Flush: 101°C / 122 cP</span>
        <span className="text-orange-700 font-bold">Active: Day 38 (53.4°C / 7,646 cP)</span>
        <span>Formation Native: 48°C / 24,000 cP</span>
      </div>
    </div>
  );
}

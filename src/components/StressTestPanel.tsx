import React, { useState } from 'react';
import { ShieldAlert, RotateCcw, AlertTriangle, TrendingUp, Sliders } from 'lucide-react';

interface StressTestPanelProps {
  totalLoans: number;
  baseNplRatio: number;
  baseNplBalance: number;
}

export const StressTestPanel: React.FC<StressTestPanelProps> = ({
  totalLoans,
  baseNplRatio,
  baseNplBalance,
}) => {
  const [delinquencyShockBps, setDelinquencyShockBps] = useState<number>(100); // 100 bps = 1.00%
  const [lossGivenDefaultPct, setLossGivenDefaultPct] = useState<number>(45); // Standard Basel LGD = 45%

  const shockPct = delinquencyShockBps / 100;
  const stressedNplRatio = Math.min(baseNplRatio + shockPct, 100);
  const stressedNplBalance = (stressedNplRatio / 100) * totalLoans;
  const incrementalNplBalance = Math.max(stressedNplBalance - baseNplBalance, 0);
  const additionalCapitalProvision = incrementalNplBalance * (lossGivenDefaultPct / 100);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleReset = () => {
    setDelinquencyShockBps(100);
    setLossGivenDefaultPct(45);
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Credit Risk Macroeconomic Stress Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model portfolio vulnerability under adverse macroeconomic delinquency migrations
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer self-start sm:self-auto font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Simulator Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs bg-slate-50 p-4 rounded border border-slate-200">
        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
            <span>Delinquency Rate Shock (+bps):</span>
            <span className="font-mono text-indigo-700">+{delinquencyShockBps} bps (+{shockPct.toFixed(2)}%)</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="25"
            value={delinquencyShockBps}
            onChange={(e) => setDelinquencyShockBps(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>0 bps (Baseline)</span>
            <span>+150 bps (Moderate)</span>
            <span>+300 bps (Severe)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
            <span>Assumed Loss Given Default (LGD):</span>
            <span className="font-mono text-indigo-700">{lossGivenDefaultPct}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="70"
            step="5"
            value={lossGivenDefaultPct}
            onChange={(e) => setLossGivenDefaultPct(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>20% (High Collateral)</span>
            <span>45% (Basel Standard)</span>
            <span>70% (Unsecured)</span>
          </div>
        </div>
      </div>

      {/* Stressed Outcomes Output Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
        <div className="p-3 bg-white border border-slate-200 rounded">
          <span className="text-slate-500 font-sans block mb-1">Baseline NPL Ratio</span>
          <div className="text-lg font-bold text-slate-800">{baseNplRatio.toFixed(2)}%</div>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            Volume: {formatCurrency(baseNplBalance)}
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded">
          <span className="text-slate-500 font-sans block mb-1">Stressed NPL Ratio</span>
          <div className="text-lg font-bold text-rose-700">{stressedNplRatio.toFixed(2)}%</div>
          <span className="text-[11px] text-rose-600 font-sans mt-0.5 block">
            Delta: +{shockPct.toFixed(2)}%
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded">
          <span className="text-slate-500 font-sans block mb-1">Projected Stressed Exposure</span>
          <div className="text-lg font-bold text-slate-900">{formatCurrency(stressedNplBalance)}</div>
          <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
            +{formatCurrency(incrementalNplBalance)}
          </span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded">
          <span className="text-amber-800 font-sans font-semibold block mb-1">
            Required Provision Reserve
          </span>
          <div className="text-lg font-bold text-amber-900 font-mono">
            {formatCurrency(additionalCapitalProvision)}
          </div>
          <span className="text-[11px] text-amber-700 font-sans mt-0.5 block">
            IFRS 9 Expected Credit Loss
          </span>
        </div>
      </div>
    </div>
  );
};

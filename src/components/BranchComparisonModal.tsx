import React, { useState, useEffect } from 'react';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BranchPerformance } from '../types/banking.js';

interface BranchComparisonModalProps {
  branches: BranchPerformance[];
  isOpen: boolean;
  onClose: () => void;
  initialBranchIdA?: string;
  initialBranchIdB?: string;
}

export const BranchComparisonModal: React.FC<BranchComparisonModalProps> = ({
  branches,
  isOpen,
  onClose,
  initialBranchIdA,
  initialBranchIdB,
}) => {
  const [branchIdA, setBranchIdA] = useState<string>(
    initialBranchIdA || (branches[0]?.branch_id ?? '')
  );
  const [branchIdB, setBranchIdB] = useState<string>(
    initialBranchIdB || (branches[1]?.branch_id ?? '')
  );

  useEffect(() => {
    if (initialBranchIdA) setBranchIdA(initialBranchIdA);
    if (initialBranchIdB) setBranchIdB(initialBranchIdB);
  }, [initialBranchIdA, initialBranchIdB]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const branchA = branches.find((b) => b.branch_id === branchIdA) || branches[0];
  const branchB = branches.find((b) => b.branch_id === branchIdB) || branches[1];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const metrics = [
    {
      label: 'Core Deposits',
      valA: branchA ? formatCurrency(branchA.total_deposits) : '$0',
      valB: branchB ? formatCurrency(branchB.total_deposits) : '$0',
      diffPct:
        branchA && branchB && branchB.total_deposits > 0
          ? ((branchA.total_deposits - branchB.total_deposits) / branchB.total_deposits) * 100
          : 0,
    },
    {
      label: 'Loan Book',
      valA: branchA ? formatCurrency(branchA.total_loans) : '$0',
      valB: branchB ? formatCurrency(branchB.total_loans) : '$0',
      diffPct:
        branchA && branchB && branchB.total_loans > 0
          ? ((branchA.total_loans - branchB.total_loans) / branchB.total_loans) * 100
          : 0,
    },
    {
      label: 'Basel II NPL Ratio',
      valA: branchA ? `${branchA.npl_ratio_pct}%` : '0%',
      valB: branchB ? `${branchB.npl_ratio_pct}%` : '0%',
      diffRaw: branchA && branchB ? branchA.npl_ratio_pct - branchB.npl_ratio_pct : 0,
    },
    {
      label: 'Active Clients',
      valA: branchA ? branchA.active_customers.toLocaleString() : '0',
      valB: branchB ? branchB.active_customers.toLocaleString() : '0',
      diffPct:
        branchA && branchB && branchB.active_customers > 0
          ? ((branchA.active_customers - branchB.active_customers) / branchB.active_customers) * 100
          : 0,
    },
    {
      label: 'Cost Efficiency Ratio',
      valA: branchA ? `${branchA.efficiency_ratio_pct}%` : '0%',
      valB: branchB ? `${branchB.efficiency_ratio_pct}%` : '0%',
      diffRaw: branchA && branchB ? branchA.efficiency_ratio_pct - branchB.efficiency_ratio_pct : 0,
    },
    {
      label: 'Annual Net Contribution',
      valA: branchA ? formatCurrency(branchA.annual_net_contribution) : '$0',
      valB: branchB ? formatCurrency(branchB.annual_net_contribution) : '$0',
      diffPct:
        branchA && branchB && branchB.annual_net_contribution > 0
          ? ((branchA.annual_net_contribution - branchB.annual_net_contribution) / branchB.annual_net_contribution) * 100
          : 0,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        role="dialog"
        aria-labelledby="comparison-title"
        className="bg-white rounded max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="comparison-title" className="text-base font-bold text-slate-900">
              Branch Benchmark &amp; Variance Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side operational comparison across key balance sheet and performance metrics
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison dialog"
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Branch Selectors */}
        <div className="p-5 border-b border-slate-100 bg-white grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch A (Subject)</label>
            <select
              value={branchIdA}
              onChange={(e) => setBranchIdA(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id} disabled={b.branch_id === branchIdB}>
                  {b.branch_name} ({b.region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch B (Benchmark)</label>
            <select
              value={branchIdB}
              onChange={(e) => setBranchIdB(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id} disabled={b.branch_id === branchIdA}>
                  {b.branch_name} ({b.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Comparison Grid */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75">
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3 text-right font-mono">{branchA?.branch_name}</th>
                <th className="py-2.5 px-3 text-right font-mono">{branchB?.branch_name}</th>
                <th className="py-2.5 px-3 text-right">Variance (A vs B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-sans font-medium text-slate-800">{m.label}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">{m.valA}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{m.valB}</td>
                  <td className="py-3 px-3 text-right">
                    {m.diffPct !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          m.diffPct > 0 ? 'text-emerald-700' : m.diffPct < 0 ? 'text-rose-700' : 'text-slate-500'
                        }`}
                      >
                        {m.diffPct > 0 ? `+${m.diffPct.toFixed(1)}%` : `${m.diffPct.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span
                        className={`font-semibold ${
                          (m.diffRaw ?? 0) <= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {(m.diffRaw ?? 0) > 0 ? `+${(m.diffRaw ?? 0).toFixed(2)}%` : `${(m.diffRaw ?? 0).toFixed(2)}%`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Benchmark calculated relative to selected counterpart.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors font-medium cursor-pointer"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};

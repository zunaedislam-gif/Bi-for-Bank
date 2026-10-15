import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle,
  FileText,
  Sliders,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { LoansSummaryResponse } from '../types/banking.js';
import { StressTestPanel } from './StressTestPanel.js';

interface LoanPortfolioProps {
  data: LoansSummaryResponse | null;
}

export const LoanPortfolio: React.FC<LoanPortfolioProps> = ({ data }) => {
  const [metricMode, setMetricMode] = useState<'volume' | 'count'>('volume');

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading loan portfolio risk models...
      </div>
    );
  }

  const { by_loan_type, aging_buckets, by_status, classification_rule } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalOutstanding = by_loan_type.reduce((acc, c) => acc + c.total_outstanding, 0);
  const totalPrincipal = by_loan_type.reduce((acc, c) => acc + c.total_principal, 0);
  const totalNplBalance = by_loan_type.reduce((acc, c) => acc + c.npl_balance, 0);
  const aggregateNplRatio = totalOutstanding > 0 ? (totalNplBalance / totalOutstanding) * 100 : 0;

  const getAgingColor = (bucket: string) => {
    if (bucket.includes('NPL') || bucket.includes('Default')) return '#e11d48'; // rose-600
    if (bucket.includes('Delinquent')) return '#f59e0b'; // amber-500
    if (bucket.includes('Grace')) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
  };

  return (
    <div className="space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Loan Portfolio Risk &amp; Credit Exposure
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit distribution by facility type, delinquency aging schedules, and regulatory asset quality
          </p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 self-start sm:self-auto text-xs">
          <button
            onClick={() => setMetricMode('volume')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              metricMode === 'volume'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exposure Volume ($)
          </button>
          <button
            onClick={() => setMetricMode('count')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Facility Count (#)
          </button>
        </div>
      </div>

      {/* Credit Risk KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Total Outstanding Balance
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Issued Principal: {formatCurrency(totalPrincipal)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Basel II NPL Ratio
          </span>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
            {aggregateNplRatio.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            NPL Exposure: {formatCurrency(totalNplBalance)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Amortization Progress
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {totalPrincipal > 0
              ? `${Math.round(((totalPrincipal - totalOutstanding) / totalPrincipal) * 100)}%`
              : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Principal Paid Down: {formatCurrency(totalPrincipal - totalOutstanding)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Credit Facilities Count
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {by_loan_type.reduce((a, b) => a + b.loan_count, 0)} Active Loans
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Across 4 Lending Segments
          </div>
        </div>
      </div>

      {/* Main Charts: Loan Type vs Delinquency Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Buckets Bar Chart */}
        <div className="bg-white border border-slate-200 rounded p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Delinquency Aging Schedule
              </h2>
              <p className="text-xs text-slate-500">
                {metricMode === 'volume'
                  ? 'Outstanding exposure ($) by Days Past Due risk horizon'
                  : 'Total facilities count (#) by Days Past Due risk horizon'}
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Basel II Standard</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging_buckets} margin={{ top: 10, right: 10, left: 15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="aging_bucket"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  stroke="#cbd5e1"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickFormatter={(val) =>
                    metricMode === 'volume' ? `$${(val / 1000000).toFixed(1)}M` : `${val}`
                  }
                />
                <Tooltip
                  formatter={(val: any) => [
                    metricMode === 'volume' ? formatCurrency(Number(val)) : `${val} facilities`,
                    metricMode === 'volume' ? 'Exposure' : 'Count',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar
                  dataKey={metricMode === 'volume' ? 'outstanding_exposure' : 'loan_count'}
                  radius={[4, 4, 0, 0]}
                >
                  {aging_buckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getAgingColor(entry.aging_bucket)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Type Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Lending Portfolio Breakdown by Product
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Outstanding volume, weighted interest rate, and NPL percentage
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Loans</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3 text-right">Yield</th>
                  <th className="py-2.5 px-3 text-right">NPL %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {by_loan_type.map((l) => (
                  <tr key={l.loan_type} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {l.loan_type}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{l.loan_count}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(l.total_outstanding)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {l.avg_interest_rate_pct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          l.npl_ratio_pct > 3.0
                            ? 'text-rose-700 bg-rose-50'
                            : l.npl_ratio_pct > 1.0
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {l.npl_ratio_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Credit Risk Stress Simulator */}
      <StressTestPanel
        totalLoans={totalOutstanding}
        baseNplRatio={aggregateNplRatio}
        baseNplBalance={totalNplBalance}
      />

      {/* Regulatory Risk Framework & Methodology Card */}
      <div className="bg-white border border-slate-200 rounded p-5 flex flex-col md:flex-row items-start gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-200">
          <img
            src="/src/assets/images/avatar_chief_risk_officer_1791745256771.jpg"
            alt="Chief Risk Officer"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              Credit Risk Governance &amp; NPL Classification Standard
            </span>
            <span className="text-slate-400 font-mono">Basel II / IFRS 9 Framework</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {classification_rule} Loans in Grace Period (1-30 DPD) are monitored without impairment provisioning.
            Early delinquency (31-89 DPD) triggers localized branch workout queues. Non-Performing Loans
            (&ge;90 DPD or explicit Default) require full loan loss reserve (LLR) capital allocation.
          </p>
        </div>
      </div>
    </div>
  );
};

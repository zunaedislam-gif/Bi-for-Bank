import React from 'react';
import {
  TrendingUp,
  Landmark,
  ShieldAlert,
  Users,
  DollarSign,
  ArrowRight,
  Info,
} from 'lucide-react';
import { OverviewResponse, BranchPerformance } from '../types/banking.js';
import { MetricCard } from './MetricCard.js';

interface ExecutiveOverviewProps {
  overviewData: OverviewResponse | null;
  branches: BranchPerformance[];
  onNavigateToBranches: () => void;
  onNavigateToDeposits: () => void;
  onNavigateToLoans: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  overviewData,
  branches,
  onNavigateToBranches,
  onNavigateToDeposits,
  onNavigateToLoans,
}) => {
  if (!overviewData) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading executive banking intelligence...
      </div>
    );
  }

  const { kpis } = overviewData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const topBranches = [...branches]
    .sort((a, b) => b.total_deposits - a.total_deposits)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner with Balanced Two-Zone Layout */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="/src/assets/images/bankbi_executive_hero_1791745231618.jpg"
            alt="BankBI Operations Headquarters"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">Core Banking Decision Support</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>FY2025 Reporting Cycle</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>8 Active Commercial Branches</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Banking Executive Cockpit &amp; Liquidity Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Integrated business intelligence synthesizing core deposits, credit exposures, branch efficiency,
              and Basel II / Bangladesh Bank risk indicators across retail, affluent, SME, and commercial divisions.
            </p>
          </div>

          {/* Right Zone in Hero: Fills the previous empty space with live institutional telemetry */}
          <div className="w-full lg:w-auto shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 bg-slate-950/70 backdrop-blur-xs border border-slate-800 rounded-lg p-4 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">CAR (Basel II)</span>
              <span className="text-base font-bold text-emerald-400">14.6%</span>
              <span className="text-[9px] text-slate-500 block">Min 10.0% Req.</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">LDR / ADR Ceiling</span>
              <span className="text-base font-bold text-indigo-400">{kpis.loan_to_deposit_ratio_pct}%</span>
              <span className="text-[9px] text-slate-500 block">Max 87.0% BB Limit</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Core Transactions</span>
              <span className="text-base font-bold text-white">5,747</span>
              <span className="text-[9px] text-slate-500 block">Relational Verified</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">KYC Compliance</span>
              <span className="text-base font-bold text-emerald-400">100%</span>
              <span className="text-[9px] text-slate-500 block">Zero Unregistered</span>
            </div>
          </div>
        </div>
      </div>


      {/* Primary KPI Grid (6 Core Banking KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard
          label="Total Core Deposits"
          value={formatCurrency(kpis.total_deposits)}
          trendPct={kpis.deposit_growth_mom_pct}
          trendLabel="MoM"
          formula="SUM(balance) WHERE status IN ('Active', 'Dormant')"
          assumption="Includes checking, savings, money market, and retail certificates of deposit."
        />
        <MetricCard
          label="Outstanding Loans"
          value={formatCurrency(kpis.total_loans_outstanding)}
          subValue={`${kpis.total_accounts} Total Accounts`}
          formula="SUM(outstanding_balance) across all active credit facilities"
          assumption="Mortgage, commercial term, vehicle finance, and personal lines."
        />
        <MetricCard
          label="Active Customers"
          value={kpis.active_customers.toLocaleString()}
          subValue={`${Math.round((kpis.active_customers / (kpis.total_customers || 1)) * 100)}% Activity Rate`}
          formula="(COUNT(Active Customers) / Total Customers) * 100"
          assumption="Customers with at least 1 transactional activity in past 90 days."
          statusVariant="positive"
        />
        <MetricCard
          label="Loan-to-Deposit (LDR)"
          value={`${kpis.loan_to_deposit_ratio_pct}%`}
          subValue="Target: 70 - 90%"
          formula="(Total Outstanding Loans / Total Deposits) * 100"
          assumption="Reflects conservative balance sheet deployment and excess liquidity reserve."
          statusVariant={kpis.loan_to_deposit_ratio_pct > 95 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Basel II NPL Ratio"
          value={`${kpis.npl_ratio_pct}%`}
          subValue={`${formatCurrency(kpis.npl_balance)} NPL Vol`}
          formula="(SUM(Outstanding where DPD >= 90 OR Default) / Total Loans) * 100"
          assumption="Regulatory classification conforming to Basel II & IFRS 9 Stage 3."
          statusVariant={kpis.npl_ratio_pct > 3.0 ? 'danger' : 'positive'}
        />
        <MetricCard
          label="Net Operating Contribution"
          value={formatCurrency(kpis.net_operating_contribution)}
          subValue={`${kpis.efficiency_ratio_pct}% Efficiency`}
          formula="Simulated Revenue - Simulated Branch Operating Costs"
          assumption="Simulated illustrative margin calculations for business intelligence portfolio demo."
        />
      </div>

      {/* Main Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Branch Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Top Branch Performance Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Branches ranked by core deposit volume and credit risk governance
              </p>
            </div>
            <button
              onClick={onNavigateToBranches}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>View all 8 branches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-right">Deposits</th>
                  <th className="py-2.5 px-3 text-right">Loans</th>
                  <th className="py-2.5 px-3 text-right">NPL %</th>
                  <th className="py-2.5 px-3 text-right">Net Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {topBranches.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {b.branch_name}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {b.branch_id}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{b.region}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(b.total_deposits)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {formatCurrency(b.total_loans)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          b.npl_ratio_pct > 3.0
                            ? 'text-rose-700 bg-rose-50'
                            : b.npl_ratio_pct > 1.5
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {b.npl_ratio_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      {formatCurrency(b.annual_net_contribution)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Balance Sheet & Liquidity Summary & Compliance Monitor */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Liquidity &amp; Risk Health
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Basel II Sound
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Capital deployment, reserve cushion and delinquency aging
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Liquidity Surplus */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600 font-medium">Excess Deposit Cushion</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {formatCurrency(kpis.total_deposits - kpis.total_loans_outstanding)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(kpis.loan_to_deposit_ratio_pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Deployed (LDR): {kpis.loan_to_deposit_ratio_pct}%</span>
                <span>Unencumbered: {(100 - kpis.loan_to_deposit_ratio_pct).toFixed(1)}%</span>
              </div>
            </div>

            {/* Overdue Delinquency Breakdown */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-2">
              <div className="text-slate-700 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Credit Portfolio At-Risk</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Basel II Rules</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Grace Period (1-30 DPD)</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(kpis.overdue_exposure - kpis.delinquent_balance - kpis.npl_balance)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Early Delinquency (31-89 DPD)</span>
                <span className="font-mono tabular-nums text-amber-700">
                  {formatCurrency(kpis.delinquent_balance)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold border-t border-slate-200 pt-1">
                <span>Non-Performing (90+ DPD / NPL)</span>
                <span className="font-mono tabular-nums text-rose-700">
                  {formatCurrency(kpis.npl_balance)}
                </span>
              </div>
            </div>

            {/* Regulatory Benchmarks Card - Fills layout gap */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded space-y-1.5 text-[11px]">
              <span className="font-semibold text-indigo-900 block text-xs">
                Bangladesh Bank Prudential Compliance
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Statutory Liquidity (SLR):</span>
                <span className="font-bold text-emerald-700">18.5% (Req: 13.0%)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance-Deposit Ratio (ADR):</span>
                <span className="font-bold text-emerald-700">{kpis.loan_to_deposit_ratio_pct}% (Max: 87.0%)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gross NPL Threshold:</span>
                <span className={`font-bold ${kpis.npl_ratio_pct > 3.0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {kpis.npl_ratio_pct}% (Ceiling: 5.0%)
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-1 grid grid-cols-2 gap-2">
              <button
                onClick={onNavigateToDeposits}
                className="w-full py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-center cursor-pointer"
              >
                Deposit Trends
              </button>
              <button
                onClick={onNavigateToLoans}
                className="w-full py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-center cursor-pointer"
              >
                Loan Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Verifiable Synthetic Disclaimers */}
      <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 block mb-0.5">
            Synthetic Banking Portfolio Notice
          </span>
          <p className="leading-relaxed">
            All bank branch entities, customer profiles, account balances, and credit histories in BankBI
            are generated deterministically via reproducible random seeds for analytical architecture demonstration.
            Financial contribution values and cost allocations represent simulated models rather than actual banking disclosures.
          </p>
        </div>
      </div>
    </div>
  );
};

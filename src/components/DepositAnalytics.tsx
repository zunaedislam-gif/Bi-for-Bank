import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { DepositAnalyticsResponse } from '../types/banking.js';
import { DollarSign, Layers, PiggyBank, ArrowUpRight, Filter } from 'lucide-react';

interface DepositAnalyticsProps {
  data: DepositAnalyticsResponse | null;
}

export const DepositAnalytics: React.FC<DepositAnalyticsProps> = ({ data }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'stack' | 'total'>('stack');

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading deposit trends &amp; product analytics...
      </div>
    );
  }

  const { by_account_type, balance_tiers, monthly_trends } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalDepositVolume = by_account_type.reduce((acc, c) => acc + c.total_balance, 0);

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Core Deposit Analytics &amp; Liquidity Inflows
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            12-month portfolio deposit progression, account mix, and balance-tier concentration
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('stack')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              viewMode === 'stack'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Stack Area
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              viewMode === 'total'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Trajectory
          </button>
        </div>
      </div>

      {/* Account Type Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {by_account_type.map((acct) => {
          const sharePct = totalDepositVolume > 0 ? (acct.total_balance / totalDepositVolume) * 100 : 0;
          const isSelected = selectedVehicle === acct.account_type;

          return (
            <div
              key={acct.account_type}
              onClick={() => setSelectedVehicle(isSelected ? 'ALL' : acct.account_type)}
              className={`bg-white border rounded p-4 cursor-pointer transition-all hover:shadow-xs ${
                isSelected
                  ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-800">{acct.account_type}</span>
                <span className="font-mono tabular-nums">{acct.account_count} accounts</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mb-1">
                {formatCurrency(acct.total_balance)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-mono tabular-nums">
                <span>{sharePct.toFixed(1)}% Share</span>
                <span>Avg: {formatCurrency(acct.avg_balance)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 12-Month Area Chart */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              12-Month Core Deposit Trajectory
            </h2>
            <p className="text-xs text-slate-500">
              {selectedVehicle === 'ALL'
                ? 'Historical balance progression across all deposit vehicles'
                : `Filtered view for ${selectedVehicle} accounts`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs" />
              <span>Checking</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-xs" />
              <span>Savings</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
              <span>Money Market</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
              <span>Certificates of Deposit</span>
            </span>
            {selectedVehicle !== 'ALL' && (
              <button
                onClick={() => setSelectedVehicle('ALL')}
                className="text-xs text-indigo-600 underline font-sans font-medium cursor-pointer"
              >
                Reset vehicle filter
              </button>
            )}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'total' ? (
              <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Total Core Deposits']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_deposits"
                  name="Total Deposits"
                  stroke="#4f46e5"
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChecking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                {(selectedVehicle === 'ALL' || selectedVehicle === 'Savings') && (
                  <Area
                    type="monotone"
                    dataKey="savings"
                    name="Savings"
                    stackId="1"
                    stroke="#0ea5e9"
                    fill="url(#colorSavings)"
                  />
                )}
                {(selectedVehicle === 'ALL' || selectedVehicle === 'Checking') && (
                  <Area
                    type="monotone"
                    dataKey="checking"
                    name="Checking"
                    stackId="1"
                    stroke="#4f46e5"
                    fill="url(#colorChecking)"
                  />
                )}
                {(selectedVehicle === 'ALL' || selectedVehicle === 'Money Market') && (
                  <Area
                    type="monotone"
                    dataKey="money_market"
                    name="Money Market"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorMM)"
                  />
                )}
                {(selectedVehicle === 'ALL' || selectedVehicle === 'Certificate of Deposit') && (
                  <Area
                    type="monotone"
                    dataKey="certificates_of_deposit"
                    name="Certificates of Deposit"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#colorCD)"
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split: Account Type Detail & Balance Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Type Yield & Balances */}
        <div className="bg-white border border-slate-200 rounded p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Deposit Portfolio Structure &amp; Yields
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Cost of funds and average balance by vehicle
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Accounts</th>
                  <th className="py-2.5 px-3 text-right">Avg Balance</th>
                  <th className="py-2.5 px-3 text-right">Avg Rate (APY)</th>
                  <th className="py-2.5 px-3 text-right">Total Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {by_account_type.map((acct) => (
                  <tr key={acct.account_type} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {acct.account_type}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {acct.account_count}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {formatCurrency(acct.avg_balance)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      {acct.avg_interest_rate_pct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(acct.total_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Balance Tiers Distribution */}
        <div className="bg-white border border-slate-200 rounded p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Balance Tier Concentration
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Account distribution by relationship balance size
          </p>

          <div className="space-y-3 font-mono tabular-nums text-xs">
            {balance_tiers.map((tier) => {
              const tierShare = totalDepositVolume > 0 ? (tier.total_volume / totalDepositVolume) * 100 : 0;
              return (
                <div key={tier.balance_tier} className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex justify-between items-center mb-1 font-sans">
                    <span className="font-semibold text-slate-800">{tier.balance_tier}</span>
                    <span className="font-mono text-slate-500">{tier.count} accounts</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${tierShare}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                    <span className="font-bold text-slate-900">{formatCurrency(tier.total_volume)}</span>
                    <span>{tierShare.toFixed(1)}% of Deposits</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

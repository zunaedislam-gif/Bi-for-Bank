import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  ArrowUpDown,
  Calendar,
  X,
  Scale,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BranchPerformance } from '../types/banking.js';
import { BranchComparisonModal } from './BranchComparisonModal.js';

interface BranchMonthlyRecord {
  reporting_period: string;
  simulated_revenue: number;
  simulated_operating_cost: number;
  net_operating_contribution: number;
  efficiency_ratio_pct: number;
}

interface BranchAnalyticsProps {
  branches: BranchPerformance[];
  onSelectBranchFilter: (branchId: string) => void;
}

export const BranchAnalytics: React.FC<BranchAnalyticsProps> = ({
  branches,
  onSelectBranchFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof BranchPerformance>('total_deposits');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchPerformance | null>(null);
  const [branchMonthlyTrends, setBranchMonthlyTrends] = useState<BranchMonthlyRecord[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState<boolean>(false);

  // Comparison Modal state
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareBranchA, setCompareBranchA] = useState<string>('');
  const [compareBranchB, setCompareBranchB] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Fetch monthly trends when a branch modal opens
  useEffect(() => {
    if (selectedBranch) {
      setLoadingMonthly(true);
      fetch(`/api/branches/${selectedBranch.branch_id}/monthly`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setBranchMonthlyTrends(data);
          }
        })
        .catch((err) => console.error('Error fetching branch trend:', err))
        .finally(() => setLoadingMonthly(false));
    } else {
      setBranchMonthlyTrends([]);
    }
  }, [selectedBranch]);

  const handleSort = (field: keyof BranchPerformance) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredBranches = branches
    .filter(
      (b) =>
        b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.branch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.region.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  // Regional Aggregations
  const regionalSummary = branches.reduce<
    Record<string, { deposits: number; loans: number; customers: number; branches: number }>
  >((acc, b) => {
    if (!acc[b.region]) {
      acc[b.region] = { deposits: 0, loans: 0, customers: 0, branches: 0 };
    }
    acc[b.region].deposits += b.total_deposits;
    acc[b.region].loans += b.total_loans;
    acc[b.region].customers += b.active_customers;
    acc[b.region].branches += 1;
    return acc;
  }, {});

  const openComparison = (idA?: string, idB?: string) => {
    setCompareBranchA(idA || branches[0]?.branch_id || '');
    setCompareBranchB(idB || branches[1]?.branch_id || '');
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Branch Network &amp; Regional Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative analysis of 8 branch locations across 4 operating territories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search branch or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            onClick={() => openComparison()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title="Compare two branches side-by-side"
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare Branches</span>
          </button>
        </div>
      </div>

      {/* Regional Rollup Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(regionalSummary).map(([region, stat]) => (
          <div key={region} className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{region} Region</span>
              <span className="font-mono tabular-nums">{stat.branches} Branches</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mb-2">
              {formatCurrency(stat.deposits)}
            </div>
            <div className="text-xs text-slate-500 space-y-1 font-mono tabular-nums border-t border-slate-100 pt-2">
              <div className="flex justify-between">
                <span>Credit Volume:</span>
                <span className="text-slate-800">{formatCurrency(stat.loans)}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Clients:</span>
                <span className="text-slate-800">{stat.customers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Branch Performance Data Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Branch Performance Ledger</h2>
            <p className="text-xs text-slate-500">
              Click column headers to sort, or select a row to inspect monthly financials
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredBranches.length} of {branches.length} Branches
          </span>
        </div>

        {filteredBranches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <p className="mb-2">No branches match &quot;{searchTerm}&quot;.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 underline font-medium cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75 select-none">
                  <th
                    onClick={() => handleSort('branch_name')}
                    className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Branch Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('region')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Region</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('active_customers')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Active Clients</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('total_deposits')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Deposits</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('total_loans')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Loans</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('npl_ratio_pct')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>NPL Ratio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('annual_net_contribution')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Net Contribution</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('efficiency_ratio_pct')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cost Efficiency</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {filteredBranches.map((b) => (
                  <tr
                    key={b.branch_id}
                    onClick={() => setSelectedBranch(b)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-sans">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {b.branch_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.branch_id}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600">{b.region}</td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {b.active_customers.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(b.total_deposits)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(b.total_loans)}
                    </td>
                    <td className="py-3 px-3 text-right">
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
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      {formatCurrency(b.annual_net_contribution)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {b.efficiency_ratio_pct}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBranchFilter(b.branch_id);
                          }}
                          className="px-2 py-1 text-[11px] font-sans font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          title="Filter global dashboard to this branch"
                        >
                          Filter
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const other = branches.find((x) => x.branch_id !== b.branch_id);
                            openComparison(b.branch_id, other?.branch_id);
                          }}
                          className="px-2 py-1 text-[11px] font-sans font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer"
                          title="Compare with another branch"
                        >
                          Compare
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Branch Detail Modal with 12-Month Financial Chart */}
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header with Flagship Image */}
            <div className="relative h-44 overflow-hidden bg-slate-900 shrink-0">
              <img
                src="/src/assets/images/branch_metro_flagship_1791745245139.jpg"
                alt={selectedBranch.branch_name}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedBranch(null)}
                aria-label="Close branch modal"
                className="absolute top-3 right-3 text-white bg-slate-900/70 hover:bg-slate-900 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  {selectedBranch.region} Region · ID: {selectedBranch.branch_id}
                </span>
                <h3 className="text-xl font-bold">{selectedBranch.branch_name}</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-sans block mb-1">Core Deposits</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedBranch.total_deposits)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Avg: {formatCurrency(selectedBranch.avg_deposit_per_account)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-sans block mb-1">Loan Book</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedBranch.total_loans)}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    NPL: {selectedBranch.npl_ratio_pct}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-sans block mb-1">Annual Revenue</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedBranch.annual_revenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Net: {formatCurrency(selectedBranch.annual_net_contribution)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-sans block mb-1">Efficiency Ratio</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedBranch.efficiency_ratio_pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Target: &lt;65%
                  </span>
                </div>
              </div>

              {/* 12-Month Financial Performance Recharts Trend */}
              <div className="border border-slate-200 rounded p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      12-Month Operating Trajectory &amp; Net Margin
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Simulated Revenue vs Operating Expense vs Net Contribution
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-indigo-600 rounded-xs" />
                      <span>Revenue</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-xs" />
                      <span>Cost</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-xs" />
                      <span>Net Contribution</span>
                    </span>
                  </div>
                </div>

                {loadingMonthly ? (
                  <div className="h-44 flex items-center justify-center text-slate-400 font-mono text-[11px]">
                    Loading monthly branch progression...
                  </div>
                ) : branchMonthlyTrends.length > 0 ? (
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={branchMonthlyTrends}
                        margin={{ top: 5, right: 5, left: 15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="reporting_period"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          stroke="#cbd5e1"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          stroke="#cbd5e1"
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          formatter={(val: any) => [formatCurrency(Number(val)), '']}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="simulated_revenue"
                          name="Revenue"
                          stroke="#4f46e5"
                          fill="#4f46e5"
                          fillOpacity={0.15}
                        />
                        <Area
                          type="monotone"
                          dataKey="simulated_operating_cost"
                          name="Operating Cost"
                          stroke="#94a3b8"
                          fill="#94a3b8"
                          fillOpacity={0.1}
                        />
                        <Area
                          type="monotone"
                          dataKey="net_operating_contribution"
                          name="Net Contribution"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-slate-400">
                    No monthly data recorded for this branch.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">
                  Charter date: {selectedBranch.opening_date}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const other = branches.find((x) => x.branch_id !== selectedBranch.branch_id);
                      setSelectedBranch(null);
                      openComparison(selectedBranch.branch_id, other?.branch_id);
                    }}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Compare Branch
                  </button>
                  <button
                    onClick={() => {
                      onSelectBranchFilter(selectedBranch.branch_id);
                      setSelectedBranch(null);
                    }}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                  >
                    Set as Dashboard Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <BranchComparisonModal
        branches={branches}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialBranchIdA={compareBranchA}
        initialBranchIdB={compareBranchB}
      />
    </div>
  );
};

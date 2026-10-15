import React from 'react';
import { Filter, RotateCcw, Calendar, Building, Users } from 'lucide-react';
import { BankingFilters } from '../types/banking.js';
import { ActiveFilterBadges } from './ActiveFilterBadges.js';

interface FilterBarProps {
  filters: BankingFilters;
  onChange: (key: keyof BankingFilters, value: string) => void;
  onReset: () => void;
  branchesList: { branch_id: string; branch_name: string; region: string }[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  branchesList,
}) => {
  const isFiltered =
    filters.region !== 'ALL' ||
    filters.branchId !== 'ALL' ||
    filters.customerSegment !== 'ALL' ||
    filters.accountType !== 'ALL' ||
    filters.loanType !== 'ALL';

  // Filter branches list if region is selected
  const availableBranches =
    filters.region === 'ALL'
      ? branchesList
      : branchesList.filter((b) => b.region === filters.region);

  return (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Filter Controls Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium inline-flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters:</span>
            </span>

            {/* Region Filter */}
            <select
              value={filters.region}
              onChange={(e) => {
                onChange('region', e.target.value);
                if (e.target.value !== 'ALL' && filters.branchId !== 'ALL') {
                  // Reset branch if it doesn't match selected region
                  const branchObj = branchesList.find((b) => b.branch_id === filters.branchId);
                  if (branchObj && branchObj.region !== e.target.value) {
                    onChange('branchId', 'ALL');
                  }
                }
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="ALL">All Regions (4)</option>
              <option value="North">North Region</option>
              <option value="South">South Region</option>
              <option value="East">East Region</option>
              <option value="West">West Region</option>
            </select>

            {/* Branch Filter */}
            <select
              value={filters.branchId}
              onChange={(e) => onChange('branchId', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none max-w-[200px] truncate"
            >
              <option value="ALL">All Branches ({branchesList.length})</option>
              {availableBranches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>

            {/* Customer Segment Filter */}
            <select
              value={filters.customerSegment}
              onChange={(e) => onChange('customerSegment', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="ALL">All Segments</option>
              <option value="Retail">Retail</option>
              <option value="Affluent">Affluent</option>
              <option value="Small Business">Small Business</option>
              <option value="Commercial">Commercial</option>
            </select>

            {/* Account Type Filter */}
            <select
              value={filters.accountType}
              onChange={(e) => onChange('accountType', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="ALL">All Account Types</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Money Market">Money Market</option>
              <option value="Certificate of Deposit">Cert. of Deposit</option>
            </select>

            {/* Loan Type Filter */}
            <select
              value={filters.loanType}
              onChange={(e) => onChange('loanType', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="ALL">All Loan Types</option>
              <option value="Mortgage">Mortgage</option>
              <option value="Commercial">Commercial</option>
              <option value="Auto">Auto</option>
              <option value="Personal">Personal</option>
            </select>

            {/* Reset Button */}
            {isFiltered && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Reporting Period & Scope Metadata */}
          <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>2025-01 / 2025-12 (12 Mo In-Scope)</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Synthetic Grounded</span>
          </div>
        </div>

        {/* Active Filter Badges Strip */}
        <ActiveFilterBadges
          filters={filters}
          onClearFilter={(k) => onChange(k, 'ALL')}
          onResetAll={onReset}
          branchName={branchesList.find((b) => b.branch_id === filters.branchId)?.branch_name}
        />
      </div>
    </div>
  );
};

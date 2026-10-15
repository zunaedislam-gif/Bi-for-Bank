import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { BankingFilters } from '../types/banking.js';

interface ActiveFilterBadgesProps {
  filters: BankingFilters;
  onClearFilter: (key: keyof BankingFilters) => void;
  onResetAll: () => void;
  branchName?: string;
}

export const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  filters,
  onClearFilter,
  onResetAll,
  branchName,
}) => {
  const activeEntries: { key: keyof BankingFilters; label: string; value: string }[] = [];

  if (filters.region !== 'ALL') {
    activeEntries.push({ key: 'region', label: 'Region', value: `${filters.region} Territory` });
  }
  if (filters.branchId !== 'ALL') {
    activeEntries.push({ key: 'branchId', label: 'Branch', value: branchName || filters.branchId });
  }
  if (filters.customerSegment !== 'ALL') {
    activeEntries.push({ key: 'customerSegment', label: 'Segment', value: filters.customerSegment });
  }
  if (filters.accountType !== 'ALL') {
    activeEntries.push({ key: 'accountType', label: 'Account', value: filters.accountType });
  }
  if (filters.loanType !== 'ALL') {
    activeEntries.push({ key: 'loanType', label: 'Loan Type', value: filters.loanType });
  }

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-slate-100">
      <span className="text-slate-500 font-medium text-[11px]">Active Filters ({activeEntries.length}):</span>
      {activeEntries.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono"
        >
          <span className="text-slate-500 font-sans">{item.label}:</span>
          <span className="font-semibold">{item.value}</span>
          <button
            type="button"
            onClick={() => onClearFilter(item.key)}
            aria-label={`Remove ${item.label} filter`}
            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onResetAll}
        className="text-[11px] text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer ml-1"
      >
        Clear all
      </button>
    </div>
  );
};

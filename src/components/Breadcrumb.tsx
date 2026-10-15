import React from 'react';
import { ChevronRight, Home, X } from 'lucide-react';
import { BankingFilters } from '../types/banking.js';

interface BreadcrumbProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: BankingFilters;
  onClearFilter: (key: keyof BankingFilters) => void;
  branchName?: string;
}

const TAB_LABELS: Record<string, string> = {
  overview: 'Executive Overview',
  branches: 'Branch Analytics',
  deposits: 'Deposit Trends',
  loans: 'Loan Portfolio',
  customers: 'Customer Insights',
  'data-quality': 'Data Quality Assurance',
  reports: 'Power BI & Export Hub',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  activeTab,
  setActiveTab,
  filters,
  onClearFilter,
  branchName,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 py-2">
      <button
        onClick={() => setActiveTab('overview')}
        className="hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
        title="Go to Executive Overview"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="font-medium">BankBI</span>
      </button>

      <ChevronRight className="w-3 h-3 text-slate-400" />

      <span className="text-slate-900 font-semibold">{TAB_LABELS[activeTab] || 'Section'}</span>

      {/* Contextual Drilldown Tags */}
      {filters.region !== 'ALL' && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
            <span>{filters.region} Region</span>
            <button
              onClick={() => onClearFilter('region')}
              aria-label="Clear region filter"
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </>
      )}

      {filters.branchId !== 'ALL' && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="inline-flex items-center gap-1 text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-mono">
            <span>{branchName || filters.branchId}</span>
            <button
              onClick={() => onClearFilter('branchId')}
              aria-label="Clear branch filter"
              className="text-indigo-400 hover:text-indigo-900 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </>
      )}
    </nav>
  );
};

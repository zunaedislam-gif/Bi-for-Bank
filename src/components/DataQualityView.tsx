import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  FileCheck,
  ShieldAlert,
  Database,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DataQualityResponse, AuditEvent } from '../types/banking.js';

interface DataQualityViewProps {
  data: DataQualityResponse | null;
  onRefreshPipeline: () => void;
  isRefreshing: boolean;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  data,
  onRefreshPipeline,
  isRefreshing,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading data quality pipeline audit logs...
      </div>
    );
  }

  const { metrics, audit_summary, recent_events } = data;

  const filteredEvents = recent_events
    .filter((e) => {
      const matchSev = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchSearch =
        e.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSev && matchSearch;
    });

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Data Engineering &amp; Quality Assurance Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated schema validations, primary/foreign key constraint enforcement, and audit logs
          </p>
        </div>

        <button
          onClick={onRefreshPipeline}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Executing Pipeline Audit...' : 'Re-Run QA Pipeline'}</span>
        </button>
      </div>

      {/* Execution Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Total Evaluated Records
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.totalRecordsEvaluated.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Pipeline: {metrics.pipelineRunId}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Passed Validations
          </span>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            {metrics.passedRecords.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-mono">
            {((metrics.passedRecords / (metrics.totalRecordsEvaluated || 1)) * 100).toFixed(1)}% Pass Rate
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Quarantined Records
          </span>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
            {metrics.quarantinedRecords}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Zero Silent Discards
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Imputed / Corrected
          </span>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {metrics.imputedRecords}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Documented Business Rules
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            Pipeline Error Rate
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.errorRatePct}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            SLA Threshold: &le;0.5%
          </div>
        </div>
      </div>

      {/* Rules & Treatment Matrix */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Active Quality Control Rules &amp; Remediation Strategy
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Formal treatment specification for data anomalies identified during batch ingestion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-1 font-mono">
              DUPLICATE_PRIMARY_KEY
            </span>
            <p className="text-slate-600 mb-2 leading-relaxed">
              Detects identical transaction IDs across multiple ingestion batches.
            </p>
            <span className="text-rose-700 font-mono font-semibold">
              Action: Quarantined to audit ledger
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-1 font-mono">
              NEGATIVE_AMOUNT_CHECK
            </span>
            <p className="text-slate-600 mb-2 leading-relaxed">
              Validates that deposits, payments, and balances are strictly non-negative.
            </p>
            <span className="text-rose-700 font-mono font-semibold">
              Action: Quarantined / Excluded
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-1 font-mono">
              INVALID_DAYS_PAST_DUE
            </span>
            <p className="text-slate-600 mb-2 leading-relaxed">
              Catches negative days past due caused by misaligned counter clocks.
            </p>
            <span className="text-amber-700 font-mono font-semibold">
              Action: Imputed to 0 (Current)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-1 font-mono">
              FOREIGN_KEY_VIOLATION
            </span>
            <p className="text-slate-600 mb-2 leading-relaxed">
              Verifies orphaned customer or branch foreign keys before analytical aggregation.
            </p>
            <span className="text-rose-700 font-mono font-semibold">
              Action: Quarantined before join
            </span>
          </div>
        </div>
      </div>

      {/* Audit Log Table with Search and Pagination */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Data Quality Audit Trail &amp; Remediation Log
            </h2>
            <p className="text-xs text-slate-500">
              Live inspection of detected anomalies and automated pipeline treatments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">All Severities</option>
                <option value="ERROR">Errors Only</option>
                <option value="WARNING">Warnings Only</option>
              </select>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <p className="mb-2">No audit events match your search or filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('ALL');
              }}
              className="text-indigo-600 underline font-medium cursor-pointer"
            >
              Reset audit filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75">
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3 font-mono">Record ID</th>
                  <th className="py-2.5 px-3">Rule Violated</th>
                  <th className="py-2.5 px-3">Diagnostic Details</th>
                  <th className="py-2.5 px-3 font-mono text-right">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {paginatedEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          evt.severity === 'ERROR'
                            ? 'bg-rose-50 text-rose-700'
                            : evt.severity === 'WARNING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{evt.entity_type}</td>
                    <td className="py-2.5 px-3 text-slate-900">{evt.record_id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                      {evt.rule_name}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 max-w-xs truncate">
                      {evt.details}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans font-medium text-slate-900">
                      {evt.action_taken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredEvents.length > pageSize && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length}{' '}
              events
            </span>

            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trendPct?: number;
  trendLabel?: string;
  formula?: string;
  assumption?: string;
  statusVariant?: 'default' | 'positive' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trendPct,
  trendLabel,
  formula,
  assumption,
  statusVariant = 'default',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between transition-shadow hover:shadow-xs">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium tracking-tight text-slate-600">{label}</span>
          {(formula || assumption) && (
            <div className="group relative">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 cursor-help p-0.5"
                aria-label={`Formula for ${label}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 text-slate-100 text-xs rounded shadow-lg border border-slate-800 pointer-events-none">
                {formula && (
                  <div className="mb-1">
                    <span className="text-slate-400 block font-semibold mb-0.5">Formula:</span>
                    <span className="font-mono text-slate-200">{formula}</span>
                  </div>
                )}
                {assumption && (
                  <div>
                    <span className="text-slate-400 block font-semibold mb-0.5">Note:</span>
                    <span className="text-slate-300">{assumption}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        {trendPct !== undefined ? (
          <div className="flex items-center gap-1">
            {trendPct > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : trendPct < 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span
              className={`font-mono tabular-nums font-medium ${
                trendPct > 0
                  ? 'text-emerald-700'
                  : trendPct < 0
                  ? 'text-rose-700'
                  : 'text-slate-600'
              }`}
            >
              {trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`}
            </span>
            {trendLabel && <span className="text-slate-500 ml-1">{trendLabel}</span>}
          </div>
        ) : subValue ? (
          <span className="text-slate-500 font-mono tabular-nums">{subValue}</span>
        ) : (
          <span className="text-slate-400">Target baseline</span>
        )}

        {statusVariant !== 'default' && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              statusVariant === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : statusVariant === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {statusVariant === 'positive'
              ? 'Nominal'
              : statusVariant === 'warning'
              ? 'Watch'
              : 'Alert'}
          </span>
        )}
      </div>
    </div>
  );
};

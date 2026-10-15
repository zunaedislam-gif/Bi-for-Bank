import React from 'react';
import {
  Users,
  Smartphone,
  CreditCard,
  Briefcase,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  CustomerSegmentsResponse,
  ProductsAdoptionResponse,
} from '../types/banking.js';

interface CustomerInsightsProps {
  segmentData: CustomerSegmentsResponse | null;
  productData: ProductsAdoptionResponse | null;
}

export const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  segmentData,
  productData,
}) => {
  if (!segmentData || !productData) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading customer segments &amp; product adoption matrices...
      </div>
    );
  }

  const { segments, credit_distribution } = segmentData;
  const { products, active_customer_denominator, denominator_documentation } = productData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalClients = segments.reduce((acc, c) => acc + c.total_customers, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Customer Segmentation &amp; Product Cross-Sell
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Client profile segmentation, relationship depth, and digital product adoption rates
        </p>
      </div>

      {/* Customer Segments Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {segments.map((seg) => {
          const share = totalClients > 0 ? (seg.total_customers / totalClients) * 100 : 0;
          return (
            <div key={seg.customer_segment} className="bg-white border border-slate-200 rounded p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-900">{seg.customer_segment}</span>
                <span className="font-mono tabular-nums">{share.toFixed(1)}% Share</span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mb-1">
                {seg.total_customers} Clients
              </div>
              <div className="text-xs text-slate-500 mb-3 font-mono tabular-nums">
                {seg.active_customers} Active ({Math.round((seg.active_customers / (seg.total_customers || 1)) * 100)}%)
              </div>

              <div className="space-y-1.5 pt-2.5 border-t border-slate-100 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Total Deposits:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(seg.total_deposits)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Avg Dep/Client:</span>
                  <span className="text-slate-800">{formatCurrency(seg.avg_deposit_balance)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Loan Volume:</span>
                  <span className="text-slate-800">{formatCurrency(seg.total_loans)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cross-Sell Index:</span>
                  <span className="font-semibold text-indigo-700">{seg.products_per_customer} prods/client</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Adoption Rates Table */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Product Adoption &amp; Digital Channel Penetration
            </h2>
            <p className="text-xs text-slate-500">
              Active product enrollment rates measured against active customer cohort
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active Baseline: {active_customer_denominator} Customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/75">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Holding Clients</th>
                <th className="py-2.5 px-3 text-right">Active Enrollments</th>
                <th className="py-2.5 px-3 text-right">Total Enrollments</th>
                <th className="py-2.5 px-3 text-right">Adoption Rate %</th>
                <th className="py-2.5 px-3 text-right">Penetration Gauge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {products.map((p) => (
                <tr key={p.product_type} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">
                    {p.product_type}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">{p.customer_count}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{p.active_count}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{p.total_enrollments}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {p.adoption_rate_pct}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="w-28 ml-auto bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(p.adoption_rate_pct, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
          <span>Note: {denominator_documentation}</span>
        </div>
      </div>

      {/* Credit Score Distribution */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Credit Score Distribution Across Client Base
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Underwriting quality profile across all customer segments
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono tabular-nums text-xs">
          {credit_distribution.map((cd) => {
            const share = totalClients > 0 ? (cd.count / totalClients) * 100 : 0;
            return (
              <div key={cd.credit_score_band} className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="font-sans font-medium text-slate-800 block mb-1">
                  {cd.credit_score_band}
                </span>
                <div className="text-lg font-bold text-slate-900">{cd.count} Clients</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  {share.toFixed(1)}% of total portfolio
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

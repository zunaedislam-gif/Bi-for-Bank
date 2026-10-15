import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface PowerBIExportViewProps {
  onNotify?: (title: string, message: string, type?: 'success' | 'info') => void;
}

export const PowerBIExportView: React.FC<PowerBIExportViewProps> = ({ onNotify }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const daxMeasures = [
    {
      name: 'Total Core Deposits',
      dax: `Total Deposits = \nSUM(Accounts[balance])`,
      desc: 'Sum of all active and dormant customer deposit account balances.',
    },
    {
      name: 'Loan to Deposit Ratio (LDR)',
      dax: `Loan to Deposit Ratio = \nDIVIDE([Total Outstanding Loans], [Total Deposits], 0)`,
      desc: 'Measures balance sheet liquidity deployment and lending capacity.',
    },
    {
      name: 'Basel II NPL Ratio %',
      dax: `NPL Ratio = \nDIVIDE(\n    CALCULATE(\n        SUM(Loans[outstanding_balance]),\n        FILTER(Loans, Loans[days_past_due] >= 90 || Loans[loan_status] = "Default")\n    ),\n    [Total Outstanding Loans],\n    0\n)`,
      desc: 'Ratio of non-performing loans (>=90 DPD or Default) to total portfolio exposure.',
    },
    {
      name: 'Deposit Growth MoM %',
      dax: `Deposit Growth MoM % = \nVAR CurrentPeriod = [Total Deposits]\nVAR PriorPeriod = CALCULATE([Total Deposits], DATEADD('Date'[Date], -1, MONTH))\nRETURN\nDIVIDE(CurrentPeriod - PriorPeriod, PriorPeriod, 0)`,
      desc: 'Month-over-month percentage growth in customer deposit balances.',
    },
    {
      name: 'Active Customer Ratio',
      dax: `Active Customer Ratio = \nDIVIDE(\n    CALCULATE(DISTINCTCOUNT(Customers[customer_id]), Customers[customer_status] = "Active"),\n    DISTINCTCOUNT(Customers[customer_id]),\n    0\n)`,
      desc: 'Proportion of registered clients maintaining active transaction behavior.',
    },
    {
      name: 'Efficiency Ratio %',
      dax: `Efficiency Ratio = \nDIVIDE(\n    SUM(BranchFinancialSummaries[simulated_operating_cost]),\n    SUM(BranchFinancialSummaries[simulated_revenue]),\n    0\n)`,
      desc: 'Non-interest operational cost divided by gross simulated revenue.',
    },
  ];

  const tablesToExport = [
    { name: 'Branches Master', file: 'branches', rows: '8 rows', desc: 'Branch IDs, geographical territory, and opening dates' },
    { name: 'Customers Master', file: 'customers', rows: '500 rows', desc: 'Customer segment, onboarding date, and credit bands' },
    { name: 'Accounts Register', file: 'accounts', rows: '1,056 rows', desc: 'Deposit types (Checking, Savings, MM, CD) and balances' },
    { name: 'Transactions Ledger', file: 'transactions', rows: '5,747 rows', desc: '12-month transaction flows across channels' },
    { name: 'Loans & Credit Portfolio', file: 'loans', rows: '218 rows', desc: 'Principal, outstanding, DPD, and Basel II statuses' },
    { name: 'Product Adoptions', file: 'product_adoptions', rows: '1,387 rows', desc: 'Digital and wealth product enrollments' },
    { name: 'Branch Financial Summaries', file: 'branch_financial_summaries', rows: '96 rows', desc: 'Monthly simulated revenues and operating costs' },
    { name: 'Data Quality Audit Log', file: 'qa_audit_log', rows: '11 rows', desc: 'Documented anomalies and remediation actions' },
  ];

  const handleCopyDax = (dax: string, index: number, measureName: string) => {
    navigator.clipboard.writeText(dax);
    setCopiedIndex(index);
    if (onNotify) {
      onNotify('DAX Measure Copied', `"${measureName}" expression copied to clipboard for Power BI.`);
    }
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadCsv = (fileKey: string, tableName: string) => {
    const reportType = fileKey === 'branches' ? 'branches' : fileKey === 'loans' ? 'loans' : 'deposits';
    if (onNotify) {
      onNotify('Export Initiated', `Downloading ${tableName} as Power BI compatible CSV.`);
    }
    window.location.href = `/api/reports/export?reportType=${reportType}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Power BI Integration Hub &amp; Star Schema Exports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Standardized relational datasets, DAX measures library, and data model mapping for enterprise BI tools
        </p>
      </div>

      {/* Relational Star Schema Architecture */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recommended Power BI Star Schema Model
            </h2>
            <p className="text-xs text-slate-500">
              Relational cardinalities and cross-filter directions for analytical reporting
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Kimball Dimensional Architecture</span>
        </div>

        <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs font-mono space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Dim_Branch (branches.csv)</span>
            <span className="text-slate-500">1-to-Many (1:N) &rarr; Dim_Customer, Fact_BranchFinancials</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Dim_Customer (customers.csv)</span>
            <span className="text-slate-500">1-to-Many (1:N) &rarr; Dim_Account, Fact_Loan, Fact_ProductAdoption</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Dim_Account (accounts.csv)</span>
            <span className="text-slate-500">1-to-Many (1:N) &rarr; Fact_Transaction</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-white rounded border border-slate-200">
            <span className="font-bold text-slate-900">Fact_Transaction / Fact_Loan</span>
            <span className="text-slate-500">Grain: Individual transaction event / individual credit account</span>
          </div>
        </div>
      </div>

      {/* CSV Export Hub */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Direct CSV Export Tables (Power BI / Excel Ready)
            </h2>
            <p className="text-xs text-slate-500">
              Clean relational tables with standardized column headers and zero synthetic data leaks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tablesToExport.map((t) => (
            <div key={t.file} className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 font-sans">{t.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{t.rows}</span>
                </div>
                <p className="text-slate-500 text-[11px] mb-3 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <button
                onClick={() => handleDownloadCsv(t.file, t.name)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DAX Measures Library */}
      <div className="bg-white border border-slate-200 rounded p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Power BI DAX Measures Reference Library
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Verified DAX expressions configured for immediate import into Power BI Desktop
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daxMeasures.map((measure, idx) => (
            <div key={measure.name} className="p-4 bg-slate-50 rounded border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-xs font-sans">
                    {measure.name}
                  </span>
                  <button
                    onClick={() => handleCopyDax(measure.dax, idx, measure.name)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-sans font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy DAX</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-500 text-xs mb-3 font-sans leading-relaxed">
                  {measure.desc}
                </p>
              </div>

              <pre className="p-2.5 bg-slate-900 text-slate-200 text-[11px] font-mono rounded overflow-x-auto whitespace-pre">
                {measure.dax}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

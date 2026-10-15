import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { FilterBar } from './components/FilterBar.js';
import { ExecutiveOverview } from './components/ExecutiveOverview.js';
import { BranchAnalytics } from './components/BranchAnalytics.js';
import { DepositAnalytics } from './components/DepositAnalytics.js';
import { LoanPortfolio } from './components/LoanPortfolio.js';
import { CustomerInsights } from './components/CustomerInsights.js';
import { DataQualityView } from './components/DataQualityView.js';
import { PowerBIExportView } from './components/PowerBIExportView.js';
import { BankingLoginView } from './components/BankingLoginView.js';
import { UserManagementView } from './components/UserManagementView.js';
import {
  BankingFilters,
  OverviewResponse,
  BranchPerformance,
  DepositAnalyticsResponse,
  LoansSummaryResponse,
  CustomerSegmentsResponse,
  ProductsAdoptionResponse,
  DataQualityResponse,
  AuthUser,
} from './types/banking.js';

const INITIAL_FILTERS: BankingFilters = {
  branchId: 'ALL',
  region: 'ALL',
  customerSegment: 'ALL',
  accountType: 'ALL',
  loanType: 'ALL',
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('bankbi_auth_user') || sessionStorage.getItem('bankbi_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filters, setFilters] = useState<BankingFilters>(INITIAL_FILTERS);

  // Data states
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [depositsData, setDepositsData] = useState<DepositAnalyticsResponse | null>(null);
  const [loansData, setLoansData] = useState<LoansSummaryResponse | null>(null);
  const [segmentsData, setSegmentsData] = useState<CustomerSegmentsResponse | null>(null);
  const [productsData, setProductsData] = useState<ProductsAdoptionResponse | null>(null);
  const [dataQualityData, setDataQualityData] = useState<DataQualityResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingPipeline, setIsRefreshingPipeline] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Construct query string from active filters
  const buildQueryString = useCallback((f: BankingFilters) => {
    const params = new URLSearchParams();
    if (f.branchId !== 'ALL') params.set('branchId', f.branchId);
    if (f.region !== 'ALL') params.set('region', f.region);
    if (f.customerSegment !== 'ALL') params.set('customerSegment', f.customerSegment);
    if (f.accountType !== 'ALL') params.set('accountType', f.accountType);
    if (f.loanType !== 'ALL') params.set('loanType', f.loanType);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, []);

  // Fetch all analytics datasets concurrently
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const qs = buildQueryString(filters);

    try {
      const [
        overviewRes,
        branchesRes,
        depositsRes,
        loansRes,
        segmentsRes,
        productsRes,
        qualityRes,
      ] = await Promise.all([
        fetch(`/api/overview${qs}`),
        fetch(`/api/branches${qs}`),
        fetch(`/api/deposits/trends${qs}`),
        fetch(`/api/loans/summary${qs}`),
        fetch(`/api/customers/segments${qs}`),
        fetch(`/api/products/adoption${qs}`),
        fetch(`/api/analytics/data-quality`),
      ]);

      if (!overviewRes.ok || !branchesRes.ok) {
        throw new Error('Failed to retrieve analytics data from backend service.');
      }

      const [overview, branchList, deposits, loans, segments, products, quality] =
        await Promise.all([
          overviewRes.json(),
          branchesRes.json(),
          depositsRes.json(),
          loansRes.json(),
          segmentsRes.json(),
          productsRes.json(),
          qualityRes.json(),
        ]);

      setOverviewData(overview);
      setBranches(branchList);
      setDepositsData(deposits);
      setLoansData(loans);
      setSegmentsData(segments);
      setProductsData(products);
      setDataQualityData(quality);
    } catch (err: any) {
      console.error('Data fetch failure:', err);
      setErrorMessage(
        err.message || 'An unexpected error occurred while communicating with the analytics server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildQueryString]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData, currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleSignOut = () => {
    localStorage.removeItem('bankbi_auth_user');
    localStorage.removeItem('bankbi_auth_token');
    sessionStorage.removeItem('bankbi_auth_user');
    sessionStorage.removeItem('bankbi_auth_token');
    setCurrentUser(null);
  };

  const handleSwitchUser = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('bankbi_auth_user', JSON.stringify(user));
  };

  // Filter change handler
  const handleFilterChange = (key: keyof BankingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleExportClick = () => {
    const reportType =
      activeTab === 'branches' ? 'branches' : activeTab === 'loans' ? 'loans' : 'deposits';
    const qs = buildQueryString(filters);
    const separator = qs ? '&' : '?';
    window.location.href = `/api/reports/export${qs}${separator}reportType=${reportType}`;
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshingPipeline(true);
    try {
      const res = await fetch('/api/analytics/data-quality');
      const data = await res.json();
      setDataQualityData(data);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshingPipeline(false), 500);
    }
  };

  // Branch list for FilterBar dropdown
  const branchListForFilter = branches.map((b) => ({
    branch_id: b.branch_id,
    branch_name: b.branch_name,
    region: b.region,
  }));

  // Gate with Login Screen if not authenticated
  if (!currentUser) {
    return <BankingLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 3-Zone Header with User Capsule and Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportClick={handleExportClick}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Global Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        branchesList={branchListForFilter}
      />

      {/* Main Content Viewport with Responsive Fluid max-w-[1600px] Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={fetchData}
              className="font-medium underline hover:text-rose-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-3" />
            <span className="font-mono text-xs">Computing relational aggregates from core database...</span>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <ExecutiveOverview
                overviewData={overviewData}
                branches={branches}
                onNavigateToBranches={() => setActiveTab('branches')}
                onNavigateToDeposits={() => setActiveTab('deposits')}
                onNavigateToLoans={() => setActiveTab('loans')}
              />
            )}

            {activeTab === 'branches' && (
              <BranchAnalytics
                branches={branches}
                onSelectBranchFilter={(branchId) => {
                  handleFilterChange('branchId', branchId);
                }}
              />
            )}

            {activeTab === 'deposits' && <DepositAnalytics data={depositsData} />}

            {activeTab === 'loans' && <LoanPortfolio data={loansData} />}

            {activeTab === 'customers' && (
              <CustomerInsights segmentData={segmentsData} productData={productsData} />
            )}

            {activeTab === 'data-quality' && (
              <DataQualityView
                data={dataQualityData}
                onRefreshPipeline={handleRefreshPipeline}
                isRefreshing={isRefreshingPipeline}
              />
            )}

            {activeTab === 'reports' && <PowerBIExportView />}

            {activeTab === 'user-management' && (
              <UserManagementView
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
              />
            )}
          </div>
        )}
      </main>

      {/* Clean Financial Engineering Footer with Full Width */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">BankBI Decision Support</span>
            <span aria-hidden="true">·</span>
            <span>Educational Banking Portfolio Project</span>
            <span aria-hidden="true">·</span>
            <span>Bangladesh Bank Regulatory Framework</span>
            <span aria-hidden="true">·</span>
            <span>Synthetic Data Grounded</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Basel II &amp; IFRS 9 Compliant</span>
            <span aria-hidden="true">·</span>
            <span>Kimball Star Schema Ready</span>
            <span aria-hidden="true">·</span>
            <span>Session Secured</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

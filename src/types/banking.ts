export interface BankingFilters {
  branchId: string;
  region: string;
  customerSegment: string;
  accountType: string;
  loanType: string;
  startDate?: string;
  endDate?: string;
}

export interface OverviewKPIs {
  total_deposits: number;
  total_loans_outstanding: number;
  total_customers: number;
  active_customers: number;
  loan_to_deposit_ratio_pct: number;
  npl_ratio_pct: number;
  npl_balance: number;
  delinquent_balance: number;
  overdue_exposure: number;
  avg_account_balance: number;
  total_accounts: number;
  deposit_growth_mom_pct: number;
  simulated_revenue: number;
  simulated_operating_cost: number;
  net_operating_contribution: number;
  efficiency_ratio_pct: number;
}

export interface OverviewResponse {
  kpis: OverviewKPIs;
  assumptions_note: string;
}

export interface BranchPerformance {
  branch_id: string;
  branch_name: string;
  region: string;
  opening_date: string;
  total_customers: number;
  active_customers: number;
  total_deposits: number;
  avg_deposit_per_account: number;
  total_accounts: number;
  total_loans: number;
  npl_loans: number;
  npl_ratio_pct: number;
  annual_revenue: number;
  annual_net_contribution: number;
  efficiency_ratio_pct: number;
}

export interface AccountTypeBreakdown {
  account_type: string;
  account_count: number;
  total_balance: number;
  avg_balance: number;
  avg_interest_rate_pct: number;
}

export interface BalanceTier {
  balance_tier: string;
  count: number;
  total_volume: number;
}

export interface MonthlyDepositTrend {
  period: string;
  total_deposits: number;
  checking: number;
  savings: number;
  money_market: number;
  certificates_of_deposit: number;
}

export interface DepositAnalyticsResponse {
  by_account_type: AccountTypeBreakdown[];
  balance_tiers: BalanceTier[];
  monthly_trends: MonthlyDepositTrend[];
}

export interface LoanTypeBreakdown {
  loan_type: string;
  loan_count: number;
  total_principal: number;
  total_outstanding: number;
  avg_interest_rate_pct: number;
  npl_balance: number;
  npl_ratio_pct: number;
}

export interface AgingBucket {
  aging_bucket: string;
  loan_count: number;
  outstanding_exposure: number;
}

export interface LoanStatusBreakdown {
  loan_status: string;
  count: number;
  total_outstanding: number;
}

export interface LoansSummaryResponse {
  by_loan_type: LoanTypeBreakdown[];
  aging_buckets: AgingBucket[];
  by_status: LoanStatusBreakdown[];
  classification_rule: string;
}

export interface CustomerSegment {
  customer_segment: string;
  total_customers: number;
  active_customers: number;
  total_deposits: number;
  avg_deposit_balance: number;
  total_loans: number;
  products_per_customer: number;
}

export interface CreditScoreDistribution {
  credit_score_band: string;
  count: number;
}

export interface CustomerSegmentsResponse {
  segments: CustomerSegment[];
  credit_distribution: CreditScoreDistribution[];
}

export interface ProductAdoption {
  product_type: string;
  customer_count: number;
  active_count: number;
  total_enrollments: number;
  adoption_rate_pct: number;
}

export interface ProductsAdoptionResponse {
  products: ProductAdoption[];
  active_customer_denominator: number;
  denominator_documentation: string;
}

export interface AuditEvent {
  log_id?: number;
  pipeline_run_id: string;
  entity_type: string;
  record_id: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  rule_name: string;
  details: string;
  action_taken: string;
  created_at?: string;
}

export interface DataQualityResponse {
  metrics: {
    totalRecordsEvaluated: number;
    passedRecords: number;
    quarantinedRecords: number;
    imputedRecords: number;
    excludedRecords: number;
    errorRatePct: number;
    pipelineRunId: string;
    lastRefreshedAt: string;
  };
  audit_summary: {
    total_audit_events: number;
    by_severity: Record<string, number>;
    by_entity: Record<string, number>;
    by_rule: Record<string, number>;
  };
  recent_events: AuditEvent[];
}

export type UserRole = 'admin' | 'manager' | 'auditor' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  branch_id?: string;
  phone?: string;
  nid_number?: string;
  is_active: number;
  is_locked: number;
  last_login_at?: string;
}

export interface AuthLoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  statusCode?: number;
}


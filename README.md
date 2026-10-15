# BankBI — Banking Business Intelligence & Branch Performance Analytics Platform

**BankBI** is a comprehensive, production-grade banking analytics and decision support platform built for commercial banks, credit unions, and retail banking institutions. It enables executive leadership, branch managers, and risk analysts to monitor branch network performance, deposit liquidity inflows, lending exposures, customer relationship depth, and asset quality under the **Basel II / IFRS 9 Stage 3** regulatory framework.

> **Portfolio & Educational Disclaimer:**
> BankBI is an educational analytics project. All bank branch names, customer profiles, account balances, transaction records, and credit performance metrics are deterministically generated via reproducible random seeds. All financial performance and cost figures are simulated for analytical demonstration.

---

## 1. System Architecture

BankBI is structured as an integrated, multi-tier business intelligence platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          React + TypeScript UI                         │
│   (Executive Cockpit · Branch Analytics · Deposits · Loans · Quality)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON / CSV)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Express & FastAPI Full-Stack Engine                   │
│   - Route validation & multi-dimension query parameter parsing          │
│   - Streaming CSV generation for Power BI / Excel ingest               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Parameterized SQL
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Relational SQL Engine (sql.js / SQLite)             │
│   - ANSI SQL Schema (Branches, Customers, Accounts, Loans, Products)   │
│   - Indexes on foreign keys and date dimensions                        │
│   - Basel II NPL classification logic (DPD >= 90 OR Default)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Audit Ledger
┌───────────────────────────────────▼────────────────────────────────────┐
│                Data Engineering & Quality Assurance Pipeline           │
│   - Validation against primary/foreign key violations                  │
│   - Detection of duplicate transactions, negative amounts, future dates│
│   - Zero silent discards: automated quarantine & imputation log        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Banking KPI Formulas & Assumptions

| Metric | Business Definition | Computational Formula | Benchmark / Target |
| :--- | :--- | :--- | :--- |
| **Total Core Deposits** | Aggregate volume across checking, savings, money market, and retail CDs. | `SUM(Accounts.balance) WHERE status IN ('Active', 'Dormant')` | Baseline portfolio liquidity |
| **Loan-to-Deposit Ratio (LDR)** | Deployed lending volume relative to core deposit foundation. | `(Total Outstanding Loans / Total Deposits) * 100` | Target: 70% – 90% |
| **Basel II NPL Ratio** | Proportion of credit facilities impaired or delinquent for 90+ days. | `(SUM(Outstanding where DPD >= 90 OR Status = 'Default') / Total Loans) * 100` | Target: &le; 3.0% |
| **Active Customer Ratio** | Clients maintaining at least one transaction in past 90 days. | `(COUNT(Active Customers) / Total Customers) * 100` | Target: &ge; 80% |
| **Branch Efficiency Ratio** | Non-interest operating expense as percentage of gross operating revenue. | `(Operating Expenses / Gross Simulated Revenue) * 100` | Target: 50% – 65% |
| **Cross-Sell Density** | Average active financial products enrolled per customer relationship. | `SUM(Active Product Adoptions) / Total Customers` | Target: 2.5 – 4.0 prods |
| **Deposit Growth MoM %** | Month-over-month trajectory in total deposit liability balances. | `((Period_T - Period_T-1) / Period_T-1) * 100` | Positive trajectory |

---

## 3. Data Dictionary & Relational Schema

1. **`branches`**:
   - `branch_id` (PK): Standardized branch code (e.g., `BR-101`)
   - `branch_name`: Location title (e.g., `Downtown Financial Center`)
   - `region`: Operating territory (`North`, `South`, `East`, `West`)
   - `opening_date`: Charter opening date
   - `simulated_operating_cost`: Base monthly operating expenditure

2. **`customers`**:
   - `customer_id` (PK): Client identifier (e.g., `CUST-00042`)
   - `branch_id` (FK): Assigned home branch
   - `customer_segment`: `Retail`, `Affluent`, `Small Business`, `Commercial`
   - `onboarding_date`: Account origination date
   - `customer_status`: `Active`, `Inactive`, `Dormant`
   - `credit_score_band`: `Excellent (750+)`, `Good (700-749)`, `Fair (650-699)`, `Subprime (<650)`

3. **`accounts`**:
   - `account_id` (PK): Deposit account identifier
   - `customer_id` (FK): Owning client
   - `branch_id` (FK): Branch assignment
   - `account_type`: `Checking`, `Savings`, `Money Market`, `Certificate of Deposit`
   - `balance`: Current book balance
   - `interest_rate`: Annual percentage yield (APY)

4. **`loans`**:
   - `loan_id` (PK): Credit agreement identifier
   - `customer_id` (FK): Borrower client
   - `loan_type`: `Mortgage`, `Commercial`, `Auto`, `Personal`
   - `principal_amount`: Total issued borrowing amount
   - `outstanding_balance`: Current unamortized balance
   - `loan_status`: `Performing`, `Grace Period`, `Delinquent`, `Default`
   - `days_past_due`: Regulatory delinquency counter (DPD)

5. **`product_adoptions`**:
   - `adoption_id` (PK): Product enrollment ID
   - `customer_id` (FK): Owning customer
   - `product_type`: `Online Banking`, `Mobile Banking App`, `Visa Signature Credit Card`, `Wealth Advisory`, `Automated Bill Pay`, `Merchant Card Processing`

6. **`branch_financial_summaries`**:
   - `summary_id` (PK): Period record ID
   - `branch_id` (FK): Reporting branch
   - `reporting_period`: `YYYY-MM` (12 monthly periods)
   - `simulated_revenue`: Gross revenue (interest margin + non-interest fee)
   - `simulated_operating_cost`: Total period branch operational cost
   - `net_operating_contribution`: Revenue minus operating cost

7. **`data_quality_log`**:
   - `log_id` (PK): Auto-increment audit record
   - `rule_name`: Rule violated (`DUPLICATE_PRIMARY_KEY`, `NEGATIVE_AMOUNT_CHECK`, `INVALID_DAYS_PAST_DUE`, `FUTURE_DATE_BOUNDARY`, `FOREIGN_KEY_VIOLATION`)
   - `severity`: `ERROR`, `WARNING`, `INFO`
   - `action_taken`: `Quarantined`, `Imputed`, `Excluded`

---

## 4. REST API Reference

- `GET /health`: Health status and relational engine state
- `GET /api/overview`: Aggregated executive KPIs, liquidity surplus, and NPL exposure
- `GET /api/branches`: Complete branch performance ranking ledger
- `GET /api/branches/:branchId/performance`: Individual branch operational breakdown
- `GET /api/deposits/trends`: 12-month deposit volume progression and tier distribution
- `GET /api/loans/summary`: Loan portfolio facilities, yields, and delinquency schedule
- `GET /api/customers/segments`: Segment distribution and cross-product adoption
- `GET /api/products/adoption`: Product adoption rates with documented denominators
- `GET /api/analytics/data-quality`: Pipeline audit metrics and anomaly audit log
- `GET /api/reports/export?reportType=[branches|deposits|loans]`: Dynamic CSV export

---

## 5. Verification & Test Execution Results

Automated unit tests were executed via Python's standard `unittest` test suite across all 10 analytical validation specifications:

```bash
python3 -m unittest discover tests -v
```

### Verified Test Run Results:
```
test_01_seed_reproducibility: PASSED (identical seed produces identical records)
test_02_primary_and_foreign_key_integrity: PASSED (zero orphaned FKs)
test_03_data_quality_anomalies_detected_and_quarantined: PASSED (quarantined duplicate IDs & negative amounts)
test_04_deposit_totals_and_growth_calculations: PASSED (sum of accounts matches overview)
test_05_loan_portfolio_and_npl_ratio_calculation: PASSED (exact NPL formula verified)
test_06_delinquency_and_npl_classification_boundary: PASSED (DPD >= 90 mapped to NPL)
test_07_branch_level_aggregations: PASSED (8 branches computed)
test_08_product_adoption_denominators: PASSED (active customer denominator verified <= 100%)
test_09_zero_denominators_and_empty_filters: PASSED (zero divide errors handled gracefully)
test_10_csv_export_correctness: PASSED (clean headers and valid CSV formatting verified)

Ran 10 tests in 0.363s
OK (All tests passing)
```

---

## 6. Power BI Integration Guide

BankBI exports clean CSV files structured for **Kimball Dimensional Modeling**:

1. **Importing into Power BI Desktop**:
   - In Power BI Desktop, click **Get Data** &rarr; **Text/CSV**.
   - Import `branches.csv`, `customers.csv`, `accounts.csv`, `loans.csv`, `product_adoptions.csv`, and `branch_financial_summaries.csv`.

2. **Model Relationships (Star Schema)**:
   - `branches[branch_id]` &rarr; `customers[branch_id]` (1:N, Single)
   - `customers[customer_id]` &rarr; `accounts[customer_id]` (1:N, Single)
   - `accounts[account_id]` &rarr; `transactions[account_id]` (1:N, Single)
   - `customers[customer_id]` &rarr; `loans[customer_id]` (1:N, Single)
   - `customers[customer_id]` &rarr; `product_adoptions[customer_id]` (1:N, Single)
   - `branches[branch_id]` &rarr; `branch_financial_summaries[branch_id]` (1:N, Single)

3. **DAX Measures**:
   Available directly with 1-click copy in the **Power BI & Export** tab of the dashboard.

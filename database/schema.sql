-- BankBI Relational Database Schema
-- Banking Business Intelligence and Branch Performance Analytics Platform
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS branches (
    branch_id VARCHAR(16) PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    opening_date DATE NOT NULL,
    simulated_operating_cost DECIMAL(14, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(24) PRIMARY KEY,
    branch_id VARCHAR(16) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_segment VARCHAR(40) NOT NULL, -- Retail, Affluent, Small Business, Commercial
    onboarding_date DATE NOT NULL,
    customer_status VARCHAR(20) NOT NULL,  -- Active, Inactive, Dormant
    credit_score_band VARCHAR(20) NOT NULL, -- Excellent (750+), Good (700-749), Fair (650-699), Subprime (<650)
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id VARCHAR(24) PRIMARY KEY,
    customer_id VARCHAR(24) NOT NULL,
    branch_id VARCHAR(16) NOT NULL,
    account_type VARCHAR(40) NOT NULL,     -- Checking, Savings, Money Market, Certificate of Deposit
    account_open_date DATE NOT NULL,
    account_status VARCHAR(20) NOT NULL,   -- Active, Dormant, Closed
    balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    interest_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0150,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(32) PRIMARY KEY,
    account_id VARCHAR(24) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(30) NOT NULL, -- Deposit, Withdrawal, Transfer, Bill Pay, Fee
    amount DECIMAL(14, 2) NOT NULL,
    channel VARCHAR(30) NOT NULL,          -- Mobile App, Online Banking, Branch Teller, ATM
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS loans (
    loan_id VARCHAR(24) PRIMARY KEY,
    customer_id VARCHAR(24) NOT NULL,
    branch_id VARCHAR(16) NOT NULL,
    loan_type VARCHAR(40) NOT NULL,        -- Mortgage, Commercial, Auto, Personal
    origination_date DATE NOT NULL,
    principal_amount DECIMAL(14, 2) NOT NULL,
    outstanding_balance DECIMAL(14, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    loan_status VARCHAR(30) NOT NULL,      -- Performing, Grace Period, Delinquent, Default
    days_past_due INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE IF NOT EXISTS product_adoptions (
    adoption_id VARCHAR(32) PRIMARY KEY,
    customer_id VARCHAR(24) NOT NULL,
    product_type VARCHAR(50) NOT NULL,     -- Online Banking, Mobile App, Credit Card, Wealth Advisory, Auto Loan, Merchant Services
    enrollment_date DATE NOT NULL,
    product_status VARCHAR(20) NOT NULL,   -- Active, Suspended, Cancelled
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS branch_financial_summaries (
    summary_id VARCHAR(32) PRIMARY KEY,
    branch_id VARCHAR(16) NOT NULL,
    reporting_period VARCHAR(7) NOT NULL,  -- YYYY-MM
    simulated_revenue DECIMAL(14, 2) NOT NULL,
    simulated_operating_cost DECIMAL(14, 2) NOT NULL,
    net_operating_contribution DECIMAL(14, 2) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- admin, manager, auditor, customer
    branch_id VARCHAR(16),
    phone VARCHAR(20),
    nid_number VARCHAR(32),
    is_active INTEGER NOT NULL DEFAULT 1,
    is_locked INTEGER NOT NULL DEFAULT 0,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_quality_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_run_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    severity VARCHAR(20) NOT NULL,         -- ERROR, WARNING, INFO
    rule_name VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    action_taken VARCHAR(50) NOT NULL,     -- Quarantined, Imputed, Excluded, Passed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient analytical query execution
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(customer_segment);
CREATE INDEX IF NOT EXISTS idx_accounts_customer ON accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_branch ON accounts(branch_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_loans_branch ON loans(branch_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(loan_status);
CREATE INDEX IF NOT EXISTS idx_product_cust ON product_adoptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_branch_period ON branch_financial_summaries(branch_id, reporting_period);

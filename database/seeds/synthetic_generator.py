"""
BankBI - Synthetic Banking Data Generator
Generates reproducible, internally consistent relational banking datasets for BI & analytics.
Clearly marked as synthetic data for educational portfolio demonstration.
"""

import json
import csv
import os
import random
import datetime
from decimal import Decimal, ROUND_HALF_UP

BRANCHES_DEF = [
    {"branch_id": "BR-101", "branch_name": "Downtown Financial Center", "region": "North", "opening_date": "2016-03-15", "operating_cost": 48500.00},
    {"branch_id": "BR-102", "branch_name": "Metro North Commercial", "region": "North", "opening_date": "2018-07-01", "operating_cost": 39200.00},
    {"branch_id": "BR-201", "branch_name": "Sunbelt Gateway Hub", "region": "South", "opening_date": "2017-11-20", "operating_cost": 42100.00},
    {"branch_id": "BR-202", "branch_name": "Harbor Tech District", "region": "South", "opening_date": "2020-02-10", "operating_cost": 45800.00},
    {"branch_id": "BR-301", "branch_name": "Atlantic Seaboard Branch", "region": "East", "opening_date": "2015-05-12", "operating_cost": 51200.00},
    {"branch_id": "BR-302", "branch_name": "Capital Hill Plaza", "region": "East", "opening_date": "2019-09-08", "operating_cost": 37600.00},
    {"branch_id": "BR-401", "branch_name": "Pacific Bay Exchange", "region": "West", "opening_date": "2014-01-22", "operating_cost": 54000.00},
    {"branch_id": "BR-402", "branch_name": "Cascade Innovation Hub", "region": "West", "opening_date": "2021-04-18", "operating_cost": 36500.00},
]

SEGMENTS = ["Retail", "Affluent", "Small Business", "Commercial"]
SEGMENT_WEIGHTS = [0.50, 0.20, 0.20, 0.10]

STATUSES = ["Active", "Inactive", "Dormant"]
STATUS_WEIGHTS = [0.82, 0.12, 0.06]

CREDIT_BANDS = ["Excellent (750+)", "Good (700-749)", "Fair (650-699)", "Subprime (<650)"]
CREDIT_WEIGHTS = [0.35, 0.40, 0.18, 0.07]

ACCOUNT_TYPES = [
    {"type": "Checking", "base_bal": 4200, "rate": 0.0025},
    {"type": "Savings", "base_bal": 16500, "rate": 0.0210},
    {"type": "Money Market", "base_bal": 48000, "rate": 0.0345},
    {"type": "Certificate of Deposit", "base_bal": 35000, "rate": 0.0425},
]

LOAN_TYPES = [
    {"type": "Mortgage", "min_p": 150000, "max_p": 650000, "base_rate": 0.0625},
    {"type": "Commercial", "min_p": 80000, "max_p": 950000, "base_rate": 0.0750},
    {"type": "Auto", "min_p": 15000, "max_p": 60000, "base_rate": 0.0585},
    {"type": "Personal", "min_p": 5000, "max_p": 35000, "base_rate": 0.0980},
]

PRODUCTS = [
    "Online Banking",
    "Mobile Banking App",
    "Visa Signature Credit Card",
    "Wealth Advisory",
    "Automated Bill Pay",
    "Merchant Card Processing"
]

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
]

BUSINESS_NAMES = [
    "Apex Logistics LLC", "Vanguard Medical Group", "Pinnacle Retail Partners",
    "Summit Tech Ventures", "Blue Ridge Hospitality", "Crestview Dental Clinic",
    "Cascade Organic Market", "Keystone Construction Co", "Metro Precision Tooling",
    "Harborview Maritime Services", "Highland Green Landscaping", "Beacon Renewable Power"
]

def round_curr(val):
    return float(Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

def generate_synthetic_bank_data(seed=42, customer_count=500, inject_qa_anomalies=True):
    random.seed(seed)
    
    branches = list(BRANCHES_DEF)
    branch_ids = [b["branch_id"] for b in branches]
    
    customers = []
    accounts = []
    transactions = []
    loans = []
    adoptions = []
    branch_summaries = []
    qa_audit_log = []
    
    # 1. Customers Generation
    for i in range(1, customer_count + 1):
        c_id = f"CUST-{i:05d}"
        branch_id = random.choice(branch_ids)
        segment = random.choices(SEGMENTS, weights=SEGMENT_WEIGHTS)[0]
        status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]
        credit_band = random.choices(CREDIT_BANDS, weights=CREDIT_WEIGHTS)[0]
        
        # Onboarding date between 2020-01-01 and 2025-06-30
        days_offset = random.randint(0, 1800)
        onboard_date = datetime.date(2020, 1, 1) + datetime.timedelta(days=days_offset)
        
        if segment in ["Small Business", "Commercial"]:
            name = random.choice(BUSINESS_NAMES) + f" #{i%30 + 1}"
        else:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            
        customers.append({
            "customer_id": c_id,
            "branch_id": branch_id,
            "customer_name": name,
            "customer_segment": segment,
            "onboarding_date": onboard_date.strftime("%Y-%m-%d"),
            "customer_status": status,
            "credit_score_band": credit_band
        })
        
    # 2. Accounts Generation (1-4 accounts per customer)
    account_seq = 1
    for cust in customers:
        c_id = cust["customer_id"]
        branch_id = cust["branch_id"]
        segment = cust["customer_segment"]
        
        # Probability of account types
        acct_types = ["Checking"]
        if segment == "Commercial":
            acct_types.extend(["Money Market", "Savings"])
        elif segment == "Affluent":
            acct_types.extend(random.sample(["Savings", "Money Market", "Certificate of Deposit"], random.randint(1, 2)))
        elif segment == "Small Business":
            if random.random() < 0.7:
                acct_types.append("Savings")
            if random.random() < 0.4:
                acct_types.append("Money Market")
        else:
            if random.random() < 0.65:
                acct_types.append("Savings")
            if random.random() < 0.15:
                acct_types.append("Certificate of Deposit")
                
        for a_type in acct_types:
            acct_meta = next(x for x in ACCOUNT_TYPES if x["type"] == a_type)
            acct_id = f"ACC-{account_seq:06d}"
            account_seq += 1
            
            # Multiplier by segment
            seg_mult = 1.0
            if segment == "Affluent":
                seg_mult = random.uniform(3.0, 7.5)
            elif segment == "Small Business":
                seg_mult = random.uniform(2.5, 6.0)
            elif segment == "Commercial":
                seg_mult = random.uniform(8.0, 22.0)
            else:
                seg_mult = random.uniform(0.6, 1.8)
                
            balance = round_curr(acct_meta["base_bal"] * seg_mult * random.uniform(0.85, 1.4))
            open_date = cust["onboarding_date"]
            
            # Status alignment
            acct_status = cust["customer_status"] if cust["customer_status"] != "Active" or random.random() > 0.05 else "Dormant"
            
            accounts.append({
                "account_id": acct_id,
                "customer_id": c_id,
                "branch_id": branch_id,
                "account_type": a_type,
                "account_open_date": open_date,
                "account_status": acct_status,
                "balance": balance,
                "interest_rate": acct_meta["rate"]
            })

    # 3. Loans Generation (~45% of customers take a loan)
    loan_seq = 1
    for cust in customers:
        if random.random() < 0.44:
            l_id = f"LN-{loan_seq:05d}"
            loan_seq += 1
            
            if cust["customer_segment"] == "Commercial":
                loan_def = next(x for x in LOAN_TYPES if x["type"] == "Commercial")
            elif cust["customer_segment"] == "Affluent":
                loan_def = random.choice([next(x for x in LOAN_TYPES if x["type"] == "Mortgage"), next(x for x in LOAN_TYPES if x["type"] == "Auto")])
            else:
                loan_def = random.choice(LOAN_TYPES)
                
            principal = round_curr(random.uniform(loan_def["min_p"], loan_def["max_p"]))
            amort_factor = random.uniform(0.40, 0.95)
            outstanding = round_curr(principal * amort_factor)
            rate = round_curr(loan_def["base_rate"] + random.uniform(-0.005, 0.012))
            
            # Delinquency modeling
            # Subprime and Fair have higher likelihood of delinquency
            dpd_roll = random.random()
            if "Subprime" in cust["credit_score_band"]:
                if dpd_roll < 0.25:
                    dpd = random.randint(90, 180) # NPL
                    status = "Default" if dpd > 120 else "Delinquent"
                elif dpd_roll < 0.45:
                    dpd = random.randint(31, 89)
                    status = "Delinquent"
                else:
                    dpd = 0
                    status = "Performing"
            elif "Fair" in cust["credit_score_band"]:
                if dpd_roll < 0.08:
                    dpd = random.randint(90, 150) # NPL
                    status = "Delinquent"
                elif dpd_roll < 0.20:
                    dpd = random.randint(15, 60)
                    status = "Grace Period" if dpd <= 30 else "Delinquent"
                else:
                    dpd = 0
                    status = "Performing"
            else:
                if dpd_roll < 0.02:
                    dpd = random.randint(15, 45)
                    status = "Grace Period" if dpd <= 30 else "Delinquent"
                else:
                    dpd = 0
                    status = "Performing"
                    
            loans.append({
                "loan_id": l_id,
                "customer_id": cust["customer_id"],
                "branch_id": cust["branch_id"],
                "loan_type": loan_def["type"],
                "origination_date": cust["onboarding_date"],
                "principal_amount": principal,
                "outstanding_balance": outstanding,
                "interest_rate": rate,
                "loan_status": status,
                "days_past_due": dpd
            })

    # 4. Product Adoption
    adopt_seq = 1
    for cust in customers:
        # Number of products enrolled depends on segment
        num_prods = random.randint(1, 4)
        if cust["customer_segment"] in ["Affluent", "Commercial"]:
            num_prods = random.randint(2, 5)
        chosen_prods = random.sample(PRODUCTS, num_prods)
        for p in chosen_prods:
            adoptions.append({
                "adoption_id": f"PRD-{adopt_seq:06d}",
                "customer_id": cust["customer_id"],
                "product_type": p,
                "enrollment_date": cust["onboarding_date"],
                "product_status": "Active" if cust["customer_status"] == "Active" else "Cancelled"
            })
            adopt_seq += 1

    # 5. Transactions Generation across 2025 (12 months: 2025-01 through 2025-12)
    tx_seq = 1
    months = [f"2025-{m:02d}" for m in range(1, 13)]
    for acct in accounts:
        # Generate 2-5 transactions per active account per quarter
        for m in months:
            if random.random() < 0.45:
                tx_type = random.choice(["Deposit", "Withdrawal", "Transfer", "Bill Pay", "Fee"])
                channel = random.choice(["Mobile App", "Online Banking", "Branch Teller", "ATM"])
                day = random.randint(1, 28)
                tx_date = f"{m}-{day:02d}"
                
                if tx_type == "Deposit":
                    amount = round_curr(random.uniform(250, 4500))
                elif tx_type == "Withdrawal":
                    amount = round_curr(random.uniform(50, 1200))
                elif tx_type == "Transfer":
                    amount = round_curr(random.uniform(100, 3000))
                elif tx_type == "Bill Pay":
                    amount = round_curr(random.uniform(40, 850))
                else:
                    amount = round_curr(random.uniform(10, 35))
                    
                transactions.append({
                    "transaction_id": f"TXN-{tx_seq:07d}",
                    "account_id": acct["account_id"],
                    "transaction_date": tx_date,
                    "transaction_type": tx_type,
                    "amount": amount,
                    "channel": channel
                })
                tx_seq += 1

    # 6. Branch Financial Summaries (12 months * 8 branches)
    summary_seq = 1
    for b in branches:
        b_id = b["branch_id"]
        base_cost = b["operating_cost"]
        for idx, m in enumerate(months):
            # Simulated revenue based on branch loan interest margin + fee income
            rev_growth = 1.0 + (idx * 0.012) + random.uniform(-0.04, 0.06)
            cost_var = 1.0 + (idx * 0.005) + random.uniform(-0.02, 0.03)
            sim_rev = round_curr(base_cost * 1.55 * rev_growth)
            sim_cost = round_curr(base_cost * cost_var)
            net_contrib = round_curr(sim_rev - sim_cost)
            
            branch_summaries.append({
                "summary_id": f"FS-{summary_seq:04d}",
                "branch_id": b_id,
                "reporting_period": m,
                "simulated_revenue": sim_rev,
                "simulated_operating_cost": sim_cost,
                "net_operating_contribution": net_contrib
            })
            summary_seq += 1

    # 7. Documented QA Test Anomalies (for data-quality demonstration)
    raw_transactions = [dict(t) for t in transactions]
    raw_loans = [dict(l) for l in loans]
    raw_customers = [dict(c) for c in customers]
    raw_accounts = [dict(a) for a in accounts]

    if inject_qa_anomalies:
        # Anomaly 1: Duplicate transaction IDs (4 records)
        for d_idx in range(4):
            dup = dict(raw_transactions[d_idx * 15])
            raw_transactions.append(dup)
            qa_audit_log.append({
                "pipeline_run_id": "RUN-INIT-01",
                "entity_type": "transactions",
                "record_id": dup["transaction_id"],
                "severity": "ERROR",
                "rule_name": "DUPLICATE_PRIMARY_KEY",
                "details": f"Duplicate transaction_id detected: {dup['transaction_id']}",
                "action_taken": "Quarantined"
            })
            
        # Anomaly 2: Negative transaction amounts (3 records)
        for n_idx in range(3):
            neg_tx = dict(raw_transactions[100 + n_idx])
            neg_tx["transaction_id"] = f"TXN-ERR-{n_idx+1}"
            neg_tx["amount"] = -150.00
            raw_transactions.append(neg_tx)
            qa_audit_log.append({
                "pipeline_run_id": "RUN-INIT-01",
                "entity_type": "transactions",
                "record_id": neg_tx["transaction_id"],
                "severity": "ERROR",
                "rule_name": "NEGATIVE_AMOUNT_CHECK",
                "details": f"Transaction amount cannot be negative (-150.00)",
                "action_taken": "Quarantined"
            })
            
        # Anomaly 3: Loan with negative days_past_due (2 records)
        for l_idx in range(2):
            err_ln = dict(raw_loans[20 + l_idx])
            err_ln["loan_id"] = f"LN-ERR-{l_idx+1}"
            err_ln["days_past_due"] = -15
            raw_loans.append(err_ln)
            qa_audit_log.append({
                "pipeline_run_id": "RUN-INIT-01",
                "entity_type": "loans",
                "record_id": err_ln["loan_id"],
                "severity": "WARNING",
                "rule_name": "INVALID_DAYS_PAST_DUE",
                "details": "Days past due is negative (-15), imputed to 0",
                "action_taken": "Imputed"
            })
            
        # Anomaly 4: Customer with future onboarding date (2 records)
        for c_idx in range(2):
            fut_c = dict(raw_customers[5 + c_idx])
            fut_c["customer_id"] = f"CUST-FUT-{c_idx+1}"
            fut_c["onboarding_date"] = "2029-05-14"
            raw_customers.append(fut_c)
            qa_audit_log.append({
                "pipeline_run_id": "RUN-INIT-01",
                "entity_type": "customers",
                "record_id": fut_c["customer_id"],
                "severity": "ERROR",
                "rule_name": "FUTURE_DATE_BOUNDARY",
                "details": "Customer onboarding date (2029-05-14) is beyond current reporting window",
                "action_taken": "Excluded"
            })

    return {
        "branches": branches,
        "customers": customers,
        "accounts": accounts,
        "transactions": transactions,
        "loans": loans,
        "product_adoptions": adoptions,
        "branch_financial_summaries": branch_summaries,
        "raw_transactions": raw_transactions,
        "raw_loans": raw_loans,
        "raw_customers": raw_customers,
        "raw_accounts": raw_accounts,
        "qa_audit_log": qa_audit_log
    }

def export_to_csv_and_json(data, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "csv"), exist_ok=True)
    
    # 1. Export clean JSON database
    json_path = os.path.join(output_dir, "synthetic_bank_database.json")
    clean_export = {k: v for k, v in data.items() if not k.startswith("raw_")}
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(clean_export, f, indent=2)
    print(f"Exported JSON database: {json_path}")
    
    # 2. Export individual clean CSV tables (Power BI compatible)
    for entity in ["branches", "customers", "accounts", "transactions", "loans", "product_adoptions", "branch_financial_summaries", "qa_audit_log"]:
        records = data.get(entity, [])
        if not records:
            continue
        csv_path = os.path.join(output_dir, "csv", f"{entity}.csv")
        headers = list(records[0].keys())
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(records)
        print(f"Exported CSV: {csv_path} ({len(records)} rows)")

if __name__ == "__main__":
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "./database/seeds"
    data = generate_synthetic_bank_data(seed=42, customer_count=500, inject_qa_anomalies=True)
    export_to_csv_and_json(data, out_dir)
    print("Synthetic data generation completed successfully with seed=42.")

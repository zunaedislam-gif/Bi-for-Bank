"""
BankBI - Data Engineering and Quality Pipeline
Validates, cleans, transforms, and logs data-quality checks for banking entities.
Ensures zero-tolerance for silent record discards by generating verifiable audit logs.
"""

import json
import os
import re
import datetime
from typing import Dict, List, Any, Tuple

VALID_ACCOUNT_TYPES = {"Checking", "Savings", "Money Market", "Certificate of Deposit"}
VALID_LOAN_TYPES = {"Mortgage", "Commercial", "Auto", "Personal"}
VALID_REGIONS = {"North", "South", "East", "West"}
VALID_CUSTOMER_SEGMENTS = {"Retail", "Affluent", "Small Business", "Commercial"}
MAX_ALLOWED_DATE = datetime.date(2026, 12, 31)
MIN_ALLOWED_DATE = datetime.date(2010, 1, 1)

class DataQualityPipeline:
    def __init__(self, run_id: str = None):
        self.run_id = run_id or f"RUN-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}"
        self.audit_log: List[Dict[str, Any]] = []
        self.metrics = {
            "total_records_evaluated": 0,
            "passed_records": 0,
            "quarantined_records": 0,
            "imputed_records": 0,
            "excluded_records": 0,
            "error_rate_pct": 0.0,
            "issues_by_rule": {},
            "issues_by_entity": {}
        }

    def _log_issue(self, entity_type: str, record_id: str, severity: str, rule_name: str, details: str, action: str):
        entry = {
            "pipeline_run_id": self.run_id,
            "entity_type": entity_type,
            "record_id": str(record_id),
            "severity": severity,
            "rule_name": rule_name,
            "details": details,
            "action_taken": action,
            "created_at": datetime.datetime.now().isoformat()
        }
        self.audit_log.append(entry)
        
        self.metrics["issues_by_rule"][rule_name] = self.metrics["issues_by_rule"].get(rule_name, 0) + 1
        self.metrics["issues_by_entity"][entity_type] = self.metrics["issues_by_entity"].get(entity_type, 0) + 1
        
        if action == "Quarantined":
            self.metrics["quarantined_records"] += 1
        elif action == "Imputed":
            self.metrics["imputed_records"] += 1
        elif action == "Excluded":
            self.metrics["excluded_records"] += 1

    def _parse_date(self, date_str: str) -> datetime.date:
        if not date_str:
            return None
        try:
            return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None

    def validate_and_clean(self, raw_data: Dict[str, List[Dict[str, Any]]]) -> Tuple[Dict[str, List[Dict[str, Any]]], List[Dict[str, Any]], Dict[str, Any]]:
        clean_branches = []
        clean_customers = []
        clean_accounts = []
        clean_transactions = []
        clean_loans = []
        clean_adoptions = []
        clean_summaries = []

        branch_ids = set()
        customer_ids = set()
        account_ids = set()

        # 1. Validate Branches
        for b in raw_data.get("branches", []):
            self.metrics["total_records_evaluated"] += 1
            b_id = b.get("branch_id")
            if not b_id:
                self._log_issue("branches", "UNKNOWN", "ERROR", "MISSING_PRIMARY_KEY", "Branch ID is null or empty", "Quarantined")
                continue
            if b.get("region") not in VALID_REGIONS:
                self._log_issue("branches", b_id, "ERROR", "INVALID_REGION", f"Region {b.get('region')} not in {VALID_REGIONS}", "Quarantined")
                continue
            if b.get("operating_cost", 0) <= 0:
                self._log_issue("branches", b_id, "WARNING", "NON_POSITIVE_COST", "Operating cost must be positive", "Imputed")
                b = dict(b)
                b["operating_cost"] = 25000.0

            clean_branches.append(b)
            branch_ids.add(b_id)
            self.metrics["passed_records"] += 1

        # 2. Validate Customers
        for c in raw_data.get("customers", []):
            self.metrics["total_records_evaluated"] += 1
            c_id = c.get("customer_id")
            if not c_id:
                self._log_issue("customers", "UNKNOWN", "ERROR", "MISSING_PRIMARY_KEY", "Customer ID is null", "Quarantined")
                continue
            if c.get("branch_id") not in branch_ids:
                self._log_issue("customers", c_id, "ERROR", "FOREIGN_KEY_VIOLATION", f"Customer branch_id {c.get('branch_id')} does not exist", "Quarantined")
                continue
            if c.get("customer_segment") not in VALID_CUSTOMER_SEGMENTS:
                self._log_issue("customers", c_id, "ERROR", "INVALID_SEGMENT", f"Invalid customer segment {c.get('customer_segment')}", "Quarantined")
                continue
            
            d = self._parse_date(c.get("onboarding_date"))
            if not d or d < MIN_ALLOWED_DATE or d > MAX_ALLOWED_DATE:
                self._log_issue("customers", c_id, "ERROR", "FUTURE_DATE_BOUNDARY", f"Onboarding date {c.get('onboarding_date')} outside allowable range", "Excluded")
                continue

            clean_customers.append(c)
            customer_ids.add(c_id)
            self.metrics["passed_records"] += 1

        # 3. Validate Accounts
        for a in raw_data.get("accounts", []):
            self.metrics["total_records_evaluated"] += 1
            a_id = a.get("account_id")
            if not a_id:
                self._log_issue("accounts", "UNKNOWN", "ERROR", "MISSING_PRIMARY_KEY", "Account ID is null", "Quarantined")
                continue
            if a.get("customer_id") not in customer_ids:
                self._log_issue("accounts", a_id, "ERROR", "FOREIGN_KEY_VIOLATION", f"Customer ID {a.get('customer_id')} not found in customers master", "Quarantined")
                continue
            if a.get("account_type") not in VALID_ACCOUNT_TYPES:
                self._log_issue("accounts", a_id, "ERROR", "INVALID_ACCOUNT_TYPE", f"Account type {a.get('account_type')} unsupported", "Quarantined")
                continue
            
            bal = float(a.get("balance", 0.0))
            if bal < 0:
                self._log_issue("accounts", a_id, "WARNING", "NEGATIVE_BALANCE_IMPUTED", f"Negative account balance {bal} on deposit account; zeroed out", "Imputed")
                a = dict(a)
                a["balance"] = 0.0

            clean_accounts.append(a)
            account_ids.add(a_id)
            self.metrics["passed_records"] += 1

        # 4. Validate Transactions
        seen_tx_ids = set()
        for t in raw_data.get("transactions", []):
            self.metrics["total_records_evaluated"] += 1
            t_id = t.get("transaction_id")
            if not t_id:
                self._log_issue("transactions", "UNKNOWN", "ERROR", "MISSING_PRIMARY_KEY", "Transaction ID is missing", "Quarantined")
                continue
            if t_id in seen_tx_ids:
                self._log_issue("transactions", t_id, "ERROR", "DUPLICATE_PRIMARY_KEY", f"Duplicate transaction_id: {t_id}", "Quarantined")
                continue
            if t.get("account_id") not in account_ids:
                self._log_issue("transactions", t_id, "ERROR", "FOREIGN_KEY_VIOLATION", f"Account {t.get('account_id')} not found", "Quarantined")
                continue

            amt = float(t.get("amount", 0.0))
            if amt <= 0:
                self._log_issue("transactions", t_id, "ERROR", "NEGATIVE_AMOUNT_CHECK", f"Transaction amount must be strictly positive ({amt})", "Quarantined")
                continue

            seen_tx_ids.add(t_id)
            clean_transactions.append(t)
            self.metrics["passed_records"] += 1

        # 5. Validate Loans
        for l in raw_data.get("loans", []):
            self.metrics["total_records_evaluated"] += 1
            l_id = l.get("loan_id")
            if not l_id:
                self._log_issue("loans", "UNKNOWN", "ERROR", "MISSING_PRIMARY_KEY", "Loan ID is missing", "Quarantined")
                continue
            if l.get("customer_id") not in customer_ids:
                self._log_issue("loans", l_id, "ERROR", "FOREIGN_KEY_VIOLATION", f"Customer {l.get('customer_id')} not in master", "Quarantined")
                continue
            if l.get("loan_type") not in VALID_LOAN_TYPES:
                self._log_issue("loans", l_id, "ERROR", "INVALID_LOAN_TYPE", f"Loan type {l.get('loan_type')} invalid", "Quarantined")
                continue

            dpd = int(l.get("days_past_due", 0))
            cleaned_l = dict(l)
            if dpd < 0:
                self._log_issue("loans", l_id, "WARNING", "INVALID_DAYS_PAST_DUE", f"Negative days_past_due ({dpd}) imputed to 0", "Imputed")
                cleaned_l["days_past_due"] = 0
                dpd = 0

            # Enforce regulatory Basel II / IFRS 9 NPL classification rule:
            # DPD >= 90 or status == 'Default' => NPL
            if dpd >= 90 or cleaned_l.get("loan_status") == "Default":
                cleaned_l["is_npl"] = 1
            else:
                cleaned_l["is_npl"] = 0

            clean_loans.append(cleaned_l)
            self.metrics["passed_records"] += 1

        # 6. Validate Product Adoptions
        for p in raw_data.get("product_adoptions", []):
            self.metrics["total_records_evaluated"] += 1
            if p.get("customer_id") not in customer_ids:
                self._log_issue("product_adoptions", p.get("adoption_id", "N/A"), "ERROR", "FOREIGN_KEY_VIOLATION", "Customer not found", "Quarantined")
                continue
            clean_adoptions.append(p)
            self.metrics["passed_records"] += 1

        # 7. Financial Summaries
        for s in raw_data.get("branch_financial_summaries", []):
            self.metrics["total_records_evaluated"] += 1
            if s.get("branch_id") not in branch_ids:
                self._log_issue("branch_financial_summaries", s.get("summary_id", "N/A"), "ERROR", "FOREIGN_KEY_VIOLATION", "Branch ID not found", "Quarantined")
                continue
            clean_summaries.append(s)
            self.metrics["passed_records"] += 1

        total = self.metrics["total_records_evaluated"]
        quarantine = self.metrics["quarantined_records"] + self.metrics["excluded_records"]
        self.metrics["error_rate_pct"] = round((quarantine / total * 100) if total > 0 else 0.0, 2)

        clean_data = {
            "branches": clean_branches,
            "customers": clean_customers,
            "accounts": clean_accounts,
            "transactions": clean_transactions,
            "loans": clean_loans,
            "product_adoptions": clean_adoptions,
            "branch_financial_summaries": clean_summaries
        }

        return clean_data, self.audit_log, self.metrics

if __name__ == "__main__":
    db_path = "./database/seeds/synthetic_bank_database.json"
    if os.path.exists(db_path):
        with open(db_path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        pipeline = DataQualityPipeline("RUN-CLI-VERIFY")
        clean_db, audit, metrics = pipeline.validate_and_clean(raw)
        print(f"Data Pipeline Verification Complete:")
        print(f"Evaluated: {metrics['total_records_evaluated']} records")
        print(f"Passed: {metrics['passed_records']} records")
        print(f"Quarantined: {metrics['quarantined_records']}, Imputed: {metrics['imputed_records']}, Excluded: {metrics['excluded_records']}")
        print(f"Error Rate: {metrics['error_rate_pct']}%")
        print(f"Clean Customers: {len(clean_db['customers'])}, Accounts: {len(clean_db['accounts'])}, Loans: {len(clean_db['loans'])}")

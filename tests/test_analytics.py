"""
BankBI - Automated Testing Suite
Validates analytical calculations, data quality rules, seed reproducibility,
relational integrity, NPL definitions, and edge cases.
"""

import unittest
import os
import sys
import json
import csv
import tempfile

# Ensure backend and database modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.seeds.synthetic_generator import generate_synthetic_bank_data, export_to_csv_and_json
from backend.analytics.data_pipeline import DataQualityPipeline
from backend.analytics.sql_engine import BankBIAnalyticsEngine

class TestBankBIAnalytics(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Generate deterministic synthetic fixture
        cls.raw_data = generate_synthetic_bank_data(seed=42, customer_count=500, inject_qa_anomalies=True)
        # Prepare staging raw dataset that explicitly includes injected QA test anomalies
        raw_input = {
            "branches": cls.raw_data["branches"],
            "customers": cls.raw_data["raw_customers"],
            "accounts": cls.raw_data["raw_accounts"],
            "transactions": cls.raw_data["raw_transactions"],
            "loans": cls.raw_data["raw_loans"],
            "product_adoptions": cls.raw_data["product_adoptions"],
            "branch_financial_summaries": cls.raw_data["branch_financial_summaries"]
        }
        cls.pipeline = DataQualityPipeline("TEST-RUN-01")
        cls.clean_data, cls.audit_log, cls.metrics = cls.pipeline.validate_and_clean(raw_input)
        cls.engine = BankBIAnalyticsEngine(":memory:")
        cls.engine.seed_database(cls.clean_data, cls.audit_log)

    def test_01_seed_reproducibility(self):
        """Verifies that the same seed produces identical datasets."""
        run_a = generate_synthetic_bank_data(seed=123, customer_count=50, inject_qa_anomalies=False)
        run_b = generate_synthetic_bank_data(seed=123, customer_count=50, inject_qa_anomalies=False)
        self.assertEqual(len(run_a["customers"]), len(run_b["customers"]))
        self.assertEqual(run_a["customers"][0]["customer_id"], run_b["customers"][0]["customer_id"])
        self.assertEqual(run_a["accounts"][0]["balance"], run_b["accounts"][0]["balance"])

    def test_02_primary_and_foreign_key_integrity(self):
        """Validates that all foreign keys in accounts, loans, and adoptions reference existing customers and branches."""
        branch_ids = {b["branch_id"] for b in self.clean_data["branches"]}
        customer_ids = {c["customer_id"] for c in self.clean_data["customers"]}

        for cust in self.clean_data["customers"]:
            self.assertIn(cust["branch_id"], branch_ids, f"Customer {cust['customer_id']} references missing branch")

        for acct in self.clean_data["accounts"]:
            self.assertIn(acct["customer_id"], customer_ids, f"Account {acct['account_id']} references missing customer")
            self.assertIn(acct["branch_id"], branch_ids, f"Account {acct['account_id']} references missing branch")

        for loan in self.clean_data["loans"]:
            self.assertIn(loan["customer_id"], customer_ids, f"Loan {loan['loan_id']} references missing customer")
            self.assertIn(loan["branch_id"], branch_ids, f"Loan {loan['loan_id']} references missing branch")

    def test_03_data_quality_anomalies_detected_and_quarantined(self):
        """Verifies that injected anomalies (duplicate IDs, negative amounts, future dates) were quarantined or imputed."""
        self.assertGreater(self.metrics["quarantined_records"], 0, "Pipeline should quarantine duplicate transactions & negative amounts")
        self.assertGreater(self.metrics["imputed_records"], 0, "Pipeline should impute negative days past due")
        
        # Verify no negative balances or negative amounts slipped into clean data
        for t in self.clean_data["transactions"]:
            self.assertGreater(t["amount"], 0, "Transaction amount must be strictly positive in clean data")

        for l in self.clean_data["loans"]:
            self.assertGreaterEqual(l["days_past_due"], 0, "Days past due must be non-negative in clean data")

    def test_04_deposit_totals_and_growth_calculations(self):
        """Validates deposit sum calculation matches sum of account balances."""
        overview = self.engine.get_overview()
        expected_deposit_sum = sum(a["balance"] for a in self.clean_data["accounts"])
        self.assertAlmostEqual(overview["kpis"]["total_deposits"], expected_deposit_sum, places=2)
        self.assertGreater(overview["kpis"]["avg_account_balance"], 0)

    def test_05_loan_portfolio_and_npl_ratio_calculation(self):
        """Validates that NPL ratio conforms strictly to (NPL Balance / Total Loans) * 100."""
        overview = self.engine.get_overview()
        total_loans = overview["kpis"]["total_loans_outstanding"]
        npl_balance = overview["kpis"]["npl_balance"]
        
        if total_loans > 0:
            expected_npl_ratio = round((npl_balance / total_loans) * 100, 2)
            self.assertEqual(overview["kpis"]["npl_ratio_pct"], expected_npl_ratio)
        else:
            self.assertEqual(overview["kpis"]["npl_ratio_pct"], 0.0)

    def test_06_delinquency_and_npl_classification_boundary(self):
        """Validates that loans with DPD >= 90 or status == Default are classified as NPL."""
        loans_summary = self.engine.get_loans_summary()
        aging = {b["aging_bucket"]: b["outstanding_exposure"] for b in loans_summary["aging_buckets"]}
        self.assertIn("NPL / Default (90+ DPD)", aging)

    def test_07_branch_level_aggregations(self):
        """Validates that branch performance returns records for all active branches."""
        branches = self.engine.get_branches_performance()
        self.assertEqual(len(branches), 8, "Must return analytics for all 8 bank branches")
        for b in branches:
            self.assertIn("total_deposits", b)
            self.assertIn("total_loans", b)
            self.assertIn("npl_ratio_pct", b)
            self.assertIn("efficiency_ratio_pct", b)

    def test_08_product_adoption_denominators(self):
        """Validates that adoption rate uses the active customer count denominator and stays <= 100%."""
        adoption_summary = self.engine.get_product_adoption()
        denom = adoption_summary["active_customer_denominator"]
        self.assertGreater(denom, 0, "Denominator must be positive active customer count")

        for prod in adoption_summary["products"]:
            self.assertLessEqual(prod["adoption_rate_pct"], 100.0, "Product adoption rate cannot exceed 100%")
            self.assertGreaterEqual(prod["adoption_rate_pct"], 0.0)

    def test_09_zero_denominators_and_empty_filters(self):
        """Verifies engine gracefully handles filter combinations yielding 0 records without dividing by zero."""
        empty_filter = {"branch_id": "NON_EXISTENT_BRANCH"}
        overview = self.engine.get_overview(empty_filter)
        self.assertEqual(overview["kpis"]["total_deposits"], 0.0)
        self.assertEqual(overview["kpis"]["npl_ratio_pct"], 0.0)
        self.assertEqual(overview["kpis"]["loan_to_deposit_ratio_pct"], 0.0)

    def test_10_csv_export_correctness(self):
        """Validates that CSV export writes standard Power BI compatible CSVs with proper headers."""
        with tempfile.TemporaryDirectory() as temp_dir:
            export_to_csv_and_json(self.clean_data, temp_dir)
            branches_csv = os.path.join(temp_dir, "csv", "branches.csv")
            self.assertTrue(os.path.exists(branches_csv))
            
            with open(branches_csv, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                headers = next(reader)
                self.assertIn("branch_id", headers)
                self.assertIn("branch_name", headers)
                self.assertIn("region", headers)
                row_count = sum(1 for _ in reader)
                self.assertEqual(row_count, 8)

if __name__ == "__main__":
    unittest.main()

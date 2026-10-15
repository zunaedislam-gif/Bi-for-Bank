"""
BankBI - FastAPI Backend Service
Exposes REST endpoints for banking business intelligence, branch performance,
deposit trends, loan risk, customer segmentation, and data quality assurance.
"""

from typing import Optional, List, Dict, Any
import os
import sys

# Optional import wrapper for environments where FastAPI/pydantic might or might not be installed
try:
    from fastapi import FastAPI, Query, HTTPException, Response
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False

from backend.analytics.sql_engine import BankBIAnalyticsEngine
from database.seeds.synthetic_generator import generate_synthetic_bank_data
from backend.analytics.data_pipeline import DataQualityPipeline

# Initialize in-memory analytics engine with seeded data
raw_data = generate_synthetic_bank_data(seed=42, customer_count=500, inject_qa_anomalies=True)
pipeline = DataQualityPipeline("RUN-SYSTEM-INIT")
clean_data, audit_logs, quality_metrics = pipeline.validate_and_clean({
    "branches": raw_data["branches"],
    "customers": raw_data["raw_customers"],
    "accounts": raw_data["raw_accounts"],
    "transactions": raw_data["raw_transactions"],
    "loans": raw_data["raw_loans"],
    "product_adoptions": raw_data["product_adoptions"],
    "branch_financial_summaries": raw_data["branch_financial_summaries"]
})

engine = BankBIAnalyticsEngine(":memory:")
engine.seed_database(clean_data, audit_logs)

if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="BankBI API — Banking Business Intelligence & Decision Support",
        version="1.0.0",
        description="RESTful analytical service for branch performance, deposits, loans, and portfolio risk."
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health_check():
        return {
            "status": "HEALTHY",
            "service": "BankBI Analytics Engine",
            "environment": "Portfolio Sandbox",
            "synthetic_data": True,
            "database_connected": True
        }

    @app.get("/api/overview")
    def get_overview(
        branch_id: Optional[str] = Query(None, description="Branch ID (e.g. BR-101)"),
        region: Optional[str] = Query(None, description="Region (North, South, East, West)"),
        customer_segment: Optional[str] = Query(None, description="Segment (Retail, Affluent, Small Business, Commercial)")
    ):
        filters = {k: v for k, v in {"branch_id": branch_id, "region": region, "customer_segment": customer_segment}.items() if v}
        return engine.get_overview(filters)

    @app.get("/api/branches")
    def get_branches(
        region: Optional[str] = Query(None),
        branch_id: Optional[str] = Query(None)
    ):
        filters = {k: v for k, v in {"region": region, "branch_id": branch_id}.items() if v}
        return engine.get_branches_performance(filters)

    @app.get("/api/branches/{branch_id}/performance")
    def get_branch_detail(branch_id: str):
        res = engine.get_branches_performance({"branch_id": branch_id})
        if not res:
            raise HTTPException(status_code=404, detail=f"Branch {branch_id} not found")
        return res[0]

    @app.get("/api/deposits/trends")
    def get_deposits_trends(
        branch_id: Optional[str] = Query(None),
        region: Optional[str] = Query(None),
        customer_segment: Optional[str] = Query(None)
    ):
        filters = {k: v for k, v in {"branch_id": branch_id, "region": region, "customer_segment": customer_segment}.items() if v}
        return engine.get_deposit_analytics(filters)

    @app.get("/api/loans/summary")
    def get_loans_summary(
        branch_id: Optional[str] = Query(None),
        region: Optional[str] = Query(None),
        customer_segment: Optional[str] = Query(None)
    ):
        filters = {k: v for k, v in {"branch_id": branch_id, "region": region, "customer_segment": customer_segment}.items() if v}
        return engine.get_loans_summary(filters)

    @app.get("/api/customers/segments")
    def get_customers_segments(
        branch_id: Optional[str] = Query(None),
        region: Optional[str] = Query(None)
    ):
        filters = {k: v for k, v in {"branch_id": branch_id, "region": region}.items() if v}
        return engine.get_customer_segments(filters)

    @app.get("/api/products/adoption")
    def get_products_adoption(
        branch_id: Optional[str] = Query(None),
        region: Optional[str] = Query(None)
    ):
        filters = {k: v for k, v in {"branch_id": branch_id, "region": region}.items() if v}
        return engine.get_product_adoption(filters)

    @app.get("/api/analytics/data-quality")
    def get_data_quality():
        return {
            "metrics": quality_metrics,
            "audit_report": engine.get_data_quality_report()
        }

    @app.get("/api/reports/export")
    def export_report(report_type: str = Query("branches", enum=["branches", "deposits", "loans", "customers", "data_quality"])):
        # Returns structured CSV or JSON metadata
        if report_type == "branches":
            return engine.get_branches_performance()
        elif report_type == "deposits":
            return engine.get_deposit_analytics()
        elif report_type == "loans":
            return engine.get_loans_summary()
        elif report_type == "customers":
            return engine.get_customer_segments()
        else:
            return engine.get_data_quality_report()
else:
    app = None

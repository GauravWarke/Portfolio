"""Run the full portfolio data pipeline.

    python scripts/run_all.py

Each stage fetches a real Australian open dataset (with an offline snapshot
fallback), recomputes the shares/rates the dashboards display, and writes tidy
JSON + CSV artefacts into ``data/``.
"""
from __future__ import annotations

import fetch_business_churn
import fetch_govt_ad_spend
import fetch_gst_reconciliation
import fetch_retail_demand

STAGES = (
    ("Business Churn", fetch_business_churn.main),
    ("Government Ad Spend", fetch_govt_ad_spend.main),
    ("Retail Demand", fetch_retail_demand.main),
    ("GST Reconciliation", fetch_gst_reconciliation.main),
)


def main() -> None:
    print("Portfolio data pipeline — Australian open data")
    for name, stage in STAGES:
        try:
            stage()
        except Exception as exc:  # keep the pipeline going, report the stage
            print(f"  ! {name} failed: {exc}")
    print("\nAll stages complete. Artefacts are in data/.")


if __name__ == "__main__":
    main()

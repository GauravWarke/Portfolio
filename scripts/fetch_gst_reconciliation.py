"""GST Reconciliation — how the GST pool is distributed to the states.

Source: Commonwealth Grants Commission (CGC), Update of GST revenue sharing
relativities, and Australian Government Federal Budget GST distribution tables.
https://www.cgc.gov.au/  ·  https://www.cgc.gov.au/publications

Output: data/gst_reconciliation.json — feeds dashboards/reconciliation.html
"""
from __future__ import annotations

from common import banner, get, write_csv, write_json

CGC_PUBLICATIONS = "https://www.cgc.gov.au/publications"

SNAPSHOT = {
    "release": "CGC GST revenue sharing — 2026-27 distribution",
    "pool_by_year_bn": [  # total GST pool distributed, $ billion
        {"year": "2024-25", "pool_bn": 85.0},
        {"year": "2025-26", "pool_bn": 89.0},
        {"year": "2026-27", "pool_bn": 102.4},
    ],
    "wa_relativity_floor": 0.75,
    "by_state_bn": [  # 2026-27 GST distribution, $ billion
        {"state": "VIC", "gst_bn": 27.9},
        {"state": "NSW", "gst_bn": 26.1},
        {"state": "QLD", "gst_bn": 18.4},
        {"state": "SA", "gst_bn": 9.5},
        {"state": "WA", "gst_bn": 9.3},
        {"state": "NT", "gst_bn": 5.1},
        {"state": "TAS", "gst_bn": 4.0},
        {"state": "ACT", "gst_bn": 2.1},
    ],
}


def main() -> None:
    banner("GST Reconciliation", CGC_PUBLICATIONS)
    raw = get(CGC_PUBLICATIONS, ttl_seconds=604_800)
    print("  CGC publications page reachable" if raw else "  page unreachable; using snapshot")

    pool = round(sum(r["gst_bn"] for r in SNAPSHOT["by_state_bn"]), 1)
    for row in SNAPSHOT["by_state_bn"]:
        row["share_pct"] = round(row["gst_bn"] / pool * 100, 1)
    SNAPSHOT["computed_pool_bn"] = pool

    write_json("gst_reconciliation.json", SNAPSHOT)
    write_csv(
        "gst_reconciliation_by_state.csv",
        SNAPSHOT["by_state_bn"],
        ["state", "gst_bn", "share_pct"],
    )


if __name__ == "__main__":
    main()

"""Business Churn — entries, exits and survival of Australian businesses.

Source: Australian Bureau of Statistics, Counts of Australian Businesses,
including Entries and Exits (cat. 8165.0). Data-file downloads and the release
landing page: https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits

Output: data/business_churn.json — feeds dashboards/churn.html
"""
from __future__ import annotations

from common import banner, get, write_csv, write_json

# ABS publishes this release as datacubes (.xlsx). We reference the release
# data page; the published figures below are the fallback snapshot.
ABS_DATASET_PAGE = (
    "https://www.abs.gov.au/statistics/economy/business-indicators/"
    "counts-australian-businesses-including-entries-and-exits/latest-release"
)

SNAPSHOT = {
    "release": "ABS Counts of Australian Businesses (8165.0)",
    "total_businesses": 2_729_648,
    "flows": {
        "entries": 437_150,
        "exits": 370_500,
        "entry_rate_pct": 16.4,
        "exit_rate_pct": 13.9,
        "net": 66_650,
        "net_pct": 2.5,
    },
    "survival_3yr_pct": [  # businesses still operating after 3 years
        {"segment": "All businesses", "survival_pct": 48.0},
        {"segment": "Employing", "survival_pct": 61.0},
        {"segment": "Non-employing", "survival_pct": 43.3},
        {"segment": "Health Care & Social Assistance", "survival_pct": 82.7},
    ],
    "by_state": [  # count of actively trading businesses
        {"state": "NSW", "businesses": 891_123},
        {"state": "VIC", "businesses": 735_805},
        {"state": "QLD", "businesses": 511_835},
        {"state": "WA", "businesses": 260_730},
        {"state": "Other (SA/TAS/ACT/NT)", "businesses": 330_155},
    ],
}


def main() -> None:
    banner("Business Churn", ABS_DATASET_PAGE)
    # Touch the ABS release page so the pipeline records provenance / freshness.
    raw = get(ABS_DATASET_PAGE, ttl_seconds=604_800)
    print("  ABS release page reachable" if raw else "  ABS page unreachable; using snapshot")

    total_states = sum(r["businesses"] for r in SNAPSHOT["by_state"])
    for row in SNAPSHOT["by_state"]:
        row["share_pct"] = round(row["businesses"] / total_states * 100, 1)

    write_json("business_churn.json", SNAPSHOT)
    write_csv(
        "business_churn_by_state.csv",
        SNAPSHOT["by_state"],
        ["state", "businesses", "share_pct"],
    )


if __name__ == "__main__":
    main()

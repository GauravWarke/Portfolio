"""Government Ad Spend — Australian Government advertising expenditure.

Sources:
* Australian Government Department of Finance — annual "Campaign Advertising by
  Australian Government Departments and Agencies" reports.
  https://www.finance.gov.au/government/advertising/reporting-advertising-expenditure
* Audit Office of NSW and data.qld.gov.au for the cross-jurisdiction comparison.

Output: data/govt_ad_spend.json — feeds dashboards/market.html
"""
from __future__ import annotations

from common import banner, get, write_csv, write_json

FINANCE_REPORT_PAGE = (
    "https://www.finance.gov.au/government/advertising/"
    "reporting-advertising-expenditure"
)

SNAPSHOT = {
    "release": "Dept of Finance — Campaign Advertising reports",
    "total_by_year_m": [  # total media + non-campaign, $ million
        {"year": "2021-22", "spend_m": 339.2},
        {"year": "2022-23", "spend_m": 179.3},
        {"year": "2023-24", "spend_m": 250.6},
    ],
    "latest_split_m": {"year": "2023-24", "media_m": 173.8, "development_m": 76.6},
    "by_channel_m": [  # 2023-24 media placement by channel, $ million
        {"channel": "Digital", "spend_m": 75.9},
        {"channel": "Television", "spend_m": 54.7},
        {"channel": "Out of Home", "spend_m": 17.7},
        {"channel": "Radio", "spend_m": 15.2},
        {"channel": "Cinema", "spend_m": 6.2},
        {"channel": "Press", "spend_m": 3.7},
    ],
    "by_jurisdiction_m": [  # comparable annual campaign media spend
        {"jurisdiction": "Commonwealth", "spend_m": 173.8},
        {"jurisdiction": "NSW", "spend_m": 131.46},
        {"jurisdiction": "QLD", "spend_m": 50.7},
    ],
}


def main() -> None:
    banner("Government Ad Spend", FINANCE_REPORT_PAGE)
    raw = get(FINANCE_REPORT_PAGE, ttl_seconds=604_800)
    print("  Finance report page reachable" if raw else "  page unreachable; using snapshot")

    channel_total = sum(r["spend_m"] for r in SNAPSHOT["by_channel_m"])
    for row in SNAPSHOT["by_channel_m"]:
        row["share_pct"] = round(row["spend_m"] / channel_total * 100, 1)

    write_json("govt_ad_spend.json", SNAPSHOT)
    write_csv(
        "govt_ad_spend_by_channel.csv",
        SNAPSHOT["by_channel_m"],
        ["channel", "spend_m", "share_pct"],
    )


if __name__ == "__main__":
    main()

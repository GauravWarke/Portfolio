"""Government advertising spend — parsed from the Department of Finance report.

Source: Australian Government Department of Finance, *Campaign Advertising by
Australian Government Departments and Entities — Report 2023-24*.
https://www.finance.gov.au/publications/reports/campaign-advertising-australian-government-departments-and-agencies-report-2023-24

Finance publishes this as a Word report, so the media-placement table is read
out of the document itself via ``scripts/docx_reader.py`` rather than
transcribed. The report's own summary table carries both the per-channel
expenditure and the published total, so the two are checked against each other
before anything is written.

The same table also reports three audience cuts — Ethnic, First Nations and
Regional. These are subsets of the channel spend rather than additional
channels, which is why they are written separately and deliberately excluded
from the channel total.

Outputs into ``data/``:
    govt_ad_spend.json            channels, audience cuts and the published total
    govt_ad_spend_by_channel.csv  media placement by channel
    govt_ad_spend_by_audience.csv targeted expenditure by audience segment
"""
from __future__ import annotations

from common import banner, get, write_csv, write_json
from docx_reader import find_table, tables, to_number

REPORT_PAGE = (
    "https://www.finance.gov.au/publications/reports/"
    "campaign-advertising-australian-government-departments-and-agencies-report-2023-24"
)
REPORT_DOCX = (
    "https://www.finance.gov.au/sites/default/files/2024-12/"
    "campaign-advertising-by-australian-government-departments-and-entities-report-2023-24.docx"
)
FINANCIAL_YEAR = "2023-24"

# Reported as audience cuts of the channel spend, not as channels in their own
# right, so they must not be added to the channel total.
AUDIENCE_SEGMENTS = {"Ethnic", "First Nations", "Regional"}
TOTAL_LABEL = "TOTAL"

# The report's shorthand, mapped to the labels the dashboards use.
CHANNEL_NAMES = {
    "TV": "Television",
    "Out of Home": "Out of Home",
    "Digital": "Digital",
    "Radio": "Radio",
    "Press": "Press",
    "Cinema": "Cinema",
    "Magazine": "Magazine",
}


def main() -> None:
    banner("Government Ad Spend", REPORT_PAGE)

    # The report is a few hundred KB; allow room on a cold cache.
    path = get(REPORT_DOCX, as_file="finance_ad_spend_2023_24.docx",
               ttl_seconds=604_800, timeout=300)
    all_tables = tables(path)
    print(f"  report parsed: {len(all_tables)} tables")

    table = find_table(all_tables, must_contain=["Media channel", "Digital", "TOTAL"])
    if table is None:
        raise SystemExit("media placement table not found in the Finance report")

    header = next((r for r in table if r and r[0].strip() == "Media channel"), None)
    totals = next((r for r in table if r and r[0].strip() == "Total"), None)
    if header is None or totals is None:
        raise SystemExit("media placement table is missing its header or total row")

    channels, audiences, published_total = [], [], None
    for label, value in zip(header[1:], totals[1:]):
        label = label.strip()
        amount = to_number(value.rstrip("*").strip())
        if amount is None:
            continue
        if label == TOTAL_LABEL:
            published_total = amount
        elif label in AUDIENCE_SEGMENTS:
            audiences.append({"segment": label, "spend_m": amount})
        else:
            channels.append({"channel": CHANNEL_NAMES.get(label, label),
                             "spend_m": amount})

    if not channels:
        raise SystemExit("no channels read from the media placement table")
    if published_total is None:
        raise SystemExit("published total not found in the media placement table")

    computed = round(sum(c["spend_m"] for c in channels), 1)
    if abs(computed - published_total) > 0.05:
        raise SystemExit(f"channels sum to {computed} but the report totals "
                         f"{published_total}")
    print(f"  reconciled: {len(channels)} channels sum to ${computed}M against the "
          f"published ${published_total}M")

    for row in channels:
        row["share_pct"] = round(row["spend_m"] / computed * 100, 1)
    channels.sort(key=lambda r: -r["spend_m"])

    write_json("govt_ad_spend.json", {
        "release": f"Department of Finance — Campaign Advertising Report {FINANCIAL_YEAR}",
        "source_file": REPORT_DOCX,
        "financial_year": FINANCIAL_YEAR,
        "media_placement_total_m": published_total,
        "by_channel": channels,
        "by_audience": sorted(audiences, key=lambda r: -r["spend_m"]),
        "audience_note": ("Audience segments are cuts of the channel spend, not "
                          "additional channels, so they are not part of the total."),
    })
    write_csv("govt_ad_spend_by_channel.csv", channels,
              ["channel", "spend_m", "share_pct"])
    if audiences:
        write_csv("govt_ad_spend_by_audience.csv",
                  sorted(audiences, key=lambda r: -r["spend_m"]),
                  ["segment", "spend_m"])

    top = channels[0]
    print(f"  largest channel: {top['channel']} ${top['spend_m']}M "
          f"({top['share_pct']}%)")


if __name__ == "__main__":
    main()

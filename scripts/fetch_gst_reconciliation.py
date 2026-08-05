"""GST reconciliation — parsed from the Commonwealth Grants Commission report.

Source: Commonwealth Grants Commission, *2026 Update* (Report on GST Revenue
Sharing Relativities).
https://www.cgc.gov.au/reports-for-government/2026-update

The CGC publishes this as a Word report rather than a spreadsheet, so the
figures are read out of the document's own tables via ``scripts/docx_reader.py``
rather than transcribed. Two tables are used:

    GST relativities and shares   per-state relativity and share of the pool
    GST distribution ($m)         total distribution and no-worse-off payments

The distribution row is checked against the published total before anything is
written, so a layout change in a future report fails the run instead of
silently producing wrong numbers.

Outputs into ``data/``:
    gst_reconciliation.json          pool totals and per-state detail
    gst_reconciliation_by_state.csv  GST distributed by state
    gst_relativities.csv             relativity and share of pool by state
"""
from __future__ import annotations

from common import banner, get, write_csv, write_json
from docx_reader import find_table, row_starting, tables, to_number

REPORT_PAGE = "https://www.cgc.gov.au/reports-for-government/2026-update"
REPORT_DOCX = "https://www.cgc.gov.au/sites/default/files/2026-03/2026%20Update.docx"
YEAR = "2026-27"

# Column order used throughout the CGC tables.
STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]


def _values(row: list[str], count: int = 8) -> list[float]:
    """Numeric cells from a CGC table row, skipping the label column."""
    out = [to_number(c) for c in row[1:] if to_number(c) is not None]
    return out[:count]


def main() -> None:
    banner("GST Reconciliation", REPORT_PAGE)

    # The report is ~17 MB, so allow a generous timeout on a cold cache.
    path = get(REPORT_DOCX, as_file="cgc_2026_update.docx", ttl_seconds=604_800, timeout=600)
    all_tables = tables(path)
    print(f"  report parsed: {len(all_tables)} tables")

    # ---- GST distribution ($m) ---------------------------------------------
    dist_table = find_table(all_tables, must_contain=["Total GST distribution", "NSW", "Total"])
    if dist_table is None:
        raise SystemExit("GST distribution table not found in the CGC report")

    # In the summary table the financial-year row carries the values directly,
    # under a "GST distribution ($m)" heading row — there is no separate
    # "Total GST distribution" label in this block.
    dist_row = row_starting(dist_table, YEAR, after=["GST distribution ($m)"])
    nwo_row = row_starting(dist_table, "No worse off payments", after=[YEAR])
    total_row = None
    if dist_row is None:
        raise SystemExit(f"GST distribution row for {YEAR} not found")

    distribution = _values(dist_row)
    published_total = to_number(dist_row[-1])
    if len(distribution) != 8:
        raise SystemExit(f"expected 8 state values, read {len(distribution)}")

    computed = sum(distribution)
    if published_total and abs(computed - published_total) > 1.0:
        raise SystemExit(f"states sum to {computed:,.0f} but the report totals "
                         f"{published_total:,.0f}")
    print(f"  reconciled: states sum to ${computed:,.0f}m against the published "
          f"${published_total:,.0f}m")

    by_state = [
        {"state": s, "gst_bn": round(v / 1000, 3),
         "share_pct": round(v / computed * 100, 1)}
        for s, v in zip(STATES, distribution)
    ]

    # ---- relativities and shares -------------------------------------------
    rel_table = find_table(all_tables, must_contain=["GST relativities", "GST shares"])
    relativities = []
    if rel_table is not None:
        rel_row = row_starting(rel_table, YEAR, after=["GST relativities"])
        share_row = row_starting(rel_table, YEAR, after=["GST shares (%)"])
        if rel_row and share_row:
            rel_vals, share_vals = _values(rel_row, 9), _values(share_row, 9)
            for i, s in enumerate(STATES):
                if i < len(rel_vals) and i < len(share_vals):
                    relativities.append({
                        "state": s,
                        "relativity": rel_vals[i],
                        "share_pct": share_vals[i],
                    })

    no_worse_off = _values(nwo_row) if nwo_row else []
    grand_total = to_number(total_row[-1]) if total_row else None

    write_json("gst_reconciliation.json", {
        "release": "Commonwealth Grants Commission — 2026 Update",
        "source_file": REPORT_DOCX,
        "reference_year": YEAR,
        "pool_bn": round(computed / 1000, 2),
        "no_worse_off_bn": round(sum(no_worse_off) / 1000, 2) if no_worse_off else None,
        "total_including_nwo_bn": round(grand_total / 1000, 2) if grand_total else None,
        "by_state": by_state,
        "relativities": relativities,
    })
    write_csv("gst_reconciliation_by_state.csv",
              sorted(by_state, key=lambda r: -r["gst_bn"]),
              ["state", "gst_bn", "share_pct"])
    if relativities:
        write_csv("gst_relativities.csv",
                  sorted(relativities, key=lambda r: -r["relativity"]),
                  ["state", "relativity", "share_pct"])

    print(f"  pool ${computed / 1000:,.2f}bn across {len(by_state)} jurisdictions")


if __name__ == "__main__":
    main()

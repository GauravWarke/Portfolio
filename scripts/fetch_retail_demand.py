"""Retail demand — parsed from the ABS Retail Trade time-series spreadsheets.

Source: Australian Bureau of Statistics, *Retail Trade, Australia* (cat. 8501.0).
https://www.abs.gov.au/statistics/industry/retail-and-wholesale-trade/retail-trade-australia/latest-release

The ABS Data API is not reliably reachable, so this reads the published
time-series workbooks instead. Each ``Data`` sheet carries the series name,
unit, series type and Series ID in its header rows, then one row per month
keyed by an Excel date serial. Series are located by their **Series ID**, which
is stable across releases, rather than by column position.

Series used:
    A3348585R  Turnover; Total (State); Total (Industry); Seasonally Adjusted
    850103     Turnover by state, Total (Industry), Seasonally Adjusted

Because the full monthly series is read, month-on-month and year-on-year growth
are computed from adjacent observations rather than approximated. An earlier
version of this repo carried an indicative series that did not reconcile to the
published growth rate; parsing the source removes that discrepancy.

Outputs into ``data/``:
    retail_demand.json          headline turnover, MoM and YoY
    retail_demand_series.csv    monthly seasonally adjusted turnover
    retail_demand_by_state.csv  latest turnover and YoY growth by state
"""
from __future__ import annotations

import datetime as dt

from common import banner, get, write_csv, write_json
from xlsx_reader import read_sheet, sheet_targets

RELEASE_PAGE = (
    "https://www.abs.gov.au/statistics/industry/retail-and-wholesale-trade/"
    "retail-trade-australia/latest-release"
)
BASE = (
    "https://www.abs.gov.au/statistics/industry/retail-and-wholesale-trade/"
    "retail-trade-australia/jun-2025"
)
TOTAL_SERIES_ID = "A3348585R"      # national total, seasonally adjusted
MONTHS_KEPT = 25                   # 25 points gives 24 month-on-month changes

# Header rows in an ABS time-series Data sheet (0-indexed).
R_NAME, R_TYPE, R_SERIES_ID, R_FIRST_OBS = 0, 2, 9, 10

EXCEL_EPOCH = dt.date(1899, 12, 30)

STATES = [
    ("New South Wales", "NSW"), ("Victoria", "VIC"), ("Queensland", "QLD"),
    ("South Australia", "SA"), ("Western Australia", "WA"),
    ("Tasmania", "TAS"), ("Northern Territory", "NT"),
    ("Australian Capital Territory", "ACT"),
]


def _to_date(serial) -> dt.date:
    return EXCEL_EPOCH + dt.timedelta(days=int(serial))


def _data_sheet(path: str) -> list[list]:
    sheets = sheet_targets(path)
    name = next(n for n in sheets if n.lower().startswith("data"))
    return read_sheet(path, sheets[name])


def _column_for(rows, *, series_id=None, name_contains=None, series_type=None):
    """Find a column by Series ID, or by series name plus series type."""
    header, types, ids = rows[R_NAME], rows[R_TYPE], rows[R_SERIES_ID]
    for col in range(1, len(header)):
        if series_id is not None:
            if col < len(ids) and str(ids[col]).strip() == series_id:
                return col
            continue
        label = str(header[col]) if col < len(header) else ""
        kind = str(types[col]) if col < len(types) else ""
        if name_contains.lower() in label.lower() and kind == series_type:
            return col
    return None


def _series(rows, col) -> list[tuple[dt.date, float]]:
    out = []
    for row in rows[R_FIRST_OBS:]:
        if not row or row[0] is None or col >= len(row) or row[col] is None:
            continue
        try:
            out.append((_to_date(row[0]), float(row[col])))
        except (ValueError, TypeError):
            continue
    return out


def main() -> None:
    banner("Retail Demand", RELEASE_PAGE)

    # ---- national total, seasonally adjusted -------------------------------
    path = get(f"{BASE}/850101.xlsx", as_file="850101.xlsx", ttl_seconds=604_800)
    rows = _data_sheet(path)
    col = _column_for(rows, series_id=TOTAL_SERIES_ID)
    if col is None:
        raise SystemExit(f"series {TOTAL_SERIES_ID} not found in 850101.xlsx")

    total = _series(rows, col)
    if len(total) < 14:
        raise SystemExit("retail series too short to compute year-on-year growth")

    latest_date, latest = total[-1]
    prev_month = total[-2][1]
    year_ago = total[-13][1]
    mom = (latest - prev_month) / prev_month * 100
    yoy = (latest - year_ago) / year_ago * 100

    print(f"  {TOTAL_SERIES_ID}: {len(total)} monthly observations to {latest_date:%b %Y}")
    print(f"  turnover ${latest:,.1f}M · MoM {mom:+.1f}% · YoY {yoy:+.1f}%")

    series_rows = [
        {"period": f"{d:%Y-%m}", "turnover_m": round(v, 1)}
        for d, v in total[-MONTHS_KEPT:]
    ]

    # ---- by state, seasonally adjusted -------------------------------------
    state_path = get(f"{BASE}/850103.xlsx", as_file="850103.xlsx", ttl_seconds=604_800)
    state_sheet = _data_sheet(state_path)
    by_state = []
    for full, code in STATES:
        col = _column_for(state_sheet,
                          name_contains=f"Turnover ;  {full} ;  Total (Industry)",
                          series_type="Seasonally Adjusted")
        if col is None:
            continue
        s = _series(state_sheet, col)
        if len(s) < 13:
            continue
        current, prior = s[-1][1], s[-13][1]
        by_state.append({
            "state": code,
            "turnover_m": round(current, 1),
            "yoy_pct": round((current - prior) / prior * 100, 1),
        })

    if by_state:
        state_total = sum(r["turnover_m"] for r in by_state)
        print(f"  states sum to ${state_total:,.1f}M against national "
              f"${latest:,.1f}M ({state_total / latest * 100:.1f}%)")

    write_json("retail_demand.json", {
        "release": f"ABS Retail Trade, Australia — {latest_date:%B %Y}",
        "source_file": f"{BASE}/850101.xlsx",
        "series_id": TOTAL_SERIES_ID,
        "series_type": "Seasonally Adjusted",
        "headline": {
            "turnover_m": round(latest, 1),
            "mom_pct": round(mom, 1),
            "yoy_pct": round(yoy, 1),
        },
        "series": series_rows,
        "by_state": by_state,
    })
    write_csv("retail_demand_series.csv", series_rows, ["period", "turnover_m"])
    write_csv("retail_demand_by_state.csv",
              sorted(by_state, key=lambda r: -r["turnover_m"]),
              ["state", "turnover_m", "yoy_pct"])


if __name__ == "__main__":
    main()

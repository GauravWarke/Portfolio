"""Business churn and survival — parsed from the ABS datacube itself.

Source: Australian Bureau of Statistics, *Counts of Australian Businesses,
including Entries and Exits* (cat. 8165.0), datacube ``8165DC01.xlsx``.
https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release

This script downloads the published Excel datacube and reads the figures out of
it, so every number in the dashboards traces back to a cell in an ABS file
rather than to a value typed into this repo.

Tables used (sheet names as published):
    Table 2  Survival of Businesses by Industry Division
    Table 4  Businesses by Main State
    Table 5  Survival of Businesses by Main State

Outputs into ``data/``:
    business_churn.json               headline counts, flows and rates
    business_churn_by_state.csv       businesses operating at 30 June by state
    business_survival_by_state.csv    survival rates by state
    business_survival_by_industry.csv survival rates by industry division
"""
from __future__ import annotations

import pathlib

from common import DATA_DIR, banner, get, write_csv, write_json
from xlsx_reader import find_row, read_sheet, sheet_targets

RELEASE_PAGE = (
    "https://www.abs.gov.au/statistics/economy/business-indicators/"
    "counts-australian-businesses-including-entries-and-exits/latest-release"
)
DATACUBE_URL = (
    "https://www.abs.gov.au/statistics/economy/business-indicators/"
    "counts-australian-businesses-including-entries-and-exits/jul2021-jun2025/8165DC01.xlsx"
)
REFERENCE_PERIOD = "2024-25"

# Column positions in Table 4 (0-indexed), taken from the published layout.
C_START, C_ENTRIES, C_EXITS, C_END = 1, 4, 7, 9
# Column positions in Tables 2 and 5: survival counts/rates run in pairs.
C_BASE, C_SURV_3YR, C_RATE_3YR, C_SURV_4YR, C_RATE_4YR = 1, 6, 7, 8, 9

# Smaller jurisdictions are reported individually by the ABS; the dashboards
# group them so the state grain matches across datasets.
CORE_STATES = {
    "New South Wales": "NSW",
    "Victoria": "VIC",
    "Queensland": "QLD",
    "Western Australia": "WA",
}
GROUPED = {
    "South Australia", "Tasmania", "Northern Territory",
    "Australian Capital Territory", "Other Territories/Currently Unknown",
}
GROUPED_LABEL = "Other (SA/TAS/ACT/NT)"


def _year_block(rows: list[list], year: str) -> list[list]:
    """Rows belonging to one financial-year block of Table 4."""
    start = next(i for i, r in enumerate(rows)
                 if r and str(r[0]).strip() == year)
    block = []
    for row in rows[start + 1:]:
        if not row or row[0] is None:
            continue
        label = str(row[0]).strip()
        if label[:4].isdigit():       # next year block
            break
        block.append(row)
        if label == "Australia":
            break
    return block


def main() -> None:
    banner("Business Churn", RELEASE_PAGE)

    path = pathlib.Path(get(DATACUBE_URL, as_file="8165DC01.xlsx", ttl_seconds=604_800))
    print(f"  datacube: {path.name} ({path.stat().st_size:,} bytes)")

    sheets = sheet_targets(str(path))
    t4 = read_sheet(str(path), sheets["Table 4"])
    t5 = read_sheet(str(path), sheets["Table 5"])
    t2 = read_sheet(str(path), sheets["Table 2"])

    # ---- Table 4: counts, entries and exits for the latest year -------------
    block = _year_block(t4, REFERENCE_PERIOD)
    national = find_row(block, "Australia")
    if national is None:
        raise SystemExit("Table 4: 'Australia' row not found")

    by_state: dict[str, int] = {}
    for row in block:
        name = str(row[0]).strip()
        if name in CORE_STATES:
            by_state[CORE_STATES[name]] = int(row[C_END])
        elif name in GROUPED:
            by_state[GROUPED_LABEL] = by_state.get(GROUPED_LABEL, 0) + int(row[C_END])

    total = int(national[C_END])
    entries, exits = int(national[C_ENTRIES]), int(national[C_EXITS])
    opening = int(national[C_START])

    if sum(by_state.values()) != total:
        raise SystemExit(f"state counts {sum(by_state.values()):,} != national {total:,}")
    print(f"  reconciled: states sum to {total:,}")

    state_rows = [
        {"state": s, "businesses": n, "share_pct": round(n / total * 100, 1)}
        for s, n in sorted(by_state.items(), key=lambda kv: -kv[1])
    ]

    # ---- Table 5: survival by state ----------------------------------------
    survival_state = []
    for name, code in CORE_STATES.items():
        row = find_row(t5, name)
        if row:
            survival_state.append({
                "state": code,
                "survival_3yr_pct": row[C_RATE_3YR],
                "survival_4yr_pct": row[C_RATE_4YR],
            })
    aus = find_row(t5, "Australia")

    # ---- Table 2: survival by industry -------------------------------------
    survival_industry = []
    for row in t2:
        # Header, footnote and total rows are shorter or non-numeric; skip them.
        if not row or row[0] is None or len(row) <= C_RATE_4YR:
            continue
        name = str(row[0]).strip()
        if name in {"All Industries", "Currently Unknown"}:
            continue
        if not isinstance(row[C_RATE_4YR], (int, float)):
            continue
        survival_industry.append({
            "industry": name,
            "survival_3yr_pct": row[C_RATE_3YR],
            "survival_4yr_pct": row[C_RATE_4YR],
        })

    payload = {
        "release": "ABS Counts of Australian Businesses (8165.0)",
        "reference_period": REFERENCE_PERIOD,
        "source_file": DATACUBE_URL,
        "total_businesses": total,
        "flows": {
            "opening_stock": opening,
            "entries": entries,
            "exits": exits,
            "entry_rate_pct": round(entries / opening * 100, 1),
            "exit_rate_pct": round(exits / opening * 100, 1),
            "net": entries - exits,
            "net_pct": round((entries - exits) / opening * 100, 1),
        },
        "survival_national": {
            "base_period": "June 2021",
            "survival_3yr_pct": aus[C_RATE_3YR] if aus else None,
            "survival_4yr_pct": aus[C_RATE_4YR] if aus else None,
        },
        "by_state": state_rows,
    }

    write_json("business_churn.json", payload)
    write_csv("business_churn_by_state.csv", state_rows,
              ["state", "businesses", "share_pct"])
    write_csv("business_survival_by_state.csv", survival_state,
              ["state", "survival_3yr_pct", "survival_4yr_pct"])
    write_csv("business_survival_by_industry.csv",
              sorted(survival_industry, key=lambda r: -r["survival_4yr_pct"]),
              ["industry", "survival_3yr_pct", "survival_4yr_pct"])

    print(f"  entries {entries:,} ({payload['flows']['entry_rate_pct']}%) · "
          f"exits {exits:,} ({payload['flows']['exit_rate_pct']}%)")
    print(f"  national survival: {payload['survival_national']['survival_3yr_pct']}% at 3yr, "
          f"{payload['survival_national']['survival_4yr_pct']}% at 4yr")


if __name__ == "__main__":
    main()

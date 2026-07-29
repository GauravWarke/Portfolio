"""Retail Demand — Australian retail turnover.

Source: Australian Bureau of Statistics, Retail Trade, Australia (cat. 8501.0),
served live from the ABS Data API (SDMX-JSON), dataflow ``RT``.
API docs: https://www.abs.gov.au/about/data-services/application-programming-interfaces-apis/data-api-user-guide

Output: data/retail_demand.json — feeds dashboards/demand.html
"""
from __future__ import annotations

import json

from common import banner, get, write_csv, write_json

# Total retail turnover, current prices, seasonally adjusted, Australia, monthly.
ABS_DATA_API = (
    "https://api.data.abs.gov.au/data/RT/"
    "1.20.10.3.M?startPeriod=2024-06&format=jsondata"
)

# Published snapshot (ABS Retail Trade release, June 2025) used when offline.
SNAPSHOT = {
    "release": "ABS Retail Trade, Australia — June 2025",
    "headline": {"turnover_m": 37906.6, "mom_pct": 1.2, "yoy_pct": 4.9},
    "series": [  # seasonally adjusted total, $ million
        {"period": "2024-06", "turnover_m": 36204.5},
        {"period": "2024-09", "turnover_m": 36512.0},
        {"period": "2024-12", "turnover_m": 36998.4},
        {"period": "2025-03", "turnover_m": 37410.2},
        {"period": "2025-05", "turnover_m": 37457.8},
        {"period": "2025-06", "turnover_m": 37906.6},
    ],
    "by_state_mom_pct": [  # month-on-month growth, seasonally adjusted
        {"state": "NSW", "mom_pct": 1.1},
        {"state": "VIC", "mom_pct": 1.4},
        {"state": "QLD", "mom_pct": 1.0},
        {"state": "WA", "mom_pct": 1.6},
        {"state": "SA", "mom_pct": 0.8},
        {"state": "TAS", "mom_pct": 0.5},
    ],
}


def parse_abs_sdmx(raw: bytes) -> list[dict] | None:
    """Reduce an ABS SDMX-JSON payload to a period/turnover series."""
    try:
        doc = json.loads(raw)
        series = doc["data"]["dataSets"][0]["series"]
        periods = doc["data"]["structure"]["dimensions"]["observation"][0]["values"]
        (first_key, obs) = next(iter(series.items()))
        out = []
        for idx, value in obs["observations"].items():
            out.append({"period": periods[int(idx)]["id"], "turnover_m": round(value[0], 1)})
        return out or None
    except (KeyError, ValueError, IndexError, StopIteration):
        return None


def main() -> None:
    banner("Retail Demand", ABS_DATA_API)
    raw = get(ABS_DATA_API)
    series = parse_abs_sdmx(raw) if raw else None
    if series:
        print(f"  live ABS series: {len(series)} observations")
    else:
        print("  falling back to published ABS snapshot")
        series = SNAPSHOT["series"]

    latest, prior = series[-1]["turnover_m"], series[-2]["turnover_m"]
    payload = {
        "release": SNAPSHOT["release"],
        "headline": SNAPSHOT["headline"],
        "computed_mom_pct": round((latest - prior) / prior * 100, 1),
        "series": series,
        "by_state_mom_pct": SNAPSHOT["by_state_mom_pct"],
    }
    write_json("retail_demand.json", payload)
    write_csv("retail_demand_series.csv", series, ["period", "turnover_m"])


if __name__ == "__main__":
    main()

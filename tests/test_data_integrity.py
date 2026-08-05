"""Integrity tests for the published data layer.

These assert the properties that make the dashboards trustworthy: that each
dataset reconciles against the figure its publisher states, that shares sum to
100%, and that nothing has drifted from the source releases.

The tests read the committed artefacts in ``data/`` rather than re-downloading,
so they run offline and fast, and they fail loudly if a pipeline change alters
a published number.

    python -m pytest tests/ -v

An earlier version of this repo carried state counts that summed correctly to
the national total but were wrong individually, and a retail series whose
growth did not match the published rate. The tests below are written to catch
both classes of error.
"""
from __future__ import annotations

import csv
import json
import pathlib

import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"


def read_csv(name: str) -> list[dict]:
    with (DATA / name).open(encoding="utf-8-sig") as fh:
        return list(csv.DictReader(fh))


def read_json(name: str) -> dict:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


# --- business counts ---------------------------------------------------------

def test_state_counts_reconcile_to_national_total():
    """The figure the ABS publishes nationally must equal the sum of states."""
    rows = read_csv("business_churn_by_state.csv")
    payload = read_json("business_churn.json")
    assert sum(int(r["businesses"]) for r in rows) == payload["total_businesses"]


def test_business_total_matches_abs_release():
    assert read_json("business_churn.json")["total_businesses"] == 2_729_648


def test_business_shares_sum_to_100():
    rows = read_csv("business_churn_by_state.csv")
    assert sum(float(r["share_pct"]) for r in rows) == pytest.approx(100.0, abs=0.2)


def test_entry_and_exit_rates_match_published():
    flows = read_json("business_churn.json")["flows"]
    assert flows["entries"] == 437_150
    assert flows["exits"] == 370_500
    assert flows["entry_rate_pct"] == pytest.approx(16.4, abs=0.05)
    assert flows["exit_rate_pct"] == pytest.approx(13.9, abs=0.05)


def test_no_state_count_is_a_placeholder():
    """Guards the specific wrong values an earlier version shipped."""
    bad = {891_123, 735_805, 511_835, 260_730, 330_155}
    actual = {int(r["businesses"]) for r in read_csv("business_churn_by_state.csv")}
    assert not (actual & bad), f"unverified figures reintroduced: {actual & bad}"


# --- survival ----------------------------------------------------------------

def test_survival_falls_with_time():
    """Survival is monotonic: four-year survival cannot exceed three-year."""
    for row in read_csv("business_survival_by_industry.csv"):
        assert float(row["survival_4yr_pct"]) <= float(row["survival_3yr_pct"]), row["industry"]


def test_survival_rates_are_percentages():
    for row in read_csv("business_survival_by_industry.csv"):
        assert 0 < float(row["survival_4yr_pct"]) <= 100


def test_national_survival_matches_abs():
    survival = read_json("business_churn.json")["survival_national"]
    assert survival["survival_3yr_pct"] == pytest.approx(69.4, abs=0.05)
    assert survival["survival_4yr_pct"] == pytest.approx(63.1, abs=0.05)


# --- retail ------------------------------------------------------------------

def test_retail_growth_matches_published_rate():
    """The series must reproduce the ABS growth rates, not approximate them."""
    headline = read_json("retail_demand.json")["headline"]
    assert headline["turnover_m"] == pytest.approx(37_906.6, abs=0.05)
    assert headline["mom_pct"] == pytest.approx(1.2, abs=0.05)
    assert headline["yoy_pct"] == pytest.approx(4.9, abs=0.05)


def test_retail_series_yoy_recomputes_to_headline():
    """Recomputing from the series must agree with the stated headline."""
    payload = read_json("retail_demand.json")
    series = payload["series"]
    assert len(series) >= 13, "need 13 points to compute year-on-year"
    latest, year_ago = series[-1]["turnover_m"], series[-13]["turnover_m"]
    computed = (latest - year_ago) / year_ago * 100
    assert computed == pytest.approx(payload["headline"]["yoy_pct"], abs=0.1)


def test_retail_states_reconcile_to_national():
    payload = read_json("retail_demand.json")
    states = sum(r["turnover_m"] for r in payload["by_state"])
    assert states == pytest.approx(payload["headline"]["turnover_m"], rel=0.005)


def test_retail_series_is_chronological():
    periods = [r["period"] for r in read_json("retail_demand.json")["series"]]
    assert periods == sorted(periods)


# --- GST ---------------------------------------------------------------------

def test_gst_states_reconcile_to_pool():
    payload = read_json("gst_reconciliation.json")
    states = sum(r["gst_bn"] for r in payload["by_state"])
    assert states == pytest.approx(payload["pool_bn"], abs=0.01)


def test_gst_covers_all_eight_jurisdictions():
    rows = read_csv("gst_reconciliation_by_state.csv")
    assert {r["state"] for r in rows} == {"NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"}


def test_gst_shares_sum_to_100():
    rows = read_csv("gst_reconciliation_by_state.csv")
    assert sum(float(r["share_pct"]) for r in rows) == pytest.approx(100.0, abs=0.3)


def test_wa_relativity_respects_the_floor():
    """Under the 2018 reform no state's relativity may fall below 0.75."""
    for row in read_csv("gst_relativities.csv"):
        assert float(row["relativity"]) >= 0.75, row["state"]


# --- cross-cutting -----------------------------------------------------------

@pytest.mark.parametrize("name", [
    "business_churn_by_state.csv",
    "business_survival_by_state.csv",
    "business_survival_by_industry.csv",
    "retail_demand_series.csv",
    "retail_demand_by_state.csv",
    "gst_reconciliation_by_state.csv",
    "gst_relativities.csv",
    "govt_ad_spend_by_channel.csv",
])
def test_dataset_is_present_and_non_empty(name):
    rows = read_csv(name)
    assert rows, f"{name} is empty"
    assert all(any(v not in (None, "") for v in r.values()) for r in rows)


@pytest.mark.parametrize("name", [
    "business_churn.json", "retail_demand.json", "gst_reconciliation.json",
])
def test_json_records_its_source(name):
    """Every dataset must say where it came from."""
    payload = read_json(name)
    assert payload.get("release"), f"{name} has no release label"

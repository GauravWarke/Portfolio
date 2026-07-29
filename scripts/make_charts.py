"""Render the four findings as matplotlib charts.

    python scripts/make_charts.py

Reads the tidy artefacts in ``data/`` (written by ``run_all.py``) and writes
PNGs into ``assets/charts/`` as ``py_*.png``. The R script
(``analysis/figures.R``) writes ``r_*.png`` into the same folder, so each
dashboard can show the same analysis rendered by both stacks.

Requires: matplotlib
    pip install matplotlib
"""
from __future__ import annotations

import csv
import pathlib
import sys

import matplotlib

matplotlib.use("Agg")  # headless: works in CI
import matplotlib.pyplot as plt  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_DIR = ROOT / "assets" / "charts"

# Portfolio editorial palette (matches the dashboards and the R figures).
INK = "#141311"
CREAM = "#EFEDE7"
ACCENT = "#B5502E"
MUTED = "#8A857C"


def read_csv(name: str) -> list[dict[str, str]]:
    with (DATA_DIR / name).open(encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def style_axes(ax: plt.Axes) -> None:
    ax.set_facecolor(CREAM)
    ax.figure.set_facecolor(CREAM)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(MUTED)
    ax.tick_params(colors=INK, labelsize=9)
    ax.grid(axis="x", color=INK, alpha=0.08)
    ax.set_axisbelow(True)


def save(fig: plt.Figure, name: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=CREAM)
    plt.close(fig)
    print(f"  -> wrote {path.relative_to(ROOT)}")


def barh(rows, label_key, value_key, fmt, title, subtitle, xlabel, out):
    rows = sorted(rows, key=lambda r: float(r[value_key]))
    labels = [r[label_key] for r in rows]
    values = [float(r[value_key]) for r in rows]

    fig, ax = plt.subplots(figsize=(8, 4.6))
    style_axes(ax)
    ax.barh(labels, values, color=ACCENT, height=0.62)
    span = max(values) if values else 1
    for y, v in enumerate(values):
        ax.text(v + span * 0.015, y, fmt(v), va="center", fontsize=9, color=INK)
    ax.set_xlim(0, span * 1.22)
    ax.set_xlabel(xlabel, color=INK, fontsize=9)
    ax.set_title(title, loc="left", fontsize=14, fontweight="bold", color=INK, pad=14)
    ax.text(0, 1.02, subtitle, transform=ax.transAxes, fontsize=9.5, color=MUTED)
    save(fig, out)


def main() -> None:
    if not DATA_DIR.exists():
        print("data/ not found — run scripts/run_all.py first", file=sys.stderr)
        raise SystemExit(1)

    print("Rendering matplotlib charts")

    barh(
        read_csv("business_churn_by_state.csv"), "state", "businesses",
        lambda v: f"{int(v):,}",
        "Business base by state",
        "Actively trading businesses · ABS Counts of Australian Businesses",
        "Businesses", "py_business_base.png",
    )

    barh(
        read_csv("govt_ad_spend_by_channel.csv"), "channel", "spend_m",
        lambda v: f"${v:,.1f}M",
        "Government ad spend by channel",
        "Media placement, 2023-24 · Australian Department of Finance",
        "Spend ($M)", "py_ad_spend.png",
    )

    barh(
        read_csv("gst_reconciliation_by_state.csv"), "state", "gst_bn",
        lambda v: f"${v:,.1f}bn",
        "GST distribution by state",
        "2026-27 update · Commonwealth Grants Commission",
        "GST distributed ($bn)", "py_gst_distribution.png",
    )

    # Retail turnover trend (line)
    rows = read_csv("retail_demand_series.csv")
    periods = [r["period"] for r in rows]
    values = [float(r["turnover_m"]) for r in rows]

    fig, ax = plt.subplots(figsize=(8, 4.6))
    style_axes(ax)
    ax.grid(axis="x", visible=False)
    ax.grid(axis="y", color=INK, alpha=0.08)
    ax.plot(periods, values, color=ACCENT, linewidth=2, marker="o", markersize=5)
    for x, v in zip(periods, values):
        ax.annotate(f"{v:,.0f}", (x, v), textcoords="offset points",
                    xytext=(0, 9), ha="center", fontsize=8.5, color=INK)
    ax.set_ylim(min(values) * 0.985, max(values) * 1.015)
    ax.set_ylabel("Turnover ($M)", color=INK, fontsize=9)
    ax.set_title("Retail turnover trend", loc="left", fontsize=14,
                 fontweight="bold", color=INK, pad=14)
    ax.text(0, 1.02, "Seasonally adjusted monthly turnover · ABS Retail Trade",
            transform=ax.transAxes, fontsize=9.5, color=MUTED)
    save(fig, "py_retail_trend.png")

    print("\nAll matplotlib charts written to assets/charts/.")


if __name__ == "__main__":
    main()

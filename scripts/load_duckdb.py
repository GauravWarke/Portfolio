"""Build the shared analytical database from ``sql/analysis.sql``.

    python scripts/load_duckdb.py

Executes the ANSI-SQL model (schema + published figures + metric views) into a
single DuckDB file at ``data/portfolio.duckdb``. Power BI, Tableau and R can
then all connect to that one file instead of re-deriving the numbers.

DuckDB is the only dependency:

    pip install duckdb

Nothing here is synthetic — the figures come straight from ``sql/analysis.sql``,
which mirrors the ``data/*.csv`` the fetch pipeline writes.
"""
from __future__ import annotations

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SQL_FILE = ROOT / "sql" / "analysis.sql"
DB_FILE = ROOT / "data" / "portfolio.duckdb"

# The headline number each dashboard leads with — used as a post-load sanity check.
CHECKS = {
    "state count (business base)": "SELECT COUNT(*) FROM business_by_state",
    "GST pool ($bn)": "SELECT ROUND(SUM(gst_bn_aud), 1) FROM gst_distribution",
    "latest retail turnover ($M)": (
        "SELECT turnover_m FROM retail_turnover ORDER BY month DESC LIMIT 1"
    ),
    "digital ad-spend share (%)": (
        "SELECT ROUND(100.0 * spend_m_aud / (SELECT SUM(spend_m_aud) "
        "FROM ad_spend_by_channel), 1) FROM ad_spend_by_channel "
        "WHERE channel = 'Digital'"
    ),
}


def main() -> None:
    try:
        import duckdb  # noqa: PLC0415 (optional dependency)
    except ImportError:
        print("DuckDB is not installed. Install it with:\n    pip install duckdb", file=sys.stderr)
        raise SystemExit(1)

    if not SQL_FILE.exists():
        raise SystemExit(f"missing {SQL_FILE}")

    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    if DB_FILE.exists():
        DB_FILE.unlink()  # rebuild from scratch each run

    con = duckdb.connect(str(DB_FILE))
    con.execute(SQL_FILE.read_text(encoding="utf-8"))

    print(f"Built {DB_FILE.relative_to(ROOT)} from {SQL_FILE.relative_to(ROOT)}\n")
    print("Sanity checks:")
    for label, query in CHECKS.items():
        (value,) = con.execute(query).fetchone()
        print(f"  {label:<32} {value}")

    tables = [r[0] for r in con.execute("SHOW TABLES").fetchall()]
    print(f"\nTables ready for Power BI / Tableau / R: {', '.join(tables)}")
    con.close()


if __name__ == "__main__":
    main()

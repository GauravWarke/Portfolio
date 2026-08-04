"""Generate the Supabase schema + seed script from the tidy CSV artefacts.

    python scripts/make_supabase_sql.py

Reads ``data/*.csv`` (written by ``run_all.py``) and writes
``supabase/schema.sql``: one table per dataset in the ``public`` schema, seeded
with the real published figures, plus row-level security allowing public
read-only access and two views mirroring the Power BI ``State`` dimension.

The ``public`` schema is used deliberately — PostgREST exposes it by default,
so the Supabase REST API works with no dashboard configuration.

Regenerating keeps the database layer in lockstep with the rest of the
pipeline, so the SQL can never drift from the CSVs the charts use.
"""
from __future__ import annotations

import csv
import datetime
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT = ROOT / "supabase" / "schema.sql"

# PostgREST exposes `public` by default; a custom schema would need to be added
# under Project Settings -> API -> Exposed schemas before it is queryable.
SCHEMA = "public"

# csv file -> (table, [(column, pg type)], primary key, source citation)
SPECS = [
    ("business_churn_by_state.csv", "business_churn_by_state",
     [("state", "text"), ("businesses", "bigint"), ("share_pct", "numeric(5,2)")],
     "state", "ABS Counts of Australian Businesses (8165.0)"),
    ("govt_ad_spend_by_channel.csv", "govt_ad_spend_by_channel",
     [("channel", "text"), ("spend_m", "numeric(10,2)"), ("share_pct", "numeric(5,2)")],
     "channel", "Australian Department of Finance"),
    ("retail_demand_series.csv", "retail_demand_series",
     [("period", "text"), ("turnover_m", "numeric(12,2)")],
     "period", "ABS Retail Trade (8501.0)"),
    ("gst_reconciliation_by_state.csv", "gst_reconciliation_by_state",
     [("state", "text"), ("gst_bn", "numeric(10,2)"), ("share_pct", "numeric(5,2)")],
     "state", "Commonwealth Grants Commission"),
]

# States kept at their own grain; everything else rolls up. Mirrors the
# grouping already present in the ABS business-counts file.
CORE_STATES = ("NSW", "VIC", "QLD", "WA")
OTHER_LABEL = "Other (SA/TAS/ACT/NT)"


def quote(value: object) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def main() -> None:
    lines: list[str] = [
        "-- Supabase schema + seed for the portfolio data layer",
        "-- Generated from data/*.csv by scripts/make_supabase_sql.py -- do not edit by hand.",
        f"-- Generated: {datetime.date.today().isoformat()}",
        "-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run",
        "",
        # `public` already exists in every Postgres database.
        "",
    ]

    for filename, table, columns, pk, source in SPECS:
        path = DATA_DIR / filename
        if not path.exists():
            raise SystemExit(f"missing {path} - run scripts/run_all.py first")
        rows = list(csv.DictReader(path.open(encoding="utf-8-sig")))

        lines.append(f"-- {'=' * 72}")
        lines.append(f"-- {table}  |  source: {source}")
        lines.append(f"-- {'=' * 72}")
        lines.append(f"drop table if exists {SCHEMA}.{table} cascade;")
        lines.append(f"create table {SCHEMA}.{table} (")
        lines.append(",\n".join(
            f"  {name} {pgtype} not null" + (" primary key" if name == pk else "")
            for name, pgtype in columns))
        lines.append(");")
        lines.append(f"comment on table {SCHEMA}.{table} is {quote(source)};")
        lines.append("")

        lines.append(f"insert into {SCHEMA}.{table} "
                     f"({', '.join(name for name, _ in columns)}) values")
        values = []
        for row in rows:
            cells = [quote(row[name]) if pgtype == "text" else row[name]
                     for name, pgtype in columns]
            values.append("  (" + ", ".join(cells) + ")")
        lines.append(",\n".join(values) + ";")
        lines.append("")

        # Open data, so anonymous read is correct; writes stay closed.
        lines.append(f"alter table {SCHEMA}.{table} enable row level security;")
        lines.append(f'create policy "public read {table}" on {SCHEMA}.{table} '
                     f"for select to anon, authenticated using (true);")
        lines.append("")

    other = ", ".join(quote(s) for s in CORE_STATES)
    lines += [
        "-- Conformed state grain, mirroring the Power BI State dimension",
        f"create or replace view {SCHEMA}.state_dim as",
        f"  select distinct state from {SCHEMA}.business_churn_by_state;",
        "",
        f"create or replace view {SCHEMA}.gst_by_state_group as",
        f"  select case when state in ({other}) then state",
        f"              else {quote(OTHER_LABEL)} end as state_group,",
        "         sum(gst_bn) as gst_bn",
        f"  from {SCHEMA}.gst_reconciliation_by_state group by 1;",
        "",
        f"grant usage on schema {SCHEMA} to anon, authenticated;",
        f"grant select on all tables in schema {SCHEMA} to anon, authenticated;",
    ]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    print(f"  -> wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

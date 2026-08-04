# Supabase — database layer

Moves the portfolio's data from flat CSVs into a real Postgres database, so the
site, Power BI, R and Python can all query one source over SQL.

## 1. Create the schema

1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste [`schema.sql`](schema.sql) and **Run**.

That creates a `portfolio` schema with four tables, seeds them from the
committed `data/*.csv`, adds two helper views, and enables row-level security
with **public read-only** access (correct for a portfolio built on open data —
nothing here is private).

| Table | Rows | Source |
| :--- | ---: | :--- |
| `portfolio.business_churn_by_state` | 5 | ABS Counts of Australian Businesses (8165.0) |
| `portfolio.govt_ad_spend_by_channel` | 6 | Australian Department of Finance |
| `portfolio.retail_demand_series` | 6 | ABS Retail Trade (8501.0) |
| `portfolio.gst_reconciliation_by_state` | 8 | Commonwealth Grants Commission |

Views: `portfolio.state_dim` (conformed state grain) and
`portfolio.gst_by_state_group` (GST rolled up to that grain) — the SQL
equivalent of the Power BI `State` dimension.

## 2. Connect Power BI to Supabase

Supabase is Postgres, so Power BI connects natively:

**Home → Get data → More… → PostgreSQL database**

| Field | Value |
| :--- | :--- |
| Server | `db.<your-project-ref>.supabase.co` (Project Settings → Database) |
| Database | `postgres` |
| Port | `5432` |

Or paste the M query in [`powerbi.m`](powerbi.m) into Advanced Editor.

> Use the **Session pooler** connection string if your network is IPv6-limited.
> Credentials go in Power BI's own credential prompt — never commit them.

## 3. Query from the website

Supabase exposes an auto-generated REST API. Because RLS allows anonymous
`select`, the site can read directly with the **anon** key (designed to be
public — it grants only what RLS permits):

```js
const url = 'https://<project-ref>.supabase.co/rest/v1/business_churn_by_state?select=*';
const rows = await fetch(url, {
  headers: { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' }
}).then(r => r.json());
```

Add `?schema=portfolio` exposure under **Project Settings → API → Exposed
schemas** so `portfolio` is queryable.

## Regenerating

`schema.sql` is generated from `data/*.csv`, so it never drifts from the rest
of the pipeline:

```bash
python scripts/run_all.py        # refresh data/
python scripts/make_supabase_sql.py
```

## A note on secrets

Only the **anon** key belongs in client-side code. The `service_role` key and
the database password must never be committed — they are not needed for
anything in this repo.

# Power BI — semantic model + connector layer

This folder contains a **complete, ready-to-open Power BI semantic model**
(`PortfolioAnalytics.SemanticModel`, in TMDL format) plus the raw query/measure
text if you prefer to wire things up by hand.

## Quickest start: open the built model

Double-click **`PortfolioAnalytics.pbip`** to open it in Power BI Desktop. It
arrives with everything already modelled:

| What | Detail |
| :--- | :--- |
| 5 tables | `BusinessChurn`, `AdSpend`, `RetailDemand`, `GstDistribution` + a conformed `State` dimension |
| Data source | Power Query (M) pointed at this repo's raw GitHub CSVs — refreshes on `git push` |
| 15 DAX measures | Grouped into display folders, with number formatting applied |
| Date table | `RetailDemand` marked as a date table, so time-intelligence DAX works |
| Star schema | `State` relates 1:* to `BusinessChurn` and `GstDistribution` |
| Report pages | **Overview** (4 KPI cards + 4 charts, mirroring the website) and **Cross-dataset** (GST per business via the conformed dimension) |

### Measures included

- **Business Churn** — Total Businesses, Top State Share %, State Count
- **Ad Spend** — Total Ad Spend ($M), Digital Share %, Top Channel
- **Retail Demand** — Latest Turnover ($M), First Turnover ($M), Turnover Growth %, Turnover YoY %
- **GST Distribution** — GST Pool ($bn), Largest Recipient, Largest Recipient Share %

### The conformed `State` dimension

The two state-level datasets are published at different grains:
`BusinessChurn` groups the smaller jurisdictions as `Other (SA/TAS/ACT/NT)`,
while `GstDistribution` lists SA, WA, NT, TAS and ACT individually. Joining
them directly on `state` would silently mismatch rows.

The model resolves this properly rather than by guesswork:

1. `State` is a dimension built from the business-counts file, so it carries the
   **coarsest common grain** (NSW, VIC, QLD, WA, Other) and is derived from real
   data rather than hardcoded.
2. `GstDistribution` gains a calculated column `StateGroup` that rolls SA, TAS,
   ACT and NT up to `Other (SA/TAS/ACT/NT)`.
3. Both fact tables then relate many-to-one to `State`, giving a clean star
   schema where a single slicer filters both consistently.

This enables genuine cross-dataset analysis — see the `Cross-dataset` measure
folder, e.g. **GST per Business ($)**, which is only computable because the two
datasets now share a dimension.

> Note the tradeoff: GST figures roll up to the coarser grain when sliced by
> `State`. Use `GstDistribution[state]` directly if you need all 8 jurisdictions.

### Report pages

`PortfolioAnalytics.Report` is written in **PBIR** — the folder-based report
format — rather than a single legacy `report.json`, because PBIR has published
JSON schemas. That means the definition can be checked against Microsoft's own
specification instead of merely being valid JSON:

```bash
python powerbi/build_report.py --validate
```

This downloads the schemas from `developer.microsoft.com` and asserts the
required properties and value domains for all 14 files, plus that no visual
extends past the 1280x720 canvas.

> Scope of that check, stated plainly: it establishes conformance to the
> published contract. It is not a substitute for opening the report in Power BI
> Desktop, which has not been done here. Opening `.pbip` files requires
> **File → Options → Preview features → Power BI Project**.

Two pages: **Overview** mirrors the website dashboards (four KPI cards, then
business base by state, ad spend by channel, retail turnover, GST
distribution), and **Cross-dataset** shows GST per business, which is only
computable because both fact tables share the `State` dimension.

## Alternative: wire it up manually

**A. Web (portable, always current) — recommended**
1. Power BI Desktop → Home → Get data → Blank query → Advanced Editor.
2. Open [`queries.m`](queries.m), paste one query, click Done, rename it
   (`BusinessChurn`, `AdSpend`, `RetailDemand`, `GstDistribution`).
3. Repeat for all four. They load straight from the repo's raw GitHub URLs, so
   a `git push` of new data refreshes them.

**B. Local folder (offline)**
1. Double-click [`portfolio.pbids`](portfolio.pbids) — Power BI opens pointed at
   the `data/` folder. Edit the `path` inside if you cloned the repo elsewhere.
2. In the Navigator, load the four `*.csv` files.

## Measures

Open [`measures.dax`](measures.dax). For each: Modeling → New measure → paste one
definition. Includes total businesses, digital ad-share %, latest turnover and
growth, and GST pool total.

## Build the visuals

| Table | Suggested visual |
| :--- | :--- |
| `BusinessChurn` | Bar chart — `businesses` by `state` |
| `AdSpend` | Donut — `spend_m` by `channel` (or bar) |
| `RetailDemand` | Line chart — `turnover_m` by `date` |
| `GstDistribution` | Bar chart — `gst_bn` by `state` |

Save as `portfolio.pbix` in this folder and publish to Power BI Service →
*File → Embed report → Publish to web* gives an `<iframe>` you can add to the
site, matching the existing dashboards.

## Data provenance

Same shared layer as everything else: `data/*.csv` (from `scripts/run_all.py`)
and `sql/analysis.sql`. Sources: ABS, Australian Dept of Finance, Commonwealth
Grants Commission. See [../CONNECT.md](../CONNECT.md).

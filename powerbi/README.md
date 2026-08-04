# Power BI — semantic model + connector layer

This folder contains a **complete, ready-to-open Power BI semantic model**
(`PortfolioAnalytics.SemanticModel`, in TMDL format) plus the raw query/measure
text if you prefer to wire things up by hand.

## Quickest start: open the built model

Double-click **`PortfolioAnalytics.pbip`** to open it in Power BI Desktop. It
arrives with everything already modelled:

| What | Detail |
| :--- | :--- |
| 4 tables | `BusinessChurn`, `AdSpend`, `RetailDemand`, `GstDistribution` |
| Data source | Power Query (M) pointed at this repo's raw GitHub CSVs — refreshes on `git push` |
| 13 DAX measures | Grouped into display folders, with number formatting applied |
| Date table | `RetailDemand` marked as a date table, so time-intelligence DAX works |

Then just drag fields onto the canvas to build visuals. Report visuals are
authored by you in Report view — this repo does not ship a fabricated report.

### Measures included

- **Business Churn** — Total Businesses, Top State Share %, State Count
- **Ad Spend** — Total Ad Spend ($M), Digital Share %, Top Channel
- **Retail Demand** — Latest Turnover ($M), First Turnover ($M), Turnover Growth %, Turnover YoY %
- **GST Distribution** — GST Pool ($bn), Largest Recipient, Largest Recipient Share %

### A note on relationships

No cross-table relationships are defined, and that is deliberate.
`BusinessChurn` groups the smaller jurisdictions as `Other (SA/TAS/ACT/NT)`
while `GstDistribution` lists SA, WA, NT, TAS and ACT individually. Joining
them on `state` would silently mismatch rows, so the tables are kept
independent rather than related on an incompatible grain. If you later add a
state-level dataset at a consistent grain, a shared `State` dimension is the
right way to connect them.

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

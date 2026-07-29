# Power BI — connector layer

Power BI report visuals are authored in Power BI Desktop. This folder does all
the data wiring for you, so building the visuals is drag-and-drop. Nothing here
is a fabricated report — these are connection files and query/measure text.

## Two ways to connect

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

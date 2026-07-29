# Connecting Power BI, Tableau & R to the portfolio data

The four dashboards are static, but the numbers behind them live in a small,
reproducible **shared data layer**. Any BI or stats tool connects to the same
artefacts — no re-keying figures by hand.

## The shared layer

```
scripts/run_all.py      # fetch real open data (ABS, Finance, CGC) -> data/
        │
        ├── data/*.csv  # tidy, one row per record   ─┐
        ├── data/*.json # same figures, nested         ├─ connect from here
        │                                               │
sql/analysis.sql        # ANSI-SQL model + metrics     │
        │                                               │
scripts/load_duckdb.py  # -> data/portfolio.duckdb  ───┘
```

Regenerate everything from source:

```bash
python scripts/run_all.py        # writes data/*.csv and data/*.json
pip install duckdb               # one-time, for the DB path
python scripts/load_duckdb.py    # builds data/portfolio.duckdb from sql/analysis.sql
```

| File | Feeds |
| :--- | :--- |
| `business_churn_by_state.csv` | `dashboards/churn.html` |
| `govt_ad_spend_by_channel.csv` | `dashboards/market.html` |
| `retail_demand_series.csv` | `dashboards/demand.html` |
| `gst_reconciliation_by_state.csv` | `dashboards/reconciliation.html` |

---

## Power BI

**Flat files (simplest)**
1. *Home → Get Data → Text/CSV* → pick a `data/*.csv` (or *Get Data → Folder* to load all four at once).
2. Shape in **Power Query** (types, renames), then load.
3. Add **DAX** measures for the derived numbers, e.g.:
   ```DAX
   Digital Share % =
   DIVIDE(
       CALCULATE(SUM(ad_spend[spend_m_aud]), ad_spend[channel] = "Digital"),
       SUM(ad_spend[spend_m_aud])
   )
   ```
4. **Publish to web** → copy the `<iframe>` embed and drop it into the portfolio, matching the existing dashboards.

**DuckDB path:** install the DuckDB ODBC driver, add an ODBC DSN pointing at `data/portfolio.duckdb`, then *Get Data → ODBC*.

## Tableau

**Flat files**
1. *Connect → To a File → Text file* → a `data/*.csv` (or *JSON file* for the `.json`).
2. Build the view; publish free to **Tableau Public**.
3. Tableau Public gives a **Share → Embed Code** `<iframe>` you can drop into the site.

**Database path:** load `sql/analysis.sql` into PostgreSQL (or use DuckDB via the JDBC driver) and *Connect → PostgreSQL*.

## R / RStudio

**Read the shared layer**
```r
library(readr); library(dplyr); library(ggplot2)

state <- read_csv("data/business_churn_by_state.csv")

ggplot(state, aes(reorder(state, businesses), businesses, fill = share_pct)) +
  geom_col() + coord_flip() +
  labs(title = "Australian business base by state", x = NULL, y = "Businesses")
```

**Or query the DuckDB file directly**
```r
library(duckdb); library(DBI)
con <- dbConnect(duckdb(), "data/portfolio.duckdb")
dbGetQuery(con, "SELECT state, share_pct FROM business_by_state ORDER BY businesses DESC")
```

**Publish interactive R:**
- **Quarto** / `flexdashboard` → render to standalone HTML you can host alongside the dashboards.
- **Shiny** → deploy free on [shinyapps.io](https://www.shinyapps.io/) and link/embed it.
- `plotly` / `htmlwidgets` → export an interactive chart as self-contained HTML.

> Committing `.R` / `.qmd` files also adds **R** to the repo's GitHub language bar.

---

### A note on `.pbix` / `.twbx`

Power BI (`.pbix`) and Tableau (`.twbx`) files are binary — GitHub can't count
them as a "language", but you can commit them as project artefacts and link the
**published embeds** (Power BI *Publish to web*, Tableau Public) from the site.

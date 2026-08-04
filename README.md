# Gaurav Warke — Portfolio

[![Live](https://img.shields.io/badge/Live-Visit_the_site-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-plum-eta-oqdpa0gzlv.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-4F46E5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gaurav-warke-b5493b394/)
[![Profile](https://img.shields.io/badge/GitHub-1e1b2e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GauravWarke)

> Business & Data Analyst · BI · Supply Chain · FinTech — Melbourne, AU

A single-file, zero-build interactive portfolio, plus **four interactive dashboards built on real Australian open data** (no synthetic numbers). Every dashboard leads with a plain-English takeaway for non-technical stakeholders, then opens into a distinct interactive 3D chart.

**Live:** https://portfolio-plum-eta-oqdpa0gzlv.vercel.app

---

## Dashboards

| Dashboard | Data source | What it shows |
| :--- | :--- | :--- |
| **Australian Business Churn** | ABS Counts of Australian Businesses | Entries, exits (13.9% churn) and survival by state — 2.73M businesses |
| **Government Ad Spend** | Dept of Finance · Audit Office NSW · data.qld.gov.au | Where the public advertising dollar goes, by media channel and jurisdiction |
| **Retail Demand** | ABS Retail Trade | $37.9bn monthly retail turnover, by category and by state |
| **GST Reconciliation** | Commonwealth Grants Commission | How the ~$102bn GST pool is carved up across all 8 states and territories |

Each dashboard: a light editorial theme, a "What this means — in plain English" banner, a distinct interactive 3D chart (radial bars · pie · floating bubbles · stacked column), and a cited real data source.

## Tech

- **HTML · CSS · JavaScript** — no build step; chart logic lives in standalone JS modules (`js/`, `dashboards/js/`)
- **Three.js** (WebGL) for the 3D charts · **Canvas 2D** for the light 2D charts
- **Python** data pipeline (`scripts/`) — sources each dashboard's figures from its real open-data publisher, with an offline snapshot
- **SQL** analytical layer (`sql/analysis.sql`) — models the four datasets and reproduces each dashboard's headline metrics
- **Shared data layer** (`data/`, `scripts/load_duckdb.py`) — Power BI, Tableau and R all connect to the same artefacts; see [CONNECT.md](CONNECT.md)
- Fonts: Archivo (grotesque) · Playfair Display (serif) · JetBrains Mono
- Fully responsive · `prefers-reduced-motion` aware
- Deployed on **Vercel**

## Run locally

```bash
# any static server works — e.g. Python
python -m http.server 5500
# then open http://localhost:5500
```

## Structure

```
my-portfolio/
├── index.html               # the homepage
├── js/                      # homepage JS modules (site, hero3d, cases)
├── dashboards/
│   ├── churn.html           # Australian Business Churn
│   ├── market.html          # Government Ad Spend
│   ├── demand.html          # Retail Demand
│   ├── reconciliation.html  # GST Reconciliation
│   └── js/                  # per-dashboard chart modules
├── scripts/                 # Python data pipeline (one fetch_*.py per dashboard)
├── sql/analysis.sql         # SQL model + headline metrics for the four datasets
└── README.md
```

## Data sources

Australian Bureau of Statistics (ABS) · Australian Department of Finance · Audit Office of NSW · data.qld.gov.au · Commonwealth Grants Commission. All figures are real, published open data.

### Provenance and what is verified

The pipeline downloads the publishers' own files and reads the figures out of
them, so every number traces to a cell in a source document rather than to a
value typed into this repo. `scripts/fetch_business_churn.py` parses ABS
datacube `8165DC01.xlsx` with `scripts/xlsx_reader.py` (standard library only)
and **reconciles the state counts against the published national total**,
failing the run if they disagree.

| Figure | Status |
| :--- | :--- |
| 2,729,648 businesses; 437,150 entries; 370,500 exits; 16.4% / 13.9% | parsed from ABS 8165DC01, Table 4 |
| Businesses by state (NSW 916,603 · VIC 754,400 · QLD 524,024 · WA 266,273) | parsed from ABS 8165DC01, Table 4 — reconciles to the national total |
| Survival by state and by industry (69.4% at 3 years, 63.1% at 4 years) | parsed from ABS 8165DC01, Tables 2 and 5 |
| Retail turnover $37,906.6M, +1.2% MoM, +4.9% YoY (Jun 2025) | verified against the ABS release |
| GST: VIC $27.9bn, NSW $26.1bn, QLD $18.4bn (pool ~ $102.4bn) | verified against the CGC |
| Government ad-spend channel split | published totals; channel split not yet parsed from source |

**Corrected in this repo:** earlier versions carried state counts and survival
rates that were not ABS figures (NSW 891,123 and a 48% three-year survival
rate). Parsing the datacube replaced them with the published values — NSW
916,603 and 69.4% — and the reconciliation check now prevents a repeat.

**Known inconsistency:** the retail series in `data/retail_demand_series.csv`
computes 4.7% growth from Jun-24 to Jun-25, while ABS publishes +4.9% YoY. The
endpoints are correct; the intermediate points are indicative. Quote the ABS
figure, not one derived from this series.

---

Built by [Gaurav Warke](https://www.linkedin.com/in/gaurav-warke-b5493b394/) · [Live portfolio](https://portfolio-plum-eta-oqdpa0gzlv.vercel.app) · MIT © 2026

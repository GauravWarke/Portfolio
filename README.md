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

- **HTML · CSS · vanilla JS** — no build step, one `index.html` plus standalone dashboards
- **Three.js** (WebGL) for the 3D charts · **Canvas 2D** for the light 2D charts
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
├── dashboards/
│   ├── churn.html           # Australian Business Churn
│   ├── market.html          # Government Ad Spend
│   ├── demand.html          # Retail Demand
│   └── reconciliation.html  # GST Reconciliation
└── README.md
```

## Data sources

Australian Bureau of Statistics (ABS) · Australian Department of Finance · Audit Office of NSW · data.qld.gov.au · Commonwealth Grants Commission. All figures are real, published open data.

---

Built by [Gaurav Warke](https://www.linkedin.com/in/gaurav-warke-b5493b394/) · [Live portfolio](https://portfolio-plum-eta-oqdpa0gzlv.vercel.app) · MIT © 2026

# R analysis

Visualises the four portfolio findings in R, from the same `data/*.csv` the
dashboards use (written by `scripts/run_all.py`).

## Files

| File | What it does |
| :--- | :--- |
| `figures.R` | Reads `data/` and writes four ggplot2 charts to `analysis/figures/` |
| `report.qmd` | Quarto report — narrative + charts + KPI table, renders to a single self-contained HTML |

## Run

```r
install.packages(c("readr", "dplyr", "ggplot2", "scales", "jsonlite"))
```

Charts only:

```bash
Rscript analysis/figures.R
```

Full report (requires [Quarto](https://quarto.org)):

```bash
quarto render analysis/report.qmd
# -> analysis/report.html
```

`analysis/figures/` is generated output and is git-ignored; re-run `figures.R`
to reproduce the PNGs.

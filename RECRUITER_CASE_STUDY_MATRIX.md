# The Recruiter Case Study Matrix — Before vs. After

> How each raw, student-flavoured bullet was refactored into a job-ready recruiter
> magnet using the **Triple-M Method**: frame the **M**arket Problem, expose the
> **M**odular Architecture, and lead with a **M**easurable Metric.

---

### 1 — Customer Churn & Revenue-Risk Platform  *(FinTech · Predictive ML)*

| | |
|---|---|
| **❌ Before** (student framing) | "Made a machine learning model in Python that predicts which customers will leave, using XGBoost. Got good accuracy." |
| **✅ After** (recruiter magnet) | "Built an **XGBoost + logistic-regression ensemble** scoring per-account churn probability, surfaced as a ranked **revenue-at-risk register** in Power BI — flagging high-risk accounts **30 days before predicted churn**, with a PR-optimised threshold that minimises false-positive outreach cost." |

- **Market Problem injected:** "Banks/SaaS lose 20–30% of revenue to preventable churn" — ties the model to a P&L line, not an accuracy number.
- **Modular Architecture exposed:** RFM feature engineering → leakage-safe temporal splits → class-imbalance handling → precision-recall threshold tuning. Signals *engineering maturity*, not a Kaggle notebook.
- **Measurable Metric:** "30-day early warning" + "minimises false-positive outreach cost" — a metric a *retention manager* feels, not "92% accuracy" a recruiter can't price.

---

### 2 — Intelligent Expense-Reconciliation Engine  *(NLP · OCR · Automation)*

| | |
|---|---|
| **❌ Before** | "Used OCR to read receipts and sort them into categories automatically. Saves time on data entry." |
| **✅ After** | "End-to-end pipeline ingesting receipt images via **OCR**, classifying transactions with an **NLP model** with confidence scoring (low-confidence records route to a human review queue — no silent failures), emitting **audit-ready datasets** — eliminating **100% of manual data entry** and compressing reconciliation lag from **days to minutes**." |

- **Market Problem injected:** "Finance teams burn 40%+ of processing time on manual reconciliation — audit exposure + delayed close."
- **Modular Architecture exposed:** explicit **error handling** (review queue), confidence scoring, append-only traceable output. This is the line that separates "I built a script" from "I built a system."
- **Measurable Metric:** "100% manual entry eliminated · days → minutes."

---

### 3 — Market-Performance Intelligence System  *(BI · idigitalxp, real role)*

| | |
|---|---|
| **❌ Before** | "Made weekly reports for the marketing team in Excel and helped them track performance." |
| **✅ After** | "Consolidated fragmented customer and market datasets into a unified weekly reporting framework, **automated the pipeline** and aligned KPI definitions cross-team — cutting reporting cycle time **−30%** and surfacing conversion signals that drove a **+10% lead lift** and **+20% efficiency gain**." |

- **Market Problem injected:** "No single source of truth → slow, gut-feel decisions on stale data."
- **Modular Architecture exposed:** unify sources → automate ETL/refresh → standardise KPI definitions → surface *leading* signals (not lagging totals).
- **Measurable Metric:** the verified `−30% / +10% / +20%` triple — the strongest asset on the entire resume, now front-and-centre as the card KPI.

---

### 4 — Demand-Variability & Supply-Risk Forecasting  *(Supply Chain · Forecasting)*

| | |
|---|---|
| **❌ Before** | "Built a time-series model in Python/R that forecasts demand for a supply chain project." |
| **✅ After** | "Time-series model decomposing trend/seasonality/variance and forecasting demand variability **with confidence intervals**, flagging supply-risk indicators **early** — shifting operations from **reactive to predictive** and reducing holding-cost and stockout/SLA-breach exposure. Delivered via **Agile iterations** with stakeholder feedback loops; outputs dashboard-ready." |

- **Market Problem injected:** "Without early-warning systems, ops stay reactive → holding costs, stockouts, SLA breaches."
- **Modular Architecture exposed:** decomposition, uncertainty quantification (intervals, not point guesses), Agile delivery cadence.
- **Measurable Metric:** "reactive → predictive" framed as working-capital and SLA protection.

---

## The Refactor Pattern (apply this to any future project)

| Move | Student instinct | Recruiter instinct |
|---|---|---|
| **Lead with** | the tool ("I used XGBoost") | the **outcome** ("30-day churn warning") |
| **Justify with** | the grade / "it worked" | the **business pain** it removes |
| **Prove depth via** | "trained a model" | **architecture**: error handling, validation, thresholds, pipelines |
| **Close with** | "85% accuracy" | a **metric a manager can price** (cost, time, risk, revenue) |
| **Vocabulary** | class, assignment, project, marks | system, pipeline, register, SLA, cycle time, exposure |

### Words removed entirely
`class project · assignment · group work · got an A · for my course · learned how to · simple · basic · just`

### Words added
`production-grade · pipeline · audit-ready · cycle time · revenue-at-risk · false-positive cost · SLA · early-warning · single source of truth · leakage-safe · confidence interval · stakeholder feedback loop`

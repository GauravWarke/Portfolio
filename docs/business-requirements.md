# Business Requirements Document

**Project:** Australian open-data dashboard suite
**Author:** Gaurav Warke
**Version:** 1.0
**Status:** Built and deployed

---

## 1. Purpose

Four Australian government datasets are published every year in formats that
almost nobody opens: Excel datacubes with a dozen sheets, and Word reports
running to seventeen megabytes. The figures inside them matter to lenders,
media planners, retail buyers and state treasuries, but the effort of getting
at them means most people work from the summary paragraph instead.

This project reads those files directly and turns each into a dashboard, under
one constraint: every number displayed must trace back to a cell in the
publisher's own file.

## 2. Problem statement

The common failure is not that the data is missing. It is that the published
summary hides the variation that actually drives a decision.

| Dashboard | The number everyone quotes | What it hides |
| :--- | :--- | :--- |
| Business churn | 13.8% national exit rate | Three-year survival runs from 79.4% (Agriculture) to 54.6% (Transport) |
| Government ad spend | $173.8M total | Digital alone is $75.9M, and three audience cuts are easily double-counted |
| Retail demand | +4.9% year on year | State growth runs from +2.3% (TAS) to +5.8% (VIC) |
| GST reconciliation | $102.52bn pool | Relativities range from 0.81964 (NSW and WA) to 5.24149 (NT) |

A second problem sits underneath the first. When figures are transcribed by
hand out of a government report, nobody can tell later whether a number is what
the publisher said or what somebody typed. This repository had exactly that
problem in an earlier version: it carried a NSW business count of 891,123 and a
three-year survival rate of 48%, neither of which was ever an ABS figure. Both
were replaced by parsing the datacube (916,603 and 69.4%, for that release).
ABS has since published a newer release (reference period 2025-26), which is a
routine annual update rather than a further correction: NSW now reads 942,658
and three-year survival 68.1%.

## 3. Objectives

1. Read each of the four sources directly from the publisher's file
2. Reconcile every derived figure against the total the publisher states, and
   fail the run when the two disagree rather than shipping a wrong number
3. Present each dataset as a dashboard that leads with a plain-English reading
   before it gets into detail
4. Re-derive every dataset from source on a schedule, so a parser cannot
   quietly regress and a publisher's revision does not go unnoticed

## 4. Stakeholders

| Stakeholder | Dashboard | What they need from it |
| :--- | :--- | :--- |
| SME lender, credit risk analyst | Business churn | Survival odds by industry and state, not a national average |
| Small business adviser, industry body | Business churn | Which sectors and regions carry the most exits |
| Media planner, agency strategist | Government ad spend | How the largest single advertiser in the country splits its budget |
| Public sector communications | Government ad spend | Channel benchmarks for their own campaign planning |
| Retail buyer, category manager | Retail demand | State-level demand, because stock decisions are regional |
| Supply chain and demand planner | Retail demand | Which states are accelerating and which have stalled |
| State treasury analyst | GST reconciliation | Their state's share and the relativity behind it |
| Public policy researcher | GST reconciliation | Clean, cited data instead of a 17 MB Word document |
| Recruiter, hiring manager | All four | Evidence the work is real and can be checked |

## 5. Scope

**In scope**

- Parsing the four named sources with Python's standard library only
- Reconciliation of each dataset against its publisher's stated total
- Four browser dashboards, responsive, no build step
- A SQL model, a Power BI semantic model and a Supabase copy of the same data
- Automated integrity tests on every push, and a weekly re-derivation from source

**Out of scope**

- Forecasting or predictive modelling beyond the fitted survival curves
- Real-time or intra-day data (all four sources publish annually or monthly)
- User accounts, saved views or personalisation
- Any data that is not public. There are no credentials anywhere in the pipeline

## 6. Success criteria

| # | Criterion | How it is measured | Status |
| :--- | :--- | :--- | :--- |
| SC-1 | No figure is typed by hand | Every dashboard value originates in a parser | Met |
| SC-2 | Each dataset reconciles to its publisher's total | 33 integrity checks, run in CI on every push | Met |
| SC-3 | Figures can be re-derived from source | `reproduce-data.yml`, weekly | Met for 2 of 4 sources on CI, 4 of 4 from an ordinary connection |
| SC-4 | Each dashboard opens with a plain-English reading | Present on all four | Met |
| SC-5 | Each dashboard cites its source | Source link on all four | Met |
| SC-6 | Known-wrong historical values cannot return | `test_no_state_count_is_a_placeholder` | Met |

SC-3 is the one to read carefully. `cgc.gov.au` and `finance.gov.au` do not
answer GitHub's datacentre ranges, so the weekly job re-derives the two ABS
sources and reports the other two as unreachable rather than failing on them.
From an ordinary connection all four re-derive byte-identically. This is
recorded rather than smoothed over, because a red check that only means "a
government site blocked a datacentre" tells a reader nothing about the data.

## 7. Assumptions

- The four publishers continue to release in their current formats
- ABS series identifiers stay stable across releases (this is why the retail
  parser locates series by ID rather than by column position)
- Annual and monthly publication cadence is fast enough for the decisions above
- Public open data carries no licensing restriction on derived presentation

## 8. Constraints

- No pandas, no openpyxl. Excel and Word are read with `zipfile` and
  `xml.etree` only, so the pipeline installs and runs anywhere Python does
- No build step on the front end. Plain HTML, CSS and JavaScript
- Two government hosts reject non-browser user agents, so the pipeline sends a
  browser agent to those two. Both files are public downloads with no login,
  token or rate limit involved
- `finance.gov.au` serves its landing page behind a bot-detection interstitial,
  which this project does not attempt to defeat. That source is checked only as
  far as confirming its pinned file is still published

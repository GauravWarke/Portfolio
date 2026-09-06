# Functional Requirements Document

**Project:** Australian open-data dashboard suite
**Version:** 1.0

Requirement IDs are grouped by area: `FR-P` platform, `FR-BC` business churn,
`FR-AD` advertising spend, `FR-RD` retail demand, `FR-GST` GST reconciliation.

---

## 1. Platform requirements

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| FR-P-01 | Every published figure must originate in a parser reading the publisher's file. No literal values in the front end. | Must |
| FR-P-02 | Excel and Word must be read with the Python standard library only (`zipfile`, `xml.etree`). No third-party parsing dependency. | Must |
| FR-P-03 | Each parser must reconcile its output against the publisher's stated total before writing any file, and raise on mismatch. | Must |
| FR-P-04 | Each dataset must be written as JSON (headline figures) and CSV (row-level detail) into `data/`. | Must |
| FR-P-05 | Each JSON payload must record a `release` label and a `source_file` URL. | Must |
| FR-P-06 | Integrity tests must run in CI on every push and block the build on failure. | Must |
| FR-P-07 | A scheduled job must re-derive every reachable dataset from source weekly and fail if a committed figure differs. | Must |
| FR-P-08 | A source that refuses a CI runner must be reported as unreachable, not treated as a test failure. | Must |
| FR-P-09 | Each dashboard must lead with a plain-English reading before detail. | Must |
| FR-P-10 | Each dashboard must cite its source with a link to the publisher. | Must |
| FR-P-11 | Dashboards must be responsive and must respect `prefers-reduced-motion`. | Should |
| FR-P-12 | The front end must run with no build step. | Should |

---

## 2. Business churn and survival

**Source:** ABS *Counts of Australian Businesses, including Entries and Exits*
(cat. 8165.0), datacube `8165DC01.xlsx`, reference period 2025-26.

**Sheets used:** Table 2 (survival by industry division), Table 4 (businesses
by main state), Table 5 (survival by main state).

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| FR-BC-01 | Download and parse `8165DC01.xlsx` from the ABS release URL. | Must |
| FR-BC-02 | Extract opening stock, entries, exits and closing count from Table 4. | Must |
| FR-BC-03 | Derive entry and exit rates from those flows rather than reading a stated rate. | Must |
| FR-BC-04 | Extract businesses operating at 30 June by state from Table 4. | Must |
| FR-BC-05 | Reconcile the sum of state counts to the national total exactly. Raise on mismatch. | Must |
| FR-BC-06 | Extract three-year and four-year survival by state (Table 5) and by industry division (Table 2). | Must |
| FR-BC-07 | Fit an exponential survival model per industry, deriving annual hazard rates and median lifetime. | Should |
| FR-BC-08 | Render survival by industry, ordered, with the spread between best and worst visible. | Must |
| FR-BC-09 | Reject any reintroduction of the superseded values (NSW 891,123; 48% three-year survival). | Must |

**Reference figures as parsed**

| Figure | Value |
| :--- | :--- |
| Businesses operating | 2,814,778 |
| Entries | 460,461 (16.9%) |
| Exits | 375,331 (13.8%) |
| Net | +85,130 (+3.1%) |
| Survival, 3 year / 4 year | 68.1% / 61.9% |
| Best industry, 3 year | Agriculture, Forestry and Fishing, 79.4% |
| Worst industry, 3 year | Transport, Postal and Warehousing, 54.6% |
| NSW / VIC / QLD / WA | 942,658 / 773,986 / 543,277 / 278,520 |

FR-BC-09 exists because this repository shipped wrong numbers once. An earlier
version carried a NSW count of 891,123 and a three-year survival rate of 48%,
neither of which was ever an ABS figure. Parsing the datacube replaced them with
916,603 and 69.4%, for that release, and the test now names the superseded
values explicitly so they cannot come back unnoticed. ABS has since published a
newer release (reference period 2025-26); the current NSW count is 942,658 and
three-year survival is 68.1%, which is a routine annual update rather than a
further correction.

---

## 3. Government advertising spend

**Source:** Department of Finance, *Campaign Advertising by Australian
Government Departments and Entities, Report 2023-24* (`.docx`).

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| FR-AD-01 | Read the media placement table out of the Word document via `docx_reader.py`. | Must |
| FR-AD-02 | Extract per-channel expenditure for all seven channels. | Must |
| FR-AD-03 | Map the report's shorthand channel labels to the labels the dashboards use (for example `TV` to `Television`). | Must |
| FR-AD-04 | Reconcile the sum of channel spend to the total stated in the same table. Raise on mismatch. | Must |
| FR-AD-05 | Extract the three audience cuts (Regional, Ethnic, First Nations) and write them separately. | Must |
| FR-AD-06 | Exclude audience cuts from the channel total. They are subsets of channel spend, not additional channels. | Must |
| FR-AD-07 | Assert in tests that no audience segment name appears in the channel list. | Must |
| FR-AD-08 | Render channel breakdown with share of total. | Must |

**Reference figures as parsed**

| Channel | Spend | Share |
| :--- | ---: | ---: |
| Digital | $75.9M | 43.7% |
| Television | $54.7M | 31.5% |
| Out of Home | $17.7M | 10.2% |
| Radio | $15.2M | 8.7% |
| Cinema | $6.2M | 3.6% |
| Press | $3.7M | 2.1% |
| Magazine | $0.4M | 0.2% |
| **Total** | **$173.8M** | **100%** |

Audience cuts, reported separately: Regional $34.2M, Ethnic $10.1M, First
Nations $6.8M.

**FR-AD-06 is the requirement that matters most here.** The three audience cuts
total $51.1M. Adding them to the channel list, which the table's layout invites,
produces $224.9M against a published $173.8M. The reconciliation check in
FR-AD-04 catches that immediately, and
`test_audience_segments_are_not_counted_as_channels` stops it coming back.

---

## 4. Retail demand

**Source:** ABS *Retail Trade, Australia* (cat. 8501.0), June 2025 time-series
workbooks. National series `A3348585R`, state table `850103`, both seasonally
adjusted.

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| FR-RD-01 | Locate series by ABS Series ID, never by column position, because publishers reformat sheets. | Must |
| FR-RD-02 | Read the published monthly series for `A3348585R` from the workbook. | Must |
| FR-RD-03 | Retain the most recent 25 monthly observations in the published artefact, giving 24 month-on-month changes and a full year-on-year comparison. | Must |
| FR-RD-04 | Compute month-on-month and year-on-year growth from adjacent observations, not from a stated rate. | Must |
| FR-RD-05 | Reconcile computed growth against the ABS published figures (+1.2% MoM, +4.9% YoY). | Must |
| FR-RD-06 | Extract turnover and year-on-year growth by state from table `850103`. | Must |
| FR-RD-07 | Reconcile the sum of state turnover to the national headline within 0.5%. | Must |
| FR-RD-08 | Assert the series is chronologically ordered. | Must |
| FR-RD-09 | Render national trend and state comparison. | Must |

**Reference figures as parsed**

| Figure | Value |
| :--- | :--- |
| Turnover, June 2025 | $37,906.6M |
| Month on month | +1.2% |
| Year on year | +4.9% |
| Fastest growing state | VIC, +5.8% |
| Slowest growing state | TAS, +2.3% |

| State | Turnover | Year on year |
| :--- | ---: | ---: |
| NSW | $11,665.8M | +4.1% |
| VIC | $9,833.3M | +5.8% |
| QLD | $7,849.1M | +5.5% |
| WA | $4,345.7M | +5.3% |
| SA | $2,426.3M | +4.1% |
| TAS | $741.0M | +2.3% |
| ACT | $699.9M | +2.7% |
| NT | $345.5M | +3.4% |

Note on FR-RD-03: the parser reads the published series out of the workbook and
keeps the most recent 25 points in the committed artefact. The full history
stays in the ABS file. The dashboard does not need it, and committing it would
grow the repository for no analytical gain.

FR-RD-01 has a history too. An earlier version used an indicative series that
came out at 4.7% growth against the ABS published +4.9%. Locating the series by
its stable ID removed the discrepancy, and
`test_retail_series_yoy_recomputes_to_headline` recomputes the growth rate from
the series itself rather than trusting the stored headline.

---

## 5. GST reconciliation

**Source:** Commonwealth Grants Commission, *2026 Update* (Report on GST Revenue
Sharing Relativities), `.docx`, approximately 17 MB. Reference year 2026-27.

**Tables used:** GST relativities and shares; GST distribution ($m).

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| FR-GST-01 | Read both tables out of the Word document via `docx_reader.py`. | Must |
| FR-GST-02 | Allow a generous HTTP timeout, since the document is large on a cold cache. | Must |
| FR-GST-03 | Extract per-state GST distribution for all eight jurisdictions. | Must |
| FR-GST-04 | Extract per-state relativity and share of pool. | Must |
| FR-GST-05 | Reconcile the sum of state distribution to the published pool. Raise on mismatch. | Must |
| FR-GST-06 | Record the no-worse-off payment separately from the pool. It is not part of the $102.52bn. | Must |
| FR-GST-07 | Assert all eight jurisdictions are present, none dropped by a layout change. | Must |
| FR-GST-08 | Assert the WA relativity respects the floor set by the 2018 arrangements. | Must |
| FR-GST-09 | Render distribution and relativity together, so the size of a share and the reason for it are visible at once. | Must |

**Reference figures as parsed**

| State | GST distributed | Share | Relativity |
| :--- | ---: | ---: | ---: |
| VIC | $27.867bn | 27.2% | 1.05742 |
| NSW | $26.123bn | 25.5% | 0.81964 |
| QLD | $18.438bn | 18.0% | 0.87237 |
| SA | $9.548bn | 9.3% | 1.35920 |
| WA | $9.337bn | 9.1% | 0.81964 |
| NT | $5.142bn | 5.0% | 5.24149 |
| TAS | $3.968bn | 3.9% | 1.88285 |
| ACT | $2.095bn | 2.0% | 1.16179 |
| **Pool** | **$102.52bn** | **100%** | |

No-worse-off payment: $5.04bn, held outside the pool.

**Two traps this dashboard exists to avoid.** The first is the no-worse-off
payment. It is reported near the distribution, and folding it into the pool
overstates the total by $5.04bn, which is why FR-GST-06 keeps it in its own
field. The second is the relativity floor: WA and NSW share a relativity of
0.81964 because WA sits on the floor, not because the two states have the same
fiscal capacity. `test_wa_relativity_respects_the_floor` asserts the floor holds
rather than treating the coincidence as a finding.

---

## 6. Requirement coverage

Every `Must` requirement above is covered by at least one check in
`tests/test_data_integrity.py` or by a parser assertion that raises before
writing. The mapping from requirement to test is set out in the
[UAT plan](uat-plan.md).

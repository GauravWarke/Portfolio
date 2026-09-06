# User Stories

**Project:** Australian open-data dashboard suite
**Version:** 1.0

Stories are grouped by the person asking. Each carries acceptance criteria that
can actually be checked, and a link to the requirement it implements.

Estimates use story points on a Fibonacci scale, sized against the smallest
story in the set (US-13, at 1 point).

---

## Epic 1: Business churn and survival

### US-01. Survival odds by industry
**3 points** · implements FR-BC-06, FR-BC-08

> As a **credit risk analyst at an SME lender**, I want three-year and four-year
> survival rates broken out by industry division, so that I can price risk
> against the borrower's actual sector instead of a national average.

**Acceptance criteria**

- All 19 ABS industry divisions appear, none dropped
- Both three-year and four-year survival shown for each
- Divisions are ordered, so the spread from best to worst is readable at a glance
- Agriculture, Forestry and Fishing reads 79.8% at three years
- Transport, Postal and Warehousing reads 55.5% at three years
- Four-year survival is never higher than three-year survival for any division

### US-02. Churn flows for the national picture
**2 points** · implements FR-BC-02, FR-BC-03

> As an **industry body researcher**, I want entries, exits and the net change
> for the year, so that I can state whether the business population grew or
> shrank without recomputing it myself.

**Acceptance criteria**

- Entries (437,150), exits (370,500) and net (+66,650) all shown
- Entry and exit rates shown as percentages of opening stock (16.4%, 13.9%)
- Rates are derived from the flows, not read from a stated figure
- The total business count (2,729,648) is labelled with its reference period

### US-03. Regional comparison
**2 points** · implements FR-BC-04, FR-BC-05

> As a **small business adviser in a state agency**, I want business counts and
> survival by state, so that I can see how my jurisdiction compares before I
> make a case for funding.

**Acceptance criteria**

- All states and territories represented, with smaller jurisdictions grouped as
  the ABS groups them
- State counts sum exactly to the national total
- Each state's share of the national count is shown
- Survival by state is available alongside the counts

### US-04. Trust the numbers
**5 points** · implements FR-BC-09, FR-P-03, FR-P-05

> As a **hiring manager reviewing this portfolio**, I want to see where each
> figure came from, so that I can tell the difference between analysis and
> assertion.

**Acceptance criteria**

- The dashboard cites the ABS datacube by catalogue number and file name
- The source link resolves to the publisher's page
- The repository documents which table each figure was read from
- Superseded values (NSW 891,123 and 48% survival) fail the test suite if
  reintroduced

---

## Epic 2: Government advertising spend

### US-05. Channel split for the largest advertiser in the country
**3 points** · implements FR-AD-02, FR-AD-04, FR-AD-08

> As a **media planner at an agency**, I want the federal campaign advertising
> budget split by channel, so that I can benchmark my own media mix against the
> biggest single buyer in the market.

**Acceptance criteria**

- All seven channels shown: Digital, Television, Out of Home, Radio, Cinema,
  Press, Magazine
- Each channel shows both dollar spend and share of total
- Channel spend sums to the published $173.8M
- Digital is identifiable as the largest channel at $75.9M (43.7%)

### US-06. Audience cuts kept separate
**3 points** · implements FR-AD-05, FR-AD-06, FR-AD-07

> As a **public sector communications officer**, I want targeted spend on
> Regional, Ethnic and First Nations audiences shown separately from the channel
> breakdown, so that I do not double-count it when I quote a total.

**Acceptance criteria**

- Regional ($34.2M), Ethnic ($10.1M) and First Nations ($6.8M) shown in their
  own section
- The section states plainly that these are cuts of channel spend, not
  additional channels
- No audience segment appears in the channel list
- The channel total remains $173.8M, not $224.9M

### US-07. Cite the report
**1 point** · implements FR-P-10

> As a **journalist**, I want a link to the Department of Finance report the
> figures came from, so that I can quote it directly.

**Acceptance criteria**

- The financial year (2023-24) is stated
- The source links to the Finance publication page
- The dashboard names the report

---

## Epic 3: Retail demand

### US-08. State-level demand
**3 points** · implements FR-RD-06, FR-RD-07

> As a **category manager at a national retailer**, I want turnover and growth
> by state, so that I can set stock levels per region instead of applying one
> national growth assumption everywhere.

**Acceptance criteria**

- All eight states and territories shown with turnover and year-on-year growth
- State turnover reconciles to the national headline within 0.5%
- The fastest (VIC, +5.8%) and slowest (TAS, +2.3%) are distinguishable
- Each state's share of national turnover is derivable from what is shown

### US-09. Trend over time
**3 points** · implements FR-RD-02, FR-RD-03, FR-RD-04

> As a **demand planner**, I want the monthly turnover series rather than a
> single headline, so that I can see whether growth is steady or a one-month
> spike.

**Acceptance criteria**

- At least 25 monthly observations, enough for a full year-on-year comparison
- The series is seasonally adjusted and says so
- Observations run in chronological order
- Month-on-month (+1.2%) and year-on-year (+4.9%) are computed from the series,
  not stored independently of it

### US-10. Growth that matches the ABS
**2 points** · implements FR-RD-01, FR-RD-05

> As an **economist**, I want the growth rates on this dashboard to match what
> the ABS published, so that I can use them without re-deriving them.

**Acceptance criteria**

- Year-on-year recomputed from the series equals the published +4.9%
- Month-on-month equals the published +1.2%
- The series is located by ABS Series ID (`A3348585R`), so a reformatted sheet
  cannot silently shift which series is read
- The series ID is shown on the dashboard

---

## Epic 4: GST reconciliation

### US-11. My state's share and why
**5 points** · implements FR-GST-03, FR-GST-04, FR-GST-09

> As a **state treasury analyst**, I want my jurisdiction's GST distribution
> alongside its relativity, so that I can explain the size of the share and the
> reason for it in the same breath.

**Acceptance criteria**

- All eight jurisdictions shown with dollar distribution, share and relativity
- Distribution sums to the published $102.52bn pool
- Shares sum to 100%
- NT's relativity (5.24149) and NSW's (0.81964) are both visible, so the range
  of the formula is apparent

### US-12. The pool is the pool
**3 points** · implements FR-GST-05, FR-GST-06

> As a **public policy researcher**, I want the no-worse-off payment reported
> separately from the pool, so that I do not quote a total that includes money
> the pool does not contain.

**Acceptance criteria**

- The no-worse-off payment ($5.04bn) is a distinct field
- It is not included in the $102.52bn pool figure
- State distribution reconciles to the pool without it

### US-13. All eight, every year
**1 point** · implements FR-GST-07

> As a **policy analyst**, I want confidence that no jurisdiction was dropped
> when the report layout changed, so that I am not reading a seven-state table
> and calling it national.

**Acceptance criteria**

- NSW, VIC, QLD, WA, SA, TAS, ACT and NT are all present
- A missing jurisdiction fails the build rather than rendering a short table

---

## Epic 5: Trust and reproducibility

### US-14. Reproduce it myself
**8 points** · implements FR-P-01, FR-P-07

> As a **technical reviewer**, I want to clone the repository and re-derive
> every number from the publishers' files, so that I can confirm the figures
> rather than take them on faith.

**Acceptance criteria**

- `python scripts/reproduce_check.py` re-derives all four datasets from source
- Re-derived values match the committed values byte for byte
- A source that cannot be reached is reported as unreachable, not as a failure
- The run states which sources it reached and which it skipped

### US-15. Catch a publisher's revision
**5 points** · implements FR-P-07, FR-P-08

> As the **maintainer**, I want a scheduled job that re-downloads the sources
> and compares them to what is committed, so that a revised figure upstream
> shows up as a red check rather than going unnoticed for a year.

**Acceptance criteria**

- The job runs weekly on a clean machine with no cache
- Any difference between a re-derived figure and a committed one fails the job
- The job does not run on every push, to avoid sending traffic at government
  sites on unrelated commits
- Hosts that refuse GitHub's ranges are named in the output

### US-16. Plain English first
**2 points** · implements FR-P-09

> As a **non-technical reader**, I want each dashboard to tell me what it means
> before it shows me the detail, so that I get the point without having to
> interpret a chart.

**Acceptance criteria**

- Every dashboard opens with a plain-English reading of the headline finding
- The reading appears above the charts
- It states a conclusion, not a restatement of the axis labels

---

## Summary

| Epic | Stories | Points |
| :--- | ---: | ---: |
| Business churn and survival | 4 | 12 |
| Government advertising spend | 3 | 7 |
| Retail demand | 3 | 8 |
| GST reconciliation | 3 | 9 |
| Trust and reproducibility | 3 | 15 |
| **Total** | **16** | **51** |

Epic 5 is the most expensive relative to what a viewer sees, which is the point
worth noting. Rendering a chart is cheap. Proving the number in it is what the
source actually says costs more than drawing it.

# Risk Register

**Project:** Australian open-data dashboard suite
**Version:** 1.0

Scoring: likelihood and impact each 1 (low) to 5 (high). Score is the product.
Anything at 12 or above needs a control that runs automatically, not a control
that depends on somebody remembering.

| Score | Band |
| :--- | :--- |
| 15 to 25 | High |
| 8 to 12 | Medium |
| 1 to 6 | Low |

---

## 1. Data risks

### R-01. A publisher reformats a source file
**Likelihood 4 · Impact 5 · Score 20 · High**

ABS and CGC reformat their published files between releases. A parser keyed to
column position reads the wrong column and produces figures that look plausible.

**Controls**

- The retail parser locates series by ABS Series ID (`A3348585R`), which is
  stable across releases, rather than by column position
- Every parser reconciles against the publisher's stated total before writing,
  so a shifted column fails the run instead of shipping
- `test_gst_covers_all_eight_jurisdictions` catches a table that loses a column
- Weekly reproduction re-downloads and re-parses, so a reformat surfaces within
  seven days

**Residual:** Low. A reformat that preserved every total while shifting meaning
would pass, but that combination is unlikely.

### R-02. Figures transcribed by hand drift from the source
**Likelihood 5 · Impact 5 · Score 25 · High**

This is the risk the project was built around, and it has already happened once
here. An earlier version carried a NSW count of 891,123 and a three-year
survival rate of 48%. Neither was ever an ABS figure.

**Controls**

- No figure is typed into the repository. Every value originates in a parser
- `test_no_state_count_is_a_placeholder` names the superseded values explicitly
  and fails if they reappear
- 33 integrity checks run on every push

**Residual:** Low. The failure mode is closed rather than mitigated: there is no
transcription step left to drift.

### R-03. Audience cuts counted as advertising channels
**Likelihood 3 · Impact 4 · Score 12 · Medium**

The Finance report lists Regional, Ethnic and First Nations in the same table as
the media channels. They are cuts of the channel spend, not additional channels.
Adding them inflates the total from $173.8M to $224.9M.

**Controls**

- The parser holds `AUDIENCE_SEGMENTS` as an explicit set, excluded from the
  channel total
- `test_ad_spend_channels_reconcile_to_published_total` fails on the inflated total
- `test_audience_segments_are_not_counted_as_channels` asserts no overlap
- The dashboard labels the audience section as cuts of channel spend

**Residual:** Low.

### R-04. No-worse-off payment folded into the GST pool
**Likelihood 3 · Impact 4 · Score 12 · Medium**

The CGC reports a $5.04bn no-worse-off payment near the distribution table.
Adding it to the $102.52bn pool overstates the total.

**Controls**

- The payment is written to its own field, outside the pool
- `test_gst_states_reconcile_to_pool` reconciles state distribution to the pool
  without it

**Residual:** Low.

### R-05. Wrong reference year read from a CGC table
**Likelihood 3 · Impact 5 · Score 15 · High**

The CGC report carries year labels across several tables. Reading the wrong one
publishes last year's relativities under this year's headline, and the figures
look entirely reasonable.

**Controls**

- `YEAR` is pinned in the parser (2026-27) and recorded in the JSON payload
- Both tables are located by content rather than by position
- The reference year appears on the dashboard, so a reader can check it against
  the cited report

**Residual:** Medium. A future report that changed both its labelling and its
totals consistently could still slip through. The weekly reproduction limits the
window, but this one warrants a look by eye each time the CGC publishes.

### R-06. WA relativity floor misread as a finding
**Likelihood 2 · Impact 3 · Score 6 · Low**

WA and NSW both show a relativity of 0.81964. That is the floor from the 2018
arrangements, not evidence the two states have equal fiscal capacity.

**Controls**

- `test_wa_relativity_respects_the_floor` asserts the floor holds
- The dashboard presents distribution and relativity together so the mechanism
  is visible

**Residual:** Low.

### R-07. A publisher revises figures after release
**Likelihood 3 · Impact 3 · Score 9 · Medium**

ABS revises seasonally adjusted series. Committed figures silently become stale.

**Controls**

- `reproduce-data.yml` re-derives weekly and fails on any difference
- A revision shows up as a red check rather than going unnoticed

**Residual:** Low for the two ABS sources. Medium for CGC and Finance, which the
CI runner cannot reach. See R-09.

---

## 2. Technical risks

### R-08. A source URL moves or the file is withdrawn
**Likelihood 3 · Impact 4 · Score 12 · Medium**

Pinned file URLs break when a publisher restructures their site.

**Controls**

- `scripts/check_freshness.py` confirms each pinned file is still published
- Weekly reproduction fails on an unreachable file for the two ABS sources
- Both the release page and the direct file URL are recorded, so a moved file
  can be relocated from the release page

**Residual:** Medium. Recovery is manual, but detection is automatic.

### R-09. Government hosts refuse CI runners
**Likelihood 5 · Impact 2 · Score 10 · Medium · Accepted**

`cgc.gov.au` and `finance.gov.au` do not answer GitHub's datacentre ranges at
all. The weekly job therefore re-derives 2 of 4 sources rather than 4 of 4.

**Controls**

- The job reports an unreachable host by name instead of failing on it. A red
  check that only means "a government site blocked a datacentre" would train the
  maintainer to ignore red checks
- From an ordinary connection all four re-derive byte-identically
- The limitation is stated in the README and in the UAT plan rather than
  smoothed over

**Residual:** Accepted. Verification of those two sources is manual and local.
Recording it honestly is the mitigation.

### R-10. A bot-detection interstitial blocks the Finance landing page
**Likelihood 4 · Impact 2 · Score 8 · Medium · Accepted**

`finance.gov.au` serves its landing page behind an interstitial. This project
does not attempt to defeat it.

**Controls**

- That source is checked only as far as confirming its pinned file is still
  published
- The freshness script labels it that way rather than reporting a pass it has
  not earned

**Residual:** Accepted.

### R-11. Standard-library-only parsing hits a file it cannot read
**Likelihood 2 · Impact 4 · Score 8 · Medium**

`xlsx_reader.py` and `docx_reader.py` implement the subset of the formats these
four files use. A publisher switching to a feature outside that subset breaks
the parser.

**Controls**

- The failure is loud: the parser raises rather than returning partial data
- The subset covers the structures ABS and CGC have used consistently
- Adding a dependency remains available if a format genuinely demands it

**Residual:** Low. The constraint is deliberate, and the failure mode is
visible rather than silent.

### R-12. Front end drifts from the data files
**Likelihood 2 · Impact 5 · Score 10 · Medium**

A dashboard could hold a hardcoded figure that no longer matches `data/`.

**Controls**

- Dashboards read from the generated files
- UAT-03 spot-checks five figures across the four dashboards against `data/`

**Residual:** Medium. This is the weakest link in the chain, because the
automated tests verify the data files rather than what the browser renders. An
end-to-end assertion against the rendered DOM would close it.

---

## 3. Project risks

### R-13. Documentation drifts from the code
**Likelihood 4 · Impact 2 · Score 8 · Medium**

These documents describe a pipeline that keeps changing.

**Controls**

- Requirements reference test names, so a renamed test surfaces the drift
- Figures quoted in the documents are the same figures the tests assert

**Residual:** Medium. Nothing enforces this automatically.

### R-14. Scope creep into forecasting
**Likelihood 3 · Impact 2 · Score 6 · Low**

Four clean datasets invite modelling that the sources do not support at this
granularity.

**Controls**

- Forecasting is explicitly out of scope in the BRD
- The one model present (exponential survival by industry) is fitted to
  published survival rates and labelled as a model, not as observed data

**Residual:** Low.

---

## 4. Summary

| Risk | Description | Score | Band | Status |
| :--- | :--- | ---: | :--- | :--- |
| R-02 | Hand-transcribed figures drift | 25 | High | Closed by design |
| R-01 | Publisher reformats a source | 20 | High | Controlled |
| R-05 | Wrong CGC reference year | 15 | High | Controlled, review by eye each release |
| R-03 | Audience cuts as channels | 12 | Medium | Controlled |
| R-04 | No-worse-off folded into pool | 12 | Medium | Controlled |
| R-08 | Source URL moves | 12 | Medium | Detected automatically, recovery manual |
| R-09 | Hosts refuse CI runners | 10 | Medium | Accepted, documented |
| R-12 | Front end drifts from data | 10 | Medium | Partly controlled |
| R-07 | Publisher revises figures | 9 | Medium | Controlled for ABS |
| R-10 | Finance interstitial | 8 | Medium | Accepted, documented |
| R-11 | Parser meets unsupported format | 8 | Medium | Fails loudly |
| R-13 | Documentation drift | 8 | Medium | Partly controlled |
| R-06 | WA floor misread | 6 | Low | Controlled |
| R-14 | Scope creep | 6 | Low | Controlled |

Two entries are worth reading together. R-02, the highest-scoring risk on the
register, is closed rather than mitigated: removing the transcription step
removes the failure mode. R-12, much lower scoring, is the one still genuinely
open, because the tests check the data files and not the rendered page.

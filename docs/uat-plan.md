# User Acceptance Test Plan

**Project:** Australian open-data dashboard suite
**Version:** 1.0

Two layers of testing sit behind this project, and they prove different things.

**Layer 1, automated integrity tests.** 22 test functions expanding to 33 checks,
in `tests/test_data_integrity.py`, run in CI on every push. These prove the
committed numbers hang together: each dataset reconciles to its publisher's
stated total, shares sum to 100%, survival falls with time, growth recomputes to
the published rate.

**Layer 2, reproduction from source.** `reproduce-data.yml`, weekly. This proves
the committed numbers are what the sources actually say. It runs on a clean
machine with no cache, re-downloads the publishers' files and fails if a single
value differs from what is committed.

Layer 1 without Layer 2 would prove only that the numbers are internally
consistent, which a carefully wrong dataset can also manage.

---

## 1. Entry criteria

- All parsers run without raising
- `data/` contains all four JSON payloads and all nine CSV files
- The four dashboards load without console errors
- The integrity suite passes locally

## 2. Exit criteria

- Every test case below passes, or carries a documented and accepted exception
- No Severity 1 or 2 defect remains open
- The reproduction check has completed at least one successful run against the
  current committed data

## 3. Environment

| Item | Value |
| :--- | :--- |
| Runtime | Python 3.11, standard library only for parsing |
| Test dependency | `pytest` |
| CI | GitHub Actions, `ubuntu-latest` |
| Front end | Static files, any HTTP server, no build step |
| Deployment | Vercel |

Run the automated layer locally with:

```bash
pip install pytest && python -m pytest tests/ -v
```

Re-derive everything from source with:

```bash
python scripts/reproduce_check.py
```

---

## 4. Automated test coverage

These run in CI. The table maps each check to the requirement it verifies.

### 4.1 Business churn

| Test | Verifies | Requirement |
| :--- | :--- | :--- |
| `test_state_counts_reconcile_to_national_total` | State counts sum exactly to 2,814,778 | FR-BC-05 |
| `test_business_total_matches_abs_release` | Total equals the ABS published figure | FR-BC-02 |
| `test_business_shares_sum_to_100` | State shares sum to 100% (±0.2) | FR-BC-04 |
| `test_entry_and_exit_rates_match_published` | 460,461 entries, 375,331 exits, 16.9% / 13.8% | FR-BC-03 |
| `test_no_state_count_is_a_placeholder` | Superseded values cannot return | FR-BC-09 |
| `test_survival_falls_with_time` | Four-year survival never exceeds three-year | FR-BC-06 |
| `test_survival_rates_are_percentages` | All survival values within 0 to 100 | FR-BC-06 |
| `test_national_survival_matches_abs` | 68.1% and 61.9% | FR-BC-06 |

### 4.2 Retail demand

| Test | Verifies | Requirement |
| :--- | :--- | :--- |
| `test_retail_growth_matches_published_rate` | $37,906.6M, +1.2%, +4.9% | FR-RD-05 |
| `test_retail_series_yoy_recomputes_to_headline` | Growth recomputed from the series matches the stored headline | FR-RD-04 |
| `test_retail_states_reconcile_to_national` | State turnover sums to national within 0.5% | FR-RD-07 |
| `test_retail_series_is_chronological` | Periods are in order | FR-RD-08 |

### 4.3 GST reconciliation

| Test | Verifies | Requirement |
| :--- | :--- | :--- |
| `test_gst_states_reconcile_to_pool` | State distribution sums to $102.52bn | FR-GST-05 |
| `test_gst_covers_all_eight_jurisdictions` | No jurisdiction dropped | FR-GST-07 |
| `test_gst_shares_sum_to_100` | Shares sum to 100% (±0.3) | FR-GST-04 |
| `test_wa_relativity_respects_the_floor` | WA relativity holds at the floor | FR-GST-08 |

### 4.4 Advertising spend

| Test | Verifies | Requirement |
| :--- | :--- | :--- |
| `test_ad_spend_channels_reconcile_to_published_total` | Channels sum to $173.8M | FR-AD-04 |
| `test_ad_spend_includes_every_channel` | All seven channels present | FR-AD-02 |
| `test_audience_segments_are_not_counted_as_channels` | No audience cut in the channel list | FR-AD-06, FR-AD-07 |
| `test_digital_is_the_largest_channel` | Digital is top by spend | FR-AD-08 |

### 4.5 Cross-cutting

| Test | Verifies | Requirement |
| :--- | :--- | :--- |
| `test_dataset_is_present_and_non_empty` (9 files) | Every CSV exists and has rows | FR-P-04 |
| `test_json_records_its_source` (4 files) | Every JSON records its release label | FR-P-05 |

---

## 5. Manual test cases

The automated layer covers the data. These cover what a person sees.

### UAT-01. Plain-English reading appears first
**Requirement:** FR-P-09 · **Severity if failed:** 2

1. Open each of the four dashboards
2. Confirm a plain-English reading appears above the charts
3. Confirm it states a conclusion rather than restating the axes

**Expected:** All four lead with an interpretation a non-technical reader can
act on.

### UAT-02. Source is cited and resolves
**Requirement:** FR-P-10 · **Severity if failed:** 1

1. On each dashboard, locate the source citation
2. Confirm it names the publisher and the release
3. Click through and confirm it reaches the publisher's page

**Expected:** Four working citations. A broken source link is Severity 1,
because an uncheckable figure is the thing this project exists to avoid.

### UAT-03. Figures on screen match the data files
**Requirement:** FR-P-01 · **Severity if failed:** 1

1. Pick five headline figures spread across the four dashboards
2. Find each in the corresponding file in `data/`
3. Confirm they match

**Suggested five:** 2,814,778 (`business_churn.json`); 54.6%
(`business_survival_by_industry.csv`, Transport); $75.9M
(`govt_ad_spend_by_channel.csv`, Digital); $37,906.6M (`retail_demand.json`);
5.24149 (`gst_relativities.csv`, NT).

**Expected:** Exact match on all five.

### UAT-04. Audience cuts are not presented as channels
**Requirement:** FR-AD-06 · **Severity if failed:** 1

1. Open the advertising spend dashboard
2. Confirm Regional, Ethnic and First Nations appear in their own section
3. Confirm they are not in the channel chart
4. Confirm the stated total is $173.8M

**Expected:** Total reads $173.8M. A total of $224.9M means the cuts have been
folded into the channels.

### UAT-05. No-worse-off payment sits outside the pool
**Requirement:** FR-GST-06 · **Severity if failed:** 1

1. Open the GST dashboard
2. Confirm the pool reads $102.52bn
3. Confirm the no-worse-off payment ($5.04bn) is labelled separately

**Expected:** The two are distinguishable. A headline of $107.56bn means they
have been added together.

### UAT-06. Responsive layout
**Requirement:** FR-P-11 · **Severity if failed:** 3

1. Open each dashboard at 375px, 768px and 1440px
2. Confirm no horizontal page scroll
3. Confirm charts and tables remain readable, scrolling within their own
   container where they must

**Expected:** Usable at all three widths.

### UAT-07. Reduced motion is respected
**Requirement:** FR-P-11 · **Severity if failed:** 3

1. Enable the operating system's reduce-motion setting
2. Reload each dashboard

**Expected:** Animation is suppressed. Content remains fully readable.

### UAT-08. Reproduction from source
**Requirement:** FR-P-07, FR-P-08 · **Severity if failed:** 1

1. On an ordinary connection, run `python scripts/reproduce_check.py`
2. Confirm all four datasets re-derive
3. Confirm re-derived values match committed values

**Expected:** 4 of 4 re-derive byte-identically from an ordinary connection.

**Known exception:** on GitHub's runners this returns 2 of 4. `cgc.gov.au` and
`finance.gov.au` do not answer datacentre ranges at all. The job reports the two
unreachable hosts by name instead of failing, because a red check that only
means "a government site blocked a datacentre" tells a reader nothing about the
data. This is accepted, not a defect.

### UAT-09. A wrong figure fails the build
**Requirement:** FR-P-03, FR-P-06 · **Severity if failed:** 1

1. Edit `data/business_churn.json` and change `total_businesses` to 2,729,000
2. Run the test suite
3. Restore the file

**Expected:** `test_state_counts_reconcile_to_national_total` and
`test_business_total_matches_abs_release` both fail. If the suite passes, the
reconciliation guarantee is not real and every other result in this plan is
worth less.

UAT-09 is the single most important case here. It is the only one that tests
the tests.

---

## 6. Defect severity

| Severity | Meaning | Response |
| :--- | :--- | :--- |
| 1 | A figure is wrong, uncheckable, or contradicts its source | Block release |
| 2 | Correct data, but a reader is likely to misread it | Fix before release |
| 3 | Presentation or accessibility issue, data unaffected | Fix in the next pass |
| 4 | Cosmetic | Backlog |

A wrong number is always Severity 1, however small. The premise of the project
is that every figure traces to a source, and one that does not undermines the
other three dashboards along with its own.

---

## 7. Sign-off

| Role | Name | Status |
| :--- | :--- | :--- |
| Analyst and developer | Gaurav Warke | Complete |
| Automated suite | GitHub Actions | Passing, 33 checks |
| Reproduction check | GitHub Actions, weekly | Passing, 2 of 4 sources on CI, 4 of 4 locally |

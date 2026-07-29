-- ============================================================================
-- Portfolio analytical layer
-- Gaurav Warke — https://github.com/GauravWarke/Portfolio
--
-- The four dashboards render figures sourced from Australian open data
-- (see scripts/*.py). This file models those datasets as relational tables and
-- reproduces the headline metrics each dashboard shows, as SQL. It is written
-- in ANSI SQL and runs as-is on SQLite / PostgreSQL / DuckDB.
--
--   business_*        -> dashboards/churn.html          (ABS 8165.0)
--   ad_spend_*        -> dashboards/market.html         (Dept of Finance)
--   retail_*          -> dashboards/demand.html         (ABS 8501.0)
--   gst_distribution  -> dashboards/reconciliation.html (Commonwealth Grants Commission)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Australian Business Churn  (ABS Counts of Australian Businesses, 8165.0)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS business_flows;
CREATE TABLE business_flows (
    metric      TEXT PRIMARY KEY,
    businesses  INTEGER NOT NULL
);
INSERT INTO business_flows (metric, businesses) VALUES
    ('opening_stock', 2729648),
    ('entries',        437150),
    ('exits',          370500);

DROP TABLE IF EXISTS business_by_state;
CREATE TABLE business_by_state (
    state       TEXT PRIMARY KEY,
    businesses  INTEGER NOT NULL
);
INSERT INTO business_by_state (state, businesses) VALUES
    ('NSW',                   891123),
    ('VIC',                   735805),
    ('QLD',                   511835),
    ('WA',                    260730),
    ('Other (SA/TAS/ACT/NT)', 330155);

DROP TABLE IF EXISTS business_survival;
CREATE TABLE business_survival (
    segment       TEXT PRIMARY KEY,
    survival_pct  NUMERIC NOT NULL   -- % still trading after 3 years
);
INSERT INTO business_survival (segment, survival_pct) VALUES
    ('All businesses',                   48.0),
    ('Employing',                        61.0),
    ('Non-employing',                    43.3),
    ('Health Care & Social Assistance',  82.7);

-- Churn: entry rate, exit rate and net growth as a share of opening stock.
SELECT
    ROUND(100.0 * MAX(CASE WHEN metric = 'entries' THEN businesses END)
                / MAX(CASE WHEN metric = 'opening_stock' THEN businesses END), 1) AS entry_rate_pct,
    ROUND(100.0 * MAX(CASE WHEN metric = 'exits'   THEN businesses END)
                / MAX(CASE WHEN metric = 'opening_stock' THEN businesses END), 1) AS exit_rate_pct,
    ROUND(100.0 * (MAX(CASE WHEN metric = 'entries' THEN businesses END)
                 - MAX(CASE WHEN metric = 'exits'   THEN businesses END))
                / MAX(CASE WHEN metric = 'opening_stock' THEN businesses END), 1) AS net_growth_pct
FROM business_flows;

-- Each state's share of the national business base.
SELECT
    state,
    businesses,
    ROUND(100.0 * businesses / SUM(businesses) OVER (), 1) AS share_pct
FROM business_by_state
ORDER BY businesses DESC;

-- ----------------------------------------------------------------------------
-- 2. Government Advertising Spend  (Australian Department of Finance)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS ad_spend_by_channel;
CREATE TABLE ad_spend_by_channel (
    channel     TEXT PRIMARY KEY,
    spend_m_aud NUMERIC NOT NULL   -- 2023-24 media placement, $M
);
INSERT INTO ad_spend_by_channel (channel, spend_m_aud) VALUES
    ('Digital', 75.9),
    ('TV',      54.7),
    ('OOH',     17.7),
    ('Radio',   15.2),
    ('Cinema',   6.2),
    ('Press',    3.7);

DROP TABLE IF EXISTS ad_spend_by_jurisdiction;
CREATE TABLE ad_spend_by_jurisdiction (
    jurisdiction TEXT PRIMARY KEY,
    spend_m_aud  NUMERIC NOT NULL
);
INSERT INTO ad_spend_by_jurisdiction (jurisdiction, spend_m_aud) VALUES
    ('Commonwealth', 173.8),
    ('NSW',          131.46),
    ('QLD',           50.7);

-- Channel mix: digital's share of total media placement.
SELECT
    channel,
    spend_m_aud,
    ROUND(100.0 * spend_m_aud / SUM(spend_m_aud) OVER (), 1) AS share_pct
FROM ad_spend_by_channel
ORDER BY spend_m_aud DESC;

-- ----------------------------------------------------------------------------
-- 3. Retail Demand  (ABS Retail Trade, 8501.0)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS retail_turnover;
CREATE TABLE retail_turnover (
    month        TEXT PRIMARY KEY,   -- ISO month
    turnover_m   NUMERIC NOT NULL    -- seasonally adjusted, $M
);
INSERT INTO retail_turnover (month, turnover_m) VALUES
    ('2024-06', 36204.5),
    ('2025-01', 36903.1),
    ('2025-02', 37122.0),
    ('2025-03', 37344.8),
    ('2025-04', 37561.2),
    ('2025-05', 37457.3),
    ('2025-06', 37906.6);

-- Month-on-month and year-on-year growth for the latest month.
WITH ordered AS (
    SELECT
        month,
        turnover_m,
        LAG(turnover_m, 1)  OVER (ORDER BY month) AS prev_month,
        LAG(turnover_m, 12) OVER (ORDER BY month) AS prev_year
    FROM retail_turnover
)
SELECT
    month,
    turnover_m,
    ROUND(100.0 * (turnover_m - prev_month) / prev_month, 1) AS mom_growth_pct,
    ROUND(100.0 * (turnover_m - prev_year)  / prev_year,  1) AS yoy_growth_pct
FROM ordered
WHERE month = '2025-06';

-- ----------------------------------------------------------------------------
-- 4. GST Reconciliation  (Commonwealth Grants Commission, 2026-27 update)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS gst_distribution;
CREATE TABLE gst_distribution (
    state       TEXT PRIMARY KEY,
    gst_bn_aud  NUMERIC NOT NULL   -- GST distributed, $bn
);
INSERT INTO gst_distribution (state, gst_bn_aud) VALUES
    ('VIC', 27.9),
    ('NSW', 26.1),
    ('QLD', 18.4),
    ('SA',   9.5),
    ('WA',   9.3),
    ('NT',   5.1),
    ('TAS',  4.0),
    ('ACT',  2.1);

-- How the ~$102bn pool reconciles out: each state's share, ranked.
SELECT
    state,
    gst_bn_aud,
    ROUND(100.0 * gst_bn_aud / SUM(gst_bn_aud) OVER (), 1) AS share_pct,
    RANK() OVER (ORDER BY gst_bn_aud DESC)                 AS rank_by_gst
FROM gst_distribution
ORDER BY gst_bn_aud DESC;

-- Pool total (reconciliation check against the published ~$102bn).
SELECT ROUND(SUM(gst_bn_aud), 1) AS gst_pool_bn_aud FROM gst_distribution;

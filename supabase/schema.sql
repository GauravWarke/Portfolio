-- Supabase schema + seed for the portfolio data layer
-- Generated from data/*.csv by scripts/make_supabase_sql.py -- do not edit by hand.
-- Generated: 2026-08-04
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run


-- ========================================================================
-- business_churn_by_state  |  source: ABS Counts of Australian Businesses (8165.0)
-- ========================================================================
drop table if exists public.business_churn_by_state cascade;
create table public.business_churn_by_state (
  state text not null primary key,
  businesses bigint not null,
  share_pct numeric(5,2) not null
);
comment on table public.business_churn_by_state is 'ABS Counts of Australian Businesses (8165.0)';

insert into public.business_churn_by_state (state, businesses, share_pct) values
  ('NSW', 891123, 32.6),
  ('VIC', 735805, 27.0),
  ('QLD', 511835, 18.8),
  ('WA', 260730, 9.6),
  ('Other (SA/TAS/ACT/NT)', 330155, 12.1);

alter table public.business_churn_by_state enable row level security;
create policy "public read business_churn_by_state" on public.business_churn_by_state for select to anon, authenticated using (true);

-- ========================================================================
-- govt_ad_spend_by_channel  |  source: Australian Department of Finance
-- ========================================================================
drop table if exists public.govt_ad_spend_by_channel cascade;
create table public.govt_ad_spend_by_channel (
  channel text not null primary key,
  spend_m numeric(10,2) not null,
  share_pct numeric(5,2) not null
);
comment on table public.govt_ad_spend_by_channel is 'Australian Department of Finance';

insert into public.govt_ad_spend_by_channel (channel, spend_m, share_pct) values
  ('Digital', 75.9, 43.8),
  ('Television', 54.7, 31.5),
  ('Out of Home', 17.7, 10.2),
  ('Radio', 15.2, 8.8),
  ('Cinema', 6.2, 3.6),
  ('Press', 3.7, 2.1);

alter table public.govt_ad_spend_by_channel enable row level security;
create policy "public read govt_ad_spend_by_channel" on public.govt_ad_spend_by_channel for select to anon, authenticated using (true);

-- ========================================================================
-- retail_demand_series  |  source: ABS Retail Trade (8501.0)
-- ========================================================================
drop table if exists public.retail_demand_series cascade;
create table public.retail_demand_series (
  period text not null primary key,
  turnover_m numeric(12,2) not null
);
comment on table public.retail_demand_series is 'ABS Retail Trade (8501.0)';

insert into public.retail_demand_series (period, turnover_m) values
  ('2024-06', 36204.5),
  ('2024-09', 36512.0),
  ('2024-12', 36998.4),
  ('2025-03', 37410.2),
  ('2025-05', 37457.8),
  ('2025-06', 37906.6);

alter table public.retail_demand_series enable row level security;
create policy "public read retail_demand_series" on public.retail_demand_series for select to anon, authenticated using (true);

-- ========================================================================
-- gst_reconciliation_by_state  |  source: Commonwealth Grants Commission
-- ========================================================================
drop table if exists public.gst_reconciliation_by_state cascade;
create table public.gst_reconciliation_by_state (
  state text not null primary key,
  gst_bn numeric(10,2) not null,
  share_pct numeric(5,2) not null
);
comment on table public.gst_reconciliation_by_state is 'Commonwealth Grants Commission';

insert into public.gst_reconciliation_by_state (state, gst_bn, share_pct) values
  ('VIC', 27.9, 27.2),
  ('NSW', 26.1, 25.5),
  ('QLD', 18.4, 18.0),
  ('SA', 9.5, 9.3),
  ('WA', 9.3, 9.1),
  ('NT', 5.1, 5.0),
  ('TAS', 4.0, 3.9),
  ('ACT', 2.1, 2.1);

alter table public.gst_reconciliation_by_state enable row level security;
create policy "public read gst_reconciliation_by_state" on public.gst_reconciliation_by_state for select to anon, authenticated using (true);

-- Conformed state grain, mirroring the Power BI State dimension
create or replace view public.state_dim as
  select distinct state from public.business_churn_by_state;

create or replace view public.gst_by_state_group as
  select case when state in ('NSW', 'VIC', 'QLD', 'WA') then state
              else 'Other (SA/TAS/ACT/NT)' end as state_group,
         sum(gst_bn) as gst_bn
  from public.gst_reconciliation_by_state group by 1;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;

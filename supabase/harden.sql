-- Defense in depth: revoke write privileges from anonymous callers.
-- RLS already blocks writes, but anon still HOLDS insert/update/delete
-- privileges, so a DELETE returns 204 (0 rows matched) instead of being
-- refused. This removes the privilege itself.
revoke all on public.business_churn_by_state      from anon, authenticated;
revoke all on public.govt_ad_spend_by_channel     from anon, authenticated;
revoke all on public.retail_demand_series         from anon, authenticated;
revoke all on public.gst_reconciliation_by_state  from anon, authenticated;
revoke all on public.state_dim, public.gst_by_state_group from anon, authenticated;

grant select on public.business_churn_by_state      to anon, authenticated;
grant select on public.govt_ad_spend_by_channel     to anon, authenticated;
grant select on public.retail_demand_series         to anon, authenticated;
grant select on public.gst_reconciliation_by_state  to anon, authenticated;
grant select on public.state_dim, public.gst_by_state_group to anon, authenticated;

-- Prevent duplicate planned rows for same email+step+campaign on same UTC day
create unique index if not exists outreach_log_one_plan_per_day
  on public.outreach_log (email, step, campaign, ((sent_at at time zone 'UTC')::date))
  where status = 'planned';

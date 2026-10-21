-- Stripe is the billing source of truth. Keep exactly one current snapshot per
-- organisation; billing_events remains the immutable event/audit history.
with ranked as (
  select id,
         row_number() over (
           partition by organisation_id
           order by
             case status
               when 'active' then 6
               when 'trialing' then 5
               when 'past_due' then 4
               when 'unpaid' then 3
               when 'incomplete' then 2
               else 1
             end desc,
             updated_at desc nulls last,
             created_at desc
         ) as position
  from public.billing_subscriptions
)
delete from public.billing_subscriptions b
using ranked r
where b.id = r.id
  and r.position > 1;

create unique index if not exists billing_subscriptions_one_per_org_idx
  on public.billing_subscriptions (organisation_id);

create table if not exists public.analytics_health_checks (
  source text primary key,
  last_attempt_at timestamptz not null,
  last_success_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

alter table public.analytics_health_checks enable row level security;
revoke all on public.analytics_health_checks from anon, authenticated;

-- 026: billing_events deduplication table + multi_location plan support

-- 1. Add multi_location to the plan check constraint
-- Supabase doesn't support ALTER CONSTRAINT directly; drop + recreate via constraint name trick.
alter table billing_subscriptions
  drop constraint if exists billing_subscriptions_plan_check;

alter table billing_subscriptions
  add constraint billing_subscriptions_plan_check
  check (plan in ('starter','pro','connected','multi_location'));

-- 2. billing_events — idempotent Stripe event log
create table if not exists billing_events (
  id               uuid         primary key default gen_random_uuid(),
  stripe_event_id  text         not null unique,
  event_type       text         not null,
  organisation_id  uuid         null,
  processed        boolean      not null default false,
  error            text         null,
  -- Store only non-sensitive summary, never full payment method data
  summary          jsonb        null default '{}'::jsonb,
  created_at       timestamptz  not null default now()
);

create index if not exists idx_billing_events_org     on billing_events(organisation_id);
create index if not exists idx_billing_events_type    on billing_events(event_type);
create index if not exists idx_billing_events_created on billing_events(created_at desc);

-- Only service role can write
alter table billing_events enable row level security;

drop policy if exists "billing_events_no_public_write" on billing_events;
create policy "billing_events_no_public_write" on billing_events
  for all using (false);

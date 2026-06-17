create extension if not exists "pgcrypto";

create table if not exists billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null check (plan in ('starter','pro','connected')),
  status text,
  trial_start timestamptz null,
  trial_end timestamptz null,
  current_period_end timestamptz null,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_billing_subscriptions_org on billing_subscriptions(organisation_id);
create index if not exists idx_billing_subscriptions_customer on billing_subscriptions(stripe_customer_id);

alter table billing_subscriptions enable row level security;

drop policy if exists "billing_select_org_members" on billing_subscriptions;
create policy "billing_select_org_members" on billing_subscriptions
  for select using (is_org_member(organisation_id));

drop policy if exists "billing_no_public_insert" on billing_subscriptions;
create policy "billing_no_public_insert" on billing_subscriptions
  for insert with check (false);

drop policy if exists "billing_no_public_update" on billing_subscriptions;
create policy "billing_no_public_update" on billing_subscriptions
  for update using (false);

drop policy if exists "billing_no_public_delete" on billing_subscriptions;
create policy "billing_no_public_delete" on billing_subscriptions
  for delete using (false);

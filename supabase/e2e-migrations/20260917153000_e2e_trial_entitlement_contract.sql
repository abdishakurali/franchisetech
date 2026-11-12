-- Columns read by the subscription and module-visibility paths in isolated E2E.
alter table public.organisations
  add column if not exists referral_credit_months integer not null default 0,
  add column if not exists stripe_customer_id text,
  add column if not exists business_profile text,
  add column if not exists inventory_enabled boolean default true,
  add column if not exists recipe_costing_enabled boolean default true,
  add column if not exists team_advanced_enabled boolean default false,
  add column if not exists multi_site_ops_enabled boolean default false;

alter table public.billing_subscriptions
  add column if not exists trial_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

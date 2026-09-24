-- Checkout, verification, and webhook reconciliation all use updated_at to
-- select and refresh the latest reusable Stripe subscription row.

alter table public.billing_subscriptions
  add column if not exists updated_at timestamptz not null default now();

create index if not exists billing_subscriptions_org_updated_idx
  on public.billing_subscriptions (organisation_id, updated_at desc);

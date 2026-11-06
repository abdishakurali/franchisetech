-- The plan check never got the current plans: "growth" (Pro €49) and "team"
-- (Multi €79), sold since 2026-09. Every Stripe subscription on those plans
-- failed to sync with a check violation, so a paying customer would not get
-- access (found 2026-11-06 on Dolce Nera's new subscription). Additive: the
-- allowed set only grows, existing rows stay valid.
alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_plan_check;

alter table public.billing_subscriptions
  add constraint billing_subscriptions_plan_check
  check (plan in ('starter', 'core', 'pro', 'operations', 'scale', 'connected', 'multi_location', 'growth', 'team'));

-- Onboarding rebuild: /onboarding now owns the whole journey through first
-- sale, not just account creation (see docs/onboarding-redesign-audit-2026-09-19.md).
-- Two additive, nullable-or-defaulted columns on organisations:
--
-- onboarding_step tracks which step of the guided journey an org is on, so
-- /onboarding can resume exactly where a user left off instead of guessing
-- from local browser state (localStorage draft mirroring stays, but is no
-- longer the source of truth for *which step*). Null means "not in the new
-- guided flow" -- existing orgs that already finished the old-style
-- onboarding are left null and never enter the new step machine.
--
-- purchases_enabled is a real, independent module flag. Achiziții was
-- previously folded into inventory_enabled with no way to turn it on
-- separately (see the audit's Section K / Section R decision: "a real
-- second column"). Existing orgs inherit their current inventory_enabled
-- value so nothing that already works today loses access to purchases on
-- this deploy -- only new onboarding going forward lets an owner choose
-- them independently.

alter table public.organisations
  add column if not exists onboarding_step text,
  add column if not exists purchases_enabled boolean not null default false;

alter table public.organisations
  drop constraint if exists organisations_onboarding_step_check;

alter table public.organisations
  add constraint organisations_onboarding_step_check
  check (onboarding_step is null or onboarding_step in (
    'location_type',
    'business_cui',
    'modules',
    'menu',
    'stock_setup',
    'recipe_setup',
    'fiscal',
    'first_sale',
    'result',
    'complete'
  ));

update public.organisations
set purchases_enabled = coalesce(inventory_enabled, false)
where purchases_enabled = false;

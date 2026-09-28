-- Restored from production migration history on 2026-09-24.
-- Production recorded this migration under version 20260920161007 while the
-- original local filename used 20260919120000. Keep both files append-only so
-- every environment can reconcile its migration history safely.

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

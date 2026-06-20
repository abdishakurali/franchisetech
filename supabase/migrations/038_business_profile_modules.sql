-- ============================================================
-- 038_business_profile_modules.sql
-- Business profile + progressive module flags on organisations.
-- Additive only. Grandfathers existing orgs with full modules.
-- ============================================================

alter table public.organisations
  add column if not exists business_profile text,
  add column if not exists inventory_enabled boolean not null default false,
  add column if not exists recipe_costing_enabled boolean not null default false,
  add column if not exists team_advanced_enabled boolean not null default false,
  add column if not exists multi_site_ops_enabled boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists setup_profile_version int not null default 1;

alter table public.organisations drop constraint if exists organisations_business_profile_check;
alter table public.organisations
  add constraint organisations_business_profile_check
  check (business_profile is null or business_profile in ('simple', 'standard', 'multi_site'));

-- Grandfather existing organisations (created before business-profile ship)
update public.organisations
set
  business_profile = coalesce(business_profile, 'standard'),
  inventory_enabled = true,
  recipe_costing_enabled = true,
  team_advanced_enabled = true,
  multi_site_ops_enabled = true
where created_at < timestamptz '2026-06-20 00:00:00+00';

-- Any org with existing inventory usage should stay enabled
update public.organisations o
set
  business_profile = coalesce(o.business_profile, 'standard'),
  inventory_enabled = true,
  recipe_costing_enabled = true
where exists (
  select 1 from public.purchases p where p.organisation_id = o.id
)
or exists (
  select 1 from public.recipes r where r.organisation_id = o.id
)
or exists (
  select 1 from public.products pr
  where pr.organisation_id = o.id
    and (pr.is_ingredient = true or pr.is_stock_tracked = true)
);

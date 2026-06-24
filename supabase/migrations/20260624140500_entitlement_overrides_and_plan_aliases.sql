alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_plan_check;

alter table public.billing_subscriptions
  add constraint billing_subscriptions_plan_check
  check (plan in ('starter', 'core', 'pro', 'operations', 'scale', 'connected', 'multi_location'));

create table if not exists public.organisation_entitlement_overrides (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  entitlement_key text,
  enabled boolean not null default true,
  limit_key text,
  limit_value text,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint organisation_entitlement_overrides_key_present
    check (entitlement_key is not null or limit_key is not null),
  constraint organisation_entitlement_overrides_limit_key_check
    check (limit_key is null or limit_key in ('kitchen.screen_limit'))
);

create unique index if not exists organisation_entitlement_overrides_entitlement_uidx
  on public.organisation_entitlement_overrides (organisation_id, entitlement_key)
  where entitlement_key is not null;

create unique index if not exists organisation_entitlement_overrides_limit_uidx
  on public.organisation_entitlement_overrides (organisation_id, limit_key)
  where limit_key is not null;

create index if not exists organisation_entitlement_overrides_org_idx
  on public.organisation_entitlement_overrides (organisation_id);

alter table public.organisation_entitlement_overrides enable row level security;

drop policy if exists organisation_entitlement_overrides_select_owner on public.organisation_entitlement_overrides;
create policy organisation_entitlement_overrides_select_owner
  on public.organisation_entitlement_overrides
  for select
  using (
    exists (
      select 1
      from public.organisation_members m
      where m.organisation_id = organisation_entitlement_overrides.organisation_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
        and (m.status is null or m.status = 'active')
    )
  );

drop policy if exists organisation_entitlement_overrides_no_public_write on public.organisation_entitlement_overrides;
create policy organisation_entitlement_overrides_no_public_write
  on public.organisation_entitlement_overrides
  for all
  using (false)
  with check (false);

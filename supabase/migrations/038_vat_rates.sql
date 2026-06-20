-- 038_vat_rates.sql
-- Org-scoped VAT/TVA catalog — single source for Settings, products, and purchases.
-- Additive only. Idempotent for environments where table already exists.

create table if not exists public.vat_rates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  rate numeric not null,
  fiscalnet_vat_group int,
  is_default boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_vat_rates_org on public.vat_rates(organisation_id);
create index if not exists idx_vat_rates_org_active on public.vat_rates(organisation_id, active, sort_order);

alter table public.vat_rates enable row level security;

drop policy if exists vat_rates_select_org_members on public.vat_rates;
create policy vat_rates_select_org_members on public.vat_rates
  for select using (public.is_org_member(organisation_id));

drop policy if exists vat_rates_insert_owner_manager on public.vat_rates;
create policy vat_rates_insert_owner_manager on public.vat_rates
  for insert with check (
    public.is_org_member(organisation_id)
    and public.get_org_role(organisation_id) in ('owner', 'manager')
  );

drop policy if exists vat_rates_update_owner_manager on public.vat_rates;
create policy vat_rates_update_owner_manager on public.vat_rates
  for update using (public.is_org_owner_or_manager(organisation_id));

drop policy if exists vat_rates_delete_owner_manager on public.vat_rates;
create policy vat_rates_delete_owner_manager on public.vat_rates
  for delete using (public.is_org_owner_or_manager(organisation_id));

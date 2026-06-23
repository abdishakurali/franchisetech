-- ============================================================
-- 050_product_modifiers.sql
-- P3: Product modifier groups + options
-- Additive only. Backwards-compatible.
-- ============================================================

-- ── Modifier groups (e.g., "Milk type", "Extra shots") ───────
create table if not exists public.modifier_groups (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name            text not null,
  required        boolean not null default false,
  multiple        boolean not null default false,
  min_selections  integer not null default 0,
  max_selections  integer,
  sort_order      integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists idx_modifier_groups_org on public.modifier_groups(organisation_id, sort_order);

-- ── Modifier options (e.g., "Oat milk +1.00") ────────────────
create table if not exists public.modifier_options (
  id               uuid primary key default gen_random_uuid(),
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  name             text not null,
  price_delta      numeric(10,4) not null default 0,
  vat_rate         numeric(5,2),
  sort_order       integer not null default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

create index if not exists idx_modifier_options_group on public.modifier_options(modifier_group_id, sort_order);

-- ── Product ↔ modifier group links ───────────────────────────
create table if not exists public.product_modifier_groups (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  sort_order       integer not null default 0,
  unique (product_id, modifier_group_id)
);

create index if not exists idx_pmg_product on public.product_modifier_groups(product_id);
create index if not exists idx_pmg_group on public.product_modifier_groups(modifier_group_id);

-- ── RLS ───────────────────────────────────────────────────────
alter table public.modifier_groups enable row level security;
alter table public.modifier_options enable row level security;
alter table public.product_modifier_groups enable row level security;

-- modifier_groups: read by members, write by owner/manager
create policy "modifier_groups_select" on public.modifier_groups
  for select using (is_org_member(organisation_id));
create policy "modifier_groups_write" on public.modifier_groups
  for all using (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'))
  with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'));

create policy "modifier_options_select" on public.modifier_options
  for select using (is_org_member(organisation_id));
create policy "modifier_options_write" on public.modifier_options
  for all using (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'))
  with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'));

create policy "product_modifier_groups_select" on public.product_modifier_groups
  for select using (is_org_member(organisation_id));
create policy "product_modifier_groups_write" on public.product_modifier_groups
  for all using (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'))
  with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager'));

-- ── pos_transaction_items: add modifiers_snapshot column ─────
alter table public.pos_transaction_items
  add column if not exists modifiers_snapshot jsonb;

-- ============================================================
-- 048_delivery_integrations.sql
-- P4: Delivery aggregation (Glovo / Bolt / Tazz)
-- Additive only. Backwards-compatible.
-- ============================================================

-- ── 1. Delivery platform credentials ─────────────────────────
create table if not exists public.delivery_integrations (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  provider         text not null,  -- 'glovo' | 'bolt' | 'tazz'
  store_address_id text,
  access_token     text,           -- encrypted at rest
  refresh_token    text,           -- encrypted at rest
  token_expires_at timestamptz,
  is_active        boolean not null default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (organisation_id, provider)
);

alter table public.delivery_integrations enable row level security;

drop policy if exists "org_members_view_delivery" on public.delivery_integrations;
create policy "org_members_view_delivery"
  on public.delivery_integrations for select
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );

drop policy if exists "owner_manager_delivery" on public.delivery_integrations;
create policy "owner_manager_delivery"
  on public.delivery_integrations for all
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and role in ('owner','manager')
        and (status is null or status = 'active')
    )
  );

-- ── 2. Product mapping: provider SKU → internal product ──────
create table if not exists public.delivery_product_mappings (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  provider        text not null,
  external_sku    text not null,
  product_id      uuid not null references public.products(id) on delete cascade,
  created_at      timestamptz default now(),
  unique (organisation_id, provider, external_sku)
);

alter table public.delivery_product_mappings enable row level security;

drop policy if exists "org_members_delivery_mappings" on public.delivery_product_mappings;
create policy "org_members_delivery_mappings"
  on public.delivery_product_mappings for all
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );

-- ── 3. Extend pos_transactions ───────────────────────────────
alter table public.pos_transactions
  add column if not exists order_source text,
  add column if not exists external_order_id text;

-- Dedup guard — prevents duplicate injection from webhook retries
create unique index if not exists idx_pos_tx_external_order
  on public.pos_transactions (organisation_id, order_source, external_order_id)
  where order_source is not null;

-- ── 4. Delivery enable flag on orgs ─────────────────────────
alter table public.organisations
  add column if not exists delivery_enabled boolean default false;

-- ── 5. Indexes ───────────────────────────────────────────────
create index if not exists idx_delivery_integrations_org
  on public.delivery_integrations (organisation_id, provider);

create index if not exists idx_pos_tx_delivery
  on public.pos_transactions (organisation_id, order_source)
  where order_source is not null;

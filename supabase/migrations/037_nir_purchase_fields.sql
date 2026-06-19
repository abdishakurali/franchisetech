-- ============================================================
-- 037_nir_purchase_fields.sql
-- P1.8: NIR metadata on purchases + org-wide yearly numbering
-- Additive only. Reconciled against production 2026-06-19.
-- Atomic post via post_nir_purchase() — single transaction.
-- ============================================================

-- ── 1. NIR columns on purchases ─────────────────────────────
alter table public.purchases
  add column if not exists nir_number text,
  add column if not exists nir_date date,
  add column if not exists supplier_invoice_date date,
  add column if not exists site_id uuid,
  add column if not exists received_by_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists posted_at timestamptz,
  add column if not exists posted_by uuid references public.profiles(id) on delete set null;

-- Site must belong to same organisation (matches 033 pattern)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'purchases_site_org_fkey') then
    alter table public.purchases
      add constraint purchases_site_org_fkey
      foreign key (site_id, organisation_id)
      references public.sites(id, organisation_id);
  end if;
end $$;

-- Status: extend for draft/post workflow (prod already has 'cancelled' in data)
alter table public.purchases drop constraint if exists purchases_status_check;
alter table public.purchases
  add constraint purchases_status_check
  check (status in ('draft','received','partial','posted','cancelled'));

-- NIR number unique per organisation (null-safe for legacy rows)
create unique index if not exists idx_purchases_org_nir_number
  on public.purchases (organisation_id, nir_number)
  where nir_number is not null;

create index if not exists idx_purchases_org_nir_date
  on public.purchases (organisation_id, nir_date desc nulls last);

create index if not exists idx_purchases_org_posted
  on public.purchases (organisation_id, posted_at desc nulls last)
  where posted_at is not null;

-- ── 2. Org-wide yearly NIR sequence ─────────────────────────
create table if not exists public.nir_sequences (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  year int not null,
  last_number int not null default 0,
  primary key (organisation_id, year)
);

alter table public.nir_sequences enable row level security;

-- ── 3. Internal sequence helper (not exposed to clients) ──────
create or replace function public.next_nir_number(
  p_org_id uuid,
  p_year int
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
begin
  insert into public.nir_sequences (organisation_id, year, last_number)
  values (p_org_id, p_year, 1)
  on conflict (organisation_id, year)
  do update set last_number = nir_sequences.last_number + 1
  returning last_number into v_next;
  return v_next;
end;
$$;

revoke all on function public.next_nir_number(uuid, int) from public;
-- Callable only from post_nir_purchase (same owner, security definer).

-- ── 4. Stock movement idempotency guard (NOT EXISTS in RPC) ───
-- Unique index omitted: legacy rows may already have duplicate
-- purchase_received movements per (reference_id, product_id).
-- post_nir_purchase skips insert when a movement already exists.

-- ── 5. Atomic NIR post (number + purchase + stock + movements) ─
create or replace function public.post_nir_purchase(
  p_purchase_id uuid,
  p_org_id uuid,
  p_actor_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.purchases%rowtype;
  v_year int;
  v_seq int;
  v_nir_number text;
  v_posted_at timestamptz := now();
  v_item record;
  v_item_count int := 0;
begin
  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
    and organisation_id = p_org_id
  for update;

  if not found then
    raise exception 'PURCHASE_NOT_FOUND';
  end if;

  if v_purchase.status = 'cancelled' then
    raise exception 'PURCHASE_CANCELLED';
  end if;

  if v_purchase.status in ('posted', 'received')
     or v_purchase.posted_at is not null
     or v_purchase.nir_number is not null then
    raise exception 'ALREADY_POSTED';
  end if;

  if v_purchase.status <> 'draft' then
    raise exception 'INVALID_STATUS';
  end if;

  select count(*)::int
  into v_item_count
  from public.purchase_items pi
  where pi.purchase_id = p_purchase_id
    and pi.organisation_id = p_org_id
    and pi.product_id is not null
    and pi.quantity > 0;

  if v_item_count = 0 then
    raise exception 'NO_ITEMS';
  end if;

  v_year := extract(
    year from coalesce(v_purchase.nir_date, v_purchase.purchase_date, current_date)
  )::int;

  v_seq := public.next_nir_number(p_org_id, v_year);
  v_nir_number := 'NIR-' || v_year::text || '-' || lpad(v_seq::text, 6, '0');

  update public.purchases
  set
    status = 'posted',
    nir_number = v_nir_number,
    nir_date = coalesce(nir_date, purchase_date, current_date),
    posted_at = v_posted_at,
    posted_by = p_actor_id,
    received_by_user_id = coalesce(received_by_user_id, p_actor_id)
  where id = p_purchase_id
    and organisation_id = p_org_id;

  for v_item in
    select
      pi.product_id,
      pi.quantity,
      pi.unit_cost,
      pi.unit_of_measure
    from public.purchase_items pi
    where pi.purchase_id = p_purchase_id
      and pi.organisation_id = p_org_id
      and pi.product_id is not null
      and pi.quantity > 0
  loop
    if exists (
      select 1
      from public.stock_movements sm
      where sm.reference_id = p_purchase_id
        and sm.reference_type = 'purchase'
        and sm.movement_type = 'purchase_received'
        and sm.product_id = v_item.product_id
    ) then
      continue;
    end if;

    update public.products
    set
      current_stock_qty = coalesce(current_stock_qty, 0) + v_item.quantity,
      cost_price = v_item.unit_cost
    where id = v_item.product_id
      and organisation_id = p_org_id;

    insert into public.stock_movements (
      organisation_id,
      product_id,
      movement_type,
      quantity_change,
      unit_of_measure,
      reference_id,
      reference_type,
      performed_by,
      performed_at
    ) values (
      p_org_id,
      v_item.product_id,
      'purchase_received',
      v_item.quantity,
      coalesce(v_item.unit_of_measure, 'each'),
      p_purchase_id,
      'purchase',
      p_actor_id,
      v_posted_at
    );
  end loop;

  return jsonb_build_object(
    'purchase_id', p_purchase_id,
    'nir_number', v_nir_number,
    'posted_at', v_posted_at
  );
end;
$$;

revoke all on function public.post_nir_purchase(uuid, uuid, uuid) from public;
grant execute on function public.post_nir_purchase(uuid, uuid, uuid) to service_role;

-- NOTE: supplier invoice number uses existing purchases.invoice_number (no new column).

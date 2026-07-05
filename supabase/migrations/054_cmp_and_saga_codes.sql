-- ============================================================
-- 054_cmp_and_saga_codes.sql
-- P1: CMP stock valuation + P2: Saga import codes
--
-- 1. Replace post_nir_purchase() with rolling-CMP recalculation
-- 2. Add trigger to snapshot CMP into stock_movements.unit_cost
--    at insert time (captures cost at the moment of consumption,
--    not the current product cost — needed for audit-proof bon de consum)
-- 3. Add saga_article_code to products (cantitativ-valorică NIR linking)
-- 4. Add saga_gestiune_code to organisations (Saga gestiune routing)
-- ============================================================

-- ── 3. Saga codes ────────────────────────────────────────────
alter table public.products
  add column if not exists saga_article_code text;

alter table public.organisations
  add column if not exists saga_gestiune_code text;

-- ── 2. Trigger: snapshot CMP into stock_movements.unit_cost ──
-- Fires BEFORE INSERT so it can populate unit_cost from the
-- product's current cost_price. Skips rows that already have a
-- unit_cost (e.g., purchase_received rows set explicitly below).
create or replace function public.capture_cmp_on_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.unit_cost is null and NEW.product_id is not null then
    select cost_price into NEW.unit_cost
    from public.products
    where id = NEW.product_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_capture_cmp_on_movement on public.stock_movements;
create trigger trg_capture_cmp_on_movement
before insert on public.stock_movements
for each row execute function public.capture_cmp_on_movement();

-- ── 1. Rolling-CMP post_nir_purchase() ──────────────────────
-- Replaces the version in 037 which used last-purchase-price.
-- Now uses rolling CMP: (old_qty * old_cmp + new_qty * new_cost)
--                        / (old_qty + new_qty)
-- Locks the product row FOR UPDATE to prevent race conditions
-- when two NIRs for the same product are posted simultaneously.
-- Also writes unit_cost (supplier price) into stock_movements
-- so the purchase_received movement has an accurate cost record.
create or replace function public.post_nir_purchase(
  p_purchase_id uuid,
  p_org_id      uuid,
  p_actor_id    uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase      public.purchases%rowtype;
  v_year          int;
  v_seq           int;
  v_nir_number    text;
  v_posted_at     timestamptz := now();
  v_item          record;
  v_item_count    int := 0;
  v_old_qty       numeric;
  v_old_cost      numeric;
  v_new_cmp       numeric;
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

  v_seq        := public.next_nir_number(p_org_id, v_year);
  v_nir_number := 'NIR-' || v_year::text || '-' || lpad(v_seq::text, 6, '0');

  update public.purchases
  set
    status             = 'posted',
    nir_number         = v_nir_number,
    nir_date           = coalesce(nir_date, purchase_date, current_date),
    posted_at          = v_posted_at,
    posted_by          = p_actor_id,
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
    -- Idempotency: skip if movement already recorded for this product+purchase
    if exists (
      select 1
      from public.stock_movements sm
      where sm.reference_id   = p_purchase_id
        and sm.reference_type = 'purchase'
        and sm.movement_type  = 'purchase_received'
        and sm.product_id     = v_item.product_id
    ) then
      continue;
    end if;

    -- Lock product row for atomic CMP update
    select
      coalesce(current_stock_qty, 0),
      coalesce(cost_price, v_item.unit_cost)
    into v_old_qty, v_old_cost
    from public.products
    where id = v_item.product_id
      and organisation_id = p_org_id
    for update;

    -- Rolling CMP: if stock was zero/negative, new CMP equals this receipt's price
    if v_old_qty <= 0 then
      v_new_cmp := v_item.unit_cost;
    else
      v_new_cmp := (v_old_qty * v_old_cost + v_item.quantity * v_item.unit_cost)
                   / (v_old_qty + v_item.quantity);
    end if;

    update public.products
    set
      current_stock_qty = v_old_qty + v_item.quantity,
      cost_price        = v_new_cmp
    where id = v_item.product_id
      and organisation_id = p_org_id;

    -- Store supplier's unit_cost on the movement (not CMP — CMP is on the product)
    -- The trigger above is skipped because unit_cost is provided explicitly here.
    insert into public.stock_movements (
      organisation_id,
      product_id,
      movement_type,
      quantity_change,
      unit_cost,
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
      v_item.unit_cost,
      coalesce(v_item.unit_of_measure, 'each'),
      p_purchase_id,
      'purchase',
      p_actor_id,
      v_posted_at
    );
  end loop;

  return jsonb_build_object(
    'purchase_id', p_purchase_id,
    'nir_number',  v_nir_number,
    'posted_at',   v_posted_at
  );
end;
$$;

revoke all on function public.post_nir_purchase(uuid, uuid, uuid) from public;

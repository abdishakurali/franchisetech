-- post_nir_purchase (the stock-movement writer) currently sums
-- purchase_items.quantity — the invoiced quantity — for both the stock
-- increase and the weighted-average cost (CMP) recalculation. That is now a
-- real, live discrepancy: the NIR document (Step 1c) can correctly print
-- "received 22 of 24" while this function still takes 24 into stock and
-- prices the CMP off 24. The document and the ledger would disagree, and the
-- document is the one that gets signed.
--
-- Fix: use coalesce(received_quantity, quantity) — per purchase_items row,
-- before aggregation — as the quantity that actually enters stock and enters
-- the CMP formula. purchase_items.quantity (invoiced) is unchanged and still
-- drives the NO_ITEMS eligibility check and the unit_cost weighting, since
-- the per-unit price doesn't change based on how many units arrived.
--
-- All 367 existing purchase_items rows have received_quantity = null, so
-- coalesce(received_quantity, quantity) = quantity for every one of them:
-- this is a no-op for all data posted before today. Verified against three
-- real posted purchases (NIR-2026-000001, 000002, 000003) by recomputing
-- this exact formula from their purchase_items and comparing against the
-- unit_cost/quantity_change actually recorded in stock_movements and the
-- resulting products.cost_price — all matched exactly.
--
-- This redefinition carries forward the per-product GROUP BY aggregation
-- from 20260717233026_stock_ledger_nir_fixes.sql (a duplicate-product-line
-- fix that was live but missing from this repo until the previous commit) —
-- not 054's per-line loop, which this function no longer matches in
-- production and which this migration must not regress back to.
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
  select * into v_purchase from public.purchases where id = p_purchase_id and organisation_id = p_org_id for update;
  if not found then raise exception 'PURCHASE_NOT_FOUND'; end if;
  if v_purchase.status = 'cancelled' then raise exception 'PURCHASE_CANCELLED'; end if;
  if v_purchase.status in ('posted', 'received') or v_purchase.posted_at is not null or v_purchase.nir_number is not null then raise exception 'ALREADY_POSTED'; end if;
  if v_purchase.status <> 'draft' then raise exception 'INVALID_STATUS'; end if;

  select count(*)::int into v_item_count from public.purchase_items pi where pi.purchase_id = p_purchase_id and pi.organisation_id = p_org_id and pi.product_id is not null and pi.quantity > 0;
  if v_item_count = 0 then raise exception 'NO_ITEMS'; end if;

  v_year := extract(year from coalesce(v_purchase.nir_date, v_purchase.purchase_date, current_date))::int;
  v_seq := public.next_nir_number(p_org_id, v_year);
  v_nir_number := 'NIR-' || v_year::text || '-' || lpad(v_seq::text, 6, '0');

  update public.purchases set status = 'posted', nir_number = v_nir_number, nir_date = coalesce(nir_date, purchase_date, current_date), posted_at = v_posted_at, posted_by = p_actor_id, received_by_user_id = coalesce(received_by_user_id, p_actor_id) where id = p_purchase_id and organisation_id = p_org_id;

  for v_item in
    select
      pi.product_id,
      sum(pi.quantity)::numeric as quantity,
      sum(coalesce(pi.received_quantity, pi.quantity))::numeric as received_quantity,
      (sum(pi.quantity * pi.unit_cost) / nullif(sum(pi.quantity), 0))::numeric as unit_cost,
      max(pi.unit_of_measure) as unit_of_measure
    from public.purchase_items pi
    where pi.purchase_id = p_purchase_id and pi.organisation_id = p_org_id and pi.product_id is not null and pi.quantity > 0
    group by pi.product_id
  loop
    if exists (select 1 from public.stock_movements sm where sm.reference_id = p_purchase_id and sm.reference_type = 'purchase' and sm.movement_type = 'purchase_received' and sm.product_id = v_item.product_id) then continue; end if;

    select coalesce(current_stock_qty, 0), coalesce(cost_price, v_item.unit_cost) into v_old_qty, v_old_cost from public.products where id = v_item.product_id and organisation_id = p_org_id for update;

    if v_old_qty <= 0 then v_new_cmp := v_item.unit_cost;
    else v_new_cmp := (v_old_qty * v_old_cost + v_item.received_quantity * v_item.unit_cost) / (v_old_qty + v_item.received_quantity);
    end if;

    update public.products set current_stock_qty = v_old_qty + v_item.received_quantity, cost_price = v_new_cmp where id = v_item.product_id and organisation_id = p_org_id;

    insert into public.stock_movements (organisation_id, product_id, movement_type, quantity_change, unit_cost, unit_of_measure, reference_id, reference_type, performed_by, performed_at)
    values (p_org_id, v_item.product_id, 'purchase_received', v_item.received_quantity, v_item.unit_cost, coalesce(v_item.unit_of_measure, 'each'), p_purchase_id, 'purchase', p_actor_id, v_posted_at);
  end loop;

  return jsonb_build_object('purchase_id', p_purchase_id, 'nir_number', v_nir_number, 'posted_at', v_posted_at);
end;
$$;

revoke all on function public.post_nir_purchase(uuid, uuid, uuid) from public;

-- Step 5: Inventar (physical stock count).
--
-- A session-grouped counterpart to the single-item manual adjuster already
-- live on /app/stock (updateProductStock in app/actions/kitchenops.ts) --
-- that writes one manual_adjustment movement per ad-hoc correction with no
-- grouping or review step. This adds the ability to walk the stockroom,
-- record counted quantities across many products without committing each
-- one immediately, review the full variance list, then apply it as one
-- auditable batch.
--
-- expected_qty is captured per item AT THE MOMENT STAFF RECORDS THE COUNT
-- for that product, not once when the session starts and not re-read at
-- finalize -- a count can take the better part of an hour on a real
-- shift, and freezing "expected" at session-start would misattribute any
-- sale that happens mid-count to shrinkage. Finalizing applies the
-- resulting DELTA (counted_qty - expected_qty) on top of whatever
-- current_stock_qty is at that moment, not an absolute overwrite -- same
-- reasoning: a sale between counting an item and finalizing the session
-- must not be silently erased by the count.

create table if not exists public.inventory_counts (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id         uuid references public.sites(id),
  status          text not null default 'draft' check (status in ('draft', 'completed')),
  started_at      timestamptz not null default now(),
  started_by      uuid,
  completed_at    timestamptz,
  completed_by    uuid,
  notes           text
);

create index if not exists inventory_counts_org_status_idx
  on public.inventory_counts (organisation_id, status);

alter table public.inventory_counts enable row level security;

create policy inventory_counts_org on public.inventory_counts
  for all using (is_org_member(organisation_id));

create table if not exists public.inventory_count_items (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  inventory_count_id  uuid not null references public.inventory_counts(id) on delete cascade,
  product_id          uuid not null references public.products(id),
  -- current_stock_qty as read at the moment this item was counted -- see
  -- note above on why this is captured per-item, not per-session.
  expected_qty        numeric not null,
  counted_qty         numeric,
  unit_of_measure     text,
  counted_at          timestamptz,
  counted_by          uuid,
  unique (inventory_count_id, product_id)
);

create index if not exists inventory_count_items_count_idx
  on public.inventory_count_items (inventory_count_id);

alter table public.inventory_count_items enable row level security;

create policy inventory_count_items_org on public.inventory_count_items
  for all using (is_org_member(organisation_id));

-- Applies every counted item's variance as a manual_adjustment stock
-- movement, in one transaction, then marks the count completed. Idempotent
-- against double-submission: a count already 'completed' raises rather
-- than re-applying. Per-product row lock (FOR UPDATE) guards against a
-- sale landing between reading current_stock_qty and writing it back.
create or replace function public.finalize_inventory_count(
  p_count_id uuid,
  p_org_id   uuid,
  p_actor_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count       public.inventory_counts%rowtype;
  v_item        record;
  v_old_qty     numeric;
  v_delta       numeric;
  v_adjustments int := 0;
begin
  select * into v_count
  from public.inventory_counts
  where id = p_count_id and organisation_id = p_org_id
  for update;

  if not found then
    raise exception 'COUNT_NOT_FOUND';
  end if;

  if v_count.status = 'completed' then
    raise exception 'ALREADY_COMPLETED';
  end if;

  for v_item in
    select ici.product_id, ici.expected_qty, ici.counted_qty, ici.unit_of_measure
    from public.inventory_count_items ici
    where ici.inventory_count_id = p_count_id
      and ici.organisation_id = p_org_id
      and ici.counted_qty is not null
  loop
    v_delta := v_item.counted_qty - v_item.expected_qty;
    if v_delta <> 0 then
      select coalesce(current_stock_qty, 0) into v_old_qty
      from public.products
      where id = v_item.product_id and organisation_id = p_org_id
      for update;

      update public.products
      set current_stock_qty = v_old_qty + v_delta
      where id = v_item.product_id and organisation_id = p_org_id;

      insert into public.stock_movements (
        organisation_id, product_id, movement_type, quantity_change,
        unit_of_measure, reference_type, reference_id, reason, performed_by
      ) values (
        p_org_id, v_item.product_id, 'manual_adjustment', v_delta,
        coalesce(v_item.unit_of_measure, 'each'),
        'inventory_count', p_count_id,
        'Inventory count adjustment', p_actor_id
      );

      v_adjustments := v_adjustments + 1;
    end if;
  end loop;

  update public.inventory_counts
  set status = 'completed', completed_at = now(), completed_by = p_actor_id
  where id = p_count_id and organisation_id = p_org_id;

  return jsonb_build_object('count_id', p_count_id, 'adjustments', v_adjustments);
end;
$$;

revoke all on function public.finalize_inventory_count(uuid, uuid, uuid) from public;

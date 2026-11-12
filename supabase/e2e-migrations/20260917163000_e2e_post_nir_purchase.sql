-- Purchase draft fields and atomic NIR posting used by the isolated E2E flow.
alter table public.purchases
  add column if not exists supplier_id uuid references public.suppliers(id),
  add column if not exists supplier text,
  add column if not exists purchased_at timestamptz,
  add column if not exists supplier_invoice_date date,
  add column if not exists reference text,
  add column if not exists notes text,
  add column if not exists site_id uuid references public.sites(id),
  add column if not exists received_by_user_id uuid references public.profiles(id);

create or replace function public.post_nir_purchase(p_purchase_id uuid, p_org_id uuid, p_actor_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_purchase public.purchases;
  v_item public.purchase_items;
begin
  select * into v_purchase from public.purchases where id = p_purchase_id and organisation_id = p_org_id for update;
  if not found then raise exception 'PURCHASE_NOT_FOUND'; end if;
  if v_purchase.status <> 'draft' then raise exception 'PURCHASE_NOT_DRAFT'; end if;
  if not exists (select 1 from public.purchase_items where purchase_id = p_purchase_id and organisation_id = p_org_id) then raise exception 'PURCHASE_NO_ITEMS'; end if;

  update public.purchases set status = 'posted', posted_at = now(), posted_by = p_actor_id,
    nir_number = coalesce(nir_number, 'NIR-' || to_char(current_date, 'YYYYMMDD') || '-' || substr(p_purchase_id::text, 1, 6))
  where id = p_purchase_id;

  for v_item in select * from public.purchase_items where purchase_id = p_purchase_id and organisation_id = p_org_id loop
    update public.products
      set current_stock_qty = coalesce(current_stock_qty, 0) + coalesce(v_item.received_quantity, v_item.quantity),
          cost_price = v_item.unit_cost
      where id = v_item.product_id and organisation_id = p_org_id;
    insert into public.stock_movements (organisation_id, product_id, movement_type, quantity_change, unit_cost, unit_of_measure, reference_id, reference_type, performed_by)
      values (p_org_id, v_item.product_id, 'purchase', coalesce(v_item.received_quantity, v_item.quantity), v_item.unit_cost, v_item.unit_of_measure, p_purchase_id, 'nir_purchase', p_actor_id);
  end loop;
end;
$$;
revoke execute on function public.post_nir_purchase(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.post_nir_purchase(uuid, uuid, uuid) to service_role;

-- Invoice numbers assigned at issue from a locked per-organisation counter, and
-- storno (reversing) invoices that put stock back exactly once.
--
-- Additive only: nullable columns, one partial unique index, and a
-- CREATE OR REPLACE of issue_sales_invoice (introduced earlier today, not yet
-- used by any deployed code). Existing invoices/drafts keep their numbers.

alter table public.organisations
  add column if not exists invoice_series text,
  add column if not exists invoice_next_number bigint;

comment on column public.organisations.invoice_next_number is
  'Next invoice number handed out by issue_sales_invoice. Null = continue after the highest issued numeric number.';

alter table public.efactura_invoices
  add column if not exists storno_of uuid references public.efactura_invoices(id) on delete restrict,
  add column if not exists note text;

-- At most one storno per invoice (double click / retry cannot create two).
create unique index if not exists efactura_invoices_one_storno_uidx
  on public.efactura_invoices (organisation_id, storno_of)
  where storno_of is not null;

-- Drafts created by the app carry a placeholder number 'CIORNA-…'; the real
-- number is assigned here, under a lock on the organisation row, so numbering
-- is sequential and two simultaneous issues can never get the same number.
-- Stock: positive stockQty leaves stock (sale), negative stockQty returns it
-- (storno). Same recipe / stock-tracked rules as post_pos_document.
create or replace function public.issue_sales_invoice(
  p_org_id uuid,
  p_actor_id uuid,
  p_invoice_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.efactura_invoices;
  v_org public.organisations;
  v_line record;
  v_product public.products;
  v_recipe_id uuid;
  v_recipe_yield numeric;
  v_recipe_item record;
  v_use_qty numeric;
  v_movements integer := 0;
  v_next bigint;
  v_number text;
begin
  select * into v_inv from public.efactura_invoices
  where id = p_invoice_id and organisation_id = p_org_id
  for update;
  if not found then raise exception 'INVOICE_NOT_FOUND'; end if;

  if v_inv.issued_at is not null then
    return jsonb_build_object('invoice_id', v_inv.id, 'invoice_number', v_inv.invoice_number, 'idempotent', true, 'movements', 0);
  end if;

  if v_inv.storno_of is not null and not exists (
    select 1 from public.efactura_invoices src
    where src.id = v_inv.storno_of and src.organisation_id = p_org_id and src.issued_at is not null
  ) then
    raise exception 'STORNO_SOURCE_NOT_ISSUED';
  end if;

  v_number := v_inv.invoice_number;
  if v_number like 'CIORNA-%' then
    select * into v_org from public.organisations where id = p_org_id for update;
    v_next := v_org.invoice_next_number;
    if v_next is null then
      select coalesce(max(substring(invoice_number from '([0-9]+)$')::bigint), 0) + 1 into v_next
      from public.efactura_invoices
      where organisation_id = p_org_id and issued_at is not null
        and invoice_number ~ '[0-9]+$' and invoice_number not like 'CIORNA-%';
    end if;
    v_number := coalesce(v_org.invoice_series, '') || v_next::text;
    if exists (select 1 from public.efactura_invoices where organisation_id = p_org_id and invoice_number = v_number) then
      raise exception 'INVOICE_NUMBER_TAKEN:%', v_number;
    end if;
    update public.organisations set invoice_next_number = v_next + 1 where id = p_org_id;
  end if;

  for v_line in
    select (l->>'productId')::uuid as product_id,
           round(sum((l->>'stockQty')::numeric), 6) as qty
    from jsonb_array_elements(coalesce(v_inv.line_items, '[]'::jsonb)) l
    where nullif(l->>'productId', '') is not null
      and coalesce((l->>'stockQty')::numeric, 0) <> 0
    group by 1
  loop
    if v_line.qty = 0 then continue; end if;
    select * into v_product from public.products
    where id = v_line.product_id and organisation_id = p_org_id
    for update;
    if not found then raise exception 'INVOICE_PRODUCT_NOT_FOUND:%', v_line.product_id; end if;

    if exists (
      select 1 from public.stock_movements
      where organisation_id = p_org_id and reference_type = 'sales_invoice'
        and reference_id = v_inv.id and product_id = v_product.id
    ) then
      continue;
    end if;

    v_recipe_id := null;
    select r.id, r.yield_qty into v_recipe_id, v_recipe_yield
    from public.recipes r
    where r.organisation_id = p_org_id and r.product_id = v_product.id and r.is_active
    limit 1;

    if v_recipe_id is not null then
      for v_recipe_item in
        select ri.ingredient_product_id, ri.quantity, ri.unit_of_measure
        from public.recipe_items ri
        where ri.recipe_id = v_recipe_id and ri.ingredient_product_id is not null
      loop
        v_use_qty := round((v_recipe_item.quantity / greatest(v_recipe_yield, 1)) * v_line.qty, 6);
        update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) - v_use_qty, 6)
        where id = v_recipe_item.ingredient_product_id and organisation_id = p_org_id;
        insert into public.stock_movements (
          organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
          reason, reference_type, reference_id, performed_by
        ) values (
          p_org_id, v_recipe_item.ingredient_product_id,
          case when v_use_qty < 0 then 'invoice_return' else 'invoice_sale' end, -v_use_qty,
          coalesce(v_recipe_item.unit_of_measure, 'each'),
          'Factură ' || v_number, 'sales_invoice', v_inv.id, p_actor_id
        );
        v_movements := v_movements + 1;
      end loop;
    elsif coalesce(v_product.is_stock_tracked, false) then
      update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) - v_line.qty, 6)
      where id = v_product.id;
      insert into public.stock_movements (
        organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
        reason, reference_type, reference_id, performed_by
      ) values (
        p_org_id, v_product.id,
        case when v_line.qty < 0 then 'invoice_return' else 'invoice_sale' end, -v_line.qty,
        coalesce(v_product.unit_of_measure, 'each'),
        'Factură ' || v_number, 'sales_invoice', v_inv.id, p_actor_id
      );
      v_movements := v_movements + 1;
    end if;
  end loop;

  update public.efactura_invoices
  set invoice_number = v_number, issued_at = now(), issued_by = p_actor_id, stock_posted_at = now(), updated_at = now()
  where id = v_inv.id;

  return jsonb_build_object('invoice_id', v_inv.id, 'invoice_number', v_number, 'idempotent', false, 'movements', v_movements);
end;
$$;

revoke all on function public.issue_sales_invoice(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.issue_sales_invoice(uuid, uuid, uuid) to service_role;

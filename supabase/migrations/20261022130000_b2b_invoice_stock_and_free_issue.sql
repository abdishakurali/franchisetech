-- B2B invoices (Factură) with one-time stock deduction, plus "transfer gratuit"
-- (free stock issue) as a separate document with no revenue.
--
-- Additive only:
--   * new nullable / defaulted columns on organisations and efactura_invoices
--   * new table stock_free_issues (RLS: members read, writes only via RPC)
--   * new SECURITY DEFINER functions, service_role only
-- No existing rows are modified. Old app code ignores all of it, so an app
-- rollback is safe with this migration applied. Rollback of the schema itself:
--   drop function public.issue_sales_invoice(uuid, uuid, uuid);
--   drop function public.post_stock_free_issue(uuid, uuid, jsonb);
--   drop table public.stock_free_issues;  (only if empty / after export)
--   and the added columns (all nullable or defaulted, unused by old code).

-- ── 1. Seller details printed on the invoice ─────────────────────────────
alter table public.organisations
  add column if not exists company_reg_com text,
  add column if not exists company_share_capital text,
  add column if not exists company_county text,
  add column if not exists invoice_bank_accounts jsonb not null default '[]'::jsonb;

comment on column public.organisations.invoice_bank_accounts is
  'Bank accounts printed on invoices: [{"bank": "...", "iban": "RO..", "currency": "RON"}]';

-- ── 2. Invoice header fields from the Romanian layout + issue/stock state ──
alter table public.efactura_invoices
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists buyer_reg_com text,
  add column if not exists issuer_name text,
  add column if not exists issuer_id_doc text,
  add column if not exists delegate_name text,
  add column if not exists delegate_id_doc text,
  add column if not exists issued_at timestamptz,
  add column if not exists issued_by uuid references auth.users(id) on delete set null,
  add column if not exists stock_posted_at timestamptz;

comment on column public.efactura_invoices.issued_at is
  'Set once by issue_sales_invoice. Issued invoices are immutable and their stock has been deducted exactly once.';

-- ── 3. Issue an invoice: lock it, deduct stock once, mark issued ──────────
-- line_items entries may carry productId + stockQty (quantity already
-- converted by the app into the product''s own unit of measure). Stock rules
-- mirror post_pos_document: active recipe → deduct ingredients; otherwise a
-- stock-tracked product deducts itself; otherwise no stock movement.
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
  v_line record;
  v_product public.products;
  v_recipe_id uuid;
  v_recipe_yield numeric;
  v_recipe_item record;
  v_use_qty numeric;
  v_movements integer := 0;
begin
  select * into v_inv from public.efactura_invoices
  where id = p_invoice_id and organisation_id = p_org_id
  for update;
  if not found then raise exception 'INVOICE_NOT_FOUND'; end if;

  if v_inv.issued_at is not null then
    return jsonb_build_object('invoice_id', v_inv.id, 'invoice_number', v_inv.invoice_number, 'idempotent', true, 'movements', 0);
  end if;

  for v_line in
    select (l->>'productId')::uuid as product_id,
           round(sum((l->>'stockQty')::numeric), 6) as qty
    from jsonb_array_elements(coalesce(v_inv.line_items, '[]'::jsonb)) l
    where nullif(l->>'productId', '') is not null
      and coalesce((l->>'stockQty')::numeric, 0) > 0
    group by 1
  loop
    select * into v_product from public.products
    where id = v_line.product_id and organisation_id = p_org_id
    for update;
    if not found then raise exception 'INVOICE_PRODUCT_NOT_FOUND:%', v_line.product_id; end if;

    -- Belt and braces: never write a second movement for this invoice+product.
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
          p_org_id, v_recipe_item.ingredient_product_id, 'invoice_sale', -v_use_qty,
          coalesce(v_recipe_item.unit_of_measure, 'each'),
          'Factură ' || v_inv.invoice_number, 'sales_invoice', v_inv.id, p_actor_id
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
        p_org_id, v_product.id, 'invoice_sale', -v_line.qty,
        coalesce(v_product.unit_of_measure, 'each'),
        'Factură ' || v_inv.invoice_number, 'sales_invoice', v_inv.id, p_actor_id
      );
      v_movements := v_movements + 1;
    end if;
  end loop;

  update public.efactura_invoices
  set issued_at = now(), issued_by = p_actor_id, stock_posted_at = now(), updated_at = now()
  where id = v_inv.id;

  return jsonb_build_object('invoice_id', v_inv.id, 'invoice_number', v_inv.invoice_number, 'idempotent', false, 'movements', v_movements);
end;
$$;

revoke all on function public.issue_sales_invoice(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.issue_sales_invoice(uuid, uuid, uuid) to service_role;

-- ── 4. Transfer gratuit (free stock issue) ────────────────────────────────
create table if not exists public.stock_free_issues (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  document_number text not null,
  issue_date date not null default current_date,
  recipient_name text,
  reason text not null,
  line_items jsonb not null default '[]'::jsonb,
  total_cost numeric(15,2) not null default 0,
  idempotency_key text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organisation_id, idempotency_key),
  unique (organisation_id, document_number)
);

create index if not exists stock_free_issues_org_date_idx
  on public.stock_free_issues (organisation_id, issue_date desc);

alter table public.stock_free_issues enable row level security;

drop policy if exists "org_members_view_free_issues" on public.stock_free_issues;
create policy "org_members_view_free_issues"
  on public.stock_free_issues for select
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );
-- No insert/update/delete policies: documents are written only by
-- post_stock_free_issue (service_role) and are immutable once posted.

-- p_document: { idempotency_key, issue_date, recipient_name, reason,
--               lines: [{ productId, name, quantity, unitCode, stockQty }] }
create or replace function public.post_stock_free_issue(
  p_org_id uuid,
  p_actor_id uuid,
  p_document jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := nullif(trim(coalesce(p_document->>'idempotency_key', '')), '');
  v_reason text := nullif(trim(coalesce(p_document->>'reason', '')), '');
  v_date date := coalesce(nullif(p_document->>'issue_date', '')::date, current_date);
  v_existing public.stock_free_issues;
  v_number text;
  v_seq integer;
  v_line jsonb;
  v_product public.products;
  v_qty numeric;
  v_cost numeric;
  v_total numeric := 0;
  v_lines jsonb := '[]'::jsonb;
  v_issue_id uuid := gen_random_uuid();
begin
  if v_key is null then raise exception 'FREE_ISSUE_IDEMPOTENCY_REQUIRED'; end if;
  if v_reason is null then raise exception 'FREE_ISSUE_REASON_REQUIRED'; end if;
  if jsonb_array_length(coalesce(p_document->'lines', '[]'::jsonb)) = 0 then raise exception 'FREE_ISSUE_LINES_REQUIRED'; end if;

  select * into v_existing from public.stock_free_issues
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('free_issue_id', v_existing.id, 'document_number', v_existing.document_number, 'idempotent', true);
  end if;

  -- Serialise numbering per organisation.
  perform 1 from public.organisations where id = p_org_id for update;
  select count(*) + 1 into v_seq from public.stock_free_issues
  where organisation_id = p_org_id and extract(year from issue_date) = extract(year from v_date);
  v_number := 'TG-' || extract(year from v_date)::text || '-' || lpad(v_seq::text, 6, '0');

  for v_line in select value from jsonb_array_elements(p_document->'lines') loop
    v_qty := round(coalesce((v_line->>'stockQty')::numeric, 0), 6);
    if v_qty <= 0 then raise exception 'FREE_ISSUE_QUANTITY_INVALID'; end if;
    select * into v_product from public.products
    where id = nullif(v_line->>'productId', '')::uuid and organisation_id = p_org_id
    for update;
    if not found then raise exception 'FREE_ISSUE_PRODUCT_NOT_FOUND'; end if;

    v_cost := coalesce(v_product.cost_price, 0);
    v_total := v_total + round(v_qty * v_cost, 2);

    update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) - v_qty, 6)
    where id = v_product.id;
    insert into public.stock_movements (
      organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
      reason, reference_type, reference_id, performed_by, unit_cost
    ) values (
      p_org_id, v_product.id, 'free_issue', -v_qty, coalesce(v_product.unit_of_measure, 'each'),
      'Transfer gratuit ' || v_number || ': ' || v_reason, 'free_issue', v_issue_id, p_actor_id, v_cost
    );

    v_lines := v_lines || jsonb_build_object(
      'productId', v_product.id,
      'name', coalesce(nullif(v_line->>'name', ''), v_product.name),
      'quantity', (v_line->>'quantity')::numeric,
      'unitCode', v_line->>'unitCode',
      'stockQty', v_qty,
      'stockUnit', coalesce(v_product.unit_of_measure, 'each'),
      'unitCost', v_cost
    );
  end loop;

  insert into public.stock_free_issues (
    id, organisation_id, document_number, issue_date, recipient_name, reason,
    line_items, total_cost, idempotency_key, created_by
  ) values (
    v_issue_id, p_org_id, v_number, v_date, nullif(trim(coalesce(p_document->>'recipient_name', '')), ''),
    v_reason, v_lines, round(v_total, 2), v_key, p_actor_id
  );

  return jsonb_build_object('free_issue_id', v_issue_id, 'document_number', v_number, 'idempotent', false, 'total_cost', round(v_total, 2));
exception when unique_violation then
  select * into v_existing from public.stock_free_issues
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('free_issue_id', v_existing.id, 'document_number', v_existing.document_number, 'idempotent', true);
  end if;
  raise;
end;
$$;

revoke all on function public.post_stock_free_issue(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_stock_free_issue(uuid, uuid, jsonb) to service_role;

-- Dolce Nera single truth: additive canonical ledger and compliance controls.

alter table public.organisations
  add column if not exists compliance_enforcement_at timestamptz not null default now(),
  add column if not exists sgr_policy text not null default 'accountant_approval_required',
  add column if not exists sgr_deposit_amount numeric(12,2) not null default 0.50,
  add column if not exists sgr_vat_rate numeric(7,4) not null default 0;

update public.organisations
set compliance_enforcement_at = now() + interval '7 days'
where created_at < now();

alter table public.organisations drop constraint if exists organisations_sgr_policy_check;
alter table public.organisations add constraint organisations_sgr_policy_check
  check (sgr_policy in ('accountant_approval_required', 'outside_vat_scope', 'included_in_taxable_base'));

alter table public.vat_rates
  add column if not exists valid_from date not null default current_date,
  add column if not exists valid_to date,
  add column if not exists legal_basis text;

update public.vat_rates
set active = false,
    valid_to = coalesce(valid_to, current_date - 1),
    legal_basis = coalesce(legal_basis, 'Cotă retrasă prospectiv')
where rate = 5 and active = true;

alter table public.products
  add column if not exists vat_status text not null default 'pending',
  add column if not exists vat_source text,
  add column if not exists vat_approved_at timestamptz,
  add column if not exists vat_approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists is_sgr_deposit boolean not null default false;

alter table public.products drop constraint if exists products_vat_status_check;
alter table public.products add constraint products_vat_status_check
  check (vat_status in ('pending', 'approved', 'ambiguous', 'retired'));

-- Preserve already configured, non-retired VAT rates for existing tenants.
-- Zero and retired 5% remain review items because their legal treatment cannot
-- be inferred from the numeric value alone.
update public.products p
set vat_status = 'approved',
    vat_source = 'legacy_active_rate_match',
    vat_approved_at = now()
where p.vat_rate not in (0, 5)
  and exists (
    select 1 from public.vat_rates vr
    where vr.organisation_id = p.organisation_id
      and vr.active
      and abs(vr.rate - p.vat_rate) < 0.0001
  );

alter table public.recipes
  add column if not exists is_active boolean not null default true,
  add column if not exists version integer not null default 1,
  add column if not exists supersedes_recipe_id uuid references public.recipes(id) on delete set null,
  add column if not exists retired_at timestamptz,
  add column if not exists retired_by uuid references public.profiles(id) on delete set null;

alter table public.pos_transaction_items
  add column if not exists recipe_id uuid references public.recipes(id) on delete set null;

with ranked as (
  select id, row_number() over (
    partition by organisation_id, product_id order by updated_at desc nulls last, created_at desc, id desc
  ) as position
  from public.recipes
  where product_id is not null and is_active
)
update public.recipes r
set is_active = false, retired_at = now()
from ranked x
where r.id = x.id and x.position > 1;

create unique index if not exists recipes_one_active_product_uidx
  on public.recipes(organisation_id, product_id) where is_active and product_id is not null;

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid,
  transaction_id uuid not null references public.pos_transactions(id) on delete restrict,
  return_id uuid,
  event_type text not null check (event_type in ('captured', 'refunded')),
  method text not null check (method in ('cash', 'card', 'online', 'voucher', 'bank', 'other')),
  amount numeric(14,2) not null check (amount <> 0),
  currency text not null default 'RON',
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  performed_by uuid references public.profiles(id) on delete set null,
  unique (organisation_id, idempotency_key)
);

create table if not exists public.pos_returns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid,
  transaction_id uuid not null references public.pos_transactions(id) on delete restrict,
  return_number text not null,
  reason text not null,
  subtotal_net numeric(14,2) not null,
  vat_total numeric(14,2) not null,
  sgr_total numeric(14,2) not null default 0,
  total_gross numeric(14,2) not null,
  idempotency_key text not null,
  returned_at timestamptz not null default now(),
  returned_by uuid references public.profiles(id) on delete set null,
  unique (organisation_id, return_number),
  unique (organisation_id, idempotency_key)
);

alter table public.payment_events
  drop constraint if exists payment_events_return_id_fkey;
alter table public.payment_events
  add constraint payment_events_return_id_fkey foreign key (return_id)
  references public.pos_returns(id) on delete restrict;

create table if not exists public.pos_return_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  return_id uuid not null references public.pos_returns(id) on delete restrict,
  transaction_item_id uuid not null references public.pos_transaction_items(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  quantity numeric(14,6) not null check (quantity > 0),
  net_amount numeric(14,2) not null,
  vat_amount numeric(14,2) not null,
  sgr_amount numeric(14,2) not null default 0,
  gross_amount numeric(14,2) not null
);

create table if not exists public.repair_batches (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  repair_type text not null check (repair_type in ('vat', 'units', 'duplicates', 'orphans', 'archived_stock', 'costs', 'reorder_levels')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'running', 'completed', 'failed', 'rolled_back')),
  summary jsonb not null default '{}'::jsonb,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.repair_actions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  batch_id uuid not null references public.repair_batches(id) on delete restrict,
  entity_type text not null,
  entity_id uuid,
  action_type text not null,
  before_data jsonb,
  after_data jsonb,
  status text not null default 'pending' check (status in ('pending', 'applied', 'failed', 'skipped')),
  error_message text,
  applied_at timestamptz
);

create index if not exists payment_events_org_occurred_idx on public.payment_events(organisation_id, occurred_at desc);
create index if not exists pos_returns_org_returned_idx on public.pos_returns(organisation_id, returned_at desc);
create index if not exists pos_return_items_tx_item_idx on public.pos_return_items(transaction_item_id);
create index if not exists repair_batches_org_created_idx on public.repair_batches(organisation_id, created_at desc);
create index if not exists repair_actions_batch_idx on public.repair_actions(batch_id);

alter table public.payment_events enable row level security;
alter table public.pos_returns enable row level security;
alter table public.pos_return_items enable row level security;
alter table public.repair_batches enable row level security;
alter table public.repair_actions enable row level security;

create policy payment_events_select_org on public.payment_events for select using (public.is_org_member(organisation_id));
create policy pos_returns_select_org on public.pos_returns for select using (public.is_org_member(organisation_id));
create policy pos_return_items_select_org on public.pos_return_items for select using (public.is_org_member(organisation_id));
create policy repair_batches_select_org on public.repair_batches for select using (public.is_org_member(organisation_id));
create policy repair_actions_select_org on public.repair_actions for select using (public.is_org_member(organisation_id));

-- Clear Dolce Nera food-service output maps to the reduced HoReCa rate.
-- Mixed merchandise and raw-material categories remain blocked for accountant review.
with dolce_nera as (
  select id from public.organisations where lower(name) = lower('Dolce Nera - CoffeeShop')
), classified as (
  select p.id,
    case
      when upper(coalesce(pc.name, p.category, '')) = 'PRODUSE FINITE' then 'approved'
      when upper(p.name) = 'SGR' then 'approved'
      else 'ambiguous'
    end as status,
    case
      when upper(coalesce(pc.name, p.category, '')) = 'PRODUSE FINITE' then 11::numeric
      when upper(p.name) = 'SGR' then 0::numeric
      else p.vat_rate
    end as mapped_rate
  from public.products p
  join dolce_nera d on d.id = p.organisation_id
  left join public.product_categories pc on pc.id = p.category_id
  where p.active and p.is_sellable
)
update public.products p
set vat_status = c.status,
    vat_rate = c.mapped_rate,
    vat_source = case when c.status = 'approved' then 'dolce_nera_category_map' else 'accountant_review_queue' end,
    vat_approved_at = case when c.status = 'approved' then now() else null end,
    available_in_pos = case when c.status = 'approved' then p.available_in_pos else false end,
    is_sgr_deposit = upper(p.name) = 'SGR'
from classified c
where p.id = c.id;

create or replace function public.post_pos_document(
  p_org_id uuid,
  p_actor_id uuid,
  p_document jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := nullif(p_document->>'idempotency_key', '');
  v_site_id uuid := nullif(p_document->>'site_id', '')::uuid;
  v_session_id uuid := nullif(p_document->>'session_id', '')::uuid;
  v_transaction_id uuid;
  v_transaction_number text := nullif(p_document->>'transaction_number', '');
  v_existing public.pos_transactions%rowtype;
  v_org public.organisations%rowtype;
  v_item jsonb;
  v_payment jsonb;
  v_product public.products%rowtype;
  v_recipe_id uuid;
  v_recipe_yield numeric;
  v_recipe_item record;
  v_quantity numeric;
  v_use_qty numeric;
  v_cash numeric(14,2) := 0;
  v_total numeric(14,2) := round(coalesce((p_document->>'total')::numeric, 0), 2);
  v_paid numeric(14,2) := 0;
  v_currency text := coalesce(nullif(p_document->>'currency', ''), 'RON');
  v_stock_enabled boolean := coalesce((p_document->>'stock_depletion_enabled')::boolean, false);
begin
  if v_key is null or v_transaction_number is null then
    raise exception 'DOCUMENT_IDEMPOTENCY_REQUIRED';
  end if;

  select * into v_existing
  from public.pos_transactions
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('transaction_id', v_existing.id, 'transaction_number', v_existing.transaction_number, 'idempotent', true);
  end if;

  select * into v_org from public.organisations where id = p_org_id for update;
  if not found then raise exception 'ORGANISATION_NOT_FOUND'; end if;
  if not exists (select 1 from public.profiles where id = p_actor_id) then raise exception 'ACTOR_NOT_FOUND'; end if;
  if jsonb_array_length(coalesce(p_document->'items', '[]'::jsonb)) = 0 then raise exception 'EMPTY_DOCUMENT'; end if;
  if jsonb_array_length(coalesce(p_document->'payments', '[]'::jsonb)) = 0 then raise exception 'PAYMENT_REQUIRED'; end if;

  for v_item in select value from jsonb_array_elements(p_document->'items') loop
    select * into v_product from public.products
    where id = (v_item->>'product_id')::uuid and organisation_id = p_org_id;
    if not found or not v_product.active or not coalesce(v_product.is_sellable, false) then
      raise exception 'PRODUCT_NOT_SELLABLE:%', v_item->>'product_id';
    end if;
    if now() >= v_org.compliance_enforcement_at
       and (v_product.vat_status <> 'approved' or not coalesce(v_product.available_in_pos, false)) then
      raise exception 'PRODUCT_VAT_REVIEW_REQUIRED:%', v_product.name;
    end if;
    if abs(v_product.vat_rate - coalesce((v_item->>'vat_rate')::numeric, -999)) > 0.0001 then
      raise exception 'VAT_SNAPSHOT_MISMATCH:%', v_product.name;
    end if;
  end loop;

  for v_payment in select value from jsonb_array_elements(p_document->'payments') loop
    v_paid := v_paid + round(coalesce((v_payment->>'amount')::numeric, 0), 2);
  end loop;
  if abs(v_paid - v_total) > 0.01 then raise exception 'PAYMENT_TOTAL_MISMATCH'; end if;

  insert into public.pos_transactions (
    organisation_id, site_id, transaction_number, sold_by, payment_method_id,
    session_id, customer_name, customer_id, notes, subtotal, subtotal_net,
    tax_total, total, total_gross, tip_amount, subtotal_gross_before_discount,
    discount_total, discount_pct, status, idempotency_key
  ) values (
    p_org_id, v_site_id, v_transaction_number, p_actor_id,
    nullif(p_document->>'payment_method_id', '')::uuid, v_session_id,
    nullif(p_document->>'customer_name', ''), nullif(p_document->>'customer_id', '')::uuid,
    nullif(p_document->>'notes', ''), round((p_document->>'subtotal')::numeric, 2),
    round((p_document->>'subtotal_net')::numeric, 2), round((p_document->>'tax_total')::numeric, 2),
    v_total, v_total, round(coalesce((p_document->>'tip_amount')::numeric, 0), 2),
    round((p_document->>'subtotal_gross_before_discount')::numeric, 2),
    round(coalesce((p_document->>'discount_total')::numeric, 0), 2),
    round(coalesce((p_document->>'discount_pct')::numeric, 0), 4), 'completed', v_key
  ) returning id into v_transaction_id;

  for v_item in select value from jsonb_array_elements(p_document->'items') loop
    select r.id, r.yield_qty into v_recipe_id, v_recipe_yield
    from public.recipes r
    where r.organisation_id = p_org_id
      and r.product_id = (v_item->>'product_id')::uuid
      and r.is_active
    limit 1;

    insert into public.pos_transaction_items (
      organisation_id, site_id, transaction_id, product_id, product_name, quantity,
      unit_price, unit_price_gross, vat_rate, net_amount, vat_amount, gross_amount,
      line_total, discount_amount, discount_pct, recipe_id
    ) values (
      p_org_id, v_site_id, v_transaction_id, (v_item->>'product_id')::uuid,
      v_item->>'product_name', round((v_item->>'quantity')::numeric, 6),
      round((v_item->>'unit_price')::numeric, 2), round((v_item->>'unit_price_gross')::numeric, 2),
      (v_item->>'vat_rate')::numeric, round((v_item->>'net_amount')::numeric, 2),
      round((v_item->>'vat_amount')::numeric, 2), round((v_item->>'gross_amount')::numeric, 2),
      round((v_item->>'line_total')::numeric, 2), round(coalesce((v_item->>'discount_amount')::numeric, 0), 2),
      round(coalesce((v_item->>'discount_pct')::numeric, 0), 4), v_recipe_id
    );

    if v_stock_enabled then
      v_quantity := round((v_item->>'quantity')::numeric, 6);
      if v_recipe_id is not null then
        for v_recipe_item in
          select ri.ingredient_product_id, ri.quantity, ri.unit_of_measure
          from public.recipe_items ri where ri.recipe_id = v_recipe_id and ri.ingredient_product_id is not null
        loop
          v_use_qty := round((v_recipe_item.quantity / greatest(v_recipe_yield, 1)) * v_quantity, 6);
          update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) - v_use_qty, 6)
          where id = v_recipe_item.ingredient_product_id and organisation_id = p_org_id;
          insert into public.stock_movements (
            organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
            reference_type, reference_id, performed_by
          ) values (
            p_org_id, v_recipe_item.ingredient_product_id, 'sale_used', -v_use_qty,
            coalesce(v_recipe_item.unit_of_measure, 'each'), 'sale', v_transaction_id, p_actor_id
          );
        end loop;
      else
        select * into v_product from public.products
        where id = (v_item->>'product_id')::uuid and organisation_id = p_org_id for update;
        if coalesce(v_product.is_stock_tracked, false) then
          update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) - v_quantity, 6)
          where id = v_product.id;
          insert into public.stock_movements (
            organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
            reference_type, reference_id, performed_by
          ) values (
            p_org_id, v_product.id, 'sale_used', -v_quantity,
            coalesce(v_product.unit_of_measure, 'each'), 'sale', v_transaction_id, p_actor_id
          );
        end if;
      end if;
    end if;
  end loop;

  for v_payment in select value from jsonb_array_elements(p_document->'payments') loop
    insert into public.sale_payments (
      organisation_id, site_id, sale_id, method, payment_method_id, amount,
      currency, reference, note, metadata, created_by
    ) values (
      p_org_id, v_site_id, v_transaction_id, v_payment->>'method',
      nullif(v_payment->>'payment_method_id', '')::uuid, round((v_payment->>'amount')::numeric, 2),
      v_currency, nullif(v_payment->>'reference', ''), nullif(v_payment->>'note', ''),
      coalesce(v_payment->'metadata', '{}'::jsonb), p_actor_id
    );
    insert into public.payment_events (
      organisation_id, site_id, transaction_id, event_type, method, amount,
      currency, idempotency_key, metadata, performed_by
    ) values (
      p_org_id, v_site_id, v_transaction_id, 'captured', v_payment->>'method',
      round((v_payment->>'amount')::numeric, 2), v_currency,
      v_key || ':payment:' || coalesce(v_payment->>'sequence', '0'),
      coalesce(v_payment->'metadata', '{}'::jsonb), p_actor_id
    );
    if v_payment->>'method' = 'cash' then
      v_cash := v_cash + round((v_payment->>'amount')::numeric, 2);
    end if;
  end loop;

  if v_session_id is not null and v_cash <> 0 then
    update public.pos_sessions set expected_cash = round(coalesce(expected_cash, 0) + v_cash, 2)
    where id = v_session_id and organisation_id = p_org_id and status = 'open';
    if not found then raise exception 'OPEN_SESSION_NOT_FOUND'; end if;
    insert into public.pos_cash_movements (
      organisation_id, site_id, session_id, movement_type, amount, reason, performed_by, idempotency_key
    ) values (
      p_org_id, v_site_id, v_session_id, 'sale', v_cash,
      'Vânzare ' || v_transaction_number, p_actor_id, v_key || ':cash'
    );
  end if;

  insert into public.pos_audit_events (
    organisation_id, transaction_id, event_type, after_data, performed_by
  ) values (
    p_org_id, v_transaction_id, 'created',
    jsonb_build_object('idempotency_key', v_key, 'source', 'post_pos_document'), p_actor_id
  );

  return jsonb_build_object('transaction_id', v_transaction_id, 'transaction_number', v_transaction_number, 'idempotent', false);
exception when unique_violation then
  select * into v_existing from public.pos_transactions
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('transaction_id', v_existing.id, 'transaction_number', v_existing.transaction_number, 'idempotent', true);
  end if;
  raise;
end;
$$;

revoke all on function public.post_pos_document(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_pos_document(uuid, uuid, jsonb) to service_role;

create or replace function public.post_pos_return(
  p_org_id uuid,
  p_actor_id uuid,
  p_document jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := nullif(p_document->>'idempotency_key', '');
  v_transaction_id uuid := nullif(p_document->>'transaction_id', '')::uuid;
  v_site_id uuid := nullif(p_document->>'site_id', '')::uuid;
  v_session_id uuid := nullif(p_document->>'session_id', '')::uuid;
  v_return_id uuid;
  v_existing public.pos_returns%rowtype;
  v_line jsonb;
  v_item public.pos_transaction_items%rowtype;
  v_product public.products%rowtype;
  v_product_found boolean;
  v_recipe_item record;
  v_quantity numeric(14,6);
  v_already_returned numeric(14,6);
  v_ratio numeric;
  v_net numeric(14,2);
  v_vat numeric(14,2);
  v_gross numeric(14,2);
  v_sgr numeric(14,2);
  v_net_total numeric(14,2) := 0;
  v_vat_total numeric(14,2) := 0;
  v_gross_total numeric(14,2) := 0;
  v_sgr_total numeric(14,2) := 0;
  v_method text := coalesce(nullif(p_document->>'method', ''), 'other');
  v_currency text := coalesce(nullif(p_document->>'currency', ''), 'RON');
begin
  if v_key is null or v_transaction_id is null then raise exception 'RETURN_IDEMPOTENCY_REQUIRED'; end if;
  select * into v_existing from public.pos_returns
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('return_id', v_existing.id, 'return_number', v_existing.return_number, 'idempotent', true);
  end if;
  if not exists (
    select 1 from public.pos_transactions
    where id = v_transaction_id and organisation_id = p_org_id and status <> 'voided'
  ) then raise exception 'TRANSACTION_NOT_RETURNABLE'; end if;
  if jsonb_array_length(coalesce(p_document->'lines', '[]'::jsonb)) = 0 then raise exception 'RETURN_LINES_REQUIRED'; end if;

  insert into public.pos_returns (
    organisation_id, site_id, transaction_id, return_number, reason,
    subtotal_net, vat_total, sgr_total, total_gross, idempotency_key, returned_by
  ) values (
    p_org_id, v_site_id, v_transaction_id, p_document->>'return_number', p_document->>'reason',
    0, 0, 0, 0, v_key, p_actor_id
  ) returning id into v_return_id;

  for v_line in select value from jsonb_array_elements(p_document->'lines') loop
    select * into v_item from public.pos_transaction_items
    where id = (v_line->>'transaction_item_id')::uuid
      and transaction_id = v_transaction_id and organisation_id = p_org_id;
    if not found then raise exception 'RETURN_ITEM_NOT_FOUND'; end if;
    v_quantity := round((v_line->>'quantity')::numeric, 6);
    select coalesce(sum(quantity), 0) into v_already_returned
    from public.pos_return_items where transaction_item_id = v_item.id;
    if v_quantity <= 0 or v_already_returned + v_quantity > v_item.quantity then
      raise exception 'RETURN_QUANTITY_EXCEEDED:%', v_item.product_name;
    end if;

    v_ratio := v_quantity / v_item.quantity;
    v_net := round(coalesce(v_item.net_amount, 0) * v_ratio, 2);
    v_vat := round(coalesce(v_item.vat_amount, 0) * v_ratio, 2);
    v_gross := round(coalesce(v_item.gross_amount, v_item.line_total) * v_ratio, 2);
    select * into v_product from public.products
    where id = v_item.product_id and organisation_id = p_org_id;
    v_product_found := found;
    v_sgr := case when v_product_found and v_product.is_sgr_deposit then v_gross else 0 end;

    insert into public.pos_return_items (
      organisation_id, return_id, transaction_item_id, product_id, quantity,
      net_amount, vat_amount, sgr_amount, gross_amount
    ) values (
      p_org_id, v_return_id, v_item.id, v_item.product_id, v_quantity,
      v_net, v_vat, v_sgr, v_gross
    );
    v_net_total := v_net_total + v_net;
    v_vat_total := v_vat_total + v_vat;
    v_gross_total := v_gross_total + v_gross;
    v_sgr_total := v_sgr_total + v_sgr;

    if v_item.recipe_id is not null then
      for v_recipe_item in
        select ri.ingredient_product_id, ri.quantity, ri.unit_of_measure, r.yield_qty
        from public.recipe_items ri
        join public.recipes r on r.id = ri.recipe_id
        where ri.recipe_id = v_item.recipe_id and ri.ingredient_product_id is not null
      loop
        update public.products
        set current_stock_qty = round(coalesce(current_stock_qty, 0)
          + (v_recipe_item.quantity / greatest(v_recipe_item.yield_qty, 1)) * v_quantity, 6)
        where id = v_recipe_item.ingredient_product_id and organisation_id = p_org_id;
        insert into public.stock_movements (
          organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
          reference_type, reference_id, performed_by
        ) values (
          p_org_id, v_recipe_item.ingredient_product_id, 'return',
          round((v_recipe_item.quantity / greatest(v_recipe_item.yield_qty, 1)) * v_quantity, 6),
          coalesce(v_recipe_item.unit_of_measure, 'each'), 'return', v_return_id, p_actor_id
        );
      end loop;
    elsif v_product_found and coalesce(v_product.is_stock_tracked, false) then
      update public.products set current_stock_qty = round(coalesce(current_stock_qty, 0) + v_quantity, 6)
      where id = v_product.id;
      insert into public.stock_movements (
        organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
        reference_type, reference_id, performed_by
      ) values (
        p_org_id, v_product.id, 'return', v_quantity, coalesce(v_product.unit_of_measure, 'each'),
        'return', v_return_id, p_actor_id
      );
    end if;
  end loop;

  update public.pos_returns set subtotal_net = v_net_total, vat_total = v_vat_total,
    sgr_total = v_sgr_total, total_gross = v_gross_total where id = v_return_id;
  insert into public.payment_events (
    organisation_id, site_id, transaction_id, return_id, event_type, method,
    amount, currency, idempotency_key, metadata, performed_by
  ) values (
    p_org_id, v_site_id, v_transaction_id, v_return_id, 'refunded', v_method,
    -v_gross_total, v_currency, v_key || ':payment', '{}'::jsonb, p_actor_id
  );

  if v_method = 'cash' and v_session_id is not null then
    update public.pos_sessions set expected_cash = round(coalesce(expected_cash, 0) - v_gross_total, 2)
    where id = v_session_id and organisation_id = p_org_id and status = 'open';
    if not found then raise exception 'OPEN_SESSION_NOT_FOUND'; end if;
    insert into public.pos_cash_movements (
      organisation_id, site_id, session_id, movement_type, amount, reason, performed_by, idempotency_key
    ) values (
      p_org_id, v_site_id, v_session_id, 'refund', -v_gross_total,
      'Retur ' || (p_document->>'return_number'), p_actor_id, v_key || ':cash'
    );
  end if;

  if not exists (
    select 1
    from public.pos_transaction_items i
    where i.transaction_id = v_transaction_id
      and coalesce((select sum(ri.quantity) from public.pos_return_items ri where ri.transaction_item_id = i.id), 0) < i.quantity
  ) then
    update public.pos_transactions set status = 'refunded' where id = v_transaction_id;
  end if;

  insert into public.pos_audit_events (
    organisation_id, transaction_id, event_type, reason, after_data, performed_by
  ) values (
    p_org_id, v_transaction_id, 'refunded', p_document->>'reason',
    jsonb_build_object('return_id', v_return_id, 'total', v_gross_total, 'sgr_total', v_sgr_total), p_actor_id
  );
  return jsonb_build_object('return_id', v_return_id, 'return_number', p_document->>'return_number', 'total', v_gross_total, 'idempotent', false);
exception when unique_violation then
  select * into v_existing from public.pos_returns where organisation_id = p_org_id and idempotency_key = v_key;
  if found then return jsonb_build_object('return_id', v_existing.id, 'return_number', v_existing.return_number, 'idempotent', true); end if;
  raise;
end;
$$;

revoke all on function public.post_pos_return(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_pos_return(uuid, uuid, jsonb) to service_role;

create or replace view public.canonical_sales_lines
with (security_invoker = true) as
select
  t.organisation_id, t.site_id, t.id as transaction_id, i.id as transaction_item_id,
  t.transaction_number, t.sold_at, t.sold_by, t.status,
  i.product_id, i.product_name, i.quantity,
  coalesce(i.net_amount, i.gross_amount / (1 + coalesce(i.vat_rate, 0) / 100)) as net_amount,
  coalesce(i.vat_amount, i.gross_amount - i.gross_amount / (1 + coalesce(i.vat_rate, 0) / 100)) as vat_amount,
  coalesce(i.gross_amount, i.line_total) as gross_amount,
  coalesce(i.vat_rate, 0) as vat_rate,
  1::smallint as direction
from public.pos_transactions t
join public.pos_transaction_items i on i.transaction_id = t.id and i.organisation_id = t.organisation_id
where t.status in ('completed', 'refunded')
union all
select
  r.organisation_id, r.site_id, r.transaction_id, ri.transaction_item_id,
  r.return_number, r.returned_at, r.returned_by, 'returned',
  ri.product_id, i.product_name, -ri.quantity,
  -ri.net_amount, -ri.vat_amount, -ri.gross_amount, coalesce(i.vat_rate, 0), -1::smallint
from public.pos_returns r
join public.pos_return_items ri on ri.return_id = r.id and ri.organisation_id = r.organisation_id
join public.pos_transaction_items i on i.id = ri.transaction_item_id;

create or replace view public.canonical_payment_events
with (security_invoker = true) as
select organisation_id, site_id, transaction_id, return_id, event_type, method,
  amount, currency, idempotency_key, occurred_at, performed_by
from public.payment_events;

create or replace view public.canonical_stock_balances
with (security_invoker = true) as
select p.organisation_id, p.id as product_id, p.name, p.unit_of_measure,
  round(coalesce(sum(m.quantity_change), 0), 6) as ledger_quantity,
  round(coalesce(p.current_stock_qty, 0), 6) as recorded_quantity,
  round(coalesce(p.current_stock_qty, 0) - coalesce(sum(m.quantity_change), 0), 6) as variance,
  p.cost_price, p.reorder_level, p.active
from public.products p
left join public.stock_movements_reconciled m
  on m.organisation_id = p.organisation_id and m.product_id = p.id
group by p.organisation_id, p.id;

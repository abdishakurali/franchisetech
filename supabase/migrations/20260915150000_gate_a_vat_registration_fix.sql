-- Gate A: Dolce Nera is confirmed not VAT-registered (anaf_vat_registered = false).
--
-- Root cause: the vat_rates catalog (21% active+is_default, 11% active) was
-- configured independently of anaf_vat_registered, so 62 products carried a
-- non-zero VAT rate (42 at 21%, 20 at 11%) for a business that isn't
-- registered to charge it. Application-level validation (resolveSubmittedVatRate,
-- the CSV import path) is fixed in this commit's app code; this migration
-- fixes the data those code paths already produced, and adds two triggers so
-- the catalog and the products table cannot drift back into this state.
--
-- Deliberately untouched: pos_transaction_items. Those rows are receipts —
-- they record what was actually charged at the time, right or wrong, and a
-- receipt does not get rewritten after the fact. This migration corrects the
-- catalog and the current product configuration going forward, not history.

-- ── 1. Fix Dolce Nera's data, with a full audit trail ──────────────────────
-- Reuses the existing repair_batches/repair_actions pattern (the same one
-- app/actions/kitchenops.ts's approveProductVat uses for a single manual
-- correction) so this bulk fix shows up in /app/settings/data-repair like
-- any other VAT repair, not as an untraceable UPDATE.
do $$
declare
  v_org_id constant uuid := 'b01ce0e0-d01c-4042-0000-000000000042';
  v_batch_id uuid;
  v_products_before int;
  v_products_after int;
  v_vat_rates_before jsonb;
  v_vat_rates_after jsonb;
begin
  select count(*) into v_products_before from products where organisation_id = v_org_id and vat_rate <> 0;
  select jsonb_agg(jsonb_build_object('name', name, 'rate', rate, 'active', active, 'is_default', is_default) order by sort_order)
    into v_vat_rates_before
    from vat_rates where organisation_id = v_org_id;

  raise notice 'Gate A fix — BEFORE: % products with non-zero VAT; vat_rates catalog: %', v_products_before, v_vat_rates_before;

  insert into repair_batches (organisation_id, repair_type, status, summary, created_at)
  values (
    v_org_id,
    'vat',
    'running',
    jsonb_build_object(
      'source', 'gate_a_vat_registration_fix',
      'reason', 'org confirmed not VAT-registered (anaf_vat_registered = false); vat_rates catalog previously configured independently of this',
      'products_affected', v_products_before
    ),
    now()
  )
  returning id into v_batch_id;

  insert into repair_actions (organisation_id, batch_id, entity_type, entity_id, action_type, before_data, after_data, status, applied_at)
  select
    v_org_id,
    v_batch_id,
    'product',
    id,
    'zero_vat_unregistered_org',
    jsonb_build_object('vat_rate', vat_rate, 'vat_status', vat_status, 'vat_source', vat_source),
    jsonb_build_object('vat_rate', 0, 'vat_status', 'approved', 'vat_source', 'gate_a_vat_registration_fix'),
    'applied',
    now()
  from products
  where organisation_id = v_org_id and vat_rate <> 0;

  update products
  set vat_rate = 0,
      vat_status = 'approved',
      vat_source = 'gate_a_vat_registration_fix',
      vat_approved_at = now(),
      vat_approved_by = null
  where organisation_id = v_org_id and vat_rate <> 0;

  -- Catalog: deactivate the non-zero rates (kept, not deleted — the rate
  -- definitions themselves are still correct, they're just not usable while
  -- unregistered), and make 0% the active default. Zeroing products alone
  -- and leaving 21% as is_default would leave every future blank-VAT CSV
  -- row landing right back on 21% via the org-default fallback.
  update vat_rates
  set active = false,
      is_default = false
  where organisation_id = v_org_id and rate <> 0 and (active or is_default);

  update vat_rates
  set active = true,
      is_default = true
  where organisation_id = v_org_id and rate = 0;

  update repair_batches set status = 'completed', completed_at = now() where id = v_batch_id;

  select count(*) into v_products_after from products where organisation_id = v_org_id and vat_rate <> 0;
  select jsonb_agg(jsonb_build_object('name', name, 'rate', rate, 'active', active, 'is_default', is_default) order by sort_order)
    into v_vat_rates_after
    from vat_rates where organisation_id = v_org_id;

  raise notice 'Gate A fix — AFTER: % products with non-zero VAT; vat_rates catalog: %', v_products_after, v_vat_rates_after;

  if v_products_after <> 0 then
    raise exception 'Gate A fix did not zero all non-zero-VAT products for org %: % remain', v_org_id, v_products_after;
  end if;
end $$;

-- ── 2. Close it permanently: products cannot carry a non-zero VAT rate for
--      an unregistered RO org, no matter which code path writes it. A plain
--      CHECK constraint can't reach the organisations row, hence a trigger. ──
create or replace function enforce_vat_registration_on_products()
returns trigger
language plpgsql
as $trigger$
declare
  v_country_code text;
  v_registered boolean;
begin
  if NEW.vat_rate is null or NEW.vat_rate = 0 then
    return NEW;
  end if;

  select country_code, anaf_vat_registered into v_country_code, v_registered
  from organisations
  where id = NEW.organisation_id;

  if upper(coalesce(v_country_code, '')) = 'RO' and coalesce(v_registered, false) is not true then
    raise exception 'Cannot set a non-zero VAT rate (%) on product % — organisation % is not VAT-registered (ANAF).',
      NEW.vat_rate, coalesce(NEW.name, NEW.id::text), NEW.organisation_id
      using errcode = '23514'; -- check_violation
  end if;

  return NEW;
end;
$trigger$;

drop trigger if exists trg_enforce_vat_registration_products on products;
create trigger trg_enforce_vat_registration_products
before insert or update of vat_rate, organisation_id on products
for each row
execute function enforce_vat_registration_on_products();

-- ── 3. Close it permanently: the catalog itself cannot hold a non-zero rate
--      marked active or is_default for an unregistered RO org — the actual
--      root cause of this whole bug. Scoped to RO/ANAF only: anaf_vat_registered
--      has no meaning for other countries (e.g. IE's 23%/13.5%/9%/0% catalog
--      is untouched by this). ──
create or replace function enforce_vat_registration_on_vat_rates()
returns trigger
language plpgsql
as $trigger$
declare
  v_country_code text;
  v_registered boolean;
begin
  if NEW.rate = 0 or (coalesce(NEW.active, false) is not true and coalesce(NEW.is_default, false) is not true) then
    return NEW;
  end if;

  select country_code, anaf_vat_registered into v_country_code, v_registered
  from organisations
  where id = NEW.organisation_id;

  if upper(coalesce(v_country_code, '')) = 'RO' and coalesce(v_registered, false) is not true then
    raise exception 'Cannot mark VAT rate % (%) active/default — organisation % is not VAT-registered (ANAF).',
      NEW.rate, coalesce(NEW.name, ''), NEW.organisation_id
      using errcode = '23514'; -- check_violation
  end if;

  return NEW;
end;
$trigger$;

drop trigger if exists trg_enforce_vat_registration_vat_rates on vat_rates;
create trigger trg_enforce_vat_registration_vat_rates
before insert or update of rate, active, is_default, organisation_id on vat_rates
for each row
execute function enforce_vat_registration_on_vat_rates();

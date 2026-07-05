-- Historical stock-movement reconciliation layer.
--
-- Some organisations (starting with Dolce Nera - CoffeeShop) had periods where
-- recipe-driven ingredient consumption was not recorded in stock_movements at
-- the time of sale (migration bulk-imports bypassing the deduction code path,
-- broken recipe_items.ingredient_product_id links, or transient errors).
--
-- We do not backfill stock_movements itself with reconstructed rows -- that
-- table represents what was actually observed/recorded at the time, and
-- rewriting it would make estimates indistinguishable from real POS-driven
-- deductions. Instead, reconstructed entries live in their own table, and a
-- view unions both for reporting so a single query produces the complete,
-- accurate picture without touching the original ledger.

create table if not exists stock_movement_reconciliations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  product_id uuid not null references products(id),
  movement_type text not null check (movement_type in ('purchase_received','sale_used','manual_adjustment','wastage','return','opening')),
  quantity_change numeric not null,
  unit_of_measure text,
  unit_cost numeric,
  reference_type text,
  reference_id uuid,
  batch_id text not null,
  reason text not null,
  performed_at timestamptz not null,
  performed_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists stock_movement_reconciliations_org_idx on stock_movement_reconciliations (organisation_id);
create index if not exists stock_movement_reconciliations_batch_idx on stock_movement_reconciliations (batch_id);
create index if not exists stock_movement_reconciliations_product_idx on stock_movement_reconciliations (product_id);

alter table stock_movement_reconciliations enable row level security;

create policy stock_movement_reconciliations_select on stock_movement_reconciliations
  for select using (
    organisation_id in (select organisation_members.organisation_id from organisation_members where organisation_members.user_id = auth.uid())
  );

create policy stock_movement_reconciliations_insert on stock_movement_reconciliations
  for insert with check (
    organisation_id in (select organisation_members.organisation_id from organisation_members where organisation_members.user_id = auth.uid())
  );

-- Unified reporting view: real observed movements + reconciled/reconstructed
-- entries, explicitly tagged by `source` so any report can filter, group by,
-- or simply trust the total.
create or replace view stock_movements_reconciled as
select
  id, organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
  unit_cost, reference_type, reference_id, reason, performed_by, performed_at,
  'observed'::text as source, null::text as batch_id
from stock_movements
union all
select
  id, organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
  unit_cost, reference_type, reference_id, reason, performed_by, performed_at,
  'reconciled'::text as source, batch_id
from stock_movement_reconciliations;

-- Without this, Postgres checks the underlying tables' RLS as the view
-- OWNER (postgres, which bypasses RLS) instead of the querying user --
-- silently leaking every organisation's rows through the view. Required
-- whenever a view sits on top of RLS-protected tables.
alter view stock_movements_reconciled set (security_invoker = true);

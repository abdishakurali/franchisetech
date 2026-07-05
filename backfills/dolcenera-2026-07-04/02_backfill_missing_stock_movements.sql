-- Dolce Nera (org b01ce0e0-d01c-4042-0000-000000000042) historical reconciliation
-- Step 2 of 2: backfill missing sale-driven ingredient consumption.
--
-- BATCH_ID = 'dolcenera-backfill-20260704-01'
--
-- APPLIED 2026-07-04, into the isolated `stock_movement_reconciliations`
-- table (created by supabase/migrations/20260704150000_stock_movement_reconciliations.sql),
-- NOT into `stock_movements` itself. `stock_movements` is untouched --
-- every row inserted here is additional, in its own table, and clearly
-- attributed via batch_id and reason. A view, `stock_movements_reconciled`,
-- unions both tables so reports read one consolidated number without the
-- original observed ledger ever being rewritten.
--
-- Result: 12,138 rows inserted, net -11,390.62 units, net value -7,956.64 RON.
-- Confirmed against snapshot_stock_movements_before.json + the dry-run count
-- from before the insert -- exact match.
--
-- Root causes covered by this single reconciliation (all three land in the
-- same "expected vs actual" gap, computed per (transaction, ingredient)):
--   1. 2,147 historical transactions bulk-imported from Odoo on 2026-06-09
--      17:07-17:13 never ran through the live sale-completion code path
--      (app/actions/kitchenops.ts), so zero stock_movements were ever created
--      for them.
--   2. The 9 orphaned ingredient links fixed in 01_fix_recipe_ingredient_links.sql
--      caused every live sale of the 14 affected recipes since 2026-06-09 to
--      skip that one ingredient's deduction. (Fixed going forward.)
--   3. A handful of scattered live transactions show zero stock_movements at
--      all for the whole sale -- traced to `.single()` throwing inside the
--      outer try/catch in kitchenops.ts and aborting the whole cart's
--      deduction loop. Fixed in the same commit as this reconciliation
--      (per-ingredient try/catch isolation + error logging).
--
-- Quantities are computed strictly from data that exists today: each
-- product's CURRENT recipe (recipe_items.quantity / yield_qty) applied to
-- the ACTUAL historical sale quantity from pos_transaction_items. We have no
-- historical recipe snapshots (the migration didn't carry recipe versioning),
-- so this is the best available reconstruction, not a guarantee that the
-- recipe was identical on every past date -- see README_ACCOUNTANT_RECONCILIATION.md.

with org as (select 'b01ce0e0-d01c-4042-0000-000000000042'::uuid as id),
sold as (
  select i.transaction_id, i.product_id, t.created_at, sum(i.quantity) as qty_sold
  from pos_transaction_items i
  join pos_transactions t on t.id = i.transaction_id
  join org on t.organisation_id = org.id
  group by i.transaction_id, i.product_id, t.created_at
),
recipe_map as (
  select r.product_id, r.yield_qty, ri.ingredient_product_id, ri.quantity as ri_qty, ri.unit_of_measure
  from recipes r
  join recipe_items ri on ri.recipe_id = r.id
  join org on r.organisation_id = org.id
  where ri.ingredient_product_id is not null
),
expected as (
  select s.transaction_id, s.created_at, rm.ingredient_product_id,
         sum((rm.ri_qty / greatest(rm.yield_qty,1)) * s.qty_sold) as expected_qty,
         max(rm.unit_of_measure) as unit_of_measure
  from sold s
  join recipe_map rm on rm.product_id = s.product_id
  group by s.transaction_id, s.created_at, rm.ingredient_product_id
),
existing as (
  select reference_id as transaction_id, product_id, sum(-quantity_change) as existing_qty
  from stock_movements sm join org on sm.organisation_id = org.id
  where sm.movement_type = 'sale_used' and sm.reference_type = 'sale'
  group by reference_id, product_id
),
missing as (
  select e.transaction_id, e.created_at, e.ingredient_product_id, e.unit_of_measure,
         (e.expected_qty - coalesce(x.existing_qty,0)) as missing_qty
  from expected e
  left join existing x on x.transaction_id = e.transaction_id and x.product_id = e.ingredient_product_id
  where (e.expected_qty - coalesce(x.existing_qty,0)) > 0.0001
)
insert into stock_movement_reconciliations (organisation_id, product_id, movement_type, quantity_change, unit_of_measure, reason, reference_type, reference_id, batch_id, performed_by, performed_at, unit_cost)
select
  'b01ce0e0-d01c-4042-0000-000000000042',
  m.ingredient_product_id,
  'sale_used',
  -m.missing_qty,
  coalesce(m.unit_of_measure, 'each'),
  'Historical reconciliation: reconstructed from current recipe ratio x actual historical sale quantity. Original deduction failed due to bulk-migration import bypassing deduction code, broken ingredient link (fixed 2026-07-04), or a transient error (logging added 2026-07-04).',
  'sale',
  m.transaction_id,
  'dolcenera-backfill-20260704-01',
  'b40cba2c-3037-44a8-8578-f7f0fe72cc00',
  m.created_at,
  p.cost_price
from missing m
left join products p on p.id = m.ingredient_product_id
returning id;

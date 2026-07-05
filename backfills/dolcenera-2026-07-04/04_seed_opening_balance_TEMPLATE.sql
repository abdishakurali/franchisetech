-- TEMPLATE — do not run as-is. Fill in real counted quantities from the
-- physical inventariere (OMFP 2861/2009) before executing, and only after
-- the inventory commission's proces-verbal is signed off.
--
-- This seeds each ingredient's opening balance ONCE. The unique index added
-- in supabase/migrations/20260705000000_opening_balance_guard.sql makes a
-- second accidental run fail loudly (constraint violation) instead of
-- silently double-counting -- do not work around that constraint.
--
-- HOW TO USE:
-- 1. Replace the VALUES rows below with the physical count: product name (must
--    match products.name exactly, or use the product's id directly), counted
--    quantity, and the count date (the day the physical inventariere happened).
-- 2. Run the "pre-flight check" SELECT first and confirm every row resolves
--    to exactly one product_id with no NULLs before running the INSERT.
-- 3. Run the INSERT. If any product already has an opening entry, the whole
--    statement fails (atomic) rather than partially applying -- fix the
--    duplicate and re-run.

-- ── Pre-flight check: run this FIRST, confirm zero problem rows ──────────
with counted(product_name, counted_qty) as (
  values
  -- ('CAFEA PRAJITA - BREZZA DI BARI 1KG', 3.5),
  -- ('LAPTE BIO UHT', 12.0),
  ('__REPLACE_ME__', 0.0)
)
select
  c.product_name,
  c.counted_qty,
  p.id as resolved_product_id,
  (select count(*) from stock_movement_reconciliations smr
   where smr.product_id = p.id and smr.movement_type = 'opening') as existing_opening_entries
from counted c
left join products p on p.name = c.product_name and p.organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
order by c.product_name;
-- Expect: every row has a non-null resolved_product_id and
-- existing_opening_entries = 0. If not, fix before proceeding.

-- ── Actual insert (uncomment and fill in only after the pre-flight check passes) ──
-- with counted(product_name, counted_qty, count_date) as (
--   values
--   ('CAFEA PRAJITA - BREZZA DI BARI 1KG', 3.5, '2026-07-10'::date),
--   ('LAPTE BIO UHT', 12.0, '2026-07-10'::date)
-- )
-- insert into stock_movement_reconciliations
--   (organisation_id, product_id, movement_type, quantity_change, unit_of_measure, reason, reference_type, batch_id, performed_by, performed_at, unit_cost)
-- select
--   'b01ce0e0-d01c-4042-0000-000000000042',
--   p.id,
--   'opening',
--   c.counted_qty,
--   coalesce(p.unit_of_measure, 'each'),
--   'Opening balance from physical inventariere (OMFP 2861/2009), proces-verbal dated ' || c.count_date::text || '. One-time seed, not a recurring movement.',
--   'inventariere',
--   'dolcenera-opening-balance-' || c.count_date::text,
--   '<REPLACE WITH REAL performed_by user id>',
--   c.count_date::timestamptz,
--   p.cost_price
-- from counted c
-- join products p on p.name = c.product_name and p.organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
-- returning id, product_id, quantity_change;

-- ── Verification: run after the insert ────────────────────────────────────
-- select count(*) from stock_movement_reconciliations
-- where organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042' and movement_type = 'opening';

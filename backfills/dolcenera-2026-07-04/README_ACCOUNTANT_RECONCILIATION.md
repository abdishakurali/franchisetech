# Dolce Nera — Stock Consumption Reconciliation (for accountant)

**Org**: Dolce Nera - CoffeeShop (id `b01ce0e0-d01c-4042-0000-000000000042`), franchisetech app
**Prepared**: 2026-07-04
**Covers**: 2026-06-09 (app go-live) through 2026-07-04

## What this is

Between go-live and today, the app's automatic ingredient-consumption tracking
(deducting recipe ingredients from stock every time a product is sold) failed
to record consumption for a portion of sales, for three separate reasons:

1. **2,147 historical sales**, bulk-imported from the previous system (Odoo) on
   2026-06-09 in a single batch, were inserted directly into the sales tables
   and never ran through the code path that deducts ingredients — so none of
   their ingredient consumption was ever recorded.
2. **9 ingredient products** (mostly coffee bean varieties) had a broken
   database link in 14 recipes, causing every live sale of those 14 drinks to
   silently skip deducting that one ingredient. **This has been fixed in the
   live system as of 2026-07-04** — it will not recur going forward.
3. A **small number of individual sales** (roughly 100, scattered across
   several days) failed to record any consumption at all, for a cause not
   fully pinned down from the data (an intermittent error in the recording
   step). Error logging has been added so any future occurrence is visible
   instead of silent.

## How this was applied (updated 2026-07-04)

We did **not** insert reconstructed rows directly into `stock_movements` —
that table stays exactly as originally observed/recorded, so it always
remains possible to tell what the POS actually did versus what was
reconstructed afterward. Instead:

- A new table, `stock_movement_reconciliations`, holds the 12,138
  reconstructed rows, each tagged with `batch_id = 'dolcenera-backfill-20260704-01'`
  and a `reason` explaining why it exists.
- A view, `stock_movements_reconciled`, unions `stock_movements` (tagged
  `source = 'observed'`) with `stock_movement_reconciliations` (tagged
  `source = 'reconciled'`) — this is the **one single source reports now
  read from** (`lib/ro-accounting/stock-movements.ts`, and the per-product
  stock history on the product detail page), so Raport de Gestiune and every
  other report reflect the complete, corrected picture automatically.
- Migration: `supabase/migrations/20260704150000_stock_movement_reconciliations.sql`.
- Rollback: `03_rollback.sql` (batch-level delete, or full mechanism teardown).

This gives one consolidated number to generate reports from, while keeping
the reconstruction fully distinguishable, reversible, and auditable at the
data level.

## What's in this reconciliation

- `detail_missing_stock_consumption.csv` — one row per (sale, ingredient)
  gap: the transaction, the date, the ingredient, how much was missing, and
  its computed value.
- `summary_by_ingredient.csv` — total missing quantity and value per
  ingredient, across the whole period.
- `summary_by_month.csv` — total missing value per calendar month.

## Totals

- **12,138** individual gaps identified.
- **~7,956.64 RON** total reconstructed value of unrecorded ingredient
  consumption across the period (this is an ingredient-cost figure, not
  revenue — it reflects stock that was used but never deducted/recorded, not
  unbilled sales; the sales themselves were correctly recorded and invoiced).
- Nearly all of it (**7,901.72 RON**) falls in **June 2026** — the month of
  the bulk migration; **only 54.92 RON** in July, after most sales were
  running through live tracking correctly.
- **287 of the 12,138 rows have no cost price on file** for that ingredient
  in the system today, so their value is recorded as 0 — the *quantity* gap
  for those rows is still accurate, but the *value* total above is a
  conservative (slight) undercount. Worth flagging to the accountant rather
  than guessing a cost.

## Methodology and its limits (please read before using these figures)

For each historical sale, missing consumption = (recipe's ingredient quantity
÷ recipe yield) × the quantity actually sold, using the recipe **as
configured today**. We do not have historical recipe versions from the
migration, so if a recipe's ingredient ratios changed between the sale date
and today, the reconstructed figure for that sale will reflect today's ratio,
not necessarily the ratio in effect on that date. This is the best available
reconstruction given what data exists, but it is an estimate for periods
before 2026-07-04, not an observed fact — please treat it accordingly for
audit purposes and flag this caveat if the accountant needs an unqualified
figure.

## What was fixed in the live system (not part of this reconciliation)

- The 9 broken ingredient links (`recipe_items.ingredient_product_id`) —
  script and before/after snapshot: see `01_fix_recipe_ingredient_links.sql`
  and `snapshot_recipe_items_before.json` in this folder.
- Going forward, all three root causes above should no longer produce new
  gaps (link fix stops #2; #1 was a one-time migration event; #3 needs the
  added logging to confirm it doesn't recur — worth checking back on after a
  few more weeks of live operation).

## Files in this folder

| File | Purpose |
|---|---|
| `snapshot_recipe_items_before.json` | Full before-state of the 39 recipe_items rows changed |
| `snapshot_stock_movements_before.json` | Full stock_movements table for this org before any change (2,405 rows) |
| `snapshot_products_before.json` | Full products table for this org before any change (360 rows) |
| `01_fix_recipe_ingredient_links.sql` | The link-fix migration, applied 2026-07-04 |
| `02_backfill_missing_stock_movements.sql` | Applied 2026-07-04 — inserted into `stock_movement_reconciliations`, NOT `stock_movements` |
| `02_backfill_missing_stock_movements.sql.orig_draft` | Earlier draft that targeted `stock_movements` directly — not used, kept for the audit trail |
| `03_rollback.sql` | Reversal script for both steps |
| `detail_missing_stock_consumption.csv` | Full 12,138-row detail |
| `summary_by_ingredient.csv` | Rollup by ingredient |
| `summary_by_month.csv` | Rollup by month |
| `README_ACCOUNTANT_RECONCILIATION.md` | This file |
| `../../supabase/migrations/20260704150000_stock_movement_reconciliations.sql` | The schema migration (new table + reporting view) |

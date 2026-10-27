# Dolce Nera — sales that skipped stock depletion since 26 Oct 2026

**Status: EXECUTED 2026-10-27 ~12:45 UTC with the owner's approval — do not run again** (it is idempotent, so a
re-run inserts nothing). Code fix deployed first (`e0692a5`, first post-deploy sale at 12:43 UTC depleted 11/11).
Backup before running: `~/franchisetech-backups/supabase/pre-migration-20261027T124411Z` (verified, 98 tables).

Result: 31 sales (2026-10-26 08:48 → 2026-10-27 12:36 UTC), 230 movements, 22 products; in-transaction checks
0 sales still missing, 230 movements, 0 balance mismatches. After commit, all 32 sales since 25 Oct have exactly
the expected movement count. Five touched products were already negative before the backfill (ZAHAR BRUN 5 GR,
PALETE, CAPAC SL37, PAHAR 6 OZ, CAFEA PRAJITA BREZZA DI BARI); it only added what was actually sold.
Separately, 9 of 82 sales on 19–24 Oct have fewer movements than today's recipes imply — pre-existing, most
likely recipe edits since, not investigated here.

## Cause (fixed on branch `seo/www-canonicals-blog-ctas`, not yet deployed)

Stripe canceled Dolce Nera's subscription (`sub_1Tm8PoQSKBSEqRxEcnntbo03`) on 2026-10-09 after the 25 Sep €49
renewal failed 9 times (7 Stripe Radar "highest_risk_level" blocks, 2 bank `transaction_not_allowed`). Our
row kept `current_period_end = 2026-10-25`, so from 25 Oct the entitlement resolver dropped the org to
`FALLBACK_ENTITLEMENTS`. That set did not contain `recipes.stock_depletion`, so `completeSaleReturn` passed
`stock_depletion_enabled = false` to `post_pos_document` and every sale stopped writing `sale_used`
movements and stopped reducing `products.current_stock_qty`. The resolver also ignored the
`grace_period_ends_at` (2026-10-31) for canceled subscriptions.

The fix keeps `recipes.stock_depletion` in the fallback set and honours the grace window for canceled
subscriptions (`lib/billing/entitlement-resolver.ts`, tests in `entitlement-resolver.test.ts`).

## What is affected

Read-only queries against production on 2026-10-27 ~10:00 UTC:

| | Count |
|---|---|
| Sales with no stock movements (all `completed`) | 29, from 2026-10-26 08:48 to 2026-10-27 09:56 UTC |
| Sale lines | 50 |
| …with a recipe | 39 → 213 ingredient movements |
| …stock-tracked product without recipe | 6 → 6 movements |
| …neither (no stock effect) | 5 |
| Expected movements to insert | **219** across 22 products (more if sales continue before the fix is live) |
| Other stock movements since 25 Oct (returns, receipts, adjustments) | 0 |
| Recipes used by these sales edited since 25 Oct | 0 |

Because nothing else touched stock in this window and no recipe changed, replaying the sales now gives the same
result as depleting at sale time would have. Sales, payments and fiscal receipts are correct and are not touched.

## The backfill

It replays the exact depletion logic of the live `post_pos_document` (checked with `pg_get_functiondef` on
2026-10-27), using the `recipe_id` stored on each sale line at sale time. `performed_at` is set to the sale time
and `performed_by` to the cashier, so daily stock and consumption reports land on the right day.

It is idempotent: a sale that already has any `sale` movement is skipped, so running it twice changes nothing.

```sql
begin;

-- 1. Sales to backfill: Dolce Nera, from 25 Oct, completed, no 'sale' movement yet.
create temporary table _bf_tx on commit drop as
select t.id, t.organisation_id, t.sold_at, t.sold_by
from public.pos_transactions t
join public.organisations o on o.id = t.organisation_id
where o.id = 'b01ce0e0-d01c-4042-0000-000000000042'          -- Dolce Nera - CoffeeShop
  and t.sold_at >= '2026-10-25T00:00:00+00'
  and t.status = 'completed'
  and not exists (
    select 1 from public.stock_movements m
    where m.organisation_id = t.organisation_id
      and m.reference_type = 'sale'
      and m.reference_id = t.id
  );

-- 2. One row per stock movement, same maths as post_pos_document.
create temporary table _bf_mv on commit drop as
-- recipe lines: ingredient qty / max(yield, 1) * sold qty, rounded to 6 dp
select tx.organisation_id, ri.ingredient_product_id as product_id,
       round((ri.quantity / greatest(r.yield_qty, 1)) * round(i.quantity, 6), 6) as use_qty,
       coalesce(ri.unit_of_measure, 'each') as unit_of_measure,
       tx.id as transaction_id, tx.sold_at, tx.sold_by
from _bf_tx tx
join public.pos_transaction_items i on i.transaction_id = tx.id
join public.recipes r on r.id = i.recipe_id
join public.recipe_items ri on ri.recipe_id = i.recipe_id and ri.ingredient_product_id is not null
union all
-- no recipe, stock-tracked product: deplete the product itself
select tx.organisation_id, p.id, round(i.quantity, 6),
       coalesce(p.unit_of_measure, 'each'), tx.id, tx.sold_at, tx.sold_by
from _bf_tx tx
join public.pos_transaction_items i on i.transaction_id = tx.id and i.recipe_id is null
join public.products p on p.id = i.product_id and p.organisation_id = tx.organisation_id
where coalesce(p.is_stock_tracked, false);

-- 3. Check before writing. Expected on 2026-10-27 ~10:00 UTC: 29 sales, 219 movements.
select (select count(*) from _bf_tx) as sales, (select count(*) from _bf_mv) as movements;

-- 4. Movements, dated at the sale.
insert into public.stock_movements (
  organisation_id, product_id, movement_type, quantity_change, unit_of_measure,
  reference_type, reference_id, performed_by, performed_at
)
select organisation_id, product_id, 'sale_used', -use_qty, unit_of_measure,
       'sale', transaction_id, sold_by, sold_at
from _bf_mv;

-- 5. Stock balances.
update public.products p
set current_stock_qty = round(coalesce(p.current_stock_qty, 0) - agg.total, 6)
from (select product_id, sum(use_qty) as total from _bf_mv group by product_id) agg
where p.id = agg.product_id
  and p.organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042';

-- 6. Verify: should return 0 rows.
select t.id from public.pos_transactions t
where t.organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
  and t.sold_at >= '2026-10-25T00:00:00+00' and t.status = 'completed'
  and not exists (select 1 from public.stock_movements m
                  where m.reference_type = 'sale' and m.reference_id = t.id)
  and exists (select 1 from _bf_mv mv where mv.transaction_id = t.id);

-- Inspect steps 3 and 6, then:
commit;   -- or: rollback;
```

## Before running

- Deploy the code fix first, then run this once. Sales made in between are picked up automatically.
- Take a fresh backup first: production has no automated DB backup (see `docs/db-backups.md`).
- `canonical_stock_balances` and any CMP/cost view derived from `stock_movements` will update from the new rows;
  nothing else needs recomputing.
- Bon de Consum documents are not generated by this script. If the accountant needs consumption documents for
  26–27 Oct, generate them from the app after the backfill, as for any other day.

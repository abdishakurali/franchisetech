-- ============================================================
-- 035_purchase_inventory_model.sql
-- Adds item_type, is_purchaseable to products;
-- category_type to product_categories (pos vs inventory);
-- tax_rate/tax_amount to purchase_items;
-- tax_total to purchases.
-- All statements use IF NOT EXISTS / safe defaults.
-- ============================================================

-- ── products: item classification columns ──────────────────
alter table products
  add column if not exists item_type text
    check (item_type in ('finished_product','ingredient','merchandise','supply','packaging','raw_material'))
    default 'finished_product',
  add column if not exists is_purchaseable boolean not null default false;

-- Backfill: existing ingredients → is_purchaseable, item_type
update products
set
  is_purchaseable = true,
  item_type = 'ingredient'
where is_ingredient = true
  and item_type is distinct from 'ingredient';

-- ── product_categories: category scope ─────────────────────
alter table product_categories
  add column if not exists category_type text
    check (category_type in ('pos','inventory','both'))
    default 'both';

-- ── purchase_items: per-line tax fields ────────────────────
alter table purchase_items
  add column if not exists tax_rate numeric not null default 0,
  add column if not exists tax_amount numeric not null default 0;

-- ── purchases: aggregate tax total ────────────────────────
alter table purchases
  add column if not exists tax_total numeric not null default 0,
  add column if not exists subtotal_amount numeric not null default 0;

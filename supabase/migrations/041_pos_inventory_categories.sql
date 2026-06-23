-- ============================================================
-- 041_pos_inventory_categories.sql
-- Separate POS menu category from inventory/product category.
-- ============================================================

alter table products
  add column if not exists pos_category_id uuid
    references product_categories(id) on delete set null;

create index if not exists idx_products_pos_category
  on products(organisation_id, pos_category_id);

create index if not exists idx_product_categories_type
  on product_categories(organisation_id, category_type, sort_order);

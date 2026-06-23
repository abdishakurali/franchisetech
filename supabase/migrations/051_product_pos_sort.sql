-- ============================================================
-- 051_product_pos_sort.sql
-- P3: Add sort_order to products for POS menu ordering
-- Additive only. Backwards-compatible.
-- ============================================================

alter table public.products
  add column if not exists pos_sort_order integer not null default 0;

create index if not exists idx_products_pos_sort on public.products(organisation_id, pos_sort_order, name);

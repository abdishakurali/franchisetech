-- 055_stock_movements_unit_cost.sql
-- Add unit_cost column required by migration 054's trigger and post_nir_purchase().
-- Stores the supplier purchase price (purchase_received rows) or
-- the CMP at time of consumption (sale_used rows, via trg_capture_cmp_on_movement).
alter table public.stock_movements
  add column if not exists unit_cost numeric;

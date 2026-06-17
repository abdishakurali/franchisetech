-- 014_recipe_improvements.sql
-- Safe additions — all use IF NOT EXISTS / idempotent

-- Add unit_cost_snapshot to recipe_items for historical cost tracking
ALTER TABLE recipe_items ADD COLUMN IF NOT EXISTS unit_cost_snapshot numeric DEFAULT 0;

-- Ensure recipe_items has ingredient_name column for display fallback
ALTER TABLE recipe_items ADD COLUMN IF NOT EXISTS ingredient_name text;

-- Update is_stock_tracked when is_ingredient = true (sync flag)
UPDATE products SET is_stock_tracked = true WHERE is_ingredient = true AND is_stock_tracked = false;

-- Add opening_stock_recorded flag so we don't double-count
ALTER TABLE products ADD COLUMN IF NOT EXISTS opening_stock_recorded boolean DEFAULT false;

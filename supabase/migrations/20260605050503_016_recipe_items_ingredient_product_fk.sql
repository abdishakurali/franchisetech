-- Drop old FK that references stock_items, add new one referencing products
-- First check if the constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipe_items_stock_item_id_fkey'
      AND conrelid = 'recipe_items'::regclass
  ) THEN
    ALTER TABLE recipe_items DROP CONSTRAINT recipe_items_stock_item_id_fkey;
  END IF;
END $$;

-- Add a separate ingredient_product_id column that properly references products
ALTER TABLE recipe_items ADD COLUMN IF NOT EXISTS ingredient_product_id uuid NULL;

-- Add FK from ingredient_product_id to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipe_items_ingredient_product_id_fkey'
      AND conrelid = 'recipe_items'::regclass
  ) THEN
    ALTER TABLE recipe_items
      ADD CONSTRAINT recipe_items_ingredient_product_id_fkey
      FOREIGN KEY (ingredient_product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recipe_items_ingredient_product ON recipe_items(ingredient_product_id);

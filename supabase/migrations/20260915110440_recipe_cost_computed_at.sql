-- Cost rețetă (Step 4) needs to say WHEN a recipe's ingredient cost was
-- last priced, not just what it is. recipe_items.unit_cost/total_cost are a
-- snapshot taken from products.cost_price (CMP) at the moment a recipe was
-- created or last edited (app/actions/kitchenops.ts:
-- addRecipeFromProducts/updateRecipeFromProducts) -- not recomputed live on
-- every view. A CMP that moves with every reception needs a visible as-of
-- date on the number it produced, or the cost silently drifts stale between
-- edits with no way to tell.
--
-- recipes.updated_at was considered and rejected as this timestamp: neither
-- write path sets it, there is no trigger maintaining it, and a check
-- against live data confirmed every recipe's updated_at still equals its
-- created_at, including ones known to have been edited since creation. It
-- is not a reliable "when was this priced" signal.
alter table public.recipes
  add column if not exists cost_computed_at timestamptz;

comment on column public.recipes.cost_computed_at is
  'When recipe_items.unit_cost/total_cost were last snapshotted from products.cost_price (CMP). Null means never computed via the current write path (created before this column, or by a path that does not set it). Not recomputed on view -- only on create/edit.';

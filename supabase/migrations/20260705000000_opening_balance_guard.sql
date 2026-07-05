-- Guard rail for seeding a one-time opening inventory balance per
-- organisation/product, once a physical stock count (inventariere, per OMFP
-- 2861/2009) has actually been performed and signed off.
--
-- Without this, re-running an opening-balance load by accident would
-- silently double-count the starting inventory. With it, a second attempt
-- fails loudly with a constraint violation instead of corrupting the figure.
create unique index if not exists stock_movement_reconciliations_one_opening_per_product
  on stock_movement_reconciliations (organisation_id, product_id)
  where movement_type = 'opening';

-- Dolce Nera (org b01ce0e0-d01c-4042-0000-000000000042) historical reconciliation
-- Step 1 of 3: fix 9 orphaned recipe_items.ingredient_product_id links
-- Root cause: migration from Odoo left these ingredient_product_id columns NULL,
-- so the ongoing recipe deduction (app/actions/kitchenops.ts:2146,
-- `if (!ri.ingredient_product_id) continue;`) silently skipped these lines on
-- every sale since go-live (2026-06-09).
--
-- Executed: 2026-07-04. Pre-change snapshot: snapshot_recipe_items_before.json
-- (39 affected recipe_items rows, all originally NULL).
--
-- ALREADY APPLIED. Kept here for the audit trail / to reproduce if needed.

with mapping(ingredient_name, product_id) as (
  values
  ('CAFEA PRAJITA - BREZZA DI BARI 1KG', '26b7dc8b-d2ee-4afd-b7cf-54dd28bca954'::uuid),
  ('CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr', '7a402754-71a4-4722-91b0-f17ba6728af8'::uuid),
  ('CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr', '7cdd3382-789c-4684-a2d0-9c885c2ef9d5'::uuid),
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', '2a65698d-f4e0-450f-8270-5e862706dc19'::uuid),
  ('CAFEA BOABE DECOF - CUORE DI COLUMBIA', '41340474-f13d-4ad2-80c6-d210847c5ba8'::uuid),
  ('DARK CHOCOLATE GOURMET VANILA ', '1a6cfdf1-8892-4784-8456-ea6781e5d20e'::uuid),
  ('LAMAIE ', 'ca2611fa-ce89-4690-b0e6-8cd6ed92e29e'::uuid),
  ('MATCHA POWDER TRADITIONAL GREEN TEA 250 G ', '375a53b9-0e0b-48c1-b762-2937c43d7819'::uuid),
  ('PIURE GIFFARD MANGO 1L', 'bcfd2839-0c87-4e4c-b092-895bcefcc8a7'::uuid)
)
update recipe_items ri
set ingredient_product_id = m.product_id
from recipes r, mapping m
where ri.recipe_id = r.id
  and r.organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
  and ri.ingredient_product_id is null
  and ri.ingredient_name = m.ingredient_name
returning ri.id, ri.ingredient_name, ri.ingredient_product_id;

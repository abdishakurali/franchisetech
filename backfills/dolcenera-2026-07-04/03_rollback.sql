-- Rollback for the 2026-07-04 Dolce Nera historical reconciliation.
-- Each step is independent; run only what you need to undo.

-- Undo step 2 (12,138-row reconciliation insert). stock_movements itself is
-- never touched by this reconciliation, so this alone fully removes it.
delete from stock_movement_reconciliations
where batch_id = 'dolcenera-backfill-20260704-01';

-- Undo the reporting view + reconciliation table entirely (only if you want
-- to remove the mechanism, not just this one batch's data).
-- drop view if exists stock_movements_reconciled;
-- drop table if exists stock_movement_reconciliations;

-- Undo step 1 (the 9 ingredient-link fixes). Restores the original NULLs
-- from snapshot_recipe_items_before.json. Only run this if you actually want
-- the ongoing coffee-bean deduction bug to come back -- not recommended.
update recipe_items set ingredient_product_id = null
where id in (
  '0bded737-bfc9-4982-83ae-cf2b39dfab31','1b39c489-7c69-4455-88c9-06f20e7d2bb4',
  '2f6a2751-91e5-413c-8872-f7c6ec7203a5','55a9ac8f-c0d3-4926-97b2-79114e35f80d',
  '5844495f-0e5e-49b8-88a6-937045f7a346','6f622e2c-64bb-4dfe-b1c8-2d670596b225',
  '797828aa-6c01-4e7f-a6d2-eda933cf46aa','99a6761a-6b1c-46c6-bbc5-c45e1a332acd',
  'a9a537b5-3df3-48d8-b761-ce77443d981e','c8bc74f3-6491-46e5-9dfb-20772b79cc61',
  'fab29942-1d74-4edb-a2df-5a0a63a45c79','ffe6bb8c-bebf-4a14-b730-c78375b5ba62',
  'fe401e50-aa81-42c8-8576-c8d6758f3ebe','3afadff2-260f-44a8-a1f9-a5d86a636be0',
  '4c688ce4-e79a-46e4-92d9-5ad2d9f8e08b','75a8f9e9-64a9-40e3-b3b0-4b354a58620c',
  '76e4684e-4f26-4985-a307-9f51ef5abd65','7af03372-1a36-42c0-8f05-659912489cc9',
  '7e4c660d-0558-4491-924a-449f477ab803','835c397e-4df2-4f90-b40c-b4edec3f4562',
  '949d035d-bd25-454f-8148-aee0df8c6d2c','a9fb53a2-8002-4dae-8dd0-b5b97f89f159',
  'b8571e98-f6ea-43ce-abdd-b3ad2984c8e5','bf7cb7e0-0c0d-41e3-943d-bfec751d60c9',
  'd03e790a-f43d-45c7-9a92-cf4a99b40420','d4013c37-41a8-4ea4-bf0f-bc8043edd5ce',
  'e849b99b-0c4d-45a4-9fee-558c879e05a7','5d0ff8d6-a12f-452c-aa43-11fd8cdfa211',
  '605b5df7-3f86-4eeb-b164-a490aac11130','98de6253-6d78-413d-b9d3-16e69eac1c31',
  '01327d37-094e-491c-ab18-29431bac12bd','09f9ddd8-56cf-49d0-b1a7-3a292fe03bb9',
  '7b02a0e1-1b8d-454d-bbea-19c0f25757b3','b62392da-e9c0-4b71-a66b-5a375f3b1e32',
  'b848cbce-3740-4a56-9739-92a0bc2fab80','08888fcf-2fbe-4ae1-980b-5daa93072bd9',
  'caaa561d-c78c-4813-a240-54a2b6107dad','7aa76889-e8ea-4609-810e-dffb5edbb884',
  'a18c46e1-cc41-4f93-9484-67f438bcfe3c'
);

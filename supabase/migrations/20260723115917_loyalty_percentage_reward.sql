ALTER TABLE organisations
  ADD COLUMN IF NOT EXISTS loyalty_reward_discount_percent smallint
  CHECK (loyalty_reward_discount_percent IS NULL OR (loyalty_reward_discount_percent BETWEEN 1 AND 100));

ALTER TABLE organisations DROP CONSTRAINT IF EXISTS organisations_loyalty_reward_type_check;
ALTER TABLE organisations ADD CONSTRAINT organisations_loyalty_reward_type_check
  CHECK (loyalty_reward_type = ANY (ARRAY['discount'::text, 'free_item'::text, 'percentage'::text]));

-- Allow nullable value_c for cooling checks (no single temperature recorded)
ALTER TABLE public.temperature_readings
  ALTER COLUMN value_c DROP NOT NULL;

-- Add check category and supporting fields
ALTER TABLE public.temperature_readings
  ADD COLUMN IF NOT EXISTS check_category  text DEFAULT 'cold_storage',
  ADD COLUMN IF NOT EXISTS food_item       text,
  ADD COLUMN IF NOT EXISTS supplier_name   text,
  ADD COLUMN IF NOT EXISTS delivery_type   text CHECK (delivery_type IN ('chilled','frozen','hot','ambient') OR delivery_type IS NULL),
  ADD COLUMN IF NOT EXISTS finished_cooking_at timestamptz,
  ADD COLUMN IF NOT EXISTS placed_in_fridge_at  timestamptz;

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_temperature_readings_category
  ON public.temperature_readings (organisation_id, check_category);

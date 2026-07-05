ALTER TABLE organisations
  ADD COLUMN IF NOT EXISTS location_band text,
  ADD COLUMN IF NOT EXISTS ingredient_tracking_intent text;

-- Add explicit image_url column so the page uses it directly (no URL construction)
ALTER TABLE marketing_screenshots
  ADD COLUMN IF NOT EXISTS image_url text;

-- Seed initial value: local /public path (works immediately without Supabase Storage upload)
UPDATE marketing_screenshots
SET image_url = '/marketing/' || storage_key
WHERE image_url IS NULL;

-- Add constraint: image_url must be set
ALTER TABLE marketing_screenshots
  ALTER COLUMN image_url SET NOT NULL;

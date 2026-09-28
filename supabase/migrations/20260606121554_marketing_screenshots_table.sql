-- Create public marketing storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing',
  'marketing',
  true,
  5242880,
  ARRAY['image/png','image/jpeg','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy on marketing bucket
CREATE POLICY "marketing_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketing');

-- Service role can insert/update/delete
CREATE POLICY "marketing_service_write"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'marketing');

CREATE POLICY "marketing_service_update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'marketing');

CREATE POLICY "marketing_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'marketing');

-- Table to store marketing screenshot metadata
CREATE TABLE IF NOT EXISTS marketing_screenshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key   text NOT NULL UNIQUE,
  section       text NOT NULL,
  title         text NOT NULL,
  alt_text      text NOT NULL,
  description   text NOT NULL,
  display_order int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Public read, no auth needed for landing page
ALTER TABLE marketing_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_screenshots_public_read"
  ON marketing_screenshots FOR SELECT
  USING (is_active = true);

CREATE POLICY "marketing_screenshots_service_write"
  ON marketing_screenshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_marketing_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER marketing_screenshots_updated_at
  BEFORE UPDATE ON marketing_screenshots
  FOR EACH ROW EXECUTE FUNCTION set_marketing_updated_at();

-- Seed initial screenshot metadata (storage_key matches what we upload)
INSERT INTO marketing_screenshots (storage_key, section, title, alt_text, description, display_order) VALUES
  ('pos-hero.png',           'showcase', 'POS register',    'KitchenOps POS register with product grid, cart, and charge button',          'Sell products quickly with a simple register, cart, customer field, and charge button.', 1),
  ('dashboard-hero.png',     'showcase', 'Dashboard',       'KitchenOps dashboard showing sales today, expected cash, and top products',    'See sales, expected cash, top products, and next setup steps.',                         2),
  ('recipe-costing-hero.png','showcase', 'Recipe costing',  'KitchenOps recipe costing screen with cost, margin, and can-make count',      'Connect products to ingredients and see cost, margin, and how many you can make.',       3),
  ('pos-hero.png',           'hero',     'POS register',    'KitchenOps POS register with product grid, cart, and charge button',          '',                                                                                       1),
  ('dashboard-hero.png',     'hero',     'Dashboard',       'KitchenOps dashboard showing sales today, expected cash, and top products',   '',                                                                                       2),
  ('dashboard-hero.png',     'reports',  'Reports',         'KitchenOps dashboard showing sales, cash, stock, and product performance',    '',                                                                                       1)
ON CONFLICT (storage_key) DO NOTHING;

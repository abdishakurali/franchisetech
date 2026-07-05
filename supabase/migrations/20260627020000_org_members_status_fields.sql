ALTER TABLE organisation_members
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS disabled_at timestamptz;

UPDATE organisation_members SET status = 'active' WHERE status IS NULL;

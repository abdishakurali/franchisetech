-- Add android_connector to the cash_drawer_mode check constraint on organisations
ALTER TABLE organisations
  DROP CONSTRAINT IF EXISTS organisations_cash_drawer_mode_check;

ALTER TABLE organisations
  ADD CONSTRAINT organisations_cash_drawer_mode_check
  CHECK (cash_drawer_mode IN ('off', 'manual', 'local_connector', 'android_connector'));

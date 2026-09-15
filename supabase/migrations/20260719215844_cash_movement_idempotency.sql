ALTER TABLE pos_cash_movements
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS pos_cash_movements_org_idempotency_key_uidx
  ON pos_cash_movements (organisation_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN pos_cash_movements.idempotency_key IS
  'Client-generated UUID reused across retry; unique per organisation.';

-- Sale idempotency: client-supplied key prevents double-insert on retry/offline sync.
ALTER TABLE pos_transactions
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS pos_transactions_org_idempotency_key_uidx
  ON pos_transactions (organisation_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN pos_transactions.idempotency_key IS
  'Client-generated UUID reused across offline retry; unique per organisation.';

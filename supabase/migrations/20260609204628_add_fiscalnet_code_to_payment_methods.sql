ALTER TABLE payment_methods
  ADD COLUMN IF NOT EXISTS fiscalnet_code integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN payment_methods.fiscalnet_code IS '1=Cash,2=Card,3=Credit,4=Meal ticket,5=Value ticket,6=Voucher,7=Modern,8=Other,9=Other';

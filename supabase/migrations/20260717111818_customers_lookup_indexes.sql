-- Speeds public loyalty signup lookups (org + email/phone) without full-table scans.
CREATE INDEX IF NOT EXISTS customers_org_email_idx
  ON public.customers (organisation_id, lower(email))
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS customers_org_phone_idx
  ON public.customers (organisation_id, phone)
  WHERE phone IS NOT NULL;

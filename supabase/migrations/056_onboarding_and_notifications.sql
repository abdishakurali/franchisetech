-- 056_onboarding_and_notifications.sql
-- Additive columns for CUI verification, onboarding state, and notification preferences.
-- fiscalnet_cif is already the org's CUI; we add verification metadata alongside it.
alter table public.organisations
  add column if not exists tax_id_verified      boolean  default false,
  add column if not exists company_legal_name   text,
  add column if not exists company_address      text,
  add column if not exists onboarding_completed boolean  default false,
  add column if not exists notification_preferences jsonb default '{
    "stock_low":             true,
    "stock_empty":           true,
    "bon_consum_generated":  false,
    "efactura_rejected":     true,
    "efactura_deadline":     true,
    "nir_missing_cui":       true,
    "daily_report":          false,
    "weekly_report":         false,
    "sales_alert":           false
  }'::jsonb;

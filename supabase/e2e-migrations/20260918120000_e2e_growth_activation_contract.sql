-- Isolated E2E parity: activation milestones are stored on organisations,
-- matching the production growth activation migration (041).
alter table public.organisations
  add column if not exists growth_till_opened_at timestamptz null,
  add column if not exists growth_first_sale_at timestamptz null,
  add column if not exists growth_first_report_at timestamptz null,
  add column if not exists growth_activated_at timestamptz null;

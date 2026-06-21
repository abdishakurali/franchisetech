-- Growth activation milestones (North Star: till → sale → report within 7 days)
alter table public.organisations
  add column if not exists growth_till_opened_at timestamptz null,
  add column if not exists growth_first_sale_at timestamptz null,
  add column if not exists growth_first_report_at timestamptz null,
  add column if not exists growth_activated_at timestamptz null;

comment on column public.organisations.growth_till_opened_at is 'First POS session opened (trial activation step 1)';
comment on column public.organisations.growth_first_sale_at is 'First completed sale (trial activation step 2)';
comment on column public.organisations.growth_first_report_at is 'First daily report viewed (trial activation step 3)';
comment on column public.organisations.growth_activated_at is 'All three milestones recorded (North Star activated trial)';

-- Lead lifecycle for demo requests (follows 20261027130000_demo_leads).
--
-- Additive and backwards-compatible with the deployed code (913be51):
-- the status check only gains values, new columns are nullable or defaulted,
-- and the running code never writes them.
--
-- Lifecycle: new → contacted → qualified → demo_completed → trial_started → won | lost
-- Out of the pipeline: spam, test (excluded from every business metric).
--
-- Rollback: the columns can stay; to restore the old check, first move any
-- demo_completed/trial_started/test rows back to an old status.

alter table public.demo_leads drop constraint if exists demo_leads_status_check;
alter table public.demo_leads add constraint demo_leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'demo_completed', 'trial_started', 'won', 'lost', 'spam', 'test'));

alter table public.demo_leads
  add column if not exists is_test boolean not null default false,
  add column if not exists next_action text check (next_action is null or char_length(next_action) <= 200),
  add column if not exists next_action_due date,
  add column if not exists notes text check (notes is null or char_length(notes) <= 2000),
  add column if not exists status_changed_at timestamptz,
  add column if not exists organisation_id uuid references public.organisations(id) on delete set null;

create index if not exists demo_leads_status_idx on public.demo_leads (status, created_at desc);

-- Internal test submissions (company domain) are never business leads.
update public.demo_leads set is_test = true where email ilike '%@franchisetech.ro';

comment on column public.demo_leads.consent_at is
  'When the visitor submitted the form after the privacy notice was shown. Processing is to answer their request (GDPR art. 6(1)(b)), not marketing consent.';
comment on column public.demo_leads.ip_hash is
  'Salted SHA-256 of the client IP, truncated. Only used for rate limiting.';

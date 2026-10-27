-- Demo requests from /demo. Until now website enquiries only existed as an
-- email in the inbox (app/api/contact), so a failed or lost email meant a lost
-- lead. This table keeps every demo request, with the email delivery result,
-- so nothing depends on one email arriving.
--
-- Server-only: RLS on with no policies, and no grants to anon/authenticated.
-- Only the service role (app/api/demo-request) reads or writes it. Personal
-- data is limited to what a salesperson needs to reply; the client IP is
-- stored only as a salted hash, used for rate limiting.
--
-- Additive: one new table and two indexes. Rollback: drop table public.demo_leads.

create table if not exists public.demo_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null check (char_length(business_name) between 1 and 120),
  contact_name text not null check (char_length(contact_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 160),
  phone text check (phone is null or char_length(phone) <= 40),
  business_type text not null check (char_length(business_type) <= 60),
  locations text not null check (char_length(locations) <= 20),
  message text check (message is null or char_length(message) <= 1500),
  -- Attribution (no personal data)
  source_page text,
  source_article text,
  cta_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  -- Operations
  ip_hash text,
  consent_at timestamptz not null,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_error text,
  notified_at timestamptz,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam'))
);

create index if not exists demo_leads_ip_recent_idx on public.demo_leads (ip_hash, created_at desc);
create index if not exists demo_leads_email_recent_idx on public.demo_leads (lower(email), created_at desc);

alter table public.demo_leads enable row level security;
revoke all on table public.demo_leads from anon, authenticated;

comment on table public.demo_leads is
  'Demo requests from /demo. Server-only (service role). Retention: delete or anonymise leads not converted within 24 months.';

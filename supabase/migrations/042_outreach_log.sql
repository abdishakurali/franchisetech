-- Cold outreach send log (n8n pipeline + Cursor MCP queries)
create table if not exists public.outreach_log (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  company text,
  type text not null check (type in ('customer', 'partner')),
  step integer not null default 1,
  status text not null check (status in ('planned', 'sent', 'skipped_existing_user', 'failed', 'failed_rate_limit')),
  campaign text not null default 'v2-franchisetech',
  error_message text,
  sent_at timestamptz not null default now()
);

create index if not exists outreach_log_email_idx on public.outreach_log (email);
create index if not exists outreach_log_status_idx on public.outreach_log (status);
create index if not exists outreach_log_sent_at_idx on public.outreach_log (sent_at desc);

comment on table public.outreach_log is 'Cold email send outcomes from n8n outreach pipeline';

alter table public.outreach_log enable row level security;

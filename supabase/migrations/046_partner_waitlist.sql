-- Partner waitlist (gated recruitment — no partner portal)
create table if not exists public.partner_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  email text not null,
  phone text,
  country text not null,
  partner_type text not null,
  horeca_client_count text,
  message text not null,
  utm_source text,
  utm_campaign text,
  utm_content text,
  status text not null default 'pending'
    check (status in ('pending', 'invited', 'active', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists partner_waitlist_email_idx on public.partner_waitlist (email);
create index if not exists partner_waitlist_status_idx on public.partner_waitlist (status);
create index if not exists partner_waitlist_created_at_idx on public.partner_waitlist (created_at desc);

comment on table public.partner_waitlist is 'Gated partner program waitlist — founder reviews in Supabase dashboard';

alter table public.partner_waitlist enable row level security;

-- No public read/write — inserts via service role in API only
create policy partner_waitlist_no_public_select on public.partner_waitlist
  for select using (false);

create policy partner_waitlist_no_public_insert on public.partner_waitlist
  for insert with check (false);

create policy partner_waitlist_no_public_update on public.partner_waitlist
  for update using (false);

create policy partner_waitlist_no_public_delete on public.partner_waitlist
  for delete using (false);

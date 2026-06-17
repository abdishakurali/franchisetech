alter table organisations add column if not exists cash_drawer_mode text not null default 'manual'
  check (cash_drawer_mode in ('off','manual','local_connector'));
alter table organisations add column if not exists cash_drawer_connector_port integer not null default 17878;
alter table organisations add column if not exists cash_drawer_connector_token text;
alter table organisations add column if not exists cash_drawer_trigger_on_cash_sale boolean not null default true;
alter table organisations add column if not exists cash_drawer_trigger_on_cash_in boolean not null default true;
alter table organisations add column if not exists cash_drawer_trigger_on_cash_out boolean not null default true;
alter table organisations add column if not exists cash_drawer_last_status text;
alter table organisations add column if not exists cash_drawer_last_checked_at timestamptz;

create table if not exists cash_drawer_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  location_id uuid,
  terminal_id uuid,
  user_id uuid references profiles(id) on delete set null,
  reason text not null check (reason in ('cash_sale','cash_in','cash_out','test')),
  related_sale_id uuid references pos_transactions(id) on delete set null,
  related_cash_movement_id uuid,
  mode text not null check (mode in ('off','manual','local_connector')),
  result text not null check (result in ('skipped','manual_required','command_sent','failed','not_configured')),
  error_code text,
  error_message text,
  connector_version text,
  connector_url text,
  created_at timestamptz default now()
);

create index if not exists idx_cash_drawer_events_org on cash_drawer_events(organisation_id, created_at desc);

alter table cash_drawer_events enable row level security;

drop policy if exists cash_drawer_events_select_org on cash_drawer_events;
create policy cash_drawer_events_select_org on cash_drawer_events
  for select using (is_org_member(organisation_id));

drop policy if exists cash_drawer_events_insert_org on cash_drawer_events;
create policy cash_drawer_events_insert_org on cash_drawer_events
  for insert with check (is_org_member(organisation_id));

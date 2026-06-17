-- FridgeProof Reminder Schedules Migration
-- Email reminders for food safety checks

-- ============================================================
-- REMINDER SCHEDULES
-- ============================================================
create table if not exists reminder_schedules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  asset_id uuid references assets(id) on delete set null,
  reminder_type text not null check (reminder_type in (
    'temperature_check',
    'hot_holding_check',
    'cleaning_check',
    'manager_review'
  )),
  label text not null,
  days_of_week int[] not null default '{1,2,3,4,5,6,7}',
  -- 1 = Monday, 7 = Sunday (ISO weekday)
  time_of_day time not null,
  timezone text not null default 'Europe/Dublin',
  recipients text[] not null,
  enabled boolean not null default true,
  last_sent_at timestamptz null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REMINDER SEND LOG
-- ============================================================
create table if not exists reminder_send_log (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  reminder_schedule_id uuid references reminder_schedules(id) on delete set null,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text null,
  error text null,
  sent_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_reminder_schedules_org on reminder_schedules(organisation_id);
create index if not exists idx_reminder_schedules_enabled on reminder_schedules(enabled) where enabled = true;
create index if not exists idx_reminder_send_log_org on reminder_send_log(organisation_id);
create index if not exists idx_reminder_send_log_schedule on reminder_send_log(reminder_schedule_id);

-- ============================================================
-- RLS
-- ============================================================
alter table reminder_schedules enable row level security;
alter table reminder_send_log enable row level security;

-- reminder_schedules: all org members can read
drop policy if exists "reminder_schedules_select_member" on reminder_schedules;
create policy "reminder_schedules_select_member" on reminder_schedules
  for select using (is_org_member(organisation_id));

-- reminder_schedules: owner/manager can insert
drop policy if exists "reminder_schedules_insert_owner_manager" on reminder_schedules;
create policy "reminder_schedules_insert_owner_manager" on reminder_schedules
  for insert with check (is_org_owner_or_manager(organisation_id));

-- reminder_schedules: owner/manager can update
drop policy if exists "reminder_schedules_update_owner_manager" on reminder_schedules;
create policy "reminder_schedules_update_owner_manager" on reminder_schedules
  for update using (is_org_owner_or_manager(organisation_id));

-- reminder_schedules: owner/manager can delete
drop policy if exists "reminder_schedules_delete_owner_manager" on reminder_schedules;
create policy "reminder_schedules_delete_owner_manager" on reminder_schedules
  for delete using (is_org_owner_or_manager(organisation_id));

-- reminder_send_log: owner/manager can read
drop policy if exists "reminder_send_log_select_owner_manager" on reminder_send_log;
create policy "reminder_send_log_select_owner_manager" on reminder_send_log
  for select using (is_org_owner_or_manager(organisation_id));

-- reminder_send_log: service role inserts via cron (bypasses RLS)
-- The cron endpoint uses the service role key for inserts, so no user-level insert policy needed.
-- But we add a permissive insert so the server action can also insert with anon/authenticated:
drop policy if exists "reminder_send_log_insert_service" on reminder_send_log;
create policy "reminder_send_log_insert_service" on reminder_send_log
  for insert with check (true);
-- Note: this table contains no PII beyond email addresses and is audit-only.
-- Actual log inserts come from the server-side cron route with SUPABASE_SERVICE_ROLE_KEY.

-- ============================================================
-- updated_at trigger for reminder_schedules
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reminder_schedules_updated_at on reminder_schedules;
create trigger reminder_schedules_updated_at
  before update on reminder_schedules
  for each row execute function set_updated_at();

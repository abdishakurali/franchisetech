-- ============================================================
-- 022 — Cash drawer audit: expand cash_drawer_events
-- ============================================================

-- 1. New reason values
alter table cash_drawer_events
  drop constraint if exists cash_drawer_events_reason_check;
alter table cash_drawer_events
  add constraint cash_drawer_events_reason_check
  check (reason in ('cash_sale','cash_in','cash_out','test','connector_check','setup_test','pairing'));

-- 2. New result values
alter table cash_drawer_events
  drop constraint if exists cash_drawer_events_result_check;
alter table cash_drawer_events
  add constraint cash_drawer_events_result_check
  check (result in (
    'skipped','manual_required','command_sent','failed',
    'not_configured','rate_limited','invalid_token','origin_rejected',
    'connector_unavailable','timeout','hardware_verified',
    'paired','pairing_failed','setup_completed'
  ));

-- 3. New mode value
alter table cash_drawer_events
  drop constraint if exists cash_drawer_events_mode_check;
alter table cash_drawer_events
  add constraint cash_drawer_events_mode_check
  check (mode in ('off','manual','local_connector','android_connector'));

-- 4. New columns
alter table cash_drawer_events
  add column if not exists device_id          text,
  add column if not exists platform           text
    check (platform in ('web','windows_connector','android_connector','unknown')),
  add column if not exists connector_version  text,
  add column if not exists connector_device_name text,
  add column if not exists connector_id       text,
  add column if not exists printer_type       text
    check (printer_type in ('network_escpos','usb_escpos','bluetooth_escpos','unknown')),
  add column if not exists printer_ip         text,
  add column if not exists printer_port       integer,
  add column if not exists command_hex        text,
  add column if not exists duration_ms        integer,
  add column if not exists request_id         text;

-- Rename connector_url → keep for backward compat but add new columns
-- connector_url already exists; keep it

-- 5. Additional indexes
create index if not exists idx_cde_location   on cash_drawer_events(location_id, created_at desc)  where location_id  is not null;
create index if not exists idx_cde_terminal   on cash_drawer_events(terminal_id, created_at desc)   where terminal_id  is not null;
create index if not exists idx_cde_sale       on cash_drawer_events(related_sale_id)                where related_sale_id is not null;
create index if not exists idx_cde_movement   on cash_drawer_events(related_cash_movement_id)       where related_cash_movement_id is not null;
create index if not exists idx_cde_result     on cash_drawer_events(result);
create index if not exists idx_cde_reason     on cash_drawer_events(reason);

-- 6. hardware_verification table for admin-only hardware proof records
create table if not exists cash_drawer_hardware_verifications (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references organisations(id) on delete cascade,
  connector_version   text,
  printer_model       text,
  drawer_model        text,
  tester_user_id      uuid references profiles(id) on delete set null,
  tester_name         text,
  notes               text,
  verified_at         timestamptz default now(),
  created_at          timestamptz default now()
);

alter table cash_drawer_hardware_verifications enable row level security;

drop policy if exists cdhv_select on cash_drawer_hardware_verifications;
create policy cdhv_select on cash_drawer_hardware_verifications
  for select using (is_org_member(organisation_id));

drop policy if exists cdhv_insert on cash_drawer_hardware_verifications;
create policy cdhv_insert on cash_drawer_hardware_verifications
  for insert with check (is_org_member(organisation_id));

create index if not exists idx_cdhv_org on cash_drawer_hardware_verifications(organisation_id, created_at desc);

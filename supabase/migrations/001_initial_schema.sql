-- FridgeProof Initial Schema Migration
-- Irish HACCP food-safety monitoring system

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table if not exists organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_type text,
  country text default 'Ireland',
  created_at timestamptz default now()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- ============================================================
-- ORGANISATION MEMBERS
-- ============================================================
create table if not exists organisation_members (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff', 'auditor')),
  created_at timestamptz default now(),
  unique (organisation_id, user_id)
);

-- ============================================================
-- SITES
-- ============================================================
create table if not exists sites (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  address text,
  city text,
  eircode text,
  created_at timestamptz default now()
);

-- ============================================================
-- ASSETS (fridges, freezers, cold rooms, etc.)
-- ============================================================
create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  asset_type text not null check (asset_type in ('fridge', 'freezer', 'cold_room', 'chill_display', 'hot_hold', 'probe', 'other')),
  location text,
  qr_code text unique,
  min_temp numeric,
  max_temp numeric,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- CHECK TEMPLATES
-- ============================================================
create table if not exists check_templates (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  check_type text not null check (check_type in ('refrigeration', 'delivery', 'cooking', 'cooling', 'reheating', 'hot_hold', 'cleaning', 'hygiene', 'calibration')),
  description text,
  frequency text not null check (frequency in ('daily', 'twice_daily', 'weekly', 'monthly', 'ad_hoc')),
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- SCHEDULED CHECKS
-- ============================================================
create table if not exists scheduled_checks (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  template_id uuid references check_templates(id) on delete set null,
  due_at timestamptz not null,
  completed_at timestamptz,
  completed_by uuid references profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'missed', 'failed', 'verified')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TEMPERATURE READINGS
-- ============================================================
create table if not exists temperature_readings (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  scheduled_check_id uuid references scheduled_checks(id) on delete set null,
  value_c numeric not null,
  source text not null default 'manual' check (source in ('manual', 'probe', 'bluetooth', 'wifi_sensor', 'simulated_sensor')),
  taken_by uuid references profiles(id) on delete set null,
  taken_at timestamptz default now(),
  status text not null check (status in ('pass', 'warning', 'fail')),
  notes text,
  photo_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- CORRECTIVE ACTIONS
-- ============================================================
create table if not exists corrective_actions (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  reading_id uuid references temperature_readings(id) on delete set null,
  action_type text not null check (action_type in ('rechecked', 'moved_stock', 'adjusted_unit', 'called_maintenance', 'discarded_food', 'escalated_to_manager', 'other')),
  description text not null,
  completed_by uuid references profiles(id) on delete set null,
  completed_at timestamptz default now(),
  follow_up_required boolean default false,
  follow_up_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- VERIFICATION REVIEWS (manager sign-off)
-- ============================================================
create table if not exists verification_reviews (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  period_start date,
  period_end date,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz default now(),
  status text not null check (status in ('approved', 'needs_action')),
  notes text
);

-- ============================================================
-- PROBE THERMOMETERS
-- ============================================================
create table if not exists probe_thermometers (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  name text not null,
  serial_number text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- CALIBRATION RECORDS
-- ============================================================
create table if not exists calibration_records (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  probe_id uuid references probe_thermometers(id) on delete cascade,
  method text not null check (method in ('ice_point', 'boiling_point', 'comparison', 'other')),
  result text not null check (result in ('pass', 'fail')),
  checked_by uuid references profiles(id) on delete set null,
  checked_at timestamptz default now(),
  notes text
);

-- ============================================================
-- SENSOR DEVICES (future hardware readiness)
-- ============================================================
create table if not exists sensor_devices (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  device_name text,
  device_type text not null check (device_type in ('temperature', 'door', 'power', 'humidity', 'combo')),
  provider text default 'manual_future',
  external_id text,
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance')),
  last_seen_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- SENSOR READINGS (from hardware sensors)
-- ============================================================
create table if not exists sensor_readings (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  sensor_device_id uuid references sensor_devices(id) on delete cascade,
  metric text not null check (metric in ('temperature_c', 'door_open', 'power_status', 'humidity')),
  value numeric,
  bool_value boolean,
  recorded_at timestamptz default now(),
  status text not null default 'normal' check (status in ('normal', 'warning', 'critical')),
  created_at timestamptz default now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- REPORTS (saved report runs)
-- ============================================================
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  report_type text not null check (report_type in ('refrigeration', 'calibration', 'corrective_actions', 'full_haccp')),
  period_start date,
  period_end date,
  generated_by uuid references profiles(id) on delete set null,
  generated_at timestamptz default now(),
  metadata jsonb
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_org_members_user on organisation_members(user_id);
create index if not exists idx_org_members_org on organisation_members(organisation_id);
create index if not exists idx_sites_org on sites(organisation_id);
create index if not exists idx_assets_org on assets(organisation_id);
create index if not exists idx_assets_site on assets(site_id);
create index if not exists idx_temp_readings_org on temperature_readings(organisation_id);
create index if not exists idx_temp_readings_asset on temperature_readings(asset_id);
create index if not exists idx_temp_readings_taken_at on temperature_readings(taken_at desc);
create index if not exists idx_corrective_actions_org on corrective_actions(organisation_id);
create index if not exists idx_scheduled_checks_org on scheduled_checks(organisation_id);
create index if not exists idx_scheduled_checks_due on scheduled_checks(due_at);
create index if not exists idx_audit_log_org on audit_log(organisation_id);
create index if not exists idx_sensor_devices_external on sensor_devices(external_id);
create index if not exists idx_sensor_readings_device on sensor_readings(sensor_device_id);
create index if not exists idx_sensor_readings_recorded on sensor_readings(recorded_at desc);

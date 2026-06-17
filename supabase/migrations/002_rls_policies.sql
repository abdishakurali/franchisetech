-- FridgeProof RLS Policies
-- Row Level Security for multi-tenant isolation

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from organisation_members
    where organisation_id = org_id
    and user_id = auth.uid()
  );
$$;

create or replace function get_org_role(org_id uuid)
returns text
language sql
security definer
stable
as $$
  select role from organisation_members
  where organisation_id = org_id
  and user_id = auth.uid()
  limit 1;
$$;

create or replace function is_org_owner_or_manager(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from organisation_members
    where organisation_id = org_id
    and user_id = auth.uid()
    and role in ('owner', 'manager')
  );
$$;

create or replace function is_org_owner(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from organisation_members
    where organisation_id = org_id
    and user_id = auth.uid()
    and role = 'owner'
  );
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table organisations enable row level security;
alter table profiles enable row level security;
alter table organisation_members enable row level security;
alter table sites enable row level security;
alter table assets enable row level security;
alter table check_templates enable row level security;
alter table scheduled_checks enable row level security;
alter table temperature_readings enable row level security;
alter table corrective_actions enable row level security;
alter table verification_reviews enable row level security;
alter table probe_thermometers enable row level security;
alter table calibration_records enable row level security;
alter table sensor_devices enable row level security;
alter table sensor_readings enable row level security;
alter table audit_log enable row level security;
alter table reports enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- Allow members to see other members' profiles within their org
drop policy if exists "profiles_select_org_members" on profiles;
create policy "profiles_select_org_members" on profiles
  for select using (
    exists (
      select 1 from organisation_members om1
      join organisation_members om2 on om1.organisation_id = om2.organisation_id
      where om1.user_id = auth.uid()
      and om2.user_id = profiles.id
    )
  );

-- ============================================================
-- ORGANISATIONS
-- ============================================================
drop policy if exists "orgs_select_member" on organisations;
create policy "orgs_select_member" on organisations
  for select using (is_org_member(id));

drop policy if exists "orgs_insert_authenticated" on organisations;
create policy "orgs_insert_authenticated" on organisations
  for insert with check (auth.uid() is not null);

drop policy if exists "orgs_update_owner" on organisations;
create policy "orgs_update_owner" on organisations
  for update using (is_org_owner(id));

drop policy if exists "orgs_delete_owner" on organisations;
create policy "orgs_delete_owner" on organisations
  for delete using (is_org_owner(id));

-- ============================================================
-- ORGANISATION MEMBERS
-- ============================================================
drop policy if exists "members_select_org" on organisation_members;
create policy "members_select_org" on organisation_members
  for select using (is_org_member(organisation_id));

drop policy if exists "members_insert_owner_or_self" on organisation_members;
create policy "members_insert_owner_or_self" on organisation_members
  for insert with check (
    is_org_owner(organisation_id) or user_id = auth.uid()
  );

drop policy if exists "members_update_owner" on organisation_members;
create policy "members_update_owner" on organisation_members
  for update using (is_org_owner(organisation_id));

drop policy if exists "members_delete_owner" on organisation_members;
create policy "members_delete_owner" on organisation_members
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- SITES
-- ============================================================
drop policy if exists "sites_select_member" on sites;
create policy "sites_select_member" on sites
  for select using (is_org_member(organisation_id));

drop policy if exists "sites_insert_owner_manager" on sites;
create policy "sites_insert_owner_manager" on sites
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "sites_update_owner_manager" on sites;
create policy "sites_update_owner_manager" on sites
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "sites_delete_owner" on sites;
create policy "sites_delete_owner" on sites
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- ASSETS
-- ============================================================
drop policy if exists "assets_select_member" on assets;
create policy "assets_select_member" on assets
  for select using (is_org_member(organisation_id));

drop policy if exists "assets_insert_owner_manager" on assets;
create policy "assets_insert_owner_manager" on assets
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "assets_update_owner_manager" on assets;
create policy "assets_update_owner_manager" on assets
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "assets_delete_owner" on assets;
create policy "assets_delete_owner" on assets
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- CHECK TEMPLATES
-- ============================================================
drop policy if exists "check_templates_select_member" on check_templates;
create policy "check_templates_select_member" on check_templates
  for select using (is_org_member(organisation_id));

drop policy if exists "check_templates_insert_owner_manager" on check_templates;
create policy "check_templates_insert_owner_manager" on check_templates
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "check_templates_update_owner_manager" on check_templates;
create policy "check_templates_update_owner_manager" on check_templates
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "check_templates_delete_owner" on check_templates;
create policy "check_templates_delete_owner" on check_templates
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- SCHEDULED CHECKS
-- ============================================================
drop policy if exists "scheduled_checks_select_member" on scheduled_checks;
create policy "scheduled_checks_select_member" on scheduled_checks
  for select using (is_org_member(organisation_id));

drop policy if exists "scheduled_checks_insert_member" on scheduled_checks;
create policy "scheduled_checks_insert_member" on scheduled_checks
  for insert with check (is_org_member(organisation_id));

drop policy if exists "scheduled_checks_update_member" on scheduled_checks;
create policy "scheduled_checks_update_member" on scheduled_checks
  for update using (is_org_member(organisation_id));

drop policy if exists "scheduled_checks_delete_owner_manager" on scheduled_checks;
create policy "scheduled_checks_delete_owner_manager" on scheduled_checks
  for delete using (is_org_owner_or_manager(organisation_id));

-- ============================================================
-- TEMPERATURE READINGS
-- ============================================================
drop policy if exists "temp_readings_select_member" on temperature_readings;
create policy "temp_readings_select_member" on temperature_readings
  for select using (is_org_member(organisation_id));

drop policy if exists "temp_readings_insert_member" on temperature_readings;
create policy "temp_readings_insert_member" on temperature_readings
  for insert with check (is_org_member(organisation_id));

drop policy if exists "temp_readings_update_owner_manager" on temperature_readings;
create policy "temp_readings_update_owner_manager" on temperature_readings
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "temp_readings_delete_owner" on temperature_readings;
create policy "temp_readings_delete_owner" on temperature_readings
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- CORRECTIVE ACTIONS
-- ============================================================
drop policy if exists "corrective_actions_select_member" on corrective_actions;
create policy "corrective_actions_select_member" on corrective_actions
  for select using (is_org_member(organisation_id));

drop policy if exists "corrective_actions_insert_member" on corrective_actions;
create policy "corrective_actions_insert_member" on corrective_actions
  for insert with check (is_org_member(organisation_id));

drop policy if exists "corrective_actions_update_owner_manager" on corrective_actions;
create policy "corrective_actions_update_owner_manager" on corrective_actions
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "corrective_actions_delete_owner" on corrective_actions;
create policy "corrective_actions_delete_owner" on corrective_actions
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- VERIFICATION REVIEWS
-- ============================================================
drop policy if exists "verification_select_member" on verification_reviews;
create policy "verification_select_member" on verification_reviews
  for select using (is_org_member(organisation_id));

drop policy if exists "verification_insert_owner_manager" on verification_reviews;
create policy "verification_insert_owner_manager" on verification_reviews
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "verification_update_owner_manager" on verification_reviews;
create policy "verification_update_owner_manager" on verification_reviews
  for update using (is_org_owner_or_manager(organisation_id));

-- ============================================================
-- PROBE THERMOMETERS
-- ============================================================
drop policy if exists "probes_select_member" on probe_thermometers;
create policy "probes_select_member" on probe_thermometers
  for select using (is_org_member(organisation_id));

drop policy if exists "probes_insert_owner_manager" on probe_thermometers;
create policy "probes_insert_owner_manager" on probe_thermometers
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "probes_update_owner_manager" on probe_thermometers;
create policy "probes_update_owner_manager" on probe_thermometers
  for update using (is_org_owner_or_manager(organisation_id));

-- ============================================================
-- CALIBRATION RECORDS
-- ============================================================
drop policy if exists "calibration_select_member" on calibration_records;
create policy "calibration_select_member" on calibration_records
  for select using (is_org_member(organisation_id));

drop policy if exists "calibration_insert_member" on calibration_records;
create policy "calibration_insert_member" on calibration_records
  for insert with check (is_org_member(organisation_id));

drop policy if exists "calibration_update_owner_manager" on calibration_records;
create policy "calibration_update_owner_manager" on calibration_records
  for update using (is_org_owner_or_manager(organisation_id));

-- ============================================================
-- SENSOR DEVICES
-- ============================================================
drop policy if exists "sensor_devices_select_member" on sensor_devices;
create policy "sensor_devices_select_member" on sensor_devices
  for select using (is_org_member(organisation_id));

drop policy if exists "sensor_devices_insert_owner_manager" on sensor_devices;
create policy "sensor_devices_insert_owner_manager" on sensor_devices
  for insert with check (is_org_owner_or_manager(organisation_id));

drop policy if exists "sensor_devices_update_owner_manager" on sensor_devices;
create policy "sensor_devices_update_owner_manager" on sensor_devices
  for update using (is_org_owner_or_manager(organisation_id));

drop policy if exists "sensor_devices_delete_owner" on sensor_devices;
create policy "sensor_devices_delete_owner" on sensor_devices
  for delete using (is_org_owner(organisation_id));

-- ============================================================
-- SENSOR READINGS
-- ============================================================
drop policy if exists "sensor_readings_select_member" on sensor_readings;
create policy "sensor_readings_select_member" on sensor_readings
  for select using (is_org_member(organisation_id));

drop policy if exists "sensor_readings_insert_member" on sensor_readings;
create policy "sensor_readings_insert_member" on sensor_readings
  for insert with check (is_org_member(organisation_id));

-- ============================================================
-- AUDIT LOG
-- ============================================================
drop policy if exists "audit_log_select_owner_manager" on audit_log;
create policy "audit_log_select_owner_manager" on audit_log
  for select using (is_org_owner_or_manager(organisation_id));

drop policy if exists "audit_log_insert_member" on audit_log;
create policy "audit_log_insert_member" on audit_log
  for insert with check (
    organisation_id is null or is_org_member(organisation_id)
  );

-- ============================================================
-- REPORTS
-- ============================================================
drop policy if exists "reports_select_member" on reports;
create policy "reports_select_member" on reports
  for select using (is_org_member(organisation_id));

drop policy if exists "reports_insert_owner_manager" on reports;
create policy "reports_insert_owner_manager" on reports
  for insert with check (is_org_owner_or_manager(organisation_id));

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

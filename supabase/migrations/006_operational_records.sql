-- FridgeProof: Operational records, audit columns, new check types
-- Safe migration: all new columns are nullable with no defaults required on existing rows.

-- =============================================================================
-- 1. Fix corrective_actions.action_type CHECK — add door_checked
-- =============================================================================
alter table corrective_actions
  drop constraint if exists corrective_actions_action_type_check;

alter table corrective_actions
  add constraint corrective_actions_action_type_check
  check (action_type in (
    'door_checked',
    'rechecked',
    'moved_stock',
    'adjusted_unit',
    'called_maintenance',
    'discarded_food',
    'escalated_to_manager',
    'other'
  ));

-- =============================================================================
-- 2. Audit columns on temperature_readings
-- =============================================================================
alter table temperature_readings
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid references profiles(id) on delete set null;

-- =============================================================================
-- 3. Audit columns on corrective_actions
-- =============================================================================
alter table corrective_actions
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid references profiles(id) on delete set null;

-- =============================================================================
-- 4. DELIVERY RECORDS
-- =============================================================================
create table if not exists delivery_records (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id) on delete cascade,
  site_id           uuid references sites(id) on delete cascade,
  supplier_name     text not null,
  product_name      text not null,
  batch_lot         text,
  use_by_date       date,
  storage_type      text check (storage_type in ('ambient', 'chilled', 'frozen', 'other')),
  allergens         text,
  quantity          text,
  status            text not null default 'accepted' check (status in ('accepted', 'rejected', 'conditional')),
  rejection_reason  text,
  received_at       timestamptz not null default now(),  -- when delivery actually arrived
  created_at        timestamptz default now(),           -- when record was entered in app
  updated_at        timestamptz,
  created_by        uuid references profiles(id) on delete set null,
  updated_by        uuid references profiles(id) on delete set null,
  notes             text,
  simulated_scan    boolean default false
);

alter table delivery_records enable row level security;

drop policy if exists "delivery_select_member"    on delivery_records;
drop policy if exists "delivery_insert_member"    on delivery_records;
drop policy if exists "delivery_update_member"    on delivery_records;

create policy "delivery_select_member" on delivery_records
  for select using (is_org_member(organisation_id));
create policy "delivery_insert_member" on delivery_records
  for insert with check (is_org_member(organisation_id));
create policy "delivery_update_member" on delivery_records
  for update using (is_org_owner_or_manager(organisation_id));

-- =============================================================================
-- 5. CLEANING CHECKS
-- =============================================================================
create table if not exists cleaning_checks (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id         uuid references sites(id) on delete cascade,
  checklist_name  text not null,
  items           jsonb,                   -- [{label, completed}]
  status          text not null default 'completed'
                    check (status in ('completed', 'partial', 'not_done')),
  checked_at      timestamptz not null default now(),   -- when cleaning happened
  created_at      timestamptz default now(),            -- when entered in app
  updated_at      timestamptz,
  completed_by    uuid references profiles(id) on delete set null,
  updated_by      uuid references profiles(id) on delete set null,
  notes           text
);

alter table cleaning_checks enable row level security;

drop policy if exists "cleaning_select_member"    on cleaning_checks;
drop policy if exists "cleaning_insert_member"    on cleaning_checks;
drop policy if exists "cleaning_update_member"    on cleaning_checks;

create policy "cleaning_select_member" on cleaning_checks
  for select using (is_org_member(organisation_id));
create policy "cleaning_insert_member" on cleaning_checks
  for insert with check (is_org_member(organisation_id));
create policy "cleaning_update_member" on cleaning_checks
  for update using (is_org_owner_or_manager(organisation_id));

-- =============================================================================
-- 6. FOOD PROCESS CHECKS (cooking, cooling, hot-hold, reheating)
-- =============================================================================
create table if not exists food_process_checks (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id         uuid references sites(id) on delete cascade,
  check_type      text not null check (check_type in ('cooking', 'cooling', 'hot_hold', 'reheating')),
  food_item       text not null,
  temperature_c   numeric,
  start_temp_c    numeric,     -- for cooling: starting temp
  end_temp_c      numeric,     -- for cooling: final temp
  status          text not null check (status in ('pass', 'warning', 'fail')),
  action_taken    text,
  checked_at      timestamptz not null default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz,
  checked_by      uuid references profiles(id) on delete set null,
  updated_by      uuid references profiles(id) on delete set null,
  notes           text
);

alter table food_process_checks enable row level security;

drop policy if exists "process_checks_select_member"    on food_process_checks;
drop policy if exists "process_checks_insert_member"    on food_process_checks;
drop policy if exists "process_checks_update_member"    on food_process_checks;

create policy "process_checks_select_member" on food_process_checks
  for select using (is_org_member(organisation_id));
create policy "process_checks_insert_member" on food_process_checks
  for insert with check (is_org_member(organisation_id));
create policy "process_checks_update_member" on food_process_checks
  for update using (is_org_owner_or_manager(organisation_id));

-- =============================================================================
-- 7. MANAGER REVIEWS (daily sign-off per kitchen)
-- =============================================================================
create table if not exists manager_reviews (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id         uuid references sites(id) on delete cascade,
  review_date     date not null,
  reviewed_by     uuid references profiles(id) on delete set null,
  reviewed_at     timestamptz default now(),
  status          text not null default 'reviewed'
                    check (status in ('reviewed', 'needs_followup')),
  notes           text,
  unique (organisation_id, site_id, review_date)
);

alter table manager_reviews enable row level security;

drop policy if exists "manager_reviews_select_member"         on manager_reviews;
drop policy if exists "manager_reviews_insert_owner_manager"  on manager_reviews;
drop policy if exists "manager_reviews_update_owner_manager"  on manager_reviews;

create policy "manager_reviews_select_member" on manager_reviews
  for select using (is_org_member(organisation_id));
create policy "manager_reviews_insert_owner_manager" on manager_reviews
  for insert with check (is_org_owner_or_manager(organisation_id));
create policy "manager_reviews_update_owner_manager" on manager_reviews
  for update using (is_org_owner_or_manager(organisation_id));

-- =============================================================================
-- 8. Indexes for new tables
-- =============================================================================
create index if not exists idx_delivery_records_org    on delivery_records(organisation_id);
create index if not exists idx_delivery_records_time   on delivery_records(received_at desc);
create index if not exists idx_cleaning_checks_org     on cleaning_checks(organisation_id);
create index if not exists idx_cleaning_checks_time    on cleaning_checks(checked_at desc);
create index if not exists idx_food_process_org        on food_process_checks(organisation_id);
create index if not exists idx_food_process_time       on food_process_checks(checked_at desc);
create index if not exists idx_manager_reviews_org     on manager_reviews(organisation_id, review_date desc);

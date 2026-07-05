-- Table management: restaurant_tables + table_tabs
-- Adds table map and tab tracking for bistro/restaurant segment.
-- Migration is additive: ALTER TABLE pos_transactions adds a nullable FK column.

-- ── restaurant_tables ──────────────────────────────────────────────────────────
create table if not exists restaurant_tables (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id         uuid references sites(id) on delete set null,
  name            text not null,
  section         text,
  capacity        smallint,
  sort_order      smallint not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists restaurant_tables_org_idx
  on restaurant_tables (organisation_id, site_id, sort_order);

alter table restaurant_tables enable row level security;

-- All active org members can read tables
create policy "rt_select_org_member" on restaurant_tables
  for select using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = restaurant_tables.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );

-- Only owners and managers can create/update/delete tables
create policy "rt_write_manager" on restaurant_tables
  for all using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = restaurant_tables.organisation_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'manager')
        and (om.status is null or om.status = 'active')
    )
  );


-- ── table_tabs ─────────────────────────────────────────────────────────────────
create table if not exists table_tabs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  site_id         uuid references sites(id) on delete set null,
  table_id        uuid not null references restaurant_tables(id) on delete restrict,
  opened_by       uuid references profiles(id) on delete set null,
  status          text not null default 'open'
                    check (status in ('open', 'bill_requested', 'closed', 'voided')),
  notes           text,
  cover_count     smallint,
  opened_at       timestamptz not null default now(),
  closed_at       timestamptz
);

-- Enforce one active tab per table (open or bill_requested)
create unique index if not exists table_tabs_one_active_per_table
  on table_tabs (table_id)
  where status in ('open', 'bill_requested');

create index if not exists table_tabs_org_status_idx
  on table_tabs (organisation_id, status);

alter table table_tabs enable row level security;

-- All active org members can read tabs
create policy "tt_select_org_member" on table_tabs
  for select using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = table_tabs.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );

-- All active org members can open/update tabs (cashier/staff need to open tables)
create policy "tt_write_org_member" on table_tabs
  for all using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = table_tabs.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );


-- ── Link pos_transactions → table_tab ─────────────────────────────────────────
alter table pos_transactions
  add column if not exists table_tab_id uuid
    references table_tabs(id) on delete set null;

create index if not exists pos_tx_table_tab_idx
  on pos_transactions (table_tab_id)
  where table_tab_id is not null;

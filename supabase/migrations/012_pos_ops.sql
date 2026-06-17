-- Phase 2: Product images + placeholders
alter table products add column if not exists image_url text;
alter table products add column if not exists placeholder_type text;
alter table products add column if not exists allergens text[] default '{}';

-- Phase 3: VAT snapshot fields on transaction items
alter table pos_transaction_items add column if not exists unit_price_gross numeric;
alter table pos_transaction_items add column if not exists net_amount numeric;
alter table pos_transaction_items add column if not exists vat_amount numeric;
alter table pos_transaction_items add column if not exists gross_amount numeric;

-- Phase 3: Transaction-level VAT totals
alter table pos_transactions add column if not exists subtotal_net numeric;
alter table pos_transactions add column if not exists total_gross numeric;

-- Phase 4: Audit events table
create table if not exists pos_audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  transaction_id uuid references pos_transactions(id) on delete cascade,
  event_type text check (event_type in ('created','voided','refunded','edited')),
  reason text,
  before_data jsonb,
  after_data jsonb,
  performed_by uuid references profiles(id) on delete set null,
  performed_at timestamptz default now()
);

create index if not exists idx_pos_audit_events_org on pos_audit_events(organisation_id, performed_at desc);
create index if not exists idx_pos_audit_events_tx on pos_audit_events(transaction_id);

alter table pos_audit_events enable row level security;

drop policy if exists pos_audit_events_select_org on pos_audit_events;
create policy pos_audit_events_select_org on pos_audit_events
  for select using (is_org_member(organisation_id));

drop policy if exists pos_audit_events_insert_owner_manager on pos_audit_events;
create policy pos_audit_events_insert_owner_manager on pos_audit_events
  for insert with check (
    is_org_member(organisation_id)
    and get_org_role(organisation_id) in ('owner','manager')
  );

-- Phase 5: Daily close records (simple, for Z-report saving)
create table if not exists pos_daily_close (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  close_date date not null,
  expected_cash numeric default 0,
  counted_cash numeric,
  cash_difference numeric,
  notes text,
  closed_by uuid references profiles(id) on delete set null,
  closed_at timestamptz default now()
);

create index if not exists idx_pos_daily_close_org on pos_daily_close(organisation_id, close_date desc);

alter table pos_daily_close enable row level security;

drop policy if exists pos_daily_close_select_org on pos_daily_close;
create policy pos_daily_close_select_org on pos_daily_close
  for select using (is_org_member(organisation_id));

drop policy if exists pos_daily_close_insert_owner_manager on pos_daily_close;
create policy pos_daily_close_insert_owner_manager on pos_daily_close
  for insert with check (
    is_org_member(organisation_id)
    and get_org_role(organisation_id) in ('owner','manager')
  );

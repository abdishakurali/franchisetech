-- ============================================================
-- 013_full_ops.sql — KitchenOps full operational schema
-- All statements use IF NOT EXISTS — safe to run multiple times
-- ============================================================

-- ── products: new operational columns ──────────────────────
alter table products add column if not exists image_url text;
alter table products add column if not exists placeholder_type text;
alter table products add column if not exists allergens text[] default '{}';
alter table products add column if not exists has_allergens boolean default false;
alter table products add column if not exists available_in_pos boolean default true;
alter table products add column if not exists is_sellable boolean default true;
alter table products add column if not exists is_stock_tracked boolean default false;
alter table products add column if not exists is_ingredient boolean default false;
alter table products add column if not exists current_stock_qty numeric default 0;
alter table products add column if not exists reorder_level numeric default 0;
alter table products add column if not exists supplier_id uuid;

-- ── pos_transactions: VAT + discount columns ───────────────
alter table pos_transactions add column if not exists subtotal_net numeric;
alter table pos_transactions add column if not exists subtotal_gross_before_discount numeric;
alter table pos_transactions add column if not exists discount_total numeric default 0;
alter table pos_transactions add column if not exists total_gross numeric;

-- ── pos_transaction_items: VAT snapshot columns ────────────
alter table pos_transaction_items add column if not exists unit_price_gross numeric;
alter table pos_transaction_items add column if not exists net_amount numeric;
alter table pos_transaction_items add column if not exists vat_amount numeric;
alter table pos_transaction_items add column if not exists gross_amount numeric;
alter table pos_transaction_items add column if not exists discount_amount numeric default 0;

-- ── units_of_measure ───────────────────────────────────────
create table if not exists units_of_measure (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  name text not null,
  abbreviation text,
  type text,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_uom_org on units_of_measure(organisation_id, name);
alter table units_of_measure enable row level security;
drop policy if exists uom_select_org on units_of_measure;
create policy uom_select_org on units_of_measure for select using (organisation_id is null or is_org_member(organisation_id));
drop policy if exists uom_insert_org on units_of_measure;
create policy uom_insert_org on units_of_measure for insert with check (organisation_id is null or (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager')));

-- ── suppliers ──────────────────────────────────────────────
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_suppliers_org on suppliers(organisation_id, name);
alter table suppliers enable row level security;
drop policy if exists suppliers_select_org on suppliers;
create policy suppliers_select_org on suppliers for select using (is_org_member(organisation_id));
drop policy if exists suppliers_insert_org on suppliers;
create policy suppliers_insert_org on suppliers for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));
drop policy if exists suppliers_update_org on suppliers;
create policy suppliers_update_org on suppliers for update using (is_org_owner_or_manager(organisation_id));

-- ── purchases ──────────────────────────────────────────────
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  purchase_date date not null default current_date,
  reference text,
  notes text,
  total_amount numeric default 0,
  status text check (status in ('draft','received','partial')) default 'received',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_purchases_org on purchases(organisation_id, purchase_date desc);
alter table purchases enable row level security;
drop policy if exists purchases_select_org on purchases;
create policy purchases_select_org on purchases for select using (is_org_member(organisation_id));
drop policy if exists purchases_insert_org on purchases;
create policy purchases_insert_org on purchases for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));

-- ── purchase_items ─────────────────────────────────────────
create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  purchase_id uuid references purchases(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity numeric not null default 1,
  unit_cost numeric not null default 0,
  total_cost numeric not null default 0,
  unit_of_measure text,
  created_at timestamptz default now()
);
create index if not exists idx_purchase_items_org on purchase_items(organisation_id);
create index if not exists idx_purchase_items_purchase on purchase_items(purchase_id);
alter table purchase_items enable row level security;
drop policy if exists purchase_items_select_org on purchase_items;
create policy purchase_items_select_org on purchase_items for select using (is_org_member(organisation_id));
drop policy if exists purchase_items_insert_org on purchase_items;
create policy purchase_items_insert_org on purchase_items for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));

-- ── stock_movements ────────────────────────────────────────
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  movement_type text check (movement_type in ('purchase_received','sale_used','manual_adjustment','wastage','return','opening')) default 'manual_adjustment',
  quantity numeric not null,
  unit_cost numeric,
  reference_id uuid,
  reference_type text,
  notes text,
  performed_by uuid references profiles(id) on delete set null,
  performed_at timestamptz default now()
);
create index if not exists idx_stock_movements_org on stock_movements(organisation_id, performed_at desc);
create index if not exists idx_stock_movements_product on stock_movements(product_id);
alter table stock_movements enable row level security;
drop policy if exists stock_movements_select_org on stock_movements;
create policy stock_movements_select_org on stock_movements for select using (is_org_member(organisation_id));
drop policy if exists stock_movements_insert_org on stock_movements;
create policy stock_movements_insert_org on stock_movements for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager','staff'));

-- ── pos_audit_events ───────────────────────────────────────
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
create policy pos_audit_events_select_org on pos_audit_events for select using (is_org_member(organisation_id));
drop policy if exists pos_audit_events_insert_org on pos_audit_events;
create policy pos_audit_events_insert_org on pos_audit_events for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));

-- ── pos_daily_close ────────────────────────────────────────
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
create policy pos_daily_close_select_org on pos_daily_close for select using (is_org_member(organisation_id));
drop policy if exists pos_daily_close_insert_org on pos_daily_close;
create policy pos_daily_close_insert_org on pos_daily_close for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));

-- ── foreign key: products.supplier_id ─────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'products_supplier_id_fkey'
  ) then
    alter table products add constraint products_supplier_id_fkey
      foreign key (supplier_id) references suppliers(id) on delete set null;
  end if;
end $$;

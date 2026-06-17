create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  color text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table products add column if not exists category_id uuid references product_categories(id) on delete set null;
alter table products add column if not exists unit_of_measure text not null default 'each';
alter table products add column if not exists cost_price numeric;

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  type text check (type in ('cash','card','online','other')) default 'cash',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists pos_transactions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  transaction_number text not null,
  sold_at timestamptz default now(),
  sold_by uuid references profiles(id) on delete set null,
  payment_method_id uuid references payment_methods(id) on delete set null,
  subtotal numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  notes text,
  status text check (status in ('completed','voided','refunded')) default 'completed',
  created_at timestamptz default now()
);

create table if not exists pos_transaction_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  transaction_id uuid references pos_transactions(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null,
  vat_rate numeric default 0,
  line_total numeric not null,
  created_at timestamptz default now()
);

alter table recipes add column if not exists updated_at timestamptz default now();
alter table recipe_items add column if not exists ingredient_name text;
alter table recipe_items add column if not exists unit_of_measure text;
alter table recipe_items add column if not exists unit_cost numeric default 0;
alter table recipe_items add column if not exists total_cost numeric default 0;

create index if not exists idx_product_categories_org on product_categories(organisation_id, sort_order, name);
create index if not exists idx_products_org_category on products(organisation_id, category_id);
create index if not exists idx_payment_methods_org on payment_methods(organisation_id);
create index if not exists idx_pos_transactions_org_sold_at on pos_transactions(organisation_id, sold_at desc);
create index if not exists idx_pos_transaction_items_org on pos_transaction_items(organisation_id);

alter table product_categories enable row level security;
alter table payment_methods enable row level security;
alter table pos_transactions enable row level security;
alter table pos_transaction_items enable row level security;

do $$
declare t text;
begin
  foreach t in array array['product_categories','payment_methods','pos_transactions','pos_transaction_items']
  loop
    execute format('drop policy if exists %I on %I', t || '_select_org_members', t);
    execute format('create policy %I on %I for select using (is_org_member(organisation_id))', t || '_select_org_members', t);
  end loop;
end $$;

drop policy if exists product_categories_insert_owner_manager on product_categories;
create policy product_categories_insert_owner_manager on product_categories for insert
with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));
drop policy if exists product_categories_update_owner_manager on product_categories;
create policy product_categories_update_owner_manager on product_categories for update
using (is_org_owner_or_manager(organisation_id));

drop policy if exists payment_methods_insert_owner_manager on payment_methods;
create policy payment_methods_insert_owner_manager on payment_methods for insert
with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager'));
drop policy if exists payment_methods_update_owner_manager on payment_methods;
create policy payment_methods_update_owner_manager on payment_methods for update
using (is_org_owner_or_manager(organisation_id));

drop policy if exists pos_transactions_insert_staff on pos_transactions;
create policy pos_transactions_insert_staff on pos_transactions for insert
with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager','staff'));
drop policy if exists pos_transaction_items_insert_staff on pos_transaction_items;
create policy pos_transaction_items_insert_staff on pos_transaction_items for insert
with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner','manager','staff'));
drop policy if exists pos_transactions_update_owner_manager on pos_transactions;
create policy pos_transactions_update_owner_manager on pos_transactions for update
using (is_org_owner_or_manager(organisation_id));

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  sale_price numeric not null default 0,
  vat_rate numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  source text not null default 'manual',
  external_sale_id text,
  sold_at timestamptz not null default now(),
  total_amount numeric not null default 0,
  payment_method text,
  created_at timestamptz default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_amount numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  unit text not null default 'unit',
  current_qty numeric not null default 0,
  reorder_level numeric,
  supplier text,
  cost_per_unit numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  supplier text not null,
  purchased_at timestamptz not null default now(),
  total_cost numeric not null default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  purchase_id uuid not null references purchases(id) on delete cascade,
  stock_item_id uuid references stock_items(id) on delete set null,
  item_name text not null,
  quantity numeric not null default 0,
  unit_cost numeric not null default 0,
  total_cost numeric not null default 0
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  yield_qty numeric not null default 1,
  created_at timestamptz default now()
);

create table if not exists recipe_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  stock_item_id uuid references stock_items(id) on delete set null,
  quantity numeric not null default 0,
  unit text not null default 'unit',
  cost numeric
);

create table if not exists pos_imports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  provider text not null default 'csv',
  filename text,
  imported_by uuid references profiles(id) on delete set null,
  imported_at timestamptz not null default now(),
  rows_imported int not null default 0,
  status text not null default 'completed'
);

create index if not exists idx_products_org on products(organisation_id);
create index if not exists idx_sales_org_sold_at on sales(organisation_id, sold_at desc);
create index if not exists idx_sale_items_org on sale_items(organisation_id);
create index if not exists idx_stock_items_org on stock_items(organisation_id);
create index if not exists idx_purchases_org on purchases(organisation_id, purchased_at desc);
create index if not exists idx_recipes_org on recipes(organisation_id);
create index if not exists idx_pos_imports_org on pos_imports(organisation_id, imported_at desc);

alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table stock_items enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;
alter table pos_imports enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','sales','sale_items','stock_items','purchases','purchase_items','recipes','recipe_items','pos_imports']
  loop
    execute format('drop policy if exists %I on %I', t || '_select_org_members', t);
    execute format('create policy %I on %I for select using (is_org_member(organisation_id))', t || '_select_org_members', t);
    execute format('drop policy if exists %I on %I', t || '_insert_org_staff', t);
    execute format('create policy %I on %I for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in (''owner'',''manager'',''staff''))', t || '_insert_org_staff', t);
    execute format('drop policy if exists %I on %I', t || '_update_owner_manager', t);
    execute format('create policy %I on %I for update using (is_org_owner_or_manager(organisation_id))', t || '_update_owner_manager', t);
    execute format('drop policy if exists %I on %I', t || '_delete_owner_manager', t);
    execute format('create policy %I on %I for delete using (is_org_owner_or_manager(organisation_id))', t || '_delete_owner_manager', t);
  end loop;
end $$;

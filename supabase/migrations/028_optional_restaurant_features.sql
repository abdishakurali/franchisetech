alter table public.organisations
  add column if not exists kitchen_display_enabled boolean not null default false,
  add column if not exists restaurant_order_flow_enabled boolean not null default false,
  add column if not exists table_service_enabled boolean not null default false,
  add column if not exists order_types_enabled boolean not null default false,
  add column if not exists kitchen_stations_enabled boolean not null default false,
  add column if not exists product_modifiers_enabled boolean not null default false,
  add column if not exists courses_enabled boolean not null default false,
  add column if not exists kitchen_printing_enabled boolean not null default false;

update public.organisations
set
  kitchen_display_enabled = coalesce(kitchen_display_enabled, false),
  restaurant_order_flow_enabled = coalesce(restaurant_order_flow_enabled, false),
  table_service_enabled = coalesce(table_service_enabled, false),
  order_types_enabled = coalesce(order_types_enabled, false),
  kitchen_stations_enabled = coalesce(kitchen_stations_enabled, false),
  product_modifiers_enabled = coalesce(product_modifiers_enabled, false),
  courses_enabled = coalesce(courses_enabled, false),
  kitchen_printing_enabled = coalesce(kitchen_printing_enabled, false);

alter table public.organisation_members drop constraint if exists organisation_members_role_check;
alter table public.organisation_members
  add constraint organisation_members_role_check
  check (role in ('owner', 'manager', 'staff', 'auditor', 'kitchen'));

create table if not exists public.kitchen_orders (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  sale_id uuid references public.pos_transactions(id) on delete set null,
  order_number text,
  status text not null default 'sent' check (status in ('sent', 'preparing', 'ready', 'completed')),
  order_type text,
  table_label text,
  note text,
  source text not null default 'pos',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.kitchen_order_items (
  id uuid primary key default gen_random_uuid(),
  kitchen_order_id uuid not null references public.kitchen_orders(id) on delete cascade,
  sale_item_id uuid references public.pos_transaction_items(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity numeric not null default 1,
  modifiers jsonb not null default '{}'::jsonb,
  note text,
  status text not null default 'sent' check (status in ('sent', 'preparing', 'ready', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_kitchen_orders_org_status on public.kitchen_orders(organisation_id, status, created_at desc);
create index if not exists idx_kitchen_orders_sale on public.kitchen_orders(sale_id);
create index if not exists idx_kitchen_order_items_order on public.kitchen_order_items(kitchen_order_id);

alter table public.kitchen_orders enable row level security;
alter table public.kitchen_order_items enable row level security;

drop policy if exists kitchen_orders_select_members on public.kitchen_orders;
create policy kitchen_orders_select_members on public.kitchen_orders
  for select using (is_org_member(organisation_id));

drop policy if exists kitchen_orders_insert_pos_staff on public.kitchen_orders;
create policy kitchen_orders_insert_pos_staff on public.kitchen_orders
  for insert with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager', 'staff'));

drop policy if exists kitchen_orders_update_kitchen on public.kitchen_orders;
create policy kitchen_orders_update_kitchen on public.kitchen_orders
  for update using (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager', 'kitchen'))
  with check (is_org_member(organisation_id) and get_org_role(organisation_id) in ('owner', 'manager', 'kitchen'));

drop policy if exists kitchen_order_items_select_members on public.kitchen_order_items;
create policy kitchen_order_items_select_members on public.kitchen_order_items
  for select using (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and is_org_member(ko.organisation_id)
    )
  );

drop policy if exists kitchen_order_items_insert_pos_staff on public.kitchen_order_items;
create policy kitchen_order_items_insert_pos_staff on public.kitchen_order_items
  for insert with check (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and is_org_member(ko.organisation_id)
        and get_org_role(ko.organisation_id) in ('owner', 'manager', 'staff')
    )
  );

drop policy if exists kitchen_order_items_update_kitchen on public.kitchen_order_items;
create policy kitchen_order_items_update_kitchen on public.kitchen_order_items
  for update using (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and is_org_member(ko.organisation_id)
        and get_org_role(ko.organisation_id) in ('owner', 'manager', 'kitchen')
    )
  )
  with check (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and is_org_member(ko.organisation_id)
        and get_org_role(ko.organisation_id) in ('owner', 'manager', 'kitchen')
    )
  );

alter table public.pos_audit_events drop constraint if exists pos_audit_events_event_type_check;
alter table public.pos_audit_events
  add constraint pos_audit_events_event_type_check
  check (event_type in (
    'created',
    'voided',
    'refunded',
    'edited',
    'feature_enabled',
    'feature_disabled',
    'kitchen_order_created',
    'kitchen_order_status_changed',
    'kitchen_item_status_changed'
  ));

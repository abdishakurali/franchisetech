-- Pending order lines on open table tabs (kitchen rounds before final payment)

create table if not exists table_tab_items (
  id                      uuid primary key default gen_random_uuid(),
  organisation_id         uuid not null references organisations(id) on delete cascade,
  site_id                 uuid references sites(id) on delete set null,
  table_tab_id            uuid not null references table_tabs(id) on delete cascade,
  product_id              uuid references products(id) on delete set null,
  product_name            text not null,
  quantity                numeric not null default 1,
  unit_price              numeric not null default 0,
  vat_rate                numeric,
  line_total              numeric not null default 0,
  status                  text not null default 'open'
                            check (status in ('open', 'settled', 'voided')),
  kitchen_order_id        uuid references kitchen_orders(id) on delete set null,
  settled_transaction_id  uuid references pos_transactions(id) on delete set null,
  created_at              timestamptz not null default now()
);

create index if not exists table_tab_items_tab_status_idx
  on table_tab_items (table_tab_id, status);

create index if not exists table_tab_items_org_idx
  on table_tab_items (organisation_id, table_tab_id);

alter table table_tab_items enable row level security;

create policy "tti_select_org_member" on table_tab_items
  for select using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = table_tab_items.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );

create policy "tti_write_org_member" on table_tab_items
  for all using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = table_tab_items.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );

-- Kitchen tickets before payment (table tab rounds)
alter table kitchen_orders
  add column if not exists table_tab_id uuid references table_tabs(id) on delete set null;

create index if not exists kitchen_orders_table_tab_idx
  on kitchen_orders (table_tab_id)
  where table_tab_id is not null;

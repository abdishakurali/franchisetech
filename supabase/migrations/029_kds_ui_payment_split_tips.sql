alter table public.organisations
  add column if not exists payment_split_enabled boolean not null default false,
  add column if not exists tips_enabled boolean not null default false,
  add column if not exists compact_workstation_nav_enabled boolean not null default false;

update public.organisations
set
  payment_split_enabled = coalesce(payment_split_enabled, false),
  tips_enabled = coalesce(tips_enabled, false),
  compact_workstation_nav_enabled = coalesce(compact_workstation_nav_enabled, false);

alter table public.kitchen_order_items
  add column if not exists unit_price numeric,
  add column if not exists line_total numeric,
  add column if not exists image_url text;

alter table public.pos_transactions
  add column if not exists tip_amount numeric not null default 0;

create table if not exists public.sale_payments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  sale_id uuid not null references public.pos_transactions(id) on delete cascade,
  method text not null check (method in ('cash', 'card', 'online', 'voucher', 'bank', 'other')),
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  amount numeric not null default 0,
  currency text default 'EUR',
  reference text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index if not exists idx_sale_payments_org_sale on public.sale_payments(organisation_id, sale_id);

alter table public.sale_payments enable row level security;

drop policy if exists sale_payments_select_org_members on public.sale_payments;
create policy sale_payments_select_org_members on public.sale_payments
  for select using (is_org_member(organisation_id));

drop policy if exists sale_payments_insert_pos_staff on public.sale_payments;
create policy sale_payments_insert_pos_staff on public.sale_payments
  for insert with check (
    is_org_member(organisation_id)
    and get_org_role(organisation_id) in ('owner', 'manager', 'staff', 'cashier')
  );

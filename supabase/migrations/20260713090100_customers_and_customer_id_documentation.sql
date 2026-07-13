-- Documentation-only migration. The `customers` table and `pos_transactions.customer_id`
-- column both already exist live in production but were applied outside the tracked
-- migration flow at some point in the app's history (no CREATE TABLE customers or
-- ALTER TABLE pos_transactions ADD COLUMN customer_id appears anywhere in git history
-- prior to this file). This captures the current live DDL + RLS so a fresh environment
-- built from migrations alone (staging, disaster recovery, a new dev DB) doesn't
-- silently end up missing them — needed as a prerequisite for the loyalty program,
-- since stamp accrual depends on pos_transactions.customer_id being populated.
--
-- Every clause below is IF NOT EXISTS / DROP POLICY IF EXISTS + CREATE, so this is a
-- no-op against the already-populated production database. Policy text was read
-- directly from pg_policies on production before writing this file — not guessed.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  tax_id text,
  vat_registered boolean default false,
  registration_code text,
  address text
);

alter table public.customers enable row level security;

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (
    organisation_id in (select organisation_id from organisation_members where user_id = auth.uid())
  );

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers
  for insert with check (
    organisation_id in (select organisation_id from organisation_members where user_id = auth.uid())
  );

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (
    organisation_id in (select organisation_id from organisation_members where user_id = auth.uid())
  );

-- pos_transactions itself is already tracked (011_pos_mvp.sql) with its own RLS —
-- only this one column was added outside the migration flow.
alter table public.pos_transactions
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists idx_pos_transactions_org_customer
  on public.pos_transactions(organisation_id, customer_id)
  where customer_id is not null;

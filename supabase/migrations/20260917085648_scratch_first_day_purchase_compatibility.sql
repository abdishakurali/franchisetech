-- Repair only the restored scratch/test database.  It is additive and makes
-- its historical table shapes compatible with the current first-day flow.
-- It must never be run against the live Dolcenera project.

alter table public.pos_transactions
  add column if not exists session_id uuid,
  add column if not exists site_id uuid;

alter table public.purchases
  add column if not exists supplier_id uuid,
  add column if not exists purchase_date date,
  add column if not exists reference text,
  add column if not exists invoice_number text,
  add column if not exists total_amount numeric not null default 0,
  add column if not exists status text not null default 'draft';

update public.purchases
set purchase_date = coalesce(purchase_date, purchased_at::date, current_date)
where purchase_date is null;

alter table public.purchases
  alter column purchase_date set default current_date,
  alter column purchase_date set not null;

alter table public.purchase_items
  add column if not exists product_id uuid,
  add column if not exists product_name text,
  add column if not exists unit_of_measure text,
  add column if not exists tax_rate numeric not null default 0,
  add column if not exists tax_amount numeric not null default 0;

create index if not exists idx_pos_transactions_org_session
  on public.pos_transactions (organisation_id, session_id);
create index if not exists idx_purchase_items_purchase_product
  on public.purchase_items (purchase_id, product_id);

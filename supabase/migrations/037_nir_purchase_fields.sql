-- ============================================================
-- 037_nir_purchase_fields.sql
-- P1.8: NIR metadata on purchases + org-wide yearly numbering
-- Additive only. Reconciled against production 2026-06-19.
-- ============================================================

-- ── 1. NIR columns on purchases ─────────────────────────────
alter table public.purchases
  add column if not exists nir_number text,
  add column if not exists nir_date date,
  add column if not exists supplier_invoice_date date,
  add column if not exists site_id uuid,
  add column if not exists received_by_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists posted_at timestamptz,
  add column if not exists posted_by uuid references public.profiles(id) on delete set null;

-- Site must belong to same organisation (matches 033 pattern)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'purchases_site_org_fkey') then
    alter table public.purchases
      add constraint purchases_site_org_fkey
      foreign key (site_id, organisation_id)
      references public.sites(id, organisation_id);
  end if;
end $$;

-- Status: extend for draft/post workflow (prod already has 'cancelled' in data)
alter table public.purchases drop constraint if exists purchases_status_check;
alter table public.purchases
  add constraint purchases_status_check
  check (status in ('draft','received','partial','posted','cancelled'));

-- NIR number unique per organisation (null-safe for legacy rows)
create unique index if not exists idx_purchases_org_nir_number
  on public.purchases (organisation_id, nir_number)
  where nir_number is not null;

create index if not exists idx_purchases_org_nir_date
  on public.purchases (organisation_id, nir_date desc nulls last);

create index if not exists idx_purchases_org_posted
  on public.purchases (organisation_id, posted_at desc nulls last)
  where posted_at is not null;

-- ── 2. Org-wide yearly NIR sequence ─────────────────────────
create table if not exists public.nir_sequences (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  year int not null,
  last_number int not null default 0,
  primary key (organisation_id, year)
);

alter table public.nir_sequences enable row level security;

-- ── 3. Concurrency-safe next number (server-only) ───────────
create or replace function public.next_nir_number(
  p_org_id uuid,
  p_year int
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
begin
  insert into public.nir_sequences (organisation_id, year, last_number)
  values (p_org_id, p_year, 1)
  on conflict (organisation_id, year)
  do update set last_number = nir_sequences.last_number + 1
  returning last_number into v_next;
  return v_next;
end;
$$;

revoke all on function public.next_nir_number(uuid, int) from public;
grant execute on function public.next_nir_number(uuid, int) to service_role;

-- NOTE: supplier invoice number uses existing purchases.invoice_number (no new column).

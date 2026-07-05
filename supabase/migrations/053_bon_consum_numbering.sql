-- ============================================================
-- 053_bon_consum_numbering.sql
-- Sequential Bon de Consum numbering (OMFP 2634/2015 Annex 1 pct. 24)
-- Mirrors the nir_sequences / next_nir_number pattern from 037.
-- Additive only — no existing tables modified.
-- ============================================================

-- ── 1. Org-wide yearly BC sequence ──────────────────────────
create table if not exists public.bon_consum_sequences (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  year            int  not null,
  last_number     int  not null default 0,
  primary key (organisation_id, year)
);

alter table public.bon_consum_sequences enable row level security;

create policy bc_seq_org on public.bon_consum_sequences
  for all using (is_org_member(organisation_id));

-- ── 2. Atomic increment (same pattern as next_nir_number) ───
create or replace function public.next_bc_number(p_org_id uuid, p_year int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
begin
  insert into public.bon_consum_sequences (organisation_id, year, last_number)
  values (p_org_id, p_year, 1)
  on conflict (organisation_id, year)
  do update set last_number = bon_consum_sequences.last_number + 1
  returning last_number into v_next;
  return v_next;
end;
$$;

-- ── 3. One BC document number per (org, from_date, to_date) ─
-- Repeat downloads for the same reporting period reuse the same number.
create table if not exists public.bon_consum_documents (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  from_date       date not null,
  to_date         date not null,
  bc_number       text not null,
  created_at      timestamptz default now(),
  unique (organisation_id, from_date, to_date)
);

alter table public.bon_consum_documents enable row level security;

create policy bc_docs_org on public.bon_consum_documents
  for all using (is_org_member(organisation_id));

-- ── 4. Upsert helper: returns existing or creates new number ─
create or replace function public.assign_bc_number(
  p_org_id uuid,
  p_from   date,
  p_to     date
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing text;
  v_seq      int;
  v_year     int;
  v_number   text;
begin
  -- Return existing assignment if this period was already numbered
  select bc_number into v_existing
  from public.bon_consum_documents
  where organisation_id = p_org_id
    and from_date = p_from
    and to_date   = p_to;

  if found then
    return v_existing;
  end if;

  -- Allocate next sequential number for the financial year of p_to
  v_year   := extract(year from p_to)::int;
  v_seq    := public.next_bc_number(p_org_id, v_year);
  v_number := 'BC-' || v_year::text || '-' || lpad(v_seq::text, 6, '0');

  insert into public.bon_consum_documents
    (organisation_id, from_date, to_date, bc_number)
  values
    (p_org_id, p_from, p_to, v_number)
  on conflict (organisation_id, from_date, to_date) do nothing;

  -- Re-read to handle the race where another request inserted first
  select bc_number into v_number
  from public.bon_consum_documents
  where organisation_id = p_org_id
    and from_date = p_from
    and to_date   = p_to;

  return v_number;
end;
$$;

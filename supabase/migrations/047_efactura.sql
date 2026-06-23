-- ============================================================
-- 047_efactura.sql
-- P2: e-Factura / SPV subsystem
-- Additive only. Backwards-compatible.
-- ============================================================

-- ── 1. ANAF org-level config ─────────────────────────────────
alter table public.organisations
  add column if not exists anaf_cif text,
  add column if not exists anaf_vat_registered boolean default false;

-- ── 2. ANAF OAuth tokens (service_role only) ─────────────────
create table if not exists public.anaf_oauth_tokens (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null unique references public.organisations(id) on delete cascade,
  cif             text not null,
  access_token    text not null,
  refresh_token   text not null,
  expires_at      timestamptz not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.anaf_oauth_tokens enable row level security;

-- Tokens are never accessible from client/browser code
drop policy if exists "service_role_only_anaf_tokens" on public.anaf_oauth_tokens;
create policy "service_role_only_anaf_tokens"
  on public.anaf_oauth_tokens
  using (false);

-- ── 3. e-Factura invoice registry ────────────────────────────
create table if not exists public.efactura_invoices (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  invoice_number      text not null,
  invoice_type        text not null default '380',
  issue_date          date not null,
  due_date            date,
  buyer_cif           text not null,
  buyer_name          text not null,
  buyer_address       jsonb,
  line_items          jsonb not null default '[]',
  total_excl_vat      numeric(15,2) not null default 0,
  total_vat           numeric(15,2) not null default 0,
  total_incl_vat      numeric(15,2) not null default 0,
  currency            text default 'RON',
  xml_content         text,
  upload_status       text not null default 'draft',
  processing_status   text,
  index_incarcare     bigint,
  id_descarcare       bigint,
  zip_content         bytea,
  error_message       text,
  retry_count         integer not null default 0,
  next_retry_at       timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (organisation_id, invoice_number)
);

alter table public.efactura_invoices enable row level security;

-- Org members can read their invoices
drop policy if exists "org_members_view_efactura" on public.efactura_invoices;
create policy "org_members_view_efactura"
  on public.efactura_invoices for select
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );

-- Owner / manager can insert
drop policy if exists "owner_manager_insert_efactura" on public.efactura_invoices;
create policy "owner_manager_insert_efactura"
  on public.efactura_invoices for insert
  with check (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and role in ('owner','manager')
        and (status is null or status = 'active')
    )
  );

-- Owner / manager can update (for status transitions)
drop policy if exists "owner_manager_update_efactura" on public.efactura_invoices;
create policy "owner_manager_update_efactura"
  on public.efactura_invoices for update
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and role in ('owner','manager')
        and (status is null or status = 'active')
    )
  );

-- ── 4. Indexes ───────────────────────────────────────────────
create index if not exists idx_efactura_org_status
  on public.efactura_invoices (organisation_id, upload_status);

create index if not exists idx_efactura_pending_poll
  on public.efactura_invoices (upload_status, processing_status)
  where upload_status = 'uploaded';

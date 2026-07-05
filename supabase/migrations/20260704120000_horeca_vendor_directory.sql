-- ============================================================
-- 20260704120000_horeca_vendor_directory.sql
-- Public HoReCa vendor/distributor directory (/resources/suppliers).
-- All statements use IF NOT EXISTS — safe to run multiple times.
--
-- This is the first genuinely PUBLIC-READ table family in this schema.
-- Every other table in this project is org-scoped private data; this one
-- is deliberately readable by anonymous marketing-site visitors.
--
-- Review-gate design: `reviewed_by` + `reviewed_at` on `vendors` are the
-- only columns that make a row eligible for public display (combined
-- with verification_status). SQL cannot verify that a human actually
-- read a PR diff before running the publish script — that is enforced
-- by process (see scripts/publish-vendor-batch.mjs), not by this schema.
-- What this schema DOES guarantee: no insert/update/delete policy is
-- granted to `anon` or `authenticated` at all, so the only way to write
-- to these tables is via the service-role key (createServiceClient() in
-- lib/supabase/server.ts), which is never shipped to the browser.
-- ============================================================

-- ── enums ────────────────────────────────────────────────────
do $$ begin
  create type vendor_category as enum (
    'coffee_equipment',
    'dairy',
    'meat_frozen',
    'fresh_produce',
    'alcoholic_beverages',
    'non_alcoholic_beverages',
    'packaging_disposables',
    'bakery_pastry_ingredients',
    'kitchen_bar_equipment',
    'cleaning_hygiene',
    'pos_fiscal_hardware'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type vendor_verification_status as enum (
    'unverified',       -- reviewed but NOT yet cleared for public display
    'listed',           -- human-approved factual listing, no partnership implied
    'verified_partner', -- explicit confirmed business relationship (rare, manual only)
    'rejected'          -- reviewed and rejected; kept for audit, never public
  );
exception when duplicate_object then null; end $$;

-- ── ro_counties: canonical region lookup (public, read-only) ──
create table if not exists ro_counties (
  slug text primary key,
  name text not null
);

insert into ro_counties (slug, name) values
  ('alba', 'Alba'), ('arad', 'Arad'), ('arges', 'Argeș'), ('bacau', 'Bacău'),
  ('bihor', 'Bihor'), ('bistrita-nasaud', 'Bistrița-Năsăud'), ('botosani', 'Botoșani'),
  ('brasov', 'Brașov'), ('braila', 'Brăila'), ('bucuresti', 'București'),
  ('buzau', 'Buzău'), ('caras-severin', 'Caraș-Severin'), ('calarasi', 'Călărași'),
  ('cluj', 'Cluj'), ('constanta', 'Constanța'), ('covasna', 'Covasna'),
  ('dambovita', 'Dâmbovița'), ('dolj', 'Dolj'), ('galati', 'Galați'),
  ('giurgiu', 'Giurgiu'), ('gorj', 'Gorj'), ('harghita', 'Harghita'),
  ('hunedoara', 'Hunedoara'), ('ialomita', 'Ialomița'), ('iasi', 'Iași'),
  ('ilfov', 'Ilfov'), ('maramures', 'Maramureș'), ('mehedinti', 'Mehedinți'),
  ('mures', 'Mureș'), ('neamt', 'Neamț'), ('olt', 'Olt'), ('prahova', 'Prahova'),
  ('satu-mare', 'Satu Mare'), ('salaj', 'Sălaj'), ('sibiu', 'Sibiu'),
  ('suceava', 'Suceava'), ('teleorman', 'Teleorman'), ('timis', 'Timiș'),
  ('tulcea', 'Tulcea'), ('vaslui', 'Vaslui'), ('valcea', 'Vâlcea'), ('vrancea', 'Vrancea')
on conflict (slug) do nothing;

-- ── vendors ──────────────────────────────────────────────────
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  brand_name text,
  cui text,
  slug text not null unique,
  category vendor_category not null,
  subcategories text[] not null default '{}',
  description text not null,
  website_url text not null,
  hq_city text,
  logo_url text,
  logo_source_url text,
  contact_email text,
  contact_phone text,
  verification_status vendor_verification_status not null default 'unverified',
  last_checked date,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendors_category on vendors(category) where reviewed_at is not null;
create index if not exists idx_vendors_public on vendors(reviewed_at) where reviewed_at is not null;

comment on column vendors.reviewed_by is
  'Set only by scripts/publish-vendor-batch.mjs after --reviewer= is checked against the internal staff allowlist. NULL = never public.';
comment on column vendors.reviewed_at is
  'NULL = never public, regardless of verification_status. This + verification_status in (listed, verified_partner) is the entire public-visibility gate.';
comment on column vendors.logo_url is
  'Re-hosted image URL (our own storage), NOT a hotlink to the vendor site. See logo_source_url for provenance.';
comment on column vendors.logo_source_url is
  'Where the logo was found — must be on the same domain as website_url. Checked by the publish script before re-hosting.';

-- ── vendor_regions: M:N, a vendor can serve multiple counties ──
create table if not exists vendor_regions (
  vendor_id uuid not null references vendors(id) on delete cascade,
  county_slug text not null references ro_counties(slug),
  primary key (vendor_id, county_slug)
);

create index if not exists idx_vendor_regions_county on vendor_regions(county_slug);

-- ── vendor_sources: provenance/audit trail, append-only ─────
create table if not exists vendor_sources (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  kind text not null check (kind in ('official_site', 'onrc', 'logo_provenance', 'other')),
  url text not null,
  note text,
  checked_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_sources_vendor on vendor_sources(vendor_id);

comment on table vendor_sources is
  'Internal provenance/audit trail. NOT rendered on public pages — see vendor_sources_public_select policy (using false).';

-- ── RLS: public read for reviewed + listed/verified_partner rows only ──
alter table vendors enable row level security;
alter table vendor_regions enable row level security;
alter table vendor_sources enable row level security;
alter table ro_counties enable row level security;

drop policy if exists vendors_public_select on vendors;
create policy vendors_public_select on vendors
  for select
  using (
    reviewed_at is not null
    and verification_status in ('listed', 'verified_partner')
  );

drop policy if exists vendor_regions_public_select on vendor_regions;
create policy vendor_regions_public_select on vendor_regions
  for select
  using (
    exists (
      select 1 from vendors v
      where v.id = vendor_id
        and v.reviewed_at is not null
        and v.verification_status in ('listed', 'verified_partner')
    )
  );

-- Sources are internal-only. No public select policy — `using (false)`
-- means even the anon/authenticated roles can never read this table.
drop policy if exists vendor_sources_public_select on vendor_sources;
create policy vendor_sources_public_select on vendor_sources
  for select
  using (false);

drop policy if exists ro_counties_public_select on ro_counties;
create policy ro_counties_public_select on ro_counties
  for select
  using (true);

-- No insert/update/delete policy is created for any table above, for
-- any role. This is intentional: all writes must go through the
-- service-role client (bypasses RLS by default in Supabase), used only
-- from scripts/publish-vendor-batch.mjs, never from browser/client code
-- and never from an `authenticated` end-user session.

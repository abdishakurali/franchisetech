-- Marketplace-controlled e-Factura visibility. Existing configured ANAF orgs
-- stay enabled, while new orgs install the integration on demand.

alter table public.organisations
  add column if not exists efactura_enabled boolean not null default false;

update public.organisations
set efactura_enabled = true
where anaf_cif is not null
  and trim(anaf_cif) <> '';

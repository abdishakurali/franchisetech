alter table suppliers
  add column if not exists tax_id text,
  add column if not exists vat_registered boolean default false,
  add column if not exists registration_code text;

create index if not exists idx_suppliers_org_tax_id on suppliers(organisation_id, tax_id);

alter table if exists customers
  add column if not exists tax_id text,
  add column if not exists vat_registered boolean default false,
  add column if not exists registration_code text,
  add column if not exists address text;

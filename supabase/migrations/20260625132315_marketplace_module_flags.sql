-- Marketplace-controlled modules. These flags hide/show product UI without
-- deleting configuration or historical data.

alter table public.organisations
  add column if not exists saga_export_enabled boolean not null default false;

update public.organisations
set saga_export_enabled = true
where saga_gestiune_code is not null
  and trim(saga_gestiune_code) <> '';

alter table public.sites
  add column if not exists saga_gestiune_code text;

-- Acquisition / campaign attribution on organisations (outreach tracking)
alter table public.organisations
  add column if not exists acquisition_source text null,
  add column if not exists acquisition_campaign text null,
  add column if not exists acquisition_content text null,
  add column if not exists acquisition_medium text null;

comment on column public.organisations.acquisition_source is 'utm_source at signup';
comment on column public.organisations.acquisition_campaign is 'utm_campaign at signup';
comment on column public.organisations.acquisition_content is 'utm_content at signup (e.g. company slug)';
comment on column public.organisations.acquisition_medium is 'utm_medium at signup';

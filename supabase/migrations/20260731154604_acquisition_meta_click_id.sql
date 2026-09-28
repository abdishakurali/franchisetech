alter table public.organisations
  add column if not exists acquisition_fbclid text null;

comment on column public.organisations.acquisition_fbclid is 'Meta click ID (fbclid) captured at signup — used to build the fbc parameter for Meta Conversions API events';

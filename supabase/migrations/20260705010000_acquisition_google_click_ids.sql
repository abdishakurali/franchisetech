-- Google Ads click identifiers + GA4 client id on organisations (for Enhanced Conversions / offline conversion import)
alter table public.organisations
  add column if not exists acquisition_gclid text null,
  add column if not exists acquisition_gbraid text null,
  add column if not exists acquisition_wbraid text null,
  add column if not exists acquisition_ga_client_id text null;

comment on column public.organisations.acquisition_gclid is 'Google Ads click ID (gclid) captured at signup — used for Enhanced Conversions / offline conversion upload';
comment on column public.organisations.acquisition_gbraid is 'Google Ads click ID for app-campaign clicks (gbraid) captured at signup';
comment on column public.organisations.acquisition_wbraid is 'Google Ads click ID for iOS web-to-app clicks (wbraid) captured at signup';
comment on column public.organisations.acquisition_ga_client_id is 'GA4 client_id from the _ga cookie at signup — required to attribute a server-side Measurement Protocol event back to the original session';

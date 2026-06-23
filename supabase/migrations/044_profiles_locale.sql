-- Per-user app language (en/ro). Null → org country default on read.
alter table public.profiles
  add column if not exists locale text;

alter table public.profiles
  drop constraint if exists profiles_locale_check;

alter table public.profiles
  add constraint profiles_locale_check
  check (locale is null or locale in ('en', 'ro'));

comment on column public.profiles.locale is 'User UI language for franchisetech app (en/ro). Null uses org country default.';

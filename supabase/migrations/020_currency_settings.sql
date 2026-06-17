alter table organisations
  add column if not exists currency_code text default 'EUR',
  add column if not exists currency_symbol text default '€';

update organisations
set currency_code = coalesce(currency_code, 'EUR'),
    currency_symbol = coalesce(currency_symbol, '€');

-- Keep the 0% selling default for unregistered RO organisations while allowing
-- non-zero catalog rates to remain active for supplier purchase documents.
create or replace function enforce_vat_registration_on_vat_rates()
returns trigger
language plpgsql
as $trigger$
declare
  v_country_code text;
  v_registered boolean;
begin
  if NEW.rate = 0 or coalesce(NEW.is_default, false) is not true then
    return NEW;
  end if;

  select country_code, anaf_vat_registered into v_country_code, v_registered
  from organisations where id = NEW.organisation_id;

  if upper(coalesce(v_country_code, '')) = 'RO' and coalesce(v_registered, false) is not true then
    raise exception 'Cannot make VAT rate % (%) the selling default before ANAF registration.',
      NEW.rate, coalesce(NEW.name, NEW.rate::text), NEW.organisation_id using errcode = '23514';
  end if;
  return NEW;
end;
$trigger$;

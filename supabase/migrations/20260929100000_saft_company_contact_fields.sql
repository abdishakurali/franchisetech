-- SAF-T D406 export: ANAF's own DUKIntegrator validator (Ro_SAFT_Schema_v249_2025.xsd,
-- CompanyHeaderStructure) requires Header/Company/Address, /Contact (with Telephone),
-- and /BankAccount. None of that data exists on organisations today — add it so the
-- export can be made schema-valid with real data instead of placeholders.
alter table public.organisations
  add column if not exists anaf_city text,
  add column if not exists anaf_phone text,
  add column if not exists anaf_bank_iban text;

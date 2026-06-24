alter table public.organisation_members
  drop constraint if exists organisation_members_role_check;

alter table public.organisation_members
  add constraint organisation_members_role_check
  check (role in ('owner', 'manager', 'staff', 'auditor', 'cashier', 'kitchen'));

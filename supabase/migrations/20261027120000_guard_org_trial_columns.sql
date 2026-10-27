-- Trial and card-verification fields are server-only.
--
-- Since 2026-10-27 an org's trial_ends_at grants Pro (15-day no-card trial,
-- see lib/billing/trial.ts). The orgs_update_owner_manager policy lets an
-- owner update any column of their own organisation, so without this guard
-- an owner could extend their own trial from the browser with the anon key.
--
-- Server code writes these columns with the service role (onboarding,
-- lib/billing/verification.ts), and SQL run by the project owner has no JWT
-- role, so both stay allowed. Additive and backwards-compatible: no column or
-- policy changes; dropping the trigger fully reverts it.

create or replace function public.guard_org_trial_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon')
     and (
       new.trial_started_at is distinct from old.trial_started_at
       or new.trial_ends_at is distinct from old.trial_ends_at
       or new.card_verified_at is distinct from old.card_verified_at
     )
  then
    raise exception 'trial and card verification fields can only be changed by the server'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_org_trial_columns on public.organisations;
create trigger guard_org_trial_columns
  before update on public.organisations
  for each row execute function public.guard_org_trial_columns();

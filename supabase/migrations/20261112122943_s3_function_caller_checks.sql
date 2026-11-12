-- Database functions that trusted their caller (2026-11-12 audit, S3).
-- All are SECURITY DEFINER and were executable by any logged-in user:
--   get_due_reminder_schedules: returned every org's reminder recipients (emails).
--     Callers in code/cron: none. -> service_role only.
--   credit_referral, credit_accountant_referral: any user could credit referrals for
--     any org. Live callers: the Stripe webhook via the service client only
--     (lib/referrals.ts creditReferralOnFirstPayment, app/api/billing/webhook).
--     -> service_role only.
--   assign_bc_number: any user could burn another org's Bon de consum numbers.
--     Live callers run as the logged-in user (consum page and PDF, gestiune data),
--     so it keeps EXECUTE for authenticated and now checks org membership.
--
-- Rollback: growth lead's file outbox/2026-11-12-s3-rollback.sql in command-center
-- (previous assign_bc_number definition + the old grants).

revoke execute on function public.get_due_reminder_schedules(timestamptz) from public, anon, authenticated;
grant execute on function public.get_due_reminder_schedules(timestamptz) to service_role;

revoke execute on function public.credit_referral(uuid, text, text) from public, anon, authenticated;
grant execute on function public.credit_referral(uuid, text, text) to service_role;

revoke execute on function public.credit_accountant_referral(uuid) from public, anon, authenticated;
grant execute on function public.credit_accountant_referral(uuid) to service_role;

create or replace function public.assign_bc_number(p_org_id uuid, p_from date, p_to date)
 returns text
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_existing text;
  v_seq      int;
  v_year     int;
  v_number   text;
begin
  -- Only the server or a member of this organisation may number its documents.
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_org_member(p_org_id) then
    raise exception 'not a member of this organisation' using errcode = '42501';
  end if;

  select bc_number into v_existing
  from public.bon_consum_documents
  where organisation_id = p_org_id
    and from_date = p_from
    and to_date   = p_to;

  if found then
    return v_existing;
  end if;

  v_year   := extract(year from p_to)::int;
  v_seq    := public.next_bc_number(p_org_id, v_year);
  v_number := 'BC-' || v_year::text || '-' || lpad(v_seq::text, 6, '0');

  insert into public.bon_consum_documents
    (organisation_id, from_date, to_date, bc_number)
  values
    (p_org_id, p_from, p_to, v_number)
  on conflict (organisation_id, from_date, to_date) do nothing;

  select bc_number into v_number
  from public.bon_consum_documents
  where organisation_id = p_org_id
    and from_date = p_from
    and to_date   = p_to;

  return v_number;
end;
$function$;

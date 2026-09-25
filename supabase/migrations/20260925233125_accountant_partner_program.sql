-- Accountant Partner Program: referral + commission tracking for accountants
-- who bring paying HoReCa clients to franchisetech.
--
-- Deliberately separate from the existing consumer referral system
-- (referrals table, organisations.referral_code/referred_by_code): a
-- different code namespace (AP- prefix), a different capture column
-- (organisations.accountant_partner_code), and its own tables. The two
-- systems never touch each other's columns or RPCs.

create table if not exists accountant_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  firm_name text,
  referral_code text unique not null default ('AP-' || substr(md5(random()::text), 1, 6)),
  commission_rate_eur numeric(10,2) not null default 15.00,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table accountant_partners enable row level security;

create policy "accountant_partners_select_own"
  on accountant_partners for select
  using (auth.uid() = user_id);

-- No write policies for `authenticated` — signup and the commission cron
-- both run via the service role, which bypasses RLS (same pattern as
-- billing_subscriptions / organisation_entitlement_overrides).

create table if not exists partner_referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references accountant_partners(id) on delete cascade,
  organisation_id uuid not null references organisations(id) on delete cascade,
  referred_at timestamptz not null default now(),
  first_payment_at timestamptz,
  status text not null default 'pending',
  unique (partner_id, organisation_id)
);

alter table partner_referrals enable row level security;

create policy "partner_referrals_select_own"
  on partner_referrals for select
  using (
    exists (
      select 1 from accountant_partners ap
      where ap.id = partner_referrals.partner_id and ap.user_id = auth.uid()
    )
  );

create table if not exists partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references accountant_partners(id) on delete cascade,
  referral_id uuid not null references partner_referrals(id) on delete cascade,
  period_month text not null,
  amount_eur numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (referral_id, period_month)
);

alter table partner_commissions enable row level security;

create policy "partner_commissions_select_own"
  on partner_commissions for select
  using (
    exists (
      select 1 from accountant_partners ap
      where ap.id = partner_commissions.partner_id and ap.user_id = auth.uid()
    )
  );

-- Referral capture column — additive, nullable, never read by the existing
-- consumer referral code path (lib/referrals.ts only reads referred_by_code).
alter table organisations add column if not exists accountant_partner_code text;

-- credit_accountant_referral — idempotent, mirrors credit_referral's pattern
-- (supabase/migrations/016_referral_rpcs_and_unique_constraint.sql): safe to
-- call more than once for the same org (e.g. webhook retries). Marks the
-- referral active on the org's first real payment. Portal-access granting is
-- deliberately NOT done here — that's a separate application-layer step (see
-- lib/accountant/partner-access.ts), called by the webhook handler right
-- after this RPC returns.
create or replace function public.credit_accountant_referral(p_org_id uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare
  v_partner_id uuid;
  v_inserted int;
begin
  select ap.id into v_partner_id
  from accountant_partners ap
  join organisations o on o.accountant_partner_code = ap.referral_code
  where o.id = p_org_id and ap.status = 'active';

  if v_partner_id is null then
    return;
  end if;

  insert into partner_referrals (partner_id, organisation_id, status, first_payment_at)
  values (v_partner_id, p_org_id, 'active', now())
  on conflict (partner_id, organisation_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    update partner_referrals
    set status = 'active', first_payment_at = coalesce(first_payment_at, now())
    where partner_id = v_partner_id and organisation_id = p_org_id and status <> 'active';
  end if;
end;
$$;

revoke all on function public.credit_accountant_referral(uuid) from public, anon;
grant execute on function public.credit_accountant_referral(uuid) to service_role;

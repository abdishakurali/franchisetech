alter table organisations
  add column if not exists trial_started_at timestamptz default now(),
  add column if not exists trial_ends_at timestamptz default (now() + interval '15 days'),
  add column if not exists referral_code text unique,
  add column if not exists referred_by_code text null,
  add column if not exists referral_credit_months integer default 0,
  add column if not exists referral_credit_note text null;

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  referrer_organisation_id uuid null references organisations(id) on delete set null,
  referral_code text not null,
  referred_email text null,
  referred_organisation_id uuid null references organisations(id) on delete set null,
  status text default 'pending' check (status in ('pending','signed_up','credited','cancelled')),
  credit_months integer default 1,
  created_at timestamptz default now(),
  signed_up_at timestamptz null,
  credited_at timestamptz null
);

alter table referrals enable row level security;

drop policy if exists referrals_select_org_members on referrals;
create policy referrals_select_org_members on referrals for select
using (
  exists (
    select 1 from organisation_members m
    where m.user_id = auth.uid()
      and (m.organisation_id = referrals.organisation_id or m.organisation_id = referrals.referrer_organisation_id)
  )
);

create index if not exists idx_referrals_org on referrals(organisation_id);
create index if not exists idx_referrals_referrer on referrals(referrer_organisation_id);
create index if not exists idx_referrals_code on referrals(referral_code);

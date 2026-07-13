-- Loyalty program (phone-anchored digital stamp card + regulars-at-risk owner view).
-- Additive only. loyalty_enabled defaults false, so this ships dormant until an org
-- installs the add-on via the existing marketplace/entitlement flow.

alter table public.organisations
  add column if not exists loyalty_enabled boolean not null default false,
  add column if not exists loyalty_stamps_required smallint not null default 8,
  add column if not exists loyalty_reward_type text not null default 'discount',
  add column if not exists loyalty_reward_discount_lei numeric(10,2),
  add column if not exists loyalty_reward_free_product_id uuid references public.products(id) on delete set null,
  add column if not exists loyalty_reward_description text,
  add column if not exists loyalty_regulars_min_visits smallint not null default 3,
  add column if not exists loyalty_regulars_at_risk_days smallint not null default 21;

alter table public.organisations drop constraint if exists organisations_loyalty_reward_type_check;
alter table public.organisations
  add constraint organisations_loyalty_reward_type_check
  check (loyalty_reward_type in ('discount', 'free_item'));

alter table public.organisations drop constraint if exists organisations_loyalty_stamps_required_check;
alter table public.organisations
  add constraint organisations_loyalty_stamps_required_check
  check (loyalty_stamps_required between 3 and 20);

-- Audit ledger: recording a redemption here is what "resets the cycle" for the next
-- stamp count (see get_loyalty_regulars_at_risk-adjacent derivation query in app code:
-- count completed pos_transactions for a customer since their last redeemed_at).
create table if not exists public.loyalty_redemptions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  transaction_id uuid references public.pos_transactions(id) on delete set null,
  stamps_used smallint not null,
  reward_description text,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz not null default now()
);

create index if not exists idx_loyalty_redemptions_org_customer
  on public.loyalty_redemptions(organisation_id, customer_id, redeemed_at desc);

alter table public.loyalty_redemptions enable row level security;

drop policy if exists loyalty_redemptions_select_org_members on public.loyalty_redemptions;
create policy loyalty_redemptions_select_org_members on public.loyalty_redemptions
  for select using (is_org_member(organisation_id));

drop policy if exists loyalty_redemptions_insert_staff on public.loyalty_redemptions;
create policy loyalty_redemptions_insert_staff on public.loyalty_redemptions
  for insert with check (
    is_org_member(organisation_id)
    and get_org_role(organisation_id) in ('owner','manager','staff','cashier')
  );

-- "Regulars at risk": customers who visited at a regular cadence (>= min_visits,
-- average gap no wider than 2x the at-risk window, which excludes one-off customers)
-- but haven't been seen in more than at_risk_days. Ranked by lifetime spend.
-- Not security definer: runs as the calling (RLS-scoped) user, so it only ever sees
-- rows that user's session can already see via the existing customers/pos_transactions
-- RLS policies.
create or replace function public.get_loyalty_regulars_at_risk(
  p_org_id uuid,
  p_min_visits int default 3,
  p_at_risk_days int default 21,
  p_limit int default 50
)
returns table (
  customer_id uuid,
  name text,
  phone text,
  visit_count bigint,
  lifetime_spend numeric,
  last_visit timestamptz,
  days_since_last_visit int
)
language sql stable as $$
  with visits as (
    select customer_id,
           count(*) as visit_count,
           sum(total) as lifetime_spend,
           max(sold_at) as last_visit,
           min(sold_at) as first_visit
    from public.pos_transactions
    where organisation_id = p_org_id and customer_id is not null and status = 'completed'
    group by customer_id
  )
  select v.customer_id, c.name, c.phone, v.visit_count, v.lifetime_spend, v.last_visit,
         extract(day from now() - v.last_visit)::int
  from visits v
  join public.customers c on c.id = v.customer_id
  where v.visit_count >= p_min_visits
    and v.last_visit < now() - make_interval(days => p_at_risk_days)
    and (
      v.visit_count <= 1
      or (extract(epoch from (v.last_visit - v.first_visit)) / 86400.0 / (v.visit_count - 1)) <= (p_at_risk_days * 2)
    )
  order by v.lifetime_spend desc
  limit p_limit;
$$;

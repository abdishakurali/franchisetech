-- Loyalty ROI report: spend comparison (loyalty vs non-loyalty), retention
-- rate, and most-redeemed rewards for a date range. Sibling to
-- get_loyalty_regulars_at_risk, kept as a single round-trip aggregate so the
-- page and the PDF export both make exactly one RPC call.
-- Not security definer: runs as the calling (RLS-scoped) user, so it only
-- ever sees pos_transactions / customers / loyalty_redemptions / organisations
-- rows that user's session can already see.
create or replace function public.get_loyalty_roi_summary(
  p_org_id uuid,
  p_period_start date,
  p_period_end date
)
returns table (
  avg_spend_loyalty numeric,
  avg_spend_non_loyalty numeric,
  loyalty_visit_count bigint,
  non_loyalty_visit_count bigint,
  customers_visited bigint,
  customers_retained bigint,
  retention_rate numeric,
  top_rewards jsonb
)
language sql stable as $$
  with tx as (
    select customer_id, total
    from public.pos_transactions
    where organisation_id = p_org_id
      and status = 'completed'
      and sold_at >= p_period_start::timestamptz
      and sold_at < (p_period_end + 1)::timestamptz
  ),
  loyalty_tx as (select total from tx where customer_id is not null),
  non_loyalty_tx as (select total from tx where customer_id is null),
  visits_per_customer as (
    select customer_id, count(*) as visit_count
    from tx
    where customer_id is not null
    group by customer_id
  ),
  redemptions as (
    select
      coalesce(nullif(r.reward_description, ''), o.loyalty_reward_type) as reward_label,
      r.stamps_used
    from public.loyalty_redemptions r
    join public.organisations o on o.id = r.organisation_id
    where r.organisation_id = p_org_id
      and r.redeemed_at >= p_period_start::timestamptz
      and r.redeemed_at < (p_period_end + 1)::timestamptz
  ),
  top_rewards_agg as (
    select reward_label,
           count(*) as redemption_count,
           sum(stamps_used) as stamps_used_total
    from redemptions
    group by reward_label
    order by count(*) desc
    limit 10
  )
  select
    (select avg(total) from loyalty_tx),
    (select avg(total) from non_loyalty_tx),
    (select count(*) from loyalty_tx),
    (select count(*) from non_loyalty_tx),
    (select count(*) from visits_per_customer),
    (select count(*) from visits_per_customer where visit_count >= 2),
    case when (select count(*) from visits_per_customer) = 0 then 0
      else round(
        (select count(*) from visits_per_customer where visit_count >= 2)::numeric
        / (select count(*) from visits_per_customer) * 100, 1)
    end,
    coalesce((select jsonb_agg(t) from top_rewards_agg t), '[]'::jsonb);
$$;

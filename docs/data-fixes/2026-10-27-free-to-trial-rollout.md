# Free plan → 15-day Pro trial: rollout notes

**Status: proposal only. Nothing has been changed in production.**

Owner decision 2026-10-27: no permanent Free plan. Every new org gets a 15-day Pro trial with no card, set at
onboarding. After it ends, an org without a subscription keeps selling and issuing fiscal receipts
(`trial_expired`, never blocked) but stock, recipes, NIR, accounting reports and new products need Pro.
At each renewal a paying org has 5 days to pay (`GRACE_PERIOD_DAYS = 5`).

## Deploy order

1. **Apply the migration first**: `supabase/migrations/20261027120000_guard_org_trial_columns.sql`.
   Without it, an owner can extend their own `trial_ends_at` from the browser (the `orgs_update_owner_manager`
   policy allows updating any column of their org) and keep Pro forever. It is additive: one function and one
   trigger; `drop trigger guard_org_trial_columns on public.organisations;` reverts it.
2. Deploy the code.
3. Decide on the existing orgs below.

## Existing orgs without a subscription

As of 2026-10-27 there are 12, all created before the trial existed, none with `trial_ends_at`. After deploy
they count as an **ended trial**: still able to sell, Pro features and new products locked. All look like
tests or abandoned signups (at most 1 sale each, last on 2026-09-28) except possibly **ARIESUL AGROLACT SRL**
(signed up 2026-10-15, 11 products, no sales).

If you want them to get the same 15 days from deploy day, run this once, after the deploy, in the Supabase
SQL editor (it runs as the project owner, which the guard allows). Idempotent: orgs that already have a trial
are skipped.

```sql
begin;

-- Preview: who gets a trial
select o.id, o.name, o.created_at::date
from public.organisations o
where o.trial_started_at is null
  and not exists (
    select 1 from public.billing_subscriptions b
    where b.organisation_id = o.id and b.stripe_subscription_id is not null
  )
order by o.created_at;
-- expected on 2026-10-27: 12 rows

update public.organisations o
set trial_started_at = now(),
    trial_ends_at    = now() + interval '15 days'
where o.trial_started_at is null
  and not exists (
    select 1 from public.billing_subscriptions b
    where b.organisation_id = o.id and b.stripe_subscription_id is not null
  );

commit;   -- or: rollback;
```

To give it only to the real prospect, add `and o.name = 'ARIESUL AGROLACT SRL'` to the `update`.

## Side effects to expect

- The billing-reminders cron sends its `trial_expired` email to orgs whose trial ended in the last few days.
  Its text now says they can keep selling and that stock, recipes, accounting reports and new products need a plan.
- PostHog `trial_started` now fires from onboarding (`source: "onboarding"`), not from card verification.
  Onboarding `plan` defaults to `growth` instead of `free` in PostHog and Loops.
- The optional €1 card-verification page still works, but no longer starts a trial for new orgs (onboarding
  already did); nothing in the app links to it.

## Not changed

Paid subscriptions that end (`canceled` after the grace window, or `past_due_expired`) still **lock the POS**
(`isSubscriptionBlockedForApp`), unlike an ended trial. Whether a lapsed paying customer should also keep
selling is a separate decision.

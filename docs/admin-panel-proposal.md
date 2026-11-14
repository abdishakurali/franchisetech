# /admin panel — follow-ups that need a decision

The panel on this branch is read-only and needs no schema change. These are
proposals only; nothing below has been applied.

## 1. `cron_runs` table (so "did the job run?" has an answer)

Today only `analytics-health` (via `analytics_health_checks`) and the owner
digest (via `owner_digest_send_log`) leave a trace. `billing-reminders`,
`billing-reconcile`, `accountant-commissions`, `first-receipt-watch` and
`backup-db` show "fără jurnal" on /admin/health.

```sql
-- PROPOSAL: supabase/migrations/<next>_cron_runs.sql  (additive, no RLS policies:
-- written and read with the service role only, like demo_leads)
create table if not exists public.cron_runs (
  id          bigserial primary key,
  job         text        not null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok          boolean,
  detail      text
);
create index if not exists cron_runs_job_started_idx on public.cron_runs (job, started_at desc);
alter table public.cron_runs enable row level security;
```

Each `app/api/cron/*/route.ts` would insert a row at start and update it at
the end (a small `withCronRun(job, fn)` wrapper). Retention: delete rows older
than 90 days in the same wrapper.

## 2. Indexes that would keep the panel cheap as data grows

Current volumes are tiny (≈5k sales, 17 orgs), so nothing is needed now.
If sales reach ~100k rows:

```sql
-- PROPOSAL only
create index if not exists pos_transactions_sold_at_completed_idx
  on public.pos_transactions (sold_at) where status = 'completed';
create index if not exists fiscal_receipt_attempts_attempted_at_idx
  on public.fiscal_receipt_attempts (attempted_at);
```

At that point the dashboard's 180-day sales read should move to an
aggregate view (`admin_daily_sales(day, organisation_id, total, n)`) instead
of paging rows.

## 3. Access

The gate is `isLeadAdmin` (`lib/leads/admin.ts`): confirmed email in
`LEAD_ADMIN_EMAILS`, default `info@franchisetech.ro`. Confirm that env var is
set on Vercel for Preview as well as Production, with only the founder's
address(es).

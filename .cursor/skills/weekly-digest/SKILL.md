---
name: weekly-digest
description: Monday morning metrics report. Use when I ask for weekly report, weekly numbers, or Monday digest. Covers the past 7 days.
---

# Weekly Metrics Digest

Query the past 7 days across all data sources.

Automated: n8n workflow **Growth — Weekly Metrics Digest** (Monday 8am Bucharest → Telegram). Manual: run this skill any time.

## Supabase MCP queries

**Funnel (7 days)** — see `lib/growth/founder-sla.ts` → `WEEKLY_FUNNEL_SQL`:

```sql
SELECT
  count(*) AS trial_signups,
  count(*) FILTER (WHERE growth_till_opened_at IS NOT NULL) AS till_opened,
  count(*) FILTER (WHERE growth_first_sale_at IS NOT NULL) AS first_sale,
  count(*) FILTER (WHERE growth_first_report_at IS NOT NULL) AS z_report,
  count(*) FILTER (WHERE growth_activated_at IS NOT NULL) AS activated
FROM organisations
WHERE created_at >= now() - interval '7 days';
```

**Outreach (7 days)** — `WEEKLY_OUTREACH_SQL` in same file.

**Stuck trials (founder SLA)** — `STUCK_TRIALS_SQL` — filter `WHERE sla_action IS NOT NULL`.

## Stripe MCP queries

- New subscriptions this week
- Churned subscriptions this week (canceled or unpaid)
- MRR start of week vs end of week (net change)
- Assisted setup (€199) purchases this week

## Output format:

📊 Weekly Digest — Week of [date]

FUNNEL

Trial signups: X
→ Till opened: X (X%)
→ First sale: X (X%)
→ Z-report: X (X%)
→ Paid conversion: X (X%)

OUTREACH (7d sent): X

REVENUE

New MRR added: €X
Churned MRR: €X
Net MRR change: +/- €X
Total MRR: €X

NEEDS ATTENTION (SLA)

[List orgs from STUCK_TRIALS_SQL where sla_action is not null]

NEXT WEEK FOCUS

Based on the weakest funnel stage above, suggest the single most impactful action to improve it.
Keep the suggestion specific to FranchiseTech's ICP and product — not generic advice.

## Baseline

Week zero snapshot: `docs/growth/WEEKLY-DIGEST-BASELINE.md`

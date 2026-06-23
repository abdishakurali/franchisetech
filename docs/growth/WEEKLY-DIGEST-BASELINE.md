# Weekly digest baseline — 2026-06-21

First run after outreach automation went live. Use as week-zero comparison for Monday n8n **Growth — Weekly Metrics Digest**.

## FUNNEL (past 7 days)

| Stage | Count | Rate |
|-------|-------|------|
| Trial signups | 1 | — |
| Till opened | 0 | 0% |
| First sale | 0 | 0% |
| Z-report | 0 | 0% |
| Activated | 0 | 0% |

**Interpretation:** Activation is the bottleneck — not top-of-funnel yet. Ireland trials (Dolcenera, The Health Bar) have zero `growth_*` milestones despite live accounts.

## REVENUE (Stripe)

| Metric | Value |
|--------|-------|
| Active subscriptions | 0 |
| MRR | €0 |
| New MRR this week | €0 |
| Churned MRR | €0 |

Note: Founder-reported under €500 MRR may be on a different Stripe account or manual billing — reconcile in Stripe dashboard.

## OUTREACH (v2-franchisetech)

| Type | Status | Count |
|------|--------|-------|
| customer | sent | 10 |
| customer | planned (duplicate batch) | 10 → **deleted** |
| partner | sent | 4 |
| partner | planned (duplicate batch) | 4 → **deleted** |

First live batch: 14 emails sent 2026-06-21 via `/daily-outreach`.

## Stuck trials (founder SLA)

| Org | Market | Owner | Issue |
|-----|--------|-------|-------|
| Dolcenera | IE | info@dolcenera.ro | No first sale — **re-engage** |
| The Health Bar | IE | calv131@yahoo.com | No first sale — **re-engage** |
| Dolce Nera | RO | roobleahmedd@gmail.com | Z-report viewed, not activated |

## NEXT WEEK FOCUS

**Call every trial older than 24h without `growth_first_sale_at`.** Product onboarding (demo products, till auto-open, POS tour) is live — the gap is founder-guided first sale, not more features.

Automations now live:

- n8n **Growth — Weekly Metrics Digest** (Monday 8am Bucharest → Telegram)
- n8n **Outreach — C2 Follow-up Planner** (daily — queues step 2 when day 4 elapsed)
- `/daily-brief` and `/weekly-digest` skills updated with SLA queries

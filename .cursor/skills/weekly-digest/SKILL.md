---
name: weekly-digest
description: Monday morning metrics report. Use when I ask for weekly report, weekly numbers, or Monday digest. Covers the past 7 days.
---

# Weekly Metrics Digest

Query the past 7 days across all data sources.

## Supabase MCP queries

- Trial signups this week (auth.users created in last 7 days)
- Activation rate: users with till_session_opened / total new trials
- First sale rate: users with first_sale_recorded / users with till_session_opened
- Z-report rate: users with z_report_viewed / users with first_sale_recorded

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

REVENUE

New MRR added: €X
Churned MRR: €X
Net MRR change: +/- €X
Total MRR: €X

NEXT WEEK FOCUS

Based on the weakest funnel stage above, suggest the single most impactful action to improve it.
Keep the suggestion specific to FranchiseTech's ICP and product — not generic advice.

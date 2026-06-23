---
name: daily-brief
description: Morning business status. Use when I ask what happened, how are we doing, or daily brief. Queries live data from Supabase, Stripe, and PostHog.
---

# Daily Brief

Query live data and report:

## Pull from MCP tools

**Supabase MCP:**

- New trial signups in last 24h (`organisations.created_at > now() - interval '24 hours'`)
- Users who set `growth_till_opened_at` yesterday
- Users who set `growth_first_report_at` yesterday
- **Founder SLA — stuck trials** (run `STUCK_TRIALS_SQL` from `lib/growth/founder-sla.ts`, show rows where `sla_action IS NOT NULL`)

### Activation SLA (founder actions)

| SLA | Trigger | Your action |
|-----|---------|-------------|
| 24h | Signup, no `growth_first_sale_at` | Personal email/call — offer 30-min screen share |
| 48h | Still no first sale | Live POS walkthrough (see `docs/growth/ireland-reengage.md`) |
| Day 7 | Sale but no `growth_first_report_at` | Walk through Z-report / till close |
| Day 12 | Trial ending, not activated | Offer €199 assisted setup or plan selection |

**Supabase stuck-trial query:**

```sql
-- Paste STUCK_TRIALS_SQL from lib/growth/founder-sla.ts, then:
-- SELECT * FROM (...) t WHERE sla_action IS NOT NULL;
```

**Stripe MCP:**

- New subscriptions created in last 24h
- Any subscriptions that went past_due in last 24h
- Current active subscription count
- Current MRR (sum of active subscription amounts)

**n8n MCP:**

- Any failed workflow executions in last 24h

## Format the output as:

🔔 Daily Brief — [today's date]

📈 Yesterday

- New trials: X
- Till sessions opened: X
- Z-reports viewed: X
- New paid conversions: X

💰 Current State

- Active subscribers: X
- MRR: €X
- Past due: X

⚠️ Needs Attention

[List sla_action trials with org name + email + recommended action]
[List any past_due subscriptions, any failed n8n workflows]

Keep it under 25 lines total. Plain text, no markdown tables.

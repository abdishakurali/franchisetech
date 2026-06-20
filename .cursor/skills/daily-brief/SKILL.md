---
name: daily-brief
description: Morning business status. Use when I ask what happened, how are we doing, or daily brief. Queries live data from Supabase, Stripe, and PostHog.
---

# Daily Brief

Query live data and report:

## Pull from MCP tools

**Supabase MCP:**

- New trial signups in last 24h (auth.users created_at > now - 24h)
- Users who triggered till_session_opened milestone yesterday
- Users who triggered z_report_viewed milestone yesterday

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

[List any past_due subscriptions with their email, any failed n8n workflows]

Keep it under 20 lines total. Plain text, no markdown tables.

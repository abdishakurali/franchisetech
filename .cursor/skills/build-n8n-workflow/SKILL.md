---
name: build-n8n-workflow
description: Build a new n8n automation workflow. Use when I describe an automation I want. Checks existing workflows first, then builds via n8n MCP.
---

# Build n8n Workflow

## Process

1. Use n8n MCP search_workflows to check if a similar workflow already exists
2. If it exists: show me what it does and ask if I want to modify it instead
3. If new: confirm the workflow spec with me before building:
   - Trigger type (webhook / schedule / n8n event)
   - Input data expected
   - Steps (what checks, what actions)
   - Output (Telegram / email / Supabase write / Loops event)
   - Credentials needed (list which n8n credentials must exist first)
4. Build using n8n MCP create_workflow_from_code
5. After building: show the webhook URL if applicable
6. Tell me exactly what code change is needed in Next.js to call this webhook

## Priority order (build these first if not built yet)

1. Trial Conversion Alert — z_report_viewed → no Stripe sub → Telegram
2. Cold email pipeline — CSV dedup → Zoho send → log
3. Stripe churn warning — past_due → Loops + Telegram
4. Weekly metrics digest — Monday 8am cron → email
5. Partner lead routing — form → Supabase → Loops → Telegram

## Credential checklist

Before building, verify these n8n credentials exist (ask me if not):

- Supabase: HTTP Header Auth with service role key
- Telegram: Bot Token + Chat ID stored as n8n credential
- Loops: HTTP Header Auth with LOOPS_API_KEY
- Stripe: Stripe credential node with secret key
- Zoho: from ZohoMCP or HTTP credential

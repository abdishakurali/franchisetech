# FranchiseTech.ro — Agent Operating Manual

## What This Product Is

FranchiseTech is a cloud operations workspace for small Romanian food businesses (cafés, restaurants, takeaway, patisseries with 1–3 locations). It is NOT franchise management software.

Core value: "Close the day with truth" — cash drawer vs expected, margin visibility, one workspace instead of Excel + WhatsApp + old POS.

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- Backend: Next.js server actions + API routes
- Database/Auth: Supabase (Postgres + RLS + Auth)
- Payments: Stripe (subscriptions + webhooks at app/api/billing/webhook/route.ts)
- Transactional email: Resend
- Lifecycle email: Loops (lib/loops.ts — loops SDK v6.3.0)
- Cold outreach: Zoho Mail (outreach/ Python scripts)
- Analytics: PostHog
- Automation: n8n at https://n8n.franchisetech.ro (MCP connected)
- Hosting: DigitalOcean VPS (SSH alias: do-server), nginx, PM2
- Fiscal: FiscalNet (local browser agent — never touch from Next.js backend)

## Connected MCP Servers

- supabase: query any table, users, subscriptions, sessions, growth milestones
- stripe: subscriptions, MRR, customers, invoices, churn
- resend: transactional email send/inspect
- github: PRs, issues, branches
- calcom: scheduling, upcoming onboarding calls
- n8n-mcp: create/trigger/list automation workflows
- ZohoMCP: outbound cold email
- loops: NOT via MCP — wired directly via lib/loops.ts SDK

## The 5 Activation Events (in order)

1. trial_started — user signs up (completePosOnboarding in app/actions/onboarding.ts ~line 27)
2. till_session_opened — first POS session (openPosSession in app/actions/kitchenops.ts ~line 509)
3. first_sale_recorded — first transaction saved (completeSaleReturn in app/actions/kitchenops.ts ~line 1713)
4. z_report_viewed — Z-report viewed (markGrowthReportViewed in app/actions/growth.ts)
5. subscription_created — Stripe webhook (app/api/billing/webhook/route.ts ~line 179)

## Pricing

- Starter: €49/mo (café, POS + products + Z-report)
- Pro: €79/mo (restaurant, stock + recipes + kitchen)
- Multi-location: €99/location/mo
- Assisted setup: €199 one-time
- Trial: 15 days, no card required

## ICP (Ideal Customer Profile)

Romanian food business owner, 1–3 locations, currently using Excel + old POS + WhatsApp.
Age 35–55. Not technical. Decision maker. Pain: doesn't know real cash position or margins.
Cities: București, Cluj, Timișoara, Iași, Brașov, Constanța.

## Sales Process

1. Cold email via Zoho (outreach/ scripts) → CSV of Romanian cafés/restaurants
2. Self-serve signup at /signup?plan=X with UTM tracking
3. Founder-led activation — goal: first sale within 48h of signup
4. 15-day assisted trial
5. Optional €199 assisted setup (booked via Cal.com)
6. Stripe checkout on conversion — no custom contracts

## Active Growth Metrics (track weekly)

- Trial signups this week
- Trial activation rate (till_session_opened / trial_started)
- First sale rate (first_sale_recorded / till_session_opened)
- Z-report rate (z_report_viewed / first_sale_recorded)
- Trial-to-paid conversion (subscription_created / trial_started)
- MRR (from Stripe)
- Churned this month

## Key Files

- app/actions/kitchenops.ts — POS logic, sessions, sales
- app/actions/onboarding.ts — trial/org creation
- app/actions/growth.ts — milestone tracking
- app/api/billing/webhook/route.ts — Stripe webhooks
- lib/loops.ts — Loops email SDK
- lib/growth/activation.ts — recordGrowthMilestone (centralizes events 2–4)
- outreach/ — cold email Python scripts
- predeploy-guard.sh — ALWAYS run before deploy

## Constraints

- NEVER touch /etc/nginx/sites-available/franchisetech.ro on do-server
- NEVER restart PM2 without checking predeploy-guard.sh first
- NEVER commit secrets (.env.local is gitignored)
- NEVER modify db/migrations — create new migration files only
- FiscalNet integration is local-only — never call it from Next.js API routes
- All user-facing text in Romanian, code comments in English
- Mobile-first for all UI changes

## How to Deploy

Production deploy is rsync-based — NOT git pull on server.
Run locally from Mac:

```bash
bash scripts/predeploy-guard.sh   # must pass before anything else
bash deploy.sh                     # rsync to /var/www/fp-releases/ on do-server
```

Do NOT run git pull or git clone on do-server — /opt/franchisetech is unrelated (Odoo).
The Next.js app runs from /var/www/fp-releases/current via PM2 (process: fridgeproof).

## When Stuck

- Check Supabase MCP for live data before assuming
- Check Stripe MCP for billing state before assuming
- Check PostHog for funnel data before assuming
- Check n8n MCP for existing workflows before building new ones

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Weekly growth metrics (North Star)

**North Star:** `activated_trials_per_week` — orgs that complete **open till → first sale → view daily report** within 7 days of signup.

## Spreadsheet columns

Copy into Google Sheets / Excel (one row per org per week review):

| Column | Description |
|--------|-------------|
| `week_ending` | Sunday date |
| `org_name` | Organisation name |
| `signup_date` | `organisations.created_at` |
| `acquisition_source` | `utm_source` (zoho, partner_*, organic) |
| `acquisition_campaign` | e.g. `ro-customer-q2-r2` |
| `acquisition_content` | slug / partner id |
| `till_opened` | Y if `growth_till_opened_at` set |
| `first_sale` | Y if `growth_first_sale_at` set |
| `report_viewed` | Y if `growth_first_report_at` set |
| `activated` | Y if `growth_activated_at` set |
| `paid` | Y if Stripe subscription active |
| `channel_notes` | outbound reply, partner name, etc. |

## Weekly rollup (one row per week)

| Metric | Source |
|--------|--------|
| Outbound sent | Zoho / `outreach/send-log.json` |
| Outbound replies | Manual |
| Signups | Supabase count by `created_at` |
| Activated trials | `growth_activated_at` in week |
| Partner-sourced signups | `acquisition_source` like `partner_%` |
| Compare page sessions | GA4 or GSC (when live) |
| Trial → paid | Billing dashboard |

## Export from Supabase

After migration `041_growth_activation.sql` is applied:

```bash
node scripts/export-growth-weekly.mjs > growth-export-$(date +%Y%m%d).csv
```

Requires `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in env.

## Founder activation SLA (48h — non-negotiable)

Every RO signup triggers founder-led activation. Track in the spreadsheet above and in PostHog `growth_*` milestones.

| Deadline | Action |
|----------|--------|
| **≤24h** | Personal WhatsApp or call — confirm business type, offer live screen-share |
| **≤48h** | Guided path to **first real sale** + end-of-day close screen |

Checklist per trial (same session when possible):

1. Signup acknowledged same day (WhatsApp/call)
2. Business details + currency RON
3. 5–10 products added (or demo catalog)
4. Till opened → **one real sale** (not sandbox-only)
5. End-of-day: show Z-style close — expected cash vs counted
6. Log `growth_till_opened_at`, `growth_first_sale_at`, `growth_first_report_at`
7. FiscalNet only if Multi-location prospect — do not block activation on fiscal setup

**If stuck after 48h:** personal re-engage (screen-share), not more product features.

**Daily enforcement:** run `/daily-brief` — uses `STUCK_TRIALS_SQL` in `lib/growth/founder-sla.ts`.

**Ireland re-engagement:** `docs/growth/ireland-reengage.md`

**Partner follow-up:** `docs/growth/partner-followup.md`

## Automated digests (n8n)

| Workflow | Schedule | Output |
|----------|----------|--------|
| Growth — Weekly Metrics Digest | Monday 8am Bucharest | Telegram funnel + focus |
| Outreach — C2 Follow-up Planner | Daily 7am | Telegram when C2 rows queued |

Week-zero baseline: `docs/growth/WEEKLY-DIGEST-BASELINE.md`

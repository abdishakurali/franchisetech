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

## Founder activation SLA

Every signup: founder-led onboard to **first sale within 48h** (plan Phase 1).

Checklist per trial:

1. Business details + currency RON
2. 5–10 products added
3. Till opened, one sale, report viewed
4. FiscalNet only if Multi-location prospect

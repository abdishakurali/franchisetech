# Organic traffic → demo → paid (branch `growth/demo-lead-capture`)

Built 2026-10-27 from the Search Console export (26 Jul – 25 Oct 2026: 848 clicks, 34,424 impressions).
Not deployed. Based on `origin/main` (`ca624bc`, already live: www canonicals, blog CTAs, Pro/Multi
pricing, 15-day trial).

## What ships

| Area | Change |
|---|---|
| `/demo` | New page (was a 308 to `/signup?plan=starter`, a retired plan). Hero, who it is for, a café day in six steps with real media only, Dolce Nera proof (published figures), Pro/Multi prices read from `lib/billing/plans.ts`, FAQ (hardware, fiscal, setup, price, trial), demo form. FAQPage + BreadcrumbList JSON-LD. In the sitemap. |
| Lead capture | `POST /api/demo-request` → `public.demo_leads` (new table) → email to the sales inbox. Validation, sanitising, honeypot, min-fill-time, link-stuffing check, DB rate limit (3 per IP hash per 10 min), duplicate guard. Succeeds only if the lead is stored **or** emailed; otherwise 503 with the inbox address. |
| Blog CTAs | Five top fiscal articles + NIR, Saga, café POS, recipe cost, ANAF connection, new stock article: contextual question after the first answer and a closing box → `/demo?from=<slug>&cta=blog_mid|blog_end`, public feature page as secondary. |
| Content | Saga article corrected (Saga C only, two exports, no "combined" export); NIR menu path corrected; recipe-cost links; new article "Cum gestionați stocul într-o cafenea: de la 1 kg de cafea la profitul real". |
| SEO | 35 redirects for Search-Console-reported 404s with a live equivalent (`lib/marketing/legacy-redirects.ts`); 7 broken internal links fixed (crawl of 153 sitemap pages now finds none); 3 CTAs that pointed at hidden feature pages (404 since `0fec713`) fixed. |

## Analytics: the journey and the events

| Step | Event (PostHog) | Notes |
|---|---|---|
| blog_viewed | `$pageview`, `$pathname` `^/blog/` | existing |
| marketing_cta_clicked | `marketing_cta_clicked`, `cta_location` `blog_mid`/`blog_end`/`blog_related_feature`, `blog_slug` | existing event |
| demo_page_viewed | `$pageview`, `$pathname = /demo` | existing |
| demo_form_started | `contact_form_started`, `source = demo_page` | same event as the contact form |
| demo_form_submitted | `demo_form_submitted` (server, after the lead is safe) | **new** |
| demo_qualified_lead | `qualified_lead`, `source = demo_page` (HoReCa business types) | existing name |
| trial_started | `trial_started` (server, onboarding) | existing |
| paid_subscription_started | `subscription_created` + `payment_succeeded` (server, Stripe webhook) | existing, authoritative |

Lead events carry only `business_type`, `locations`, `lead_fit`, `source_article`, `cta_id`, `landing_page`,
UTM fields and `has_phone` — no name, email, phone, business name or message (tested).
The client's anonymous PostHog id is passed so server events join the visitor's funnel.

Dashboard: **Organic → Demo → Paid** — https://eu.posthog.com/project/206414/dashboard/1060113
(8 insights; demo tiles are empty until this branch is live).

## Before deploying

1. **Apply the migration** `supabase/migrations/20261027130000_demo_leads.sql` (backup first, then
   `scripts/apply-migrations-production.sh`). Until it is applied the form still works: leads are emailed and the
   rate limit falls back to per-instance memory, but nothing is stored.
2. **Environment variables** (Vercel, production):
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — already set.
   - `SALES_EMAIL` — optional; defaults to `SUPPORT_EMAIL`, then `info@franchisetech.ro` (same inbox as `/contact`).
   - `LEAD_HASH_SALT` — recommended; any random string, salts the stored IP hash.
3. **Privacy policy**: `/privacy` is English-only and does not mention sales enquiries or their retention. The form
   has an inline Romanian notice (purpose, 24-month retention, deletion on request), but the policy should be
   updated by the owner.
4. Optional: replace `recipes.png` (shows a test account with a negative-margin item) before using it anywhere.

## Rollback

Vercel instant rollback to the previous production deployment. The `demo_leads` table can stay (unused) or be
dropped with `drop table public.demo_leads;` after exporting any leads. The 35 redirects and the `/demo` page
revert with the code.

## Not done / follow-ups

- No end-to-end submission against production: the local dev server is wired to the production database and the
  real Resend key, so the success path was tested with a mocked API in the browser and with unit tests on the
  handler (store + email + failure paths). After deploy, submit one real test lead and check the inbox and the
  `demo_leads` row.
- No CRM integration exists in the repo; leads live in `demo_leads` + the inbox.
- `homepage-content.ts` still links to the hidden `/features/recipe-costing`, but that content is not rendered on
  any live page (the crawl did not find it).

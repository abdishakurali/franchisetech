# Lead capture hardening (branch `growth/lead-hardening`)

Built 2026-10-27 on top of live `main` (`913be51`, /demo + `demo_leads`). Not pushed, not deployed,
migration not applied.

Commits: `1db406d` leads/lifecycle/privacy · `bd10ec6` analytics dev-capture · `75bb801` marketing claims + links.

## What ships

| Area | Change |
|---|---|
| Form | Bot timer starts at mount, not first focus (live bug: autofill/keyboard-less submits sent `started_at: 0` and were rejected). Consent checkbox removed; replaced by a notice linking to `/privacy#cereri-demo` — the processing is art. 6(1)(b), not consent. |
| Privacy | Romanian demo-enquiry notice on `/privacy#cereri-demo`: controller, data, purposes/bases, processors + locations, transfers, retention, rights, ANSPDCP. Facts that need the owner live in `lib/legal/controller.ts` marked PENDING. |
| Lead pipeline | Migration `20261027150000_demo_leads_lifecycle.sql` (additive): statuses new → contacted → qualified → demo_completed → trial_started → won / lost (+ spam, test), next action + due date, notes, linked organisation. `/app/leads`: noindex, admin-only (`LEAD_ADMIN_EMAILS`, default info@franchisetech.ro, confirmed email required), shows source article/CTA/UTM, repeat enquiries, email delivery status. |
| Test leads | `@franchisetech.ro` emails or business names starting "TEST" are stored with `is_test`/status `test` and never emit `qualified_lead`. PostHog dashboard 1060113 insights already filter `is_test`, `cta_id = deploy_check` and non-franchisetech hosts. |
| Trial linking | Onboarding marks a matching open lead `trial_started` and links the organisation (best-effort, never blocks onboarding). |
| Duplicates | Exact lower-cased email match (ILIKE treated `_`/`%` as wildcards). |
| Analytics | `localhost`/`*.localhost`/`*.test` never init PostHog; `next dev` sends no server events unless `POSTHOG_CAPTURE_IN_DEV=true`. Found because local testing was writing to the production project. |
| Content | Live "plan gratuit permanent / fără card" claims removed from `/compare/posnet`, `/compare/ebriza`, `/compare/expressoft`; AI-discovery pricing model updated; stock article linked from the NIR and inventar fizic articles. |

Compatibility: the new code works before the migration (insert retries without the new columns; `/app/leads`
shows a banner). The old code works after it (it inserts `status = 'new'`, still allowed).

## Gate (run on committed code, drafts stashed)

tsc 0 · lint 0 errors / 57 warnings · vitest 612/612 · `next build` OK · predeploy guard PASSED.

## Deploy order (each step needs explicit approval)

1. `bash scripts/backup/export-public-data.sh` (fresh, verified).
2. `ALLOW_PROD_MIGRATE=1 bash scripts/apply-migrations-production.sh supabase/migrations/20261027150000_demo_leads_lifecycle.sql`
   — also marks the one existing row (internal test, status `spam`) `is_test = true`.
3. Set the IP-hash salt (the code falls back to a constant that is in git, so hashes are brute-forceable over IPv4
   until this is set). Generates and stores it without printing it:
   `openssl rand -hex 32 | vercel env add LEAD_HASH_SALT production`
   Effect of changing it: rate-limit history (10-minute window) restarts. No migration, stored rows untouched.
4. Optional: `LEAD_ADMIN_EMAILS` if anyone besides info@franchisetech.ro should see `/app/leads`.
5. Push the branch → check the Vercel preview (`/demo`, `/privacy#cereri-demo`, `/compare/posnet`).
6. Fast-forward `main` → production deploy → smoke the required public routes.
7. Acceptance test (below).

Rollback: promote the previous Vercel deployment (`913be51`). The migration stays (additive; old code is
compatible). Unset `LEAD_HASH_SALT` only if needed — it reverts to the fallback constant.

## Acceptance test (after deploy)

1. Open a blog article → click the mid-article CTA → `/demo?from=<slug>&cta=blog_mid`.
2. Submit with a `TEST …` business name and an `@franchisetech.ro` email, using browser autofill.
3. Expect: success message; `demo_leads` row with `status = test`, `is_test = true`, `source_article` set,
   `email_status = sent`; notification in the info@ inbox; PostHog `demo_form_submitted` with `is_test = true`
   and **no** `qualified_lead`; dashboard tiles unchanged (excluded).
4. Sign in as info@franchisetech.ro → `/app/leads?view=all` shows the lead; set a status + next action → saved.
5. Repeat-submit the same email → duplicate count shows 2 earlier enquiries; no second notification flood.

Organic-Google attribution and a real trial → paid conversion can't be simulated; check the first real ones.

## Needs an owner or legal decision

- **Controller identity** — Stripe shows an individual account with no company name. The notice says
  "Operatorul site-ului franchisetech" until a legal name, address and registration number are given.
- **Retention** — 24 months is a placeholder (`DEMO_LEAD_RETENTION_MONTHS`). No automatic deletion yet.
- **Resend** — data region not confirmed; the US-transfer wording ("garanțiile din capitolul V GDPR") needs legal review.
- **Cookie consent** — PostHog sets cookies with no banner (ePrivacy). Not addressed here.
- **Sender name** — production `RESEND_FROM_EMAIL` reads "Fanchise tech" on customer emails (env change).

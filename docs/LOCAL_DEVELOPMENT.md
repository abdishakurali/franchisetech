# Local Development Guide

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in real Supabase values (see below)
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Environment variables

### Required for local dev (runtime)

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project → Settings → API | Public. Safe to use production URL locally. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project → Settings → API → anon/public key | Public. RLS policies restrict what this key can access. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project → Settings → API → service_role key | **Secret — never expose to browser or commit to git.** |

### Required only at runtime (not for build)

| Variable | Purpose | Local placeholder |
|---|---|---|
| `STRIPE_SECRET_KEY` | Billing flows | `sk_test_placeholder` |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks | `whsec_placeholder` |
| `STRIPE_PRO_PRICE_ID` | Subscription price ID | `price_placeholder_pro` |
| `STRIPE_STARTER_PRICE_ID` | Subscription price ID | `price_placeholder_starter` |
| `STRIPE_MULTI_LOCATION_PRICE_ID` | Subscription price ID | `price_placeholder_multi` |
| `RESEND_API_KEY` | Transactional email | `re_placeholder` |
| `RESEND_FROM_EMAIL` | From address | `noreply@franchisetech.ro` |
| `CRON_SECRET` | Cron job auth | Any string |
| `MARKETING_UPLOAD_TOKEN` | Marketing bootstrap | Any string |
| `SENSOR_INGEST_SECRET` | Sensor API auth | Any string |

### Optional

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Used in email links and OAuth redirects |
| `NEXT_PUBLIC_ENABLE_DEMO_TOOLS` | `false` | Enable demo mode UI |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | `false` | Enable Google OAuth login button |
| `NEXT_PUBLIC_GA_ID` | *(blank)* | Google Analytics — leave blank locally |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | *(blank)* | PostHog EU — from Project settings; enables analytics + session replay |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` | PostHog ingest host (EU cloud) |

---

## Local build verification (no deploy)

To verify the build passes before requesting deploy approval:

```bash
# 1. Pre-deploy guard (checks brand, protected paths, required files)
bash scripts/predeploy-guard.sh .

# 2. TypeScript — zero errors required
npx tsc --noEmit

# 3. Lint — zero errors required (warnings are pre-existing, acceptable)
npm run lint

# 4. Production build
npm run build
```

The build can run with placeholder values for Stripe, Resend, and internal secrets.
**Real Supabase credentials are recommended** so the build can verify data-fetching routes
(though all `/app/**` routes are `force-dynamic` and are not pre-rendered).

---

## Important: local dev uses production Supabase

This project connects to **production Supabase** even in local dev.

**Consequences:**
- Any sale you complete on `/app/pos` locally will be recorded in production.
- Any stock movement will affect real inventory.
- Any email action will send real emails (if `RESEND_API_KEY` is set to a real key).

**Safe local testing practices:**
- Use a test organisation (ask the owner to create a sandbox org).
- Do not complete real POS sales locally unless you intend to record them.
- For UI-only changes, use `/app/products`, `/app/settings`, `/app/reports` — these are read-heavy.
- Routes that are safe to test locally (read-only or auth-gated): `/`, `/pricing`, `/help`, `/login`, `/signup`.

---

## Running locally

```bash
# Development server with hot reload
npm run dev

# Production build (verifies everything compiles)
npm run build

# Serve production build locally
npm run build && npm run start
```

### Login

1. Go to http://localhost:3000/login
2. Log in with your existing franchisetech account credentials.
3. You will be taken to `/app` after login (same session as production if using production Supabase).

---

## Typecheck

```bash
# Checks app code only (excludes __tests__ — see tsconfig.json exclude)
npx tsc --noEmit

# Or via npm script
npm run typecheck
```

Test files (`lib/fiscalnet/__tests__/`) are excluded from the production typecheck because
they use Jest globals (`describe`, `it`, `expect`) and `@types/jest` is not installed as a
production dependency. This is intentional — test files are not part of the production build.

---

## Pre-deploy checklist

Before requesting deploy approval, ALL of the following must pass locally:

```bash
bash scripts/predeploy-guard.sh .   # PASS
npx tsc --noEmit                    # zero errors
npm run lint                        # zero errors
npm run build                       # success
```

Then report results and wait for `APPROVED TO DEPLOY` from the owner.

**Deploy is always a separate step** — local green does not trigger deploy automatically.

---

## FiscalNet / drawer note

- FiscalNet (`http://localhost` calls) must be called from the cashier PC browser — not from this dev server.
- Do not test FiscalNet flows locally unless you have a local FiscalNet installation on the same machine.
- Cash drawer opening is hardware-only — it will not open on a dev machine.

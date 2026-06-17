# franchisetech — Claude Code Operating Guide

> **Current public brand:** franchisetech
> **Allowed internal legacy name:** fridgeproof (server paths, PM2 app, DB URLs — do not rename these)
> **BLOCKED customer-facing brand:** KitchenOps — must not appear in any UI, page, nav, footer, email, or help text

---

## Quick-start for every task

Before writing a single line of code, state:

1. **Task level** — P0 / P1 / P2 / P3 / P4 (see priority framework below)
2. **Risk** — low / medium / high / regulated
3. **Touches** — database? POS? money? FiscalNet? stock? reports? customer data? deployment? public website? Android/APK?
4. **Files expected to change**
5. **Files explicitly not to touch**
6. **Rollback plan**
7. **Test plan**
8. **Acceptance criteria**

If the task touches money, fiscal, accounting, tax, stock, database, POS sessions, payments, reports, or customer records — **audit first, implement after risk is confirmed clear.**

---

## Priority framework — never skip to lower priority while higher is unstable

| Level | Name | Examples |
|---|---|---|
| **P0** | Live platform safety | deployment, rollback, public website, source sync, brand consistency, uptime |
| **P1** | Business flow & compliance | POS sale, payments, till open/close, FiscalNet, Romanian fiscal, reports, stock, DB/RLS, customer data |
| **P2** | Customer-request features | Romanian categories, purchases, RON/lei, TVA, UM, POS layout |
| **P3** | Customer experience | smart closing, guided mode, owner summary, staff UX, support |
| **P4** | Marketing & growth | landing claims, pricing, testimonials, case studies, growth content |

**Rule: No P2/P3/P4 work while P0 or P1 is unstable.**

---

## Customer experience principles

franchisetech's advantage is reliability, honesty, and clear workflows — not feature count.

Every change must answer:
1. Does this make the staff member faster or less likely to make a mistake?
2. Does this make the owner trust the numbers more?
3. Does this reduce support burden?
4. Does this work on the till screen?
5. Does this preserve existing workflows?
6. Does this handle failure clearly?
7. Does this respect local tax/fiscal rules?

Do not add features that make the till harder to use, hide errors, or require owner intervention to recover.

---

## Mandatory engineering rules

- **New features must never break existing business logic.**
- **Database migrations must be additive and backwards-compatible.**
- **Regulated workflows must be idempotent.** Repeated clicks/retries must not duplicate: sales, payments, fiscal commands, cash movements, opening balances, stock movements, or receipts.
- **"Command sent" is not success.** Do not claim success unless the operation is confirmed complete.
- **Fiscal/payment amount must not change unless explicitly intended.**
- **Cash received/change due must not affect fiscal revenue.**
- **App rollback does not undo database migrations.**
- **No live-folder builds.** Never `cd /var/www/fridgeproof && npm run build`.
- **No `pm2 restart all`.** Only `pm2 reload fridgeproof --update-env`.
- **No stale local deploys.** Sync from server source before deploying if in doubt.
- **No broad rsync from stale source.** Run pre-deploy guard first.
- **No Android/APK/download changes** unless this is an explicit connector task.
- **No public marketing claim** until product behaviour is verified and live.

---

## Deploy rules

### Production deploy is a separate approval step

Agents may prepare a deploy, but must NOT deploy unless ALL of the following are true:
1. Local build passes fully (`npm run build` or server build equivalent)
2. `bash scripts/predeploy-guard.sh` passes
3. TypeScript check clean (`npx tsc --noEmit` — zero errors, not just pre-existing)
4. Lint check clean (`npm run lint` — zero errors, warnings acceptable)
5. Changed files have been reviewed (show exact diff)
6. **Owner explicitly approves deploy in chat**

"Pre-existing error" is not a bypass. Fix the error or get explicit owner sign-off first.

### The only safe deploy path is:

```bash
bash scripts/predeploy-guard.sh        # runs from repo root on Mac
bash /tmp/franchisetech_deploy.sh      # or: deploy.sh in repo root
```

The deploy script internally:
1. Runs `scripts/predeploy-guard.sh`
2. Rsyncs source to a new timestamped release directory
3. Calls `/var/www/fp-releases/build.sh` on the server
4. Server builds → symlink swap → `pm2 reload fridgeproof --update-env`
5. Runs smoke checks

Rollback:
```bash
ssh do-server 'bash /var/www/fp-releases/rollback.sh'
```

### Banned commands — never run

```bash
cd /var/www/fridgeproof && npm run build       # live-dir build
cd /var/www/fridgeproof && rm -rf .next        # destroys live build
pm2 restart fridgeproof                        # hard restart kills requests
pm2 restart all                                # affects all PM2 apps
pm2 stop fridgeproof                           # takes site offline
```

---

## Brand rules

| Context | Rule |
|---|---|
| Customer-facing UI, pages, nav, footer, help, emails, onboarding | Must say **franchisetech** |
| Internal server paths (`/var/www/fridgeproof`), PM2 app name, DB connection strings | May say **fridgeproof** — do not rename these |
| KitchenOps | **BLOCKED everywhere** — not in UI, not in source, not in metadata |

`scripts/predeploy-guard.sh` will block deploy if KitchenOps appears in `app/page.tsx`, `app/pricing/page.tsx`, or `app/layout.tsx`.

---

## Database safety rules

- Never run `DROP TABLE`, `TRUNCATE`, or destructive schema changes.
- All migrations go in `supabase/migrations/` with sequential numbering (`NNN_description.sql`).
- Do not apply migrations to production without reviewing their RLS impact.
- New columns must have safe defaults or be nullable.
- Do not change RLS policies without explicit confirmation.
- Service role key must never appear in browser/client code.
- App rollback does not undo applied migrations — design accordingly.

---

## FiscalNet / payment safety rules

- Do not call FiscalNet localhost from the Next.js backend. FiscalNet must be called from the cashier PC client/browser or local agent.
- Do not send the opening balance twice (use per-session idempotency tracking).
- Do not create duplicate POS sessions.
- Do not make FiscalNet or drawer success required for local POS session to open.
- Do not send customer cash received as fiscal payment if it exceeds the sale total.
- Do not change VAT/group logic.
- Do not change VAT calculation.
- Do not recalculate historical data.
- Sale must still record even if drawer fails.
- Z report requires admin permission — never run automatically.
- X report requires admin permission.
- Cash in/out requires admin permission.

---

## Android/APK protection

- Do not touch `fp-android/`, `fp-android-connector/`, or any APK files in `public/downloads/`.
- Do not include those paths in rsync or deploys.
- Pre-deploy guard blocks any deploy that touches protected paths.

---

## POS and sale logic

- Do not touch POS sale creation logic.
- Do not change how cash/card/split payments are recorded.
- Do not change how change due is calculated.
- Do not remove or alter the manual fallback for drawer/fiscal failure.
- Do not hide POS errors.
- Do not claim drawer opened unless hardware status confirms it.
- Do not allow unauthenticated drawer opening.

---

## Protected files and paths

The following must not change without explicit task scope:

```
public/downloads/          # APK distribution
fp-android/                # Android connector source
android-connector/         # connector
app/actions/kitchenops.ts  # core business actions
lib/kitchenops/            # core business logic
supabase/migrations/       # DB history — only add, never delete
```

---

## Required public routes (smoke test must pass)

| Route | Expected |
|---|---|
| `/` | 200 |
| `/pricing` | 200 |
| `/help` | 200 |
| `/industries` | 200 |
| `/industries/cafes` | 200 |
| `/industries/restaurants` | 200 |
| `/industries/takeaways` | 200 |
| `/industries/food-trucks` | 200 |
| `/industries/health-bars` | 200 |
| `/features` | 200 |
| `/resources` | 200 |
| `/login` | 200 |
| `/signup` | 200 |
| `/app/pos` | 200 or 307 (auth redirect) |
| `/app/settings` | 200 or 307 (auth redirect) |

Known planned (not yet implemented — not regressions):
- `/start`
- `/industries/retail`

---

## Source of truth

| What | Where |
|---|---|
| Mac source | `~/Documents/Codex/2026-06-02/files-mentioned-by-the-user-pasted/work/fridgeproof/` |
| Server source (original) | `/var/www/fridgeproof` (physical dir — do not rename) |
| Live releases | `/var/www/fp-releases/releases/YYYYMMDD_HHMMSS/` |
| Current live symlink | `/var/www/fp-releases/current` |
| Good known release | `20260617_122603` |
| Deploy script (server) | `/var/www/fp-releases/build.sh` |
| Rollback script (server) | `/var/www/fp-releases/rollback.sh` |
| Env file | `/var/www/fridgeproof/.env.local` (symlinked into each release) |

When the Mac source is stale, pull from server:
```bash
rsync -av do-server:/var/www/fridgeproof/<path>/ <local-path>/
```

---

## Release validation

A release is valid only if it has:
- `.next/BUILD_ID` present
- `package.json` present
- `app/page.tsx` containing `franchisetech`
- `app/page.tsx` NOT containing `KitchenOps`
- `components/marketing/MarketingShell.tsx` present
- `public/franchise-tech-logo.png` present
- `RELEASE.json` present (written by build.sh)
- `supabase/migrations/035_purchase_inventory_model.sql` present

---

## Current deployment context (as of 2026-06-17)

- **Live release:** `20260617_122603`
- **PM2 app:** `fridgeproof` (2 instances, cluster mode)
- **Port:** 3001 (proxied by nginx)
- **Domain:** `franchisetech.ro` / `fridgeproof.franchisetech.ro`
- **Migration level:** 035 (purchase + inventory model)
- **Rollback targets:** all prior releases quarantined — build new release if rollback needed

---

## Do not jump to features

If a P0 or P1 issue is detected during any task, stop the current work, escalate, and fix the higher-priority issue first. Report clearly which priority level the issue is and what the impact is.

---

## Next.js version note

@AGENTS.md

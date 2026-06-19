# P1.8 NIR — Staging Review Package

**Branch:** `p1-8-nir`
**Commit:** `205ec0e` — Add Romanian NIR purchase workflow
**Date:** 2026-06-19
**Production deploy:** NOT performed
**Migration 037 on production:** NOT applied

---

## 1. Commit

| Item | Value |
|------|--------|
| Hash | `205ec0e2867b34334f08de23f860fe8a84d905fa` (short: `205ec0e`) |
| Message | Add Romanian NIR purchase workflow |

### Committed files (15)

- `supabase/migrations/037_nir_purchase_fields.sql`
- `lib/nir/purchase.ts`
- `app/actions/kitchenops.ts`
- `components/app/PurchaseForm.tsx`
- `components/app/PurchasesBulkTable.tsx`
- `components/app/PrintButton.tsx`
- `app/app/purchases/new/page.tsx`
- `app/app/purchases/page.tsx`
- `app/app/purchases/[id]/page.tsx`
- `app/app/purchases/[id]/edit/page.tsx`
- `app/app/purchases/[id]/print/page.tsx`
- `app/app/reports/page.tsx`
- `scripts/verify-nir-purchase-flow.mjs`
- `package.json`
- `review/p1-8-nir/PLAN.md`

Protected path check on commit: **clean**

---

## 2. Staging migration result

### Target identification

| Check | Result |
|-------|--------|
| `.env` Supabase URL | `https://ycqzxlahhfqwuteistvf.supabase.co` |
| Project ref | `ycqzxlahhfqwuteistvf` |
| Same project as live P1.7b | **Yes** (production Supabase) |
| Separate staging project in repo | **None configured** |

### Action taken

**Migration 037 was NOT applied.**

Reason: The only configured Supabase project matches the **live production database** (P1.7b accepted at `65ec273`). Owner instructions require staging-only apply and explicitly forbid production migration.

### Exact SQL (for owner apply on staging)

File: `supabase/migrations/037_nir_purchase_fields.sql` (81 lines)

Apply via Supabase SQL Editor on **staging project only**, after backup/snapshot.

### Read-only pre-apply verification (production/staging target)

Script: `node scripts/verify-staging-nir-schema.mjs`

| Object | Status |
|--------|--------|
| `purchases.nir_number` | MISSING |
| `purchases.nir_date` | MISSING |
| `purchases.supplier_invoice_date` | MISSING |
| `purchases.site_id` | MISSING |
| `purchases.received_by_user_id` | MISSING |
| `purchases.posted_at` | MISSING |
| `purchases.posted_by` | MISSING |
| `nir_sequences` | MISSING |
| `next_nir_number()` | MISSING |

**Verdict:** Migration 037 not applied on configured target.

---

## 3. RPC / service-role safety review

**Updated after atomic post fix (post-`205ec0e`).**

| # | Question | Verdict |
|---|----------|---------|
| 1 | RPC executable only by service role? | **Yes** — `post_nir_purchase` granted to `service_role` only; `next_nir_number` not client-callable |
| 2 | Service role key server-side only? | **Yes** — `createServiceClient()` in server action only |
| 3 | `security definer` safe? | **Partial** — RPC trusts `p_org_id` from server action; no membership check inside SQL |
| 4 | Normal browser client can call RPC? | **No** |
| 5 | Post action guards org ownership? | **Yes** — `getActiveOrg()` + draft upsert scoped to org; RPC verifies `organisation_id` |
| 6 | Post guards posted state? | **Yes** — RPC rejects `posted`/`received`/`posted_at`/`nir_number`; app pre-checks draft |
| 7 | Double-click / concurrent post? | **Mitigated** — `FOR UPDATE` row lock; second call gets `ALREADY_POSTED` |
| 8 | Stock update idempotent? | **Yes in RPC** — `NOT EXISTS` guard per `(purchase_id, product_id)` movement |

### Previous blocker (fixed)

Old flow split number allocation, purchase update, and stock across separate calls. **Replaced by single `post_nir_purchase` transaction.**

**Residual gap:** Draft upsert still happens in app layer before RPC (two round trips). If RPC fails after draft save, draft remains editable — acceptable. No stock change until RPC succeeds.

**Unique index on stock_movements:** Not added — legacy duplicates possible. RPC uses `NOT EXISTS` guard only.

---

## 4. Functional smoke tests (A–F)

**Environment:** Configured Supabase without migration 037. Full E2E blocked.

| Test | Result | Notes |
|------|--------|-------|
| **A — Draft no stock** | **BLOCKED** | Requires 037 + auth session |
| **B — Post NIR** | **BLOCKED** | RPC/columns missing |
| **C — Double post guard** | **STATIC PASS** | `verify-nir-purchase-flow.mjs` + code review |
| **D — Cancellation** | **STATIC PASS** | `canCancelPurchase` + `cancelPurchase` guards in code |
| **E — Old `received` purchase** | **PARTIAL** | 5 legacy `received` rows exist; detail UI code reviewed; live render blocked until app + migration on staging |
| **F — POS/FiscalNet unaffected** | **PASS** | `verify-pos-line-discount` 21/21; protected paths clean |

### Post-037 staging checklist (owner run after apply)

1. Create draft → verify `status=draft`, stock unchanged
2. Post → `NIR-YYYY-000001`, `posted_at` set, stock +1 movement
3. Re-post same → `?error=already_posted`, stock unchanged
4. Cancel draft → ok; cancel posted → blocked
5. Open legacy `received` → “Cumpărare veche / fără NIR”, print works

---

## 5. Screenshot paths

Local UI capture attempted against `npm run dev` (migration not required for form layout).

| File | Status |
|------|--------|
| `review/screenshots/p1-8-nir/purchase-draft-form.png` | See note below |
| `review/screenshots/p1-8-nir/nir-preview-or-post.png` | See note below |
| `review/screenshots/p1-8-nir/nir-detail-posted.png` | Blocked until 037 + post |
| `review/screenshots/p1-8-nir/nir-print-view.png` | Blocked until posted NIR |
| `review/screenshots/p1-8-nir/purchase-list-nir-column.png` | Blocked until auth |
| `review/screenshots/p1-8-nir/draft-cancel-blocked-posted.png` | Blocked until 037 + post |

**Note:** Screenshots require authenticated session to `/app/purchases/*`. Not committed per owner policy.

---

## 6. Gates (post-commit `205ec0e`)

| Gate | Result |
|------|--------|
| `predeploy-guard.sh` | PASS |
| `npm run lint` | PASS (64 warnings, 0 errors) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `verify-pos-line-discount` | PASS (21/21) |
| `verify-pos-cart-restore` | PASS (6/6) |
| `verify-nir-purchase-flow` | PASS (20/20) |
| Protected paths `HEAD~1..HEAD` | **clean** |

---

## 7. Known issues

1. **No staging Supabase project** in repo — only production ref configured
2. **Migration 037 not applied** anywhere yet
3. **Draft upsert + RPC are two round trips** — if RPC fails, draft remains (no stock change); acceptable
4. **CSV import** still creates legacy `received` with immediate stock (unchanged)
5. **RPC lacks org membership check** inside SQL (relies on server action + service_role)
6. **No unique index on stock_movements** — RPC uses `NOT EXISTS` only

---

## 8. Final status

### **`P1.8 NIR atomic post fix ready for staging`**

**Blockers for production approval:**

1. Apply 037 on **confirmed staging** Supabase (not `ycqzxlahhfqwuteistvf`)
2. Run functional smoke tests A–E on staging
3. Capture authenticated staging screenshots

**Ready:**

- Atomic `post_nir_purchase` RPC in migration 037
- Server action uses single RPC; `applyPurchaseStockIncrease` removed
- Extended static verification
- POS/FiscalNet unaffected

**Not done:**

- Production deploy / migration
- Full staging E2E

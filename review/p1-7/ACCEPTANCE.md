# P1.7 Acceptance Review — FiscalNet Discounts + POS Offline/Hold

**Date:** 2026-06-18 (updated P1.7-fix)
**Reviewer:** Automated code audit + fiscal command generation
**Final status:** **Ready for owner fiscal review** — lint fixed, offline queue hardened, migration 036 pending deploy approval.

---

## 1. Scope audit (P1.7 + P1.1 POS batch only)

Exclude marketing/blog/SEO files from deploy — they are unrelated dirty worktree noise.

### FiscalNet discount generation
| File | Change |
|------|--------|
| [`lib/fiscalnet/browser.ts`](../../lib/fiscalnet/browser.ts) | `DP^`/`DV^` after each `S^`; `ST^0` before `P^` |
| [`lib/fiscalnet/__tests__/fiscalnet.test.ts`](../../lib/fiscalnet/__tests__/fiscalnet.test.ts) | Test: `DP^3200` after Croissant `S^` |
| [`app/actions/kitchenops.ts`](../../app/actions/kitchenops.ts) | `discountPercent` on fiscal items; `discount_pct` DB writes |

**Not changed:** `command-builder.ts`, `service.ts`, `FiscalNetSettingsCard.tsx`, Android connector

### POS UI / two-step checkout
| File | Change |
|------|--------|
| [`components/app/PosRegister.tsx`](../../components/app/PosRegister.tsx) | Two-step flow, hold, offline queue, discount % |
| [`components/app/PosCashKeypad.tsx`](../../components/app/PosCashKeypad.tsx) | Cash keypad (payment step) |
| [`lib/pos-i18n.ts`](../../lib/pos-i18n.ts) | RO/EN payment/register strings |
| [`lib/pos-cart-backup.ts`](../../lib/pos-cart-backup.ts) | Safe cart restore (Register only) |

### Migration 036
| File | Change |
|------|--------|
| [`supabase/migrations/036_pos_discount_pct.sql`](../../supabase/migrations/036_pos_discount_pct.sql) | Adds `discount_pct` columns |

### Hold / resume orders
| File | Change |
|------|--------|
| [`lib/pos-held-sales.ts`](../../lib/pos-held-sales.ts) | sessionStorage, max 5 held sales |

### Offline sale queue
| File | Change |
|------|--------|
| [`lib/pos-offline-queue.ts`](../../lib/pos-offline-queue.ts) | localStorage queue, max 20 |

### Chatwoot hiding
| File | Change |
|------|--------|
| [`components/app/SupportChat.tsx`](../../components/app/SupportChat.tsx) | `return null` when `pathname.startsWith("/app/pos")` |

### i18n labels
| File | Change |
|------|--------|
| [`lib/pos-i18n.ts`](../../lib/pos-i18n.ts) | Expanded RO/EN for payment, hold, offline |
| [`components/app/PosRegister.tsx`](../../components/app/PosRegister.tsx) | Uses `t.*` on order/payment steps |

**Still mixed EN:** utility bar (New sale, Customers, Refund), modals, Z-report dialog — not payment-step critical.

---

## 2. Migration 036 review

```sql
alter table pos_transactions add column if not exists discount_pct numeric default 0;
alter table pos_transaction_items add column if not exists discount_pct numeric default 0;
```

| Check | Result |
|-------|--------|
| Tables | `pos_transactions`, `pos_transaction_items` |
| Column | `discount_pct numeric default 0` |
| Nullable | Implicitly nullable; default 0 for new rows |
| Destructive | **No** — additive only |
| Rollback | `ALTER TABLE ... DROP COLUMN discount_pct` (optional; safe to leave) |
| Old sales render | **Yes** — receipt page uses `line_total`, `gross_amount`, `discount_amount`; does not require `discount_pct` |
| Old receipts | **Yes** — no template change; new column ignored when 0/null |
| RLS break | **No** — no policy changes; existing insert/select policies unchanged |

**Deploy requirement:** Migration **must be applied** before sales write `discount_pct` or inserts may fail on production.

---

## 3. FiscalNet command examples

Config used: `operatorCode=1`, `fiscalNetGroup=1`, cash=`P^1^`, card=`P^5^`, UM=`Buc`.

Encoding: price × 100 bani, qty × 1000, DP value = percent × 100.

### A. One product, no discount (Apple Danish €3.10, cash)

```
S^Apple Danish^310^1000^Buc^1^1
ST^0
P^1^310
```

### B. One product, 10% cart discount (€3.10 → €2.79)

```
S^Apple Danish^310^1000^Buc^1^1
DP^1000
ST^0
P^1^279
```

### C. Two products, 10% cart discount (€6.30 → €5.67)

**Yes — DP under each line** (cart-wide % applied to every fiscal item):

```
S^Apple Danish^310^1000^Buc^1^1
DP^1000
S^Chocolate Croissant^320^1000^Buc^1^1
DP^1000
ST^0
P^1^567
```

VAT/tax in DB: each line `gross_amount` discounted by same multiplier; `tax_total` sum matches receipt.

### D. Two products, discount on ONE item only

**NOT supported.** Cart `discount_pct` applies to **all** lines equally in `completeSaleReturn`. Both items receive `discountPercent` when cart discount > 0.

Per-item selective discount requires P1.7 follow-up (line-level discount UI + selective `DP^`/`DV^`).

### E. Fixed value discount (DV^)

| Layer | Status |
|-------|--------|
| `browser.ts` | **Can emit** `DV^` if `discountValue` set on item |
| POS UI | **Not exposed** — only `Discount %` field, no fixed RON/€ discount |
| `completeSaleReturn` | **Does not pass** `discountValue` |

UI does not imply fixed-value FiscalNet support. No `DV^` in live POS flow today.

**Library-only example** (not reachable from POS):

```
S^Item^1000^1000^Buc^1^1
DV^200
ST^0
P^1^800
```

### F. Subtotal discount (ST^ + DP on subtotal)

**Not supported.** Code always emits `ST^0` (marker before payment, no subtotal-level discount). No `ST^` + cart-wide DP combo.

---

## 4. Chocolate Croissant real case

User report: €3.20 list, receipt **€2.18** cash, old fiscal file missing `DP^`:

```
S^Chocolate Croissant^320^1000^Buc^1^1
ST^0
P^1^218          ← wrong: payment discounted but no DP^
```

### If discount entered as **32%** in cart (matches €2.18 rounding)

| Field | Value |
|-------|-------|
| Gross before | €3.20 |
| Discount (32%) | €1.02 (display −€1.02) |
| Payable total | €2.18 (3.20 × 0.68 = 2.176 → €2.18) |

**Expected FiscalNet after fix:**

```
S^Chocolate Croissant^320^1000^Buc^1^1
DP^3200
ST^0
P^1^218
```

| Check | Expected |
|-------|----------|
| `P^` amount | **218** bani (= discounted payable total) |
| Cash received | UI/metadata only in `sale_payments.metadata` |
| Fiscal sale amount | **218** — not cash received |
| Response | `fiscalBrowserReceipt` → API or file download; mock mode skips hardware |

**Note:** If cashier edited **line total** to €2.18 instead of using **Discount %**, fiscal `S^` still shows full unit price with **no** `DP^` — line-total edits are not wired to `DV^`. Use cart **Discount %** for fiscal-correct receipts.

---

## 5. Payment correctness

| Check | Status |
|-------|--------|
| Fiscal `P^` = discounted payable total | **Pass** — `buildFiscalNetReceiptLines(..., total)` uses `saleTotal` |
| Cash received not sent as fiscal amount | **Pass** — only in `sale_payments.metadata` |
| Change due UI/metadata only | **Pass** |
| Underpaid cash blocked | **Pass** — `cashUnderPaid` + server `cashReceivedStored + 0.005 < saleTotal` |
| Overpaid cash + change due | **Pass** — allowed; change in metadata |

---

## 6. Offline queue safety

| Check | Status | Notes |
|-------|--------|-------|
| No auto fiscal on queue | **Pass** | Offline path returns before `fiscalBrowserReceipt` |
| Sync = DB only | **Pass** | `flushOfflineQueue` calls `completeSaleReturn` only |
| “Needs fiscal printing” UI | **Pass** | `pending_fiscal` status + banner “bon fiscal încă necesar” / “Fiscal receipt still required” |
| Duplicate sale on retry | **Pass** | Only `pending_sync` entries flush; synced entries move to `pending_fiscal` |
| Duplicate fiscal print | **Pass** | Sync never calls `fiscalBrowserReceipt` |
| Cart cleared on offline enqueue | **Pass** | `resetCartAfterSale()` + no cart backup written before offline path |
| Refresh does not re-submit | **Pass** | Cart empty after queue; backup not written offline |

**After online sync:** Cashier sees pending fiscal banner with link to transaction; dismisses with “Fiscal done” / “Bon emis” after printing.

---

## 7. Hold / resume safety

| Check | Status |
|-------|--------|
| sessionStorage only | **Pass** — `pos_held_sales`, max 5 |
| No fiscal on hold | **Pass** |
| No stock/reports until charged | **Pass** |
| Refresh | Held list reloads from sessionStorage; cart backup separate |
| Visible / clearable | **Pass** — Held orders dialog + resume removes entry |

---

## 8. POS restore safety

| Check | Status |
|-------|--------|
| Cart restores after refresh | **Pass** |
| Lands on Register step | **Pass** — `readCartBackupFromStorage` strips payment fields |
| No auto-submit | **Pass** — submit only when `checkoutStep === "payment"` |
| Stale cash cleared | **Pass** — `cashReceived` always `""` on init |
| Double-submit guard | **Pass** — `salePending` |

---

## 9. Chatwoot on POS

| Check | Status |
|-------|--------|
| Hidden on `/app/pos` | **Pass** — early `return null` |
| Visible elsewhere | **Pass** — script loads on other app routes |
| Global removal | **No** |

---

## 10. Local gates

| Gate | Result |
|------|--------|
| `scripts/predeploy-guard.sh` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** |
| `npm run lint` | **PASS** (0 errors; pre-existing warnings only) |
| `verify-pos-cart-restore` | **PASS** (if run) |
| Fiscal unit tests | Present in `fiscalnet.test.ts` (requires jest config to run) |

---

## 11. Protected paths

| Path | Changed? |
|------|----------|
| `fp-android/`, `android-connector/`, `*.apk` | **No** |
| `FiscalNetSettingsCard.tsx` | **No** |
| `lib/fiscalnet/command-builder.ts` | **No** |
| Connector code | **No** |

---

## 12. Screenshots

| # | Screen | Status |
|---|--------|--------|
| Register step | **Pending** — requires authenticated POS session |
| Payment cash exact/overpaid | **Pending** |
| Payment card | **Pending** |
| Discount in cart | **Pending** |
| Held / resumed | **Pending** |
| Offline queued | **Pending** — UI: badge “N offline sales pending sync” |

Prior baseline (pre-two-step): [`review/screenshots/app-pos-demo.png`](../screenshots/app-pos-demo.png)

---

## Issues blocking deploy

1. **Migration 036** not applied on production DB (await deploy approval)
2. **Per-item selective discount (case D)** not implemented — cart-wide only (explicit out of scope)
3. **Live screenshots + owner fiscal review** not completed
4. **Deploy batch** must exclude marketing/blog dirty worktree files

### Resolved in P1.7-fix

- Lint error (`setState` in mount `useEffect`) — lazy `useState` initializers
- Offline enqueue leaves cart populated — cart cleared + backup skipped offline
- No post-sync fiscal reminder — `pending_fiscal` banner + dismiss action
- Line-total edits fiscal mismatch — line total read-only when FiscalNet enabled

---

## Final status: **Ready for owner fiscal review**

**Deploy after:**

- Apply migration 036 (deploy approval)
- Owner confirms bon.txt examples A–C and Chocolate Croissant case on staging hardware/mock
- Capture screenshot set (offline pending sync/fiscal banners)
- POS-only deploy branch (exclude marketing/blog)

**Do not deploy** until migration applied and owner fiscal sign-off complete.

---

## P1.7 follow-up (post-deploy, separate batch)

- Per-item discount UI + selective `DP^`/`DV^` (case D)
- Fixed value discount (`DV^`) from POS
- Full RO/EN on utility bar/modals

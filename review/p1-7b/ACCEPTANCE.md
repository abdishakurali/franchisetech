# P1.7b — Product-level discounts + POS simplification

**Status:** **Local batch ready for owner review** — not deployed.

**Branch:** `p1-7-pos-deploy` (local WIP on top of deployed `d62eb09`)

---

## Goal

Replace cart-wide discount-first UI with **per-line discount percentage** and a **cleaner cashier UX**. FiscalNet emits `DP^` only under product lines that have a discount; `P^` remains the final discounted payable total.

P1.7 is **not** the final discount model. P1.7b is.

---

## Scope

### In scope

| Area | Change |
|------|--------|
| Cart line model | Each line may have its own `discount_pct` (0–100) |
| DB | Store `discount_pct` per `pos_transaction_item`; keep optional `pos_transactions.discount_pct` for legacy / “apply to all” |
| FiscalNet | `DP^` immediately under `S^` **only** when that line’s discount &gt; 0 |
| Payment | `P^` = sum of discounted line totals (+ tips if applicable) |
| POS Register | Item discount control per line; simplified primary view |
| POS Payment | Total, methods, cash keypad (cash only), validate, back |
| More menu | Hold, resume, customer, order note, split, refund, open till |
| Transition | Keep cart-wide “Apply to all items” temporarily alongside item discount |
| i18n | RO/EN strings for item discount + More menu |

### Out of scope

- DV fixed-value discounts (unless separately planned)
- Subtotal-level discount (`ST^` + cart DP)
- NIR / purchase receiving (P1.8)
- FiscalNet setup UI (`FiscalNetSettingsCard.tsx`)
- Android connector / APK / downloads
- Stripe / billing changes
- Database changes beyond using existing `discount_pct` columns per line (migration 036 already adds item column)

---

## Product-level discount model

Example cart:

```text
Chocolate Croissant: 32%
Apple Danish: 0%
Coffee: 10%
```

Expected FiscalNet output:

```text
S^Chocolate Croissant^320^1000^Buc^1^1
DP^3200
S^Apple Danish^310^1000^Buc^1^1
S^Coffee^250^1000^Buc^1^1
DP^1000
ST^0
P^1^...
```

Rules:

- `DP^` sits **immediately under** the `S^` line it applies to (FiscalNet requirement).
- Undiscounted lines have **no** `DP^`.
- `P^` encodes final payable total in bani, not cash received.

---

## UI simplification

### Register step (primary)

- Products grid
- Cart with quantity
- **Item discount** control per line (preferred flow)
- Notes only when feature enabled and needed
- **Pay**

### Payment step

- Large total
- Payment methods
- Cash keypad **only when Cash selected**
- Validate / complete
- Back

### More menu (secondary)

Move out of main toolbar:

- Hold sale
- Resume sale
- Customer
- Order note
- Split payment
- Refund
- Open till

Target cashier flow:

```text
Add product → adjust quantity/discount → Pay → validate payment
```

Fewer visible chips/buttons than current POS.

---

## Transition from P1.7 cart-wide discount

Do **not** remove global discount abruptly.

1. **Add** item-level discount as the preferred flow.
2. **Keep** cart-wide “Apply to all items” temporarily (sets same % on every line or mirrors current P1.7 behaviour).
3. **Later** hide or remove global discount once product-level is stable in production.

---

## Technical notes (implementation sketch)

| Layer | P1.7 today | P1.7b target |
|-------|------------|--------------|
| `CartItem` | `unit_price`, no line discount | `discount_pct` per line |
| `completeSaleReturn` | Copies cart `discount_pct` to every item | Per-item `discount_pct`; fiscal items get `discountPercent` only when line &gt; 0 |
| `buildFiscalNetReceiptLines` | Already supports per-item `discountPercent` | Wire from line data; no cart-wide blanket |
| Reports / receipt page | `discount_amount`, `line_total` | Show line discount % where set |
| Cart backup / hold / offline | Restore cart + single discount | Restore per-line `discount_pct` |

Migration 036 is sufficient for item-level storage; no new migration required unless audit fields are added later.

---

## Acceptance tests

| # | Test | Pass criteria |
|---|------|----------------|
| 1 | One item, 32% discount | `S^…` + `DP^3200` under that line only; `P^` = discounted total |
| 2 | Two items, discount on first only | Croissant `DP^3200`; Apple Danish `S^` with **no** `DP^`; correct `P^` |
| 3 | Two items, different discounts | Line A `DP^3200`, line B `DP^1000` |
| 4 | No discount | No `DP^` lines anywhere |
| 5 | History / receipt / report | Line discount visible where applied |
| 6 | Old sales | Pre-P1.7b sales still render (null/zero `discount_pct`) |
| 7 | Apply to all (if kept) | Cart-wide % applies to every line; each line gets matching `DP^` |
| 8 | Protected paths | FiscalNet setup, Android connector untouched |
| 9 | UI | Fewer primary controls; secondary actions in More menu |
| 10 | Cash / card / offline | Behaviour unchanged from P1.7 (including pending fiscal, no auto-fiscal on sync) |

---

## Local gates (before deploy)

- `bash scripts/predeploy-guard.sh .`
- `npm run lint` (0 errors)
- `npm run typecheck`
- `npm run build`
- `npm run verify-pos-cart-restore`
- FiscalNet unit tests for mixed-line bon.txt examples
- POS-only deploy branch (no marketing/blog WIP)

---

## Close acceptance

| Outcome | When |
|---------|------|
| **P1.7b accepted** | All acceptance tests pass on staging/till; owner fiscal sign-off on mixed-line bon.txt |
| **P1.7b needs fix** | Wrong `DP^` placement, wrong `P^`, UI regression, or offline/hold breakage |

---

## References

- P1.7 deploy: [`review/p1-7/ACCEPTANCE.md`](../p1-7/ACCEPTANCE.md)
- FiscalNet line discount: [`lib/fiscalnet/browser.ts`](../../lib/fiscalnet/browser.ts) (already emits per-item `DP^` when `discountPercent` set)

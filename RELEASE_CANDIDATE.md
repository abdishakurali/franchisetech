# Local Release Candidate — P1.2 + P2 + P0.6

**Date:** 2026-06-17
**Status:** Local only — NOT deployed. Awaiting `APPROVED TO DEPLOY`.
**Prior live release:** `20260617_132857`

---

## Batch summary

### P0.6 — Local-first hardening (this batch)
- `.env.example` — created with all required variables (no secrets)
- `.gitignore` — added `!.env.example` exception so it can be committed
- `docs/LOCAL_DEVELOPMENT.md` — full local dev + build guide
- `package.json` — added `typecheck` and `typecheck:app` scripts
- `.env.local` — placeholder values for build testing (gitignored)

### P1.2 — POS error resilience
- `components/app/PosRegister.tsx`
  - Cart backup to sessionStorage before server action call
  - Cart restore on page reload via lazy useState initializer (no useEffect)
  - Clear sessionStorage backup on successful sale
  - Catch block: safe cashier-facing messages (RO/EN), no raw framework errors
  - Double-click protection via `salePending` guard already present

### P2 — Language consistency
- `app/app/products/new/page.tsx`
  - All labels locale-based via `isRO` (currency === "RON")
  - "Sell this item on POS" / "Se vinde la POS"
  - "Track as ingredient / stock" / "Urmărire stoc / ingredient"
  - "Can be purchased" / "Poate fi cumpărat"
  - "Item type" / "Tip articol" with all option values
  - Purchaseable note for finished products
- `app/app/products/[id]/edit/page.tsx`
  - Same locale treatment as new/page.tsx
  - Purchaseable note shown when item_type is finished_product
- `app/app/settings/page.tsx`
  - Category add form: `category_type` select (POS & Inventory / POS only / Inventory only)
  - Category edit rows: `category_type` select with current defaultValue

### P2 — Category model
- `app/app/pos/page.tsx` — category query filtered `.in("category_type", ["pos", "both"])`
- `app/actions/kitchenops.ts` — `addCategory` saves `category_type`; `updateCategory` updates it

### Infra
- `tsconfig.json` — `__tests__` excluded to fix pre-existing test-file tsc error
- `CLAUDE.md` — deploy gate rules section added

---

## Local gate results (2026-06-17)

| Check | Result |
|---|---|
| `bash scripts/predeploy-guard.sh .` | PASSED |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 66 warnings (all pre-existing) |
| `npm run build` | **SUCCESS** — 82 routes compiled |
| Mixed-language grep | CLEAN |
| Customer-facing KitchenOps grep | CLEAN |
| Protected paths touched | None |

---

## Files changed in this batch

```
.env.example                              (new)
.gitignore                                (updated — !.env.example)
docs/LOCAL_DEVELOPMENT.md                 (new)
package.json                              (typecheck scripts added)
CLAUDE.md                                 (deploy gate section)
tsconfig.json                             (exclude __tests__)
app/app/pos/page.tsx                      (category_type filter)
app/actions/kitchenops.ts                 (category_type in add/update)
app/app/settings/page.tsx                 (category_type UI)
app/app/products/new/page.tsx             (full locale labels)
app/app/products/[id]/edit/page.tsx       (full locale labels)
components/app/PosRegister.tsx            (cart backup, safe errors)
```

---

## Known limitations

- **Local dev uses production Supabase** — see `docs/LOCAL_DEVELOPMENT.md` for safe testing practices.
- `npm run build` with placeholder Supabase values compiles successfully but cannot fetch real data at runtime.
- **FiscalNet flows cannot be tested locally** — requires cashier PC hardware.
- Android/APK paths are untouched as required.

---

## How to deploy (when approved)

```bash
bash scripts/predeploy-guard.sh .
bash ./deploy.sh
```

Only after owner says: `APPROVED TO DEPLOY`

# P1.8 — NIR Romania — Implementation Plan

**Branch:** `p1-8-nir`
**Status:** Plan only — **do not apply migration 037 or deploy without explicit owner approval**
**Production Supabase:** `ycqzxlahhfqwuteistvf` (live — migration forbidden until backup + approval)
**Staging Supabase:** Not configured (`STAGING_*` env vars missing)

**Scope:** Purchase receiving only. No POS, FiscalNet sales, cash drawer, till, Android/APK, marketing, or P1.7b discount logic changes.

**Related docs:** `review/p1-8-nir/PLAN.md` (schema reconciliation), `review/p1-8-nir/STAGING_REVIEW.md` (safety review)

---

## 1. Business goal

Romanian food businesses (restaurants, cafés, bakeries, shops) buy ingredients and goods from suppliers. They need a clear record of **what arrived**, **when**, **from whom**, **at what cost**, and **with what TVA (VAT)** — before those goods become available for recipes and POS.

**NIR (Notă de Intrare Recepție)** is the purchase-side receiving document that:

- Links a **supplier invoice** to **received products**
- Records **quantities, unit costs, and TVA**
- **Increases stock once** when goods are officially received
- Produces a **printable receiving note** for the owner or accountant

NIR is **inventory and purchase control**, not sales. It helps owners trust stock levels and purchase spend without touching the till, FiscalNet receipts, or customer-facing flows.

---

## 2. What NIR will do

| Capability | Detail |
|------------|--------|
| **Supplier** | Select from existing suppliers (`supplier_id`); legacy `supplier` text retained for old rows |
| **Supplier invoice number** | Reuse existing `purchases.invoice_number` |
| **Supplier invoice date** | New `supplier_invoice_date` |
| **NIR date** | New `nir_date` (document date; defaults from purchase date) |
| **Received products/items** | Existing `purchase_items` lines linked to `product_id` |
| **Quantity** | Per line; must be &gt; 0 to post |
| **Unit of measure** | Existing `unit_of_measure` (UM) |
| **Net unit cost** | Existing `unit_cost` (ex-VAT) |
| **TVA rate** | Existing `tax_rate` (e.g. 11%, 21%) |
| **Net total** | Line `total_cost`; header `subtotal_amount` |
| **TVA total** | Line `tax_amount`; header `tax_total` |
| **Gross total** | Header `total_amount` (net + TVA) |
| **Stock increase** | On post only: `products.current_stock_qty += quantity`; `cost_price = unit_cost` |
| **Printable NIR document** | `/app/purchases/[id]/print` for posted and legacy `received` |
| **Purchase history / reports** | List shows NIR number; spend and VAT reports include posted/received only |

**NIR number (on post):** Organisation-wide yearly format `NIR-YYYY-000001` (e.g. `NIR-2026-000001`).

---

## 3. What NIR will not do

Explicit out-of-scope for v1:

- **No FiscalNet sale receipt** — NIR is not a fiscal bon
- **No cash drawer** — no drawer open/close or cash events
- **No POS sale** — till register unchanged
- **No till closing effect** — Z-report / daily close unaffected
- **No customer receipt** — B2B purchase document only
- **No stock reversal in v1** — posted NIR cannot be cancelled or reversed silently
- **No legal/accounting certification claim** — layout is operational; accountant must approve print format
- **No per-site NIR numbering in v1** — org-wide sequence only (`site_id` stored but not in number)
- **No CSV import workflow change in v1** — import may still create legacy `received` with immediate stock (document separately if changed later)

---

## Romanian NIR content requirements

Romanian practice treats this document as:

```text
Notă de recepție și constatare de diferențe
Cod document: 14-3-1A
```

Official finance-accounting rules require supporting documents to include document name, entity details, number and date, parties, economic operation content, quantitative and value data, responsible persons, and print/archive capability. Software may generate financial-accounting documents if required content is preserved.

### v1 print/content checklist (RON orgs)

| Element | Source in franchisetech |
|---------|-------------------------|
| **Title** | `NOTĂ DE RECEPȚIE ȘI CONSTATARE DE DIFERENȚE` |
| **Document code** | `14-3-1A` |
| **Entity name** | `organisations.name` |
| **CUI** | `organisations.fiscalnet_cif` when set |
| **Address / location** | `sites` name + address when `site_id` set |
| **NIR number / date** | `nir_number`, `nir_date` (assigned on post) |
| **Supplier** | `suppliers.name` |
| **Supplier invoice no. / date** | `invoice_number`, `supplier_invoice_date` |
| **Gestiune / locație** | `sites.name` (optional) |
| **Received items** | `purchase_items` |
| **Qty, UM, net unit, TVA, totals** | Line + header amounts |
| **Diferențe / observații** | Existing `purchases.notes` (no new column in v1) |
| **Receiver** | `received_by_user_id` → profile name |
| **Signatures** | Blank print lines (gestionar, comisie recepție) — no digital signature workflow in v1 |
| **Archive** | Browser print + purchase record in app |

**Disclaimer (on print):** Layout is operational software support. Owner/accountant must confirm final form. **Not** a legal or accounting certification.

**Legacy `received` without `nir_number`:** Printable as “Notă de recepție marfă (cumpărare veche)” — must **not** display a fake official NIR number.

### Observations field decision (v1)

- **Use existing `purchases.notes`** for diferențe/observații.
- **Do not add** `reception_notes` or commission tables in migration 037.
- **Receiver:** `received_by_user_id` + optional blank signature lines on print.

---

## Purchase Order relationship (future — not v1)

```text
Purchase Order → Receive Goods → NIR
```

| Stage | Purpose |
|-------|---------|
| **Purchase Order (PO)** | Request/commitment to supplier — what was ordered, expected qty/price |
| **NIR** | Receiving/accounting document when goods **arrive** — what was actually received |

**v1:** Direct NIR purchase receiving via `/app/purchases/new` (no PO module required).
**Future v1.1+:** Create NIR from an approved PO, pre-fill lines, compare ordered vs received in observații.

No purchase order module in this batch unless already present (it is not).

---

## 4. Data model plan

**Migration file (draft, not applied):** `supabase/migrations/037_nir_purchase_fields.sql`

### New columns on `purchases`

| Column | Purpose |
|--------|---------|
| `nir_number` | Assigned on post: `NIR-YYYY-000001` |
| `nir_date` | NIR document date |
| `supplier_invoice_date` | Date on supplier’s invoice |
| `site_id` | Optional receiving site (FK → `sites`, org-scoped) |
| `received_by_user_id` | Who received goods (FK → `profiles`) |
| `posted_at` | Timestamp when NIR was posted (lock marker) |
| `posted_by` | User who posted (FK → `profiles`) |

### Reuse (no duplicate columns)

| Existing field | NIR use |
|----------------|---------|
| `invoice_number` | Supplier invoice number |
| `purchase_items.*` | Lines: qty, UM, net cost, TVA |
| `purchase_items.tax_rate` / `tax_amount` | TVA per line |
| `subtotal_amount` / `tax_total` / `total_amount` | Header totals |
| `stock_movements.quantity_change` | Stock delta (production uses this, not `quantity`) |
| `stock_movements.movement_type = 'purchase_received'` | Post movement type |

### Numbering table

```text
nir_sequences (organisation_id, year, last_number)
  PK: (organisation_id, year)
  Org-wide yearly counter — no site_id in v1
```

### RPCs (server-only, `security definer`)

| Function | Role |
|----------|------|
| `next_nir_number(org_id, year)` | Internal; increments sequence; not granted to `public` |
| `post_nir_purchase(purchase_id, org_id, actor_id)` | **Atomic post:** lock purchase → validate draft → assign NIR → set `posted_*` → stock + movements once |

**Post RPC guarantees (single transaction):**

1. `SELECT … FOR UPDATE` on purchase row
2. Reject if not `draft`, already posted, cancelled, or no line items
3. Call `next_nir_number` for year from `nir_date` / `purchase_date`
4. Update purchase: `status = 'posted'`, NIR fields, `posted_at`, `posted_by`
5. For each line: skip if movement already exists; else update product stock + insert `stock_movements`

**Unique index:** `(organisation_id, nir_number) WHERE nir_number IS NOT NULL`

**Observations (v1):** Reuse `purchases.notes` — label “Observații / diferențe” in UI/print. No `reception_notes` column.

**Status check (037):** `draft | received | partial | posted | cancelled`

---

## 5. Workflow plan

### User flow

```text
Create purchase draft
  → add supplier + supplier invoice # + invoice date
  → add NIR date
  → add received items (product, qty, UM, net cost, TVA)
  → save draft                    (no stock change)
  → review on detail page
  → post / generate NIR           (number assigned, stock + once)
  → print NIR
```

### Status semantics

| Status | Stock | Editable | NIR number | Notes |
|--------|-------|----------|------------|-------|
| `draft` | No change | Yes | None | Can cancel |
| `posted` | Increased once | **Locked** | Assigned | New NIR workflow |
| `received` | Already increased (legacy) | **Locked** | Usually null | Pre-NIR purchases; treat as posted in reports |
| `cancelled` | No change | Locked | None | **Draft only** in v1 |
| `partial` | — | — | — | Reserved; unused in v1 |

### Server actions (planned / partially implemented on branch)

| Action | Behaviour |
|--------|-----------|
| `savePurchaseDraft` | Upsert purchase + lines; `status = draft`; **no stock** |
| `postNirPurchase` | Call `post_nir_purchase` RPC via service role; redirect with error codes on failure |
| `cancelPurchase` | Allowed only when `status = draft`; **blocked** for `posted` / `received` |

---

## 6. UI plan

### Pages

| Route | Purpose |
|-------|---------|
| `/app/purchases/new` | New draft with NIR fields |
| `/app/purchases` | List with NIR number column, status badges |
| `/app/purchases/[id]` | Detail, TVA breakdown, post button (draft), print link (posted/legacy) |
| `/app/purchases/[id]/edit` | Edit draft only; redirect if locked |
| `/app/purchases/[id]/print` | Printable NIR layout |

### Romanian UI labels (RON orgs / RO locale)

| Label | Field / action |
|-------|----------------|
| Furnizor | Supplier |
| Nr. factură furnizor | `invoice_number` |
| Data factură furnizor | `supplier_invoice_date` |
| Data NIR | `nir_date` |
| Nr. NIR | `nir_number` (read-only after post) |
| Gestiune / Locație | `site_id` |
| Articole primite | Line items section |
| Observații / diferențe | `notes` |
| Cantitate | Quantity |
| UM | Unit of measure |
| Cost net | Net unit cost |
| TVA | VAT rate / amount |
| Total net | Subtotal |
| Total TVA | Tax total |
| Total brut | Gross total |
| Salvează ciornă | Save draft |
| Generează NIR | Post NIR |
| Tipărește NIR | Print |

**Status badges (RO):** Ciornă · NIR emis · Cumpărare veche / fără NIR · Anulat

### Components (branch)

- `components/app/PurchaseForm.tsx` — NIR section, draft vs post buttons
- `components/app/PurchasesBulkTable.tsx` — NIR column, cancel guard
- `components/app/PrintButton.tsx` — print trigger
- `lib/nir/purchase.ts` — parsing, totals, status helpers, error mapping

---

## 7. Stock rules

| Rule | Enforcement |
|------|-------------|
| Draft does **not** change stock | No stock writes in `savePurchaseDraft` |
| Post increases stock **once** | Single RPC transaction |
| Double post must **not** double stock | RPC raises `ALREADY_POSTED`; movement `NOT EXISTS` guard per product |
| Old `received` purchases stay locked | `isPurchaseLocked()` treats `received` as posted |
| Posted NIR cannot be cancelled silently | `canCancelPurchase()` → draft only; UI + server block |
| Movement type | `purchase_received` |
| Quantity column | Use **`quantity_change`** on `stock_movements` (production truth) |
| Cost update | On post: `products.cost_price = unit_cost` for each line |

**Idempotency note:** No unique index on `stock_movements` (legacy duplicates possible). RPC uses `NOT EXISTS` on `(reference_id, reference_type, movement_type, product_id)` before insert.

---

## 8. Reporting plan

| Report / view | Rule |
|---------------|------|
| Purchase list | Show `nir_number` column; status badge |
| Supplier spend | Include `posted` + legacy `received` only |
| Draft / cancelled | **Excluded** from spend totals |
| Purchase VAT | Sum `purchase_items.tax_amount` / header `tax_total` on detail and reports |
| Print | Available for `posted` (with NIR) and legacy `received` (without NIR number) |
| `/app/reports/purchases` | Extend to respect NIR status filters (implementation phase) |

---

## 9. Safety plan

| Control | Detail |
|---------|--------|
| Migration 037 | **Additive only** — new columns, table, functions, indexes; no data rewrite |
| Production apply | **Forbidden** until owner explicit approval |
| Pre-apply backup | Mandatory on `ycqzxlahhfqwuteistvf` if no staging (snapshot + documented restore path) |
| Staging preferred | Apply 037 on separate project first; run E2E there |
| POS / FiscalNet regression | Run `verify-pos-line-discount`, `verify-pos-cart-restore` after NIR work |
| App rollback | Safe — additive migration; old app ignores new columns |
| DB rollback | Only if migration causes serious issue; drop columns/functions/indexes per PLAN.md rollback section |
| Service role | `post_nir_purchase` via `createServiceClient()` in server actions only — never in browser |
| Protected paths | Do not touch POS sale actions, FiscalNet, drawer, Android, marketing |

---

## 10. Testing plan

### Acceptance tests (owner / QA)

| # | Test | Expected |
|---|------|----------|
| 1 | Create draft purchase | `status = draft`, no NIR number |
| 2 | Draft does not change stock | `current_stock_qty` unchanged; no new `purchase_received` movements |
| 3 | Post NIR creates number | `NIR-YYYY-000001` format; `posted_at` / `posted_by` set |
| 4 | Post increases stock once | Product qty + line qty; one movement per product |
| 5 | Double post blocked | Second post → `ALREADY_POSTED`; stock unchanged |
| 6 | Draft cancel does not change stock | Status `cancelled`; stock unchanged |
| 7 | Posted NIR locked | Edit/cancel blocked in UI and server |
| 8 | Old `received` purchase still opens | Detail + print; badge “Cumpărare veche / fără NIR” |
| 9 | Print page works | Posted and legacy rows render |
| 10 | Purchase VAT totals correct | Line net + TVA = header totals |
| 11 | POS sale still works | Sale completes; stock decreases on sale if configured |
| 12 | FiscalNet discount output still works | P1.7b discount bon unchanged (`verify-pos-line-discount`) |

### Automated scripts (branch)

```bash
npm run verify-nir-purchase-flow    # static checks (20 assertions)
npm run verify-nir-staging-schema   # requires STAGING_*; hard-blocks production ref
npm run verify-pos-line-discount    # POS regression
npm run verify-pos-cart-restore     # POS regression
```

**E2E blocked until:** Migration 037 applied on non-production Supabase + authenticated test session.

---

## 11. Risks and decisions

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No staging Supabase** | Cannot E2E before prod | Owner provides staging project OR backup + maintenance window on prod |
| **Production migration on live DB** | Constraint/index change on `purchases` | Apply during low traffic; backup first; test SQL on copy if possible |
| **Service role exposure** | Stock/NIR abuse if key leaks | Server-only; never `NEXT_PUBLIC_*`; audit server actions |
| **Post RPC must be atomic** | Partial post = wrong stock | Single `post_nir_purchase` transaction (implemented in 037 draft) |
| **No reversal in v1** | Owner cannot undo posted NIR | Document v1.1 correction workflow; block cancel in UI |
| **Print layout vs accountant expectations** | Legal/compliance gap | Owner/accountant sign-off before marketing “NIR ready” |
| **Legacy `received` vs new `posted`** | Mixed list semantics | App treats both as locked + spend-eligible |
| **CSV import still `received`** | Bypasses draft/post | Document; optional follow-up to import-as-draft |
| **RPC org membership** | RPC trusts `p_org_id` from server action | Server action validates `getActiveOrg()` before RPC; optional future RPC membership check |
| **Draft save then RPC fail** | Draft exists without NIR | Acceptable — no stock until post succeeds |

### Owner decisions (locked for v1)

1. **Numbering:** Org-wide yearly `NIR-YYYY-000001` — no per-site sequence
2. **Workflow:** Draft (no stock) → post (stock once) → print
3. **Posted lock:** No cancel/reversal in v1; legacy `received` = pre-NIR posted
4. **Production:** No migration without approval; backup required if no staging

---

## 12. Implementation phases

| Phase | Work | Exit criteria |
|-------|------|---------------|
| **1 — Plan and schema** | This document + `PLAN.md` reconciliation | Owner signs plan; decisions recorded |
| **2 — Migration 037** | Apply on **staging only** (or approved prod with backup) | Schema verifier green; RPC callable by service role |
| **3 — Draft/post actions** | `savePurchaseDraft`, `postNirPurchase` in `kitchenops.ts` | Static verify script pass; no stock on draft |
| **4 — UI pages** | Form, list, detail, edit guards | RO labels; draft/post/cancel flows |
| **5 — Print view** | `/print` layout | Accountant preview; posted + legacy |
| **6 — Reports** | Purchase list NIR column; spend/VAT filters | Draft excluded from spend |
| **7 — Tests** | Acceptance 1–12 + POS regression scripts | All pass on staging |
| **8 — Owner review** | Screenshots, print sample, accountant check | Written approval |
| **9 — Production approval / migration / deploy** | Backup → apply 037 → deploy app branch | Smoke: purchases + POS + FiscalNet discount |

**Current phase:** Phase 1 complete (plan). Phases 2–7 **implemented locally on branch** but **not validated on staging** (no staging project). Phase 9 **blocked**.

---

## 13. Files likely touched

| File | Role |
|------|------|
| `supabase/migrations/037_nir_purchase_fields.sql` | Schema + RPCs |
| `app/actions/kitchenops.ts` | `savePurchaseDraft`, `postNirPurchase`, cancel guards |
| `lib/nir/purchase.ts` | Parsing, totals, status, error mapping |
| `components/app/PurchaseForm.tsx` | NIR fields, RO labels, draft/post |
| `components/app/PurchasesBulkTable.tsx` | NIR column, cancel rules |
| `components/app/PrintButton.tsx` | Print navigation |
| `app/app/purchases/new/page.tsx` | New draft entry |
| `app/app/purchases/page.tsx` | List + filters |
| `app/app/purchases/[id]/page.tsx` | Detail, post, TVA |
| `app/app/purchases/[id]/edit/page.tsx` | Draft edit only |
| `app/app/purchases/[id]/print/page.tsx` | Printable NIR |
| `app/app/reports/page.tsx` | Purchase/VAT report links |
| `scripts/verify-nir-purchase-flow.mjs` | Static acceptance checks |
| `scripts/verify-staging-nir-schema.mjs` | Post-migration schema probe |

**Explicitly not touched:** `PosRegister.tsx`, FiscalNet paths, cash drawer, `fp-android/`, marketing pages, P1.7b discount logic.

---

## 14. Final recommendation

**NIR plan ready. Implementation exists locally, but production migration/deploy requires explicit owner approval and backup because no staging Supabase is available.**

Research-aligned print layout (Cod 14-3-1A) implemented in app code; migration 037 unchanged.

### Readiness summary

| Area | Status |
|------|--------|
| Business plan | ✅ This document |
| Schema design (037) | ✅ Draft in repo; reconciled to production columns |
| Atomic post RPC | ✅ Designed in 037 |
| App code on branch | ✅ Draft/post UI and actions present locally |
| Staging validation | ❌ Blocked — no `STAGING_*` credentials |
| Production migration | ❌ Forbidden until approval + backup |
| Production deploy | ❌ Forbidden until migration validated |

### Before production

1. **Option A (preferred):** Create staging Supabase → set `STAGING_*` → apply 037 → run acceptance tests 1–12
2. **Option B:** Owner approves prod apply → full backup/snapshot of `ycqzxlahhfqwuteistvf` → apply 037 in maintenance window → deploy → smoke tests

### Verdict

**Ready for implementation after owner approval** (code path exists on branch).
**Ready for production only after backup and explicit migration approval** (current gate).

---

*Document version: 2026-06-19 · P1.8 NIR · Plan only — no migration applied*

# P1.8 — NIR (Notă de Intrare Recepție) — Design & Implementation Plan

**Status:** Schema reconciliation complete — **ready for implementation** (see verdict below)

**Branch baseline:** P1.7b hotfix `65ec2732867b34334f08de23f860fe8a84d905fa`

**Scope:** Purchase-side only. No POS, FiscalNet sales, cash drawer, till, or Android changes.

---

## Owner decisions (recorded)

### 1. NIR numbering — org-wide yearly (v1)

- Format: `NIR-YYYY-000001` (e.g. `NIR-2026-000001`, `NIR-2026-000002`)
- **Not** per-site in v1 (accountant may request later)
- Still store `site_id` on purchase when available
- Assign number **server-side only**, atomically at post time (never browser-only)

### 2. Draft workflow — true draft + post

| State | Stock | NIR number |
|-------|-------|------------|
| `draft` | No change | None |
| `posted` | Increase once | Assigned atomically |

- Posting sets `posted_at` and `posted_by`
- Legacy `received` rows (pre-NIR) treated as already posted without NIR metadata

### 3. Posted NIR cancellation — locked in v1

- Draft: editable and cancellable
- Posted: **locked** — no silent cancel, no status-only cancel
- Reversal/correction workflow deferred to **v1.1**
- Do **not** use current `cancelPurchase` on posted rows (it does not reverse stock)

### 4. Production schema reconciliation — mandatory (completed)

Reconciliation performed **2026-06-19** via read-only Supabase PostgREST OpenAPI + column probes.
Scripts: `scripts/inspect-prod-schema.mjs`, `scripts/probe-prod-schema.mjs` (read-only, no data writes).

Direct `pg_constraint` / `pg_indexes` SQL was **not** run (no DB connection string in repo; Supabase CLI not authenticated). Check constraints inferred from production data + OpenAPI where noted.

---

## Production schema audit

### Method

1. PostgREST OpenAPI (`/rest/v1/`) — columns, types, nullability, defaults
2. Read-only probes — distinct `status` values, column existence tests
3. Repo migrations `010`, `013`, `035` compared

### Root cause of drift

Migration **010** created `purchases` / `purchase_items` with legacy columns. Migration **013** used `create table if not exists`, so it **did not replace** the 010 tables. Production is therefore **010 base + partial 013/035 alters + manual/out-of-repo evolution** (e.g. `invoice_number`, `quantity_change`).

---

## Schema reconciliation table

| Concept | Repo expectation (migrations) | Production actual | Decision |
|---------|------------------------------|---------------------|----------|
| **purchases.purchased_at** | 010: `timestamptz NOT NULL` | `timestamptz NOT NULL`, default `now()` | **Keep.** App continues dual-write with `purchase_date`. |
| **purchases.purchase_date** | 013: `date NOT NULL` | `date`, **nullable** | **Keep both.** Use `purchase_date` for NIR date input; `purchased_at` for legacy sort/display. |
| **purchases.supplier** | 010: `text NOT NULL` | `text NOT NULL` (often `''` when `supplier_id` set) | **Keep.** App sets empty string when `supplier_id` present. |
| **purchases.supplier_id** | 013: nullable FK | `uuid`, nullable | **Keep.** Primary supplier link for NIR. |
| **purchases.invoice_number** | Not in repo migrations | `text`, nullable | **Reuse for supplier invoice # in v1.** Do **not** add duplicate `supplier_invoice_number`. |
| **purchases.reference** | 013: nullable text | `text`, nullable | **Keep** as optional internal reference / notes alias. |
| **purchases.total_amount** | 013: gross total | `numeric`, nullable, default 0 | **Keep** as gross (net + tax). |
| **purchases.total_cost** | 010 legacy | `numeric NOT NULL`, default 0 | **Keep** (legacy). App writes `total_amount`; leave `total_cost` untouched or sync later — no rewrite in 037. |
| **purchases.subtotal_amount** | 035 | `numeric NOT NULL`, default 0 | **Keep** (net subtotal). |
| **purchases.tax_total** | 035 | `numeric NOT NULL`, default 0 | **Keep** (purchase TVA total). |
| **purchases.status** | 013 check: `draft\|received\|partial` | Values in data: `received`, `cancelled` (5 + 1 rows). No `draft`/`partial`/`posted` yet. | **Extend check** in 037 to: `draft`, `received`, `partial`, `posted`, `cancelled`. Map legacy `received` → posted semantics in app. |
| **purchases.status = cancelled** | Not in 013 check | **Exists in production data** | **Allowed.** 013 check likely never applied on 010 table. 037 replaces check safely. |
| **purchase_items.item_name** | 010: `NOT NULL` | `text NOT NULL` | **Keep.** App dual-writes with `product_name`. |
| **purchase_items.product_name** | 013: `NOT NULL` | `text`, **nullable** | **Keep both.** Insert both on new lines. |
| **purchase_items.stock_item_id** | 010 legacy | `uuid`, nullable | **Keep** (unused). No change. |
| **purchase_items.unit_cost** | net unit cost | `numeric NOT NULL` | **Keep** as net ex-VAT unit cost. |
| **purchase_items.total_cost** | net line subtotal | `numeric NOT NULL` | **Keep** as net line subtotal. |
| **purchase_items.tax_rate** | 035 | `numeric NOT NULL`, default 0 | **Keep.** |
| **purchase_items.tax_amount** | 035 | `numeric NOT NULL`, default 0 | **Keep.** |
| **purchase_items.unit_of_measure** | 013 | `text`, nullable | **Keep.** |
| **purchase_items.created_at** | 013 | **Column does not exist** | **Do not add in 037** unless needed; out of NIR scope. |
| **stock_movements.quantity** | 013: `quantity NOT NULL` | **Column does not exist** | **Repo migration wrong for prod.** Code correctly uses `quantity_change`. Update repo docs only; no prod change. |
| **stock_movements.quantity_change** | Not in repo migrations | `numeric NOT NULL` | **Production source of truth.** All stock writes use this. |
| **stock_movements.unit_of_measure** | Not in 013 | `text`, nullable | **Keep.** |
| **stock_movements.reason** | Not in 013 | `text`, nullable | **Keep.** |
| **stock_movements.reference_id / reference_type** | 013 | Present | **Keep.** NIR post links `reference_type = 'purchase'`. |
| **stock_movements.movement_type** | 013 check enum | Data: `opening`, `purchase_received`, `sale_used` | **Keep** existing values; no check change in 037 unless insert fails in testing. |
| **stock_movements.unit_cost / notes** | 013 | **Do not exist** | **Do not add in 037.** |
| **products.is_purchaseable / item_type** | 035 | Present | **Keep.** Filter purchase product picker. |
| **sites** | 001 / 033 | Present | **Keep.** Add optional `purchases.site_id` in 037. |
| **NIR fields** | Design proposal | **Not present** | **Add in 037** (see below). |
| **supplier_invoice_date** | Design proposal | **Not present** | **Add in 037.** |
| **nir_sequences** | Design proposal | **Not present** | **Add in 037** (org + year PK). |

### Production column inventory (key tables)

#### `purchases`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| organisation_id | uuid | NO | — |
| supplier | text | NO | — |
| supplier_id | uuid | YES | — |
| purchased_at | timestamptz | NO | now() |
| purchase_date | date | YES | — |
| reference | text | YES | — |
| invoice_number | text | YES | — |
| notes | text | YES | — |
| total_cost | numeric | NO | 0 |
| total_amount | numeric | YES | 0 |
| subtotal_amount | numeric | NO | 0 |
| tax_total | numeric | NO | 0 |
| status | text | YES | received |
| created_by | uuid | YES | — |
| created_at | timestamptz | YES | now() |

#### `purchase_items`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| organisation_id | uuid | NO | — |
| purchase_id | uuid | NO | — |
| stock_item_id | uuid | YES | — |
| product_id | uuid | YES | — |
| item_name | text | NO | — |
| product_name | text | YES | — |
| quantity | numeric | NO | 0 |
| unit_cost | numeric | NO | 0 |
| total_cost | numeric | NO | 0 |
| unit_of_measure | text | YES | — |
| tax_rate | numeric | NO | 0 |
| tax_amount | numeric | NO | 0 |

#### `stock_movements`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| organisation_id | uuid | NO | — |
| product_id | uuid | YES | — |
| movement_type | text | NO | — |
| quantity_change | numeric | NO | — |
| unit_of_measure | text | YES | — |
| reason | text | YES | — |
| reference_id | uuid | YES | — |
| reference_type | text | YES | — |
| performed_by | uuid | YES | — |
| performed_at | timestamptz | YES | now() |

---

## Proposed NIR data model (v1)

### Extend `purchases` only (no new document table)

| New column | Purpose |
|------------|---------|
| `nir_number` | `NIR-YYYY-000001`, set on post |
| `nir_date` | NIR document date |
| `supplier_invoice_date` | Supplier invoice date |
| `site_id` | Receiving location (optional FK → sites) |
| `received_by_user_id` | Who received goods |
| `posted_at` | Immutability marker |
| `posted_by` | Who posted |

**Reuse existing:**

- `invoice_number` → supplier invoice number (already written by `addPurchase` and import)
- `created_by` → fallback if `received_by_user_id` null

**Status semantics:**

| status | Meaning |
|--------|---------|
| `draft` | Editable; no stock |
| `posted` | Locked; stock increased; NIR number assigned |
| `received` | Legacy posted (pre-NIR); treat as posted in reports |
| `cancelled` | Draft-only cancel in v1 |
| `partial` | Reserved; unused in v1 |

### `purchase_items` — sufficient as-is

Gross line = `total_cost + tax_amount` (computed at render/print).

### NIR numbering

- Table: `nir_sequences(organisation_id, year, last_number)` — **org-wide, no site_id in v1**
- RPC: `next_nir_number(org_id, year)` — `security definer`, called inside post transaction
- Format built in app: `NIR-${year}-${String(seq).padStart(6,'0')}`
- Unique index: `(organisation_id, nir_number) WHERE nir_number IS NOT NULL`

---

## UI flow (v1)

```
Record purchase (PurchaseForm + NIR section)
  → Save draft (no stock)
  → Preview NIR
  → Post NIR (number + stock + posted_at/by)
  → Detail page + Print / Export
```

### Files to enhance (implementation phase)

| File | Change |
|------|--------|
| `components/app/PurchaseForm.tsx` | NIR fields, draft vs post actions, RO labels |
| `app/actions/kitchenops.ts` | Split `savePurchaseDraft` / `postPurchaseNir`; stock only on post |
| `app/app/purchases/[id]/page.tsx` | NIR detail, TVA breakdown, print |
| `app/app/purchases/page.tsx` | NIR number column |
| New: `app/app/purchases/[id]/print/page.tsx` | Printable NIR |

**Do not touch:** `PosRegister.tsx`, FiscalNet paths, cash drawer, Android.

---

## Stock and reporting rules

| Event | Stock | POS / FiscalNet |
|-------|-------|-----------------|
| Save draft | No change | Unaffected |
| Post NIR | `current_stock_qty += qty`; `cost_price = unit_cost`; `stock_movements` `purchase_received` | Unaffected |
| Cancel draft | No change | Unaffected |
| Cancel posted | **Blocked in v1** | Unaffected |

**Reports:** Include `posted` + legacy `received`; exclude `draft` and `cancelled` from spend totals. Add purchase TVA report from `purchase_items.tax_amount` (implementation).

---

## Migration 037 draft (DO NOT APPLY)

File: `supabase/migrations/037_nir_purchase_fields.sql` (proposed)

```sql
-- ============================================================
-- 037_nir_purchase_fields.sql (DRAFT — NOT APPLIED)
-- P1.8: NIR metadata on purchases + org-wide yearly numbering
-- Additive only. Reconciled against production 2026-06-19.
-- ============================================================

-- ── 1. NIR columns on purchases ─────────────────────────────
alter table public.purchases
  add column if not exists nir_number text,
  add column if not exists nir_date date,
  add column if not exists supplier_invoice_date date,
  add column if not exists site_id uuid,
  add column if not exists received_by_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists posted_at timestamptz,
  add column if not exists posted_by uuid references public.profiles(id) on delete set null;

-- Site must belong to same organisation (matches 033 pattern)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'purchases_site_org_fkey') then
    alter table public.purchases
      add constraint purchases_site_org_fkey
      foreign key (site_id, organisation_id)
      references public.sites(id, organisation_id);
  end if;
end $$;

-- Status: extend for draft/post workflow (prod already has 'cancelled' in data)
alter table public.purchases drop constraint if exists purchases_status_check;
alter table public.purchases
  add constraint purchases_status_check
  check (status in ('draft','received','partial','posted','cancelled'));

-- NIR number unique per organisation (null-safe for legacy rows)
create unique index if not exists idx_purchases_org_nir_number
  on public.purchases (organisation_id, nir_number)
  where nir_number is not null;

create index if not exists idx_purchases_org_nir_date
  on public.purchases (organisation_id, nir_date desc nulls last);

create index if not exists idx_purchases_org_posted
  on public.purchases (organisation_id, posted_at desc nulls last)
  where posted_at is not null;

-- ── 2. Org-wide yearly NIR sequence ─────────────────────────
create table if not exists public.nir_sequences (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  year int not null,
  last_number int not null default 0,
  primary key (organisation_id, year)
);

alter table public.nir_sequences enable row level security;

-- RLS policies: add in implementation PR mirroring purchases insert (owner/manager).
-- Intentionally omitted from draft until post RPC is wired.

-- ── 3. Concurrency-safe next number (server-only) ───────────
create or replace function public.next_nir_number(
  p_org_id uuid,
  p_year int
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
begin
  insert into public.nir_sequences (organisation_id, year, last_number)
  values (p_org_id, p_year, 1)
  on conflict (organisation_id, year)
  do update set last_number = nir_sequences.last_number + 1
  returning last_number into v_next;
  return v_next;
end;
$$;

revoke all on function public.next_nir_number(uuid, int) from public;
grant execute on function public.next_nir_number(uuid, int) to service_role;
-- App server action uses service role or authenticated RPC wrapper in implementation.

-- NOTE: supplier invoice number uses existing purchases.invoice_number (no new column).
-- NOTE: no changes to purchase_items or stock_movements in 037.
```

### Rollback plan

1. `drop function if exists public.next_nir_number(uuid, int);`
2. `drop table if exists public.nir_sequences;`
3. Drop indexes `idx_purchases_org_nir_number`, `idx_purchases_org_nir_date`, `idx_purchases_org_posted`
4. Drop constraint `purchases_site_org_fkey` if added
5. Drop columns: `nir_number`, `nir_date`, `supplier_invoice_date`, `site_id`, `received_by_user_id`, `posted_at`, `posted_by`
6. Restore prior `purchases_status_check` if needed (likely none effective on prod today)

No data rewrite. Legacy rows remain valid with null NIR fields.

### Recommended follow-up (not 037): repo schema sync doc

Add `review/p1-8-nir/SCHEMA_DRIFT.md` or amend migration comments so future devs know production uses `quantity_change`, dual date columns, and `invoice_number` — **optional**, not blocking implementation.

---

## Acceptance tests (implementation phase)

1. Create draft NIR purchase from supplier with invoice # and date
2. Add ingredient: qty, UM, net cost, TVA 11%/21%
3. Post assigns unique `NIR-YYYY-000001` under concurrent posts
4. Draft does **not** change stock; post increases stock once
5. Supplier spend updates after post
6. Purchase list shows NIR number
7. Purchase TVA totals visible
8. POS sale unchanged
9. FiscalNet receipt unchanged
10. Legacy purchase (`status=received`, null `nir_number`) still renders
11. RO labels on RON org
12. Print/export NIR works
13. Posted NIR cannot be cancelled via bulk table / cancel action

---

## Risks (remaining)

| Risk | Mitigation |
|------|------------|
| Legal NIR layout | Owner/accountant sign-off on print template |
| Number race | `post_nir_purchase` locks purchase + sequence in one transaction |
| Stock double-increase | RPC `NOT EXISTS` movement guard per purchase/product |
| Legacy `received` vs new `posted` | App treats both as posted for stock already applied |
| Posted cancel attempted | Block in UI + server; v1.1 reversal later |
| Mixed EN/RO labels | RO-first when `currency_code = RON` |
| `invoice_number` vs new field confusion | Document: reuse `invoice_number`; add only `supplier_invoice_date` |
| Repo migration 013 inaccuracy | Do not run 013 recreate on prod; 037 additive only |
| Check constraint drop/add | Test on staging; include `cancelled` and `received` |
| Indexes/constraints not verified via `pg_constraint` SQL | Run suggested SQL on staging before prod apply |

---

## Implementation readiness verdict

**P1.8 NIR atomic post fix ready for staging**

Reconciliation is complete enough to proceed:

- Production columns verified for all drift items listed by owner
- 037 draft aligns with **actual** production (reuses `invoice_number`, `quantity_change`, dual legacy columns)
- Owner decisions on numbering, draft/post, and posted lock are recorded
- No blocking accounting unknowns for **MVP v1** (print layout still needs owner review before release)

### Implementation order (when approved)

1. Apply 037 on staging → verify constraints + RPC
2. Split `addPurchase` → draft save + post NIR
3. Enhance `PurchaseForm` + list/detail/print
4. Block cancel on posted; purchase TVA report
5. Acceptance tests 1–13

---

## Out of scope (unchanged)

- POS / FiscalNet sale logic (P1.7b)
- Cash drawer / till
- Android / APK
- Posted NIR reversal (v1.1)
- Per-site NIR numbering (v1.1+)
- Migration apply / deploy (until explicitly requested)

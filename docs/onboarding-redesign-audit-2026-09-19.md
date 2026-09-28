# Onboarding Redesign — Audit & Proposed Architecture

**Date:** 2026-09-19
**Status:** AUDIT COMPLETE, DESIGN PROPOSED — NOT APPROVED, NOT IMPLEMENTED
**Scope:** Full activation journey redesign — signup → account → location → business → modules → menu → fiscal hardware → first sale → first result. Supersedes the partial technical work already merged; addresses the *product flow* problem, not just individual pages.

This document is organized in two parts: **Part 1 (A–M)** is a factual audit of what exists today, verified directly against source (file:line citations throughout — no speculation). **Part 2 (N–Y)** is the proposed new architecture, built to reuse as much already-working code as possible. Nothing in Part 2 has been implemented. Two issues found during the audit are flagged up front because they're outside the redesign's scope but affect priority — see below.

---

## ⚠️ Two issues found during audit that need a triage decision (not part of the redesign itself)

### Issue 1 — Onboarding is currently lying to new signups (P1, live now)

The current onboarding step "Pregătit pentru prima vânzare" and several other UI strings (dashboard `WelcomeBanner`, `PosFirstSaleTour`) claim demo products are seeded and ready to sell — e.g. `lib/app-i18n.ts:1521`: *"Produsele demo sunt gata — deschide POS-ul și finalizează o vânzare."* This is **false in the current build**. `app/actions/onboarding.ts` seeds a category and 2 payment methods, but never calls `demoProductsForCountry()` — that seeding call was apparently removed by a later cleanup commit (`aeec480`, "delete dead HACCP/sensors/reminders/demo code") without updating the copy that depends on it. Net effect for any org signing up **today**: the POS first-sale tour points at a product tile that doesn't exist, and the "ready to sell" messaging is simply wrong.

This is independent of whether the full redesign proceeds — it's a currently-live defect affecting real signups. Worth a decision: fix as a small isolated patch now, or fold the fix into the redesign (since the redesign removes this screen entirely per your spec's Section 1, the bug may become moot rather than needing its own fix).

### Issue 2 — FiscalNet cash-in/cash-out/X-report likely non-functional in production API mode (P1, pre-existing, unrelated to onboarding)

Per your own CLAUDE.md rule, FiscalNet must be called from the cashier browser/local agent, never from the Next.js server. That rule is correctly followed for the sale path and Z-report, but **not** for cash-in, cash-out, X-report, and the internal test console — those call `lib/fiscalnet/service.ts` server-side, which does `fetch(apiHost)` from the Next.js server. In production, `apiHost` defaults to `http://localhost:65400` (the *cashier PC's* localhost) — a server-side fetch to that address from the DigitalOcean VPS resolves to the VPS's own loopback, where nothing is listening. Practically: any org using FiscalNet in "API" mode (the only mode currently selectable in Settings) likely cannot successfully run cash-in, cash-out, or an X-report today. Z-report and the sale-receipt path are unaffected (they already correctly defer to the browser).

Blast radius is currently small (project memory: only 3 orgs have ever existed), but this is a genuine architecture-rule violation on regulated flows (cash movements, X-report both require admin permission per your rules — that's intact — but "command sent ≠ success" is effectively violated if the command never reaches the till at all). Flagging per the priority framework rather than silently working around it. Not blocking the onboarding design below, but recommend triaging separately.

---

# PART 1 — AUDIT (what exists today, verified)

## A. Current signup flow

1. **`app/signup/page.tsx`** — email + password only. `supabase.auth.signUp()`, `emailRedirectTo` includes `next=/onboarding`. If a session comes back immediately (the common case) → `router.push("/onboarding")` (line 94). Existing-account and email-confirmation branches exist as secondary paths.
2. **`app/onboarding/layout.tsx`** — guards `/onboarding`: no user → `/login`; membership already exists → `redirect("/app")`.
3. **`app/onboarding/page.tsx`** — a **2-step client-side wizard, single URL, no route change**. Step 0: business type, CUI + ANAF lookup, VAT-registered checkbox, address, brand name, owner name. Step 1: three static info cards (no inputs) titled "Pregătit pentru prima vânzare," one button: "Creează produsele și deschide POS."
4. That button calls **`completePosOnboarding`** (`app/actions/onboarding.ts:35-314`):
   - Auth + idempotency checks (existing membership → `redirect("/app")`, line 86-89)
   - `create_organisation_with_owner` RPC (org + owner + default site)
   - Business/ANAF fields written to `organisations`
   - `saveOrgModuleFlags` (module booleans — see K)
   - Seeds payment methods (Cash + Card) and **one category ("Menu")** — **no products** (contradicts the button's own label)
   - Seeds VAT rates
   - **Opens a POS session** server-side — the till is open before the user ever sees `/app`
   - Records `till_opened` growth milestone, sets `onboarding_completed = true`
   - Loops/PostHog side effects, optional ANAF e-Factura OAuth redirect
   - `redirect("/app/setup-checklist?welcome=1")` — **not POS**, despite the button copy

**€1 card verification does NOT block signup or POS access.** Confirmed by explicit code comment at `onboarding.ts:309-312`: card verification is optional, reachable only if the user navigates to it themselves (`/onboarding/verify-card`), and is idempotent.

## B. Current onboarding state model

**No dedicated onboarding table.** Three uncoordinated layers:

1. **DB columns on `organisations`** (source of truth):
   - `onboarding_completed boolean default false` (migration 056)
   - `onboarding_completed_at timestamptz` (migration 039) — **a second, separately-named timestamp column**, added independently of #1, suggesting two uncoordinated additions over time.
   - Growth milestone timestamps: `growth_till_opened_at`, `growth_first_sale_at`, `growth_first_report_at`, `growth_activated_at` (migration 041, additive, nullable, idempotent writes via `recordGrowthMilestone`).
   - Trial/card columns (`trial_started_at`, `card_verified_at`, etc.)
   - **There is no `onboarding_step` column anywhere** — no granular "which step is the user on" state exists in the DB today.
2. **Server actions**: `recordGrowthMilestone` (`lib/growth/activation.ts:115-156`, idempotent, early-returns if already set) is called from `onboarding.ts:226` (till_opened, redundant with the call below), `kitchenops.ts:714` (till_opened again, inside `openPosSession`), `kitchenops.ts:2358` (first_sale, inside `completeSaleReturn`).
3. **Client-side**: `app/onboarding/page.tsx` mirrors the in-progress 2-step form into `localStorage["franchisetech:onboarding-draft"]` purely for refresh-resilience — cleared on success, not authoritative.
4. **URL params** (`?welcome=1`, `?tour=first_sale`) gate UI overlays client-side only, never persisted.

## C. Current redirect chain

`middleware.ts` does **not** do onboarding/auth redirects — only a marketing-locale cookie. Gating lives in layouts/pages:

- `app/onboarding/layout.tsx` — no user → `/login`; membership exists → `/app`.
- `app/app/layout.tsx` — no user → `/login`. **No redirect back to `/onboarding`** if an authenticated user has no org — the app degrades in place rather than redirecting. No forced card-verification redirect (explicit comment confirms this).
- `app/app/onboarding/page.tsx` — a same-named but unrelated stub route, unconditionally `redirect("/app")`. Dead weight, not part of the active flow.
- Post-signup → `/onboarding`. Post-submit → `/app/setup-checklist?welcome=1`. Post-card-verification (optional path) → `/app/pos?welcome=1`.
- **There is no server-side redirect that lands a user on "Pregătit pentru prima vânzare"** — it's in-page client state inside `/onboarding`, not a route.

## D. Every route in the signup → first-sale path

| Order | Route | File |
|---|---|---|
| 1 | `/signup` | `app/signup/page.tsx` |
| 2 | `/onboarding` (2 client steps, one URL) | `app/onboarding/page.tsx` |
| 3 | `/app/setup-checklist?welcome=1` | `app/app/setup-checklist/page.tsx` |
| 4a | `/app/pos?welcome=1` | `app/app/pos/page.tsx` |
| 4b | `/app/products` (checklist link) | `app/app/products/page.tsx` |
| 4b′ | `/app/products/new` (dashboard banner link — **different target than 4b**) | `app/app/products/new/page.tsx` |
| 4c | `/app/settings?tab=business` | `app/app/settings/page.tsx` |
| 4d | `/app/settings?tab=fiscal` | `app/app/settings/page.tsx` |
| 4e | `/app/settings/team` | `app/app/settings/team/page.tsx` |
| — | `/app` (dashboard, reachable any time) | `app/app/page.tsx` |

Also present but dead: `/app/onboarding` → immediate redirect to `/app`.

## E. Current click/action count

Concrete walkthrough, actual copy cited: `/signup` (2 fields, 1 click) → `/onboarding` step 0 (industry, CUI+optional ANAF click, brand name, owner name, 1 click "Continuă") → `/onboarding` step 1 (0 inputs, 1 click "Creează produsele și deschide POS") → lands on `/app/setup-checklist` (not POS, despite the label) → user must click into "Adaugă produsele" → `/app/products` (separate generic page, add fields + save) → navigate back or directly to `/app/pos?welcome=1` → tap product, tap Charge, confirm payment.

**Minimum ~5 distinct page loads, ~8-11 clicks** — and today, step "tap a product" is actually **blocked** for a fresh signup, because no products are seeded (see Issue 1 above) and the checklist forces a detour through the full `/app/products` management page to create one.

## F. Every place the user loses context

1. Onboarding's own completion button ("Creează produsele și deschide POS") lands on a generic checklist page, not POS or a product-creation flow.
2. Checklist "Adaugă produsele" → `/app/products`, the full product-management page (list, filters, bulk tools) — not an inline mini-flow.
3. Dashboard's `ActivationBanner` "Add products" CTA → `/app/products/new` — **a different route than #2**, so the app's own two "add a product" entry points disagree with each other.
4. Checklist "Conectează casa de marcat" → `/app/settings?tab=fiscal` — full multi-tab Settings page.
5. Checklist "Invită echipa" → `/app/settings/team`.
6. Checklist "Datele firmei" → `/app/settings?tab=business`.
7. None of 2–6 link back to the checklist; the only return path is the generic app nav.
8. A **second, unused checklist model** exists (`lib/setup-progress.ts`, `buildSetupSteps`/`computeSetupProgress`) with different steps and hrefs (e.g. `/app/products/import-ingredients`, `/app/purchases/new`) than the live checklist. It's dead code (grep-confirmed, only self-referenced) but a redesign could mistake it for the real one.

## G. The "Pregătit pentru prima vânzare" step, precisely

`app/onboarding/page.tsx`, `step === 1` (lines 466-523). Zero `<Input>`/`<Select>`/checkbox in this block — confirmed by direct JSX read. Three static cards (Package/"Catalogul dumneavoastră", Receipt/"Numerar, card și TVA", ShieldCheck/"FiscalNet"), each already showing a green checkmark regardless of actual state, plus one button that doesn't do what its label says (see A). This is exactly the "vague summary screen" problem you flagged — confirmed from source, not inferred.

## Documented rationale check

- `CONTEXT.md`, `docs/adr/0001`, `docs/adr/0002`, `docs/dolcenera-removal-map.md` — no onboarding-relevant rationale.
- `docs/ONBOARDING_REDESIGN_PROMPT.md` (2026-08-31) — an earlier version of this same audit/brief; **partially stale** (assumes demo products are seeded, which is no longer true — see Issue 1).
- `docs/growth/ACTIVATION-AUDIT.md` (2026-06-21) — documents why the milestone/tour system exists (prevent silent trial abandonment). **Preserve `growth_till_opened_at`/`growth_first_sale_at`/`growth_first_report_at` tracking** in the redesign.
- `docs/lean-cafe-platform-audit-2026-09-17.md` (2 days before this audit) — a **current, live** product-scope decision doc: activation path should be till → sell → purchases/stock → margin → day-close, with fiscal/recipes/e-Factura explicitly "conditional, not activation blockers." **This matches your spec directly** — fiscal setup must not gate first sale (test mode escape hatch). Also flags E2E testing as currently blocked on a schema-incompatible scratch Supabase project — relevant to Section X below.
- `docs/design-implementation-status-2026-09-16.md` — records a design pass touching onboarding/settings that was explicitly blocked from deployment by you and left `predeploy-guard` failing on missing migration baselines. Worth checking current deploy state before assuming the working tree is fully representative of what's live.

## G/H. Current product/category model — and why "Categorie" and "Categorie POS" both exist

**Schema:** `product_categories` (migration 011) gained a `category_type` column (migration 035): `check (category_type in ('pos','inventory','both')) default 'both'`. `products` has **two independent nullable FKs into the same table**: `category_id` (migration 011) and `pos_category_id` (migration 041, header comment: *"Separate POS menu category from inventory/product category"*). No constraint links the two columns to each other — a product can point its `category_id` and `pos_category_id` at two completely unrelated rows, or the same row, or one-and-null.

**Server actions:** `addCategory`/`updateCategory`/`deleteCategory` (`kitchenops.ts:274-317`) always take an explicit `category_type`. `addProduct`, `addProductFromPos`, `updateProduct`, `importProductsCsv` all handle both FKs.

**Do they have a real distinct purpose?** Yes, in exactly one dimension: `pos_category_id` is the **only** category read by the actual till screen (`PosRegister.tsx` — tab filter, tile color, photo/name tile-mode grouping). `category_id` feeds the `/app/products` list filter and the sales-by-category report/PDF export. So the underlying capability (till layout grouping vs. reporting grouping) is legitimate — this is not pure accidental duplication at the schema level.

**Is the customer-facing UX justified? No.** Both dropdowns (`ProductEditForm.tsx:233-248`, `products/new/page.tsx:78-93`) are identical `SearchableSelect` components, same visual weight, labeled only "Categorie" vs. "Categorie POS," with zero explanation of the difference anywhere in the UI or i18n strings. Worse: a brand-new org is seeded with **3 POS-type categories and 0 inventory-type categories** (`app/app/pos/page.tsx:203-210`) — so on day one, "Categorie" is an empty, apparently-broken dropdown sitting next to "Categorie POS," which already has options. This reads as a bug, not a deliberate choice, to a first-time owner. **Verdict: the two-FK architecture should stay (it's genuinely useful for power users), but the default customer-facing UX should collapse to one visible "Categorie" field** — see Part 2, Section P.

## Product creation form — current field inventory

`/app/products/new` is a **flat, non-collapsible 4-card form**, 16 fields total (image, name*, category, POS category, sale price, cost price, VAT, unit*, available-in-pos, is-ingredient, is-stock-tracked, is-purchaseable, opening-stock, SKU, supplier, kitchen station) — only name and unit are HTML-`required`; several fields show a visual `*` without actual enforcement. The **edit** form (`ProductEditForm.tsx`) already has a real `<details>` progressive-disclosure "Avansat" section for SKU/kitchen-station — the **create** form does not use it, despite the pattern existing in the codebase.

**A genuinely minimal quick-add form already exists and is shipped**: `components/app/PosQuickAddProduct.tsx` (used inside POS itself) — name, sale price, a fixed/inherited VAT display, one POS-category select. No image, SKU, cost, or stock fields. **This is functionally identical to what your spec asks for as the onboarding quick-add form — direct reuse candidate.**

Module-driven field visibility already exists: `lib/product-module-fields.ts` `productModuleVisibility()` hides stock/ingredient/purchaseable/supplier/opening-stock fields when the `inventory`/`recipe_costing` org modules are off — this is the exact mechanism your spec's Section 10 asks for ("if Stock is disabled, don't show stock fields").

## Category creation UX

**Cannot be done inline today.** Both category dropdowns are pure pickers (confirmed: no create-affordance in `SearchableSelect.tsx`); the only escape hatch is a plain link ("Gestionează categorii →") to `/app/settings?tab=products`, which loses in-progress product-form state.

**A working inline-create pattern already exists elsewhere**: `PurchaseForm.tsx`'s supplier creation — `showNewSupplier` toggle reveals a mini-form, ANAF lookup, `createNewSupplier()` calls a server action and merges the result into local state with **no navigation, no page refresh**. Direct template for inline category creation.

## Product → POS propagation

No client cache library anywhere in the app (confirmed: no React Query/SWR/Apollo in `package.json`). Pure server components + server actions + `revalidatePath`. `addProduct` revalidates `/app/products`, `/app/pos`, `/app/stock`, then redirects. `addProductFromPos` (in-till quick add) narrowly revalidates just `/app/products` and `/app/pos` (with a code comment explicitly noting this scoping is deliberate), then the client calls `router.refresh()`. **Works correctly for the single-session case** (create → see it appear after a refresh triggered automatically) — there's no push/realtime layer, so a product created in one browser tab won't appear in a different already-open tab without a manual reload, but that's not relevant to a single-user onboarding flow.

## Bulk product creation

`importProductsCsv` (`kitchenops.ts:1492-1591`) exists and is live, with the CSV-blank-VAT bug already fixed (confirmed: blank VAT resolves to the org default with `vat_status: "ambiguous"` pending manual approval, not a silent 0%). The import UI (`app/app/products/import/page.tsx`) is hardcoded in **English** (inconsistent with the rest of the RO-first app — a pre-existing gap, not something this audit changed) and its downloadable template is **missing the `pos_category` column** even though the server action supports it.

**A genuine multi-row entry pattern already exists**: `PurchaseForm.tsx`'s line-items array (`addLine`/`removeLine`/`updateLine`, live per-line totals) — the direct template for a rapid multi-product entry table.

## I/J. FiscalNet integration architecture

**Client-side call, correctly separated (for the sale path):** `lib/fiscalnet/browser.ts` does the actual `fetch()` to `http://localhost:65400` from the browser. `PosRegister.tsx` calls it only *after* `completeSaleReturn` has already saved the sale server-side — fire-and-forget from the UI's perspective, matching "command sent ≠ success" (status only flips to "success" once the real/mocked response confirms it).

**Server-side calls exist too — see Issue 2 above** (cash-in/out, X-report, internal test console) — an architecture-rule violation, not part of the sale path, likely non-functional in production API mode.

**No hardware/model awareness anywhere in the data model.** `FiscalNetConfig` only knows `apiHost` (a URL) and `connectionMode` (`api`/`file`) — no brand/model/firmware field exists in schema or UI.

**No live connection status.** No websocket/polling/heartbeat. The closest thing is historical: count + last-status of past `fiscal_receipt_attempts`, shown in Settings as "Configurat"/"Neconfigurat" text — reflects past attempts, not current reachability. The exact "Neconectat/Se conectează/Conectat" badge pattern you described exists today **only for ANAF e-Factura**, not FiscalNet.

**Test mode exists in the schema but is unreachable from the UI.** `organisations.fiscalnet_mock_mode` (default `true`) is real and load-bearing — every transport function short-circuits to a synthetic success when true. But `FiscalNetSettingsCard.tsx:51` **hardcodes `fiscalnet_mock_mode: "false"` on every save**, with a code comment "simulation toggle removed — always real mode." There is no checkbox for it in the rendered form. So today, any org that configures FiscalNet through the actual product UI is forced into live mode — mock mode is reachable only via direct DB write or the internal gated test console.

**Sale → fiscal call sequence** (unchanged, correct): pay clicked → `completeSaleReturn` saves the sale unconditionally and flags `fiscal_receipt_status: "api_pending"` → client calls the browser-side FiscalNet API → logs the outcome via an idempotent SECURITY DEFINER RPC. Z-report requires manager+ role and correctly defers to the browser in API mode; X-report requires the same role but does **not** defer (Issue 2).

**Supported hardware — two disconnected hardcoded lists, neither wired to any settings or onboarding UI:**
- `app/help/romania-fiscalnet/page.tsx:43-53` — a long list (Datecs, Daisy, Custom, Orgtech, Partner, Posiflex, Sam4S, Tremol, Incotex models) — documentation page only.
- `lib/marketing/homepage-content.ts:4-23` — 3 Datecs models with photos, for the marketing homepage.

**Existing Settings UI** (`FiscalNetSettingsCard.tsx`, tab `fiscal`): enable/disable toggle, a single non-switchable "Android" delivery-method card (file mode exists in the backend but has no clickable UI option), a device-address text input, an operator-code input, one save button. **No model selector, no test-connection button, no test-print button, no status badge** — despite a working `testFiscalNetConnection` server action existing in code, unused by any UI (grep-confirmed).

**Onboarding's current FiscalNet touchpoint**: a static info card in step 1 linking to the help page — not interactive, no status, no action. The checklist's "Conectează casa de marcat" item marks itself done purely from the boolean `fiscalnet_enabled`, with no verification. Notably, `SetupChecklist.tsx` already contains the correct architectural rule as copy: *"Casa de marcat se conectează doar din browserul casierului — serverul nu atinge niciodată echipamentul local"* — i.e., the product's own UI already states the rule that Issue 2's code paths don't fully honor.

## K. Stock/Purchase/Recipe module dependency model

**Two parallel systems exist:**

1. **Plan-tier entitlements** (`lib/billing/entitlement-catalog.ts` + `entitlement-resolver.ts`) — ~50 fine-grained keys (`inventory.enabled`, `purchases.nir`, `recipes.enabled`, `recipes.stock_depletion`, etc.), grouped into `core`/`operations`/`scale` plan tiers, with a per-org override table for support use. Answers "what does this org's *plan* unlock." Enforced via `assertEntitlement`/`hasEntitlement` at ~50 call sites in `kitchenops.ts`.
2. **Per-org boolean module columns** on `organisations` (migration 039): `inventory_enabled`, `recipe_costing_enabled`, `team_advanced_enabled`, `multi_site_ops_enabled`. Answers "what has the owner chosen." **Actively enforced** via `lib/module-guard.ts` `requireBusinessModule()` on ~25 routes (`/app/stock`, `/app/purchases`, `/app/suppliers`, `/app/recipes`, `/app/reports/{stock,margins,gestiune,...}`, `/app/sites`) and gates nav visibility.

Both must pass (AND-gate, `canUseModule()`) for a feature to actually be usable.

- **Stock** — always-on at the DB level (column exists on every product row for every org unconditionally), gated at the app layer by both systems above.
- **Purchases/NIR** — fully implemented and live (Bon de Consum numbering, CMP costing, Saga C XML export — all confirmed present, matching project history). **Purchases has no separate module key — it lives entirely under the `inventory` module.** Your spec treats Stock and Achiziții as two separate optional checkboxes; today they're one backing flag.
- **Recipes** — fully implemented. **No explicit "Recipes requires Stock" check exists in code anywhere.** They co-occur only because they're bundled in the same plan tier and the same `defaultModulesForProfile` branches — at the org-toggle level they're two fully independent booleans with zero cross-checking today. The `recipes.stock_depletion` entitlement (separate from `recipes.enabled`) is what actually controls whether a sale depletes ingredient stock.
- **Loyalty** — has a working per-org enable/disable path (`IntegrationCards` + `setBusinessModuleInstalled`), but its Marketplace card is currently **excluded** from the live `MARKETPLACE_PRODUCT_ORDER` array (recent commit narrowed it to FiscalNet only) — so it's not currently clickable anywhere, even though the backend fully works.
- **Reports** — sales/VAT/till-close are universal; stock/margin reports require the `inventory`/`recipe_costing` modules; the Saga accountant pack is Scale-tier-only.

**Is there ANY existing UI to toggle modules today?** This is the key finding for your design: **module flags are currently set exactly once, automatically**, from two implicit onboarding intake questions (`locationBand`, `ingredientTracking`) → `deriveBusinessProfile()` → `defaultModulesForProfile()` → written once. **There is no reachable post-signup page to change them** — two fully-built toggle-card components (`BusinessModulesCard.tsx`, `BusinessCapabilitiesCard.tsx`) exist with checkbox UI, plan-lock badges, and a working server action (`updateBusinessCapabilities`), but **neither is mounted/imported anywhere in `app/`** — confirmed dead code, not reachable through any route. `BusinessCapabilitiesCard`'s module-rendering branch is additionally starved of data (`CAPABILITY_CATEGORIES` currently has zero `kind: "module"` entries — even if mounted today, it would render zero module checkboxes).

**The `20260917*_e2e_*` migrations are unrelated to this** — confirmed they're schema-parity migrations for an isolated E2E-test Supabase project (explicit header comments: "Isolated E2E environment only"), mirroring the same production column names, not new module/entitlement business logic.

## L. Current cache/query architecture

No client cache library (`package.json` confirmed clean of React Query/SWR/Apollo). Pure Server Components + Server Actions + `revalidatePath` (0 `revalidateTag` usage anywhere).

`app/app/layout.tsx` is `force-dynamic` and calls `headers()` — the entire authenticated shell reruns a **~10-query, mostly-sequential chain** (auth → profile → org membership → subscription status → transaction count → sites → referral code → module flags → module-pathname check) on **every single navigation** under `/app/*`.

**Org/user/subscription context is refetched redundantly, 2-4× per navigation, with zero request-level memoization** (`React.cache()` is not used anywhere): the layout does its own fetch; `getActiveOrg()`/`getKitchenOpsContext()` (no caching) is independently called again in **56 separate `page.tsx` files**; `requireBusinessModule()` (used on 8 module-gated route layouts) fetches org + module flags + subscription status **a third time**; 8 more pages run their own raw queries directly, bypassing the shared helper entirely.

## M. Full-page reload / skeleton triggers

Only **2 `loading.tsx` files exist** in the whole app (`app/app/loading.tsx`, `app/app/reports/loading.tsx`), each a generic 4-card skeleton reused across ~50+ structurally unrelated pages.

**Mechanically confirmed from the bundled Next.js 16 docs** (this repo does not enable Cache Components/PPR): because the layout calls `headers()` and is `force-dynamic`, **navigation blocks with no fallback UI at all** for the full duration of that ~10-query chain — only after it resolves does the generic skeleton get a chance to show while the destination page's own fetch runs. This is the direct mechanical explanation for "feels like loading a different website every time."

**~140 `revalidatePath` call sites**, almost all in `kitchenops.ts`. A few deliberately invalidate the whole shell (`revalidatePath("/app","layout")` for currency/industry changes — legitimately shell-wide but heavy); most are page-scoped. Per the bundled Next docs, **any** `revalidatePath` call currently marks the client's entire history of previously-visited pages stale on next visit, not just the named path — a documented, temporary Next.js 16 behavior, not a bug in this codebase's usage, but one that compounds given how often these actions fire (every category edit, every stock adjustment, every settings save).

**No realtime/push layer exists anywhere** (grep-confirmed zero `.channel(`/`realtime` usage) — cross-tab freshness depends entirely on re-navigation.

**Onboarding → `/app` is a guaranteed cold crossing** — `/onboarding` and `/app` are separate route-group layouts; the very first time a new signup crosses from one to the other, the `/app` shell has never been rendered client-side, so it's the full uncached ~10-query chain with no exception. This happens **at least twice** in the current flow (once after onboarding submit, again if the user later visits `/onboarding/verify-card`).

**Sale completion is the one place in the codebase that already gets this right** — `completeSaleReturn`'s revalidation is deliberately scoped with an explicit code comment: *"Do not invalidate the authenticated layout: that remounts navigation and unrelated modules."* This is the pattern to generalize, not invent.

**Waterfall examples** (independent queries run sequentially instead of `Promise.all`): the dashboard page (5 sequential awaits before finally batching metrics), the layout itself (6 independent-but-sequential fetches), and worst of all the POS page (~15 sequential round trips, only two small `Promise.all` groupings).

---

# PART 2 — PROPOSED ARCHITECTURE (not implemented, pending your approval)

Design principle throughout: **reuse what's already built and working** wherever it exists (there's more reusable infrastructure here than the current onboarding lets you see), and only add net-new schema/components where nothing suitable exists.

## N. Proposed `/onboarding` route architecture

Keep the existing `/onboarding` route group (it already has its own layout, separate from `/app`'s navbar/shell — structurally this already satisfies "no dashboard clutter behind it"). Extend it to own the **entire** journey through first sale + result, not just account creation:

```
/onboarding                  → location type + business/CUI (existing step 0, kept)
/onboarding/modules          → new: module selection (Section R)
/onboarding/menu             → new: inline menu builder (Section P)
/onboarding/fiscal           → new: FiscalNet setup (Section Q)
/onboarding/first-sale       → new: embedded POS, scoped to onboarding shell
/onboarding/result           → new: first-sale result + first report teaser
```

Each is a real sub-route (not more client-only step state) so: (a) the DB-backed `onboarding_step` (Section S) can deep-link directly to where the user left off, (b) each step's bundle stays small instead of one giant client component, (c) the guard pattern already used in `app/onboarding/layout.tsx` extends naturally — check `onboarding_step`, redirect to the correct sub-route if the user tries to jump ahead or lands back at `/onboarding` after a break.

**Critical change to the existing guard**: today, `app/onboarding/layout.tsx` redirects to `/app` the moment an org membership exists (line ~15-20) — that's no longer correct once onboarding extends past account creation. New rule: membership exists **and** `onboarding_completed = true` → `/app`; membership exists **and** `onboarding_completed = false` → redirect to whichever sub-route matches `onboarding_step`.

**First sale stays inside `/onboarding`, not `/app/pos`.** Reuse the existing `PosRegister` component (it's already a well-built, self-contained client component receiving products/config as props — no rewrite needed) but mount it inside `/onboarding/first-sale`'s own layout instead of navigating into `/app/pos`. This directly avoids the "guaranteed cold `/app` shell crossing" problem identified in M — the expensive first crossing into `/app`'s 10-query layout happens exactly **once**, deliberately, when the user clicks "Vezi panoul" on the result screen (Section U's `T` proposals help make even that one crossing lighter).

## O. Proposed onboarding state machine

Linear, with two optional branch points:

```
account → location_type → business_cui → modules → menu
  → [stock_setup]   (only if Stoc or Achiziții selected)
  → [recipe_setup]  (only if Rețete selected — optional, doesn't block first sale)
  → fiscal → first_sale → result → report_teaser → complete
```

Each step's server action, on success, does two things atomically (same transaction/pattern already used by `completePosOnboarding`): saves the step's data, and advances `organisations.onboarding_step` to the next value. Idempotent by construction — re-submitting a step you've already completed just re-saves the same data and re-sets the same (or later) step, matching the idempotency pattern already used by `recordGrowthMilestone`.

## P. Proposed inline menu builder

- **Quick-add row**: reuse `PosQuickAddProduct.tsx`'s field set (name, price, category, VAT-from-default) directly — it's already the exact minimal form your spec describes; no need to build a new one.
- **Bulk entry table**: model directly on `PurchaseForm.tsx`'s line-items pattern (`addLine`/`removeLine`/`updateLine`, live totals) — category header, repeatable name+price rows, "Salvează produsele" batch-inserts.
- **Inline category creation**: model directly on `PurchaseForm.tsx`'s `showNewSupplier`/`createNewSupplier` pattern — a thin new server action wrapping the existing `addCategory`, with the result merged into local state with no navigation, replacing the current "Gestionează categorii →" link-out.
- **Collapsing "Categorie"/"Categorie POS" into one customer-facing field**: the schema already supports this cleanly — `category_type` already has a `'both'` value in its check constraint. Onboarding-created categories get `category_type: 'both'`, and the new category-creation action points **both** `category_id` and `pos_category_id` at the same row. The customer sees one "Categorie" field during onboarding and initial quick-add; the dual-FK power-user override (different till grouping than report grouping) stays available later in the full product edit form/Settings, behind "Mai multe opțiuni," for anyone who actually needs it. No schema change required — this is a UI/default-behavior change only, and it directly fixes the "empty-looking broken dropdown" problem from G/H, since onboarding will no longer seed POS-only categories with zero matching inventory categories.
- **Progressive disclosure**: gate the existing `lib/product-module-fields.ts` `productModuleVisibility()` logic (already built, already used correctly in the edit form) onto the onboarding quick-add too, so stock/ingredient/supplier fields only ever appear if the corresponding module was enabled in the previous step.
- **CSV import**: surface the existing `importProductsCsv` as the "Importă meniul" secondary option per your spec — non-mandatory. Fix the template/preview to include the `pos_category` column the server already accepts, and translate the import page to Romanian to match the rest of the app (currently English-only, a pre-existing gap).

## Q. Proposed FiscalNet onboarding component

- New step UI built around the *existing* `FiscalNetSettingsCard` save logic, but with the fixes needed to make your spec's UX possible:
  - **Un-hardcode `mock_mode`** — expose a real, visible toggle. Default new orgs into mock/test mode automatically when they reach this step, so "Continuă în mod test" (spec Section 14/15) is simply "don't flip this switch yet," not a new code path.
  - **Wire the already-built-but-unused `testFiscalNetConnection` action** to a "Testează conexiunea" button — the backend support exists, it's just never been called from any UI.
  - **Consolidate the two disconnected hardcoded hardware lists** (`help/romania-fiscalnet` + `marketing/homepage-content.ts`) into one shared constant used by both the help page and this new selector — no change to fiscal transport logic, purely a shared source of truth for the dropdown.
  - **Status badge**: a simple ephemeral (not persisted) Neconectat/Se conectează/Conectat indicator driven by the test-connection action's live result — avoids inventing a fake persistent "connected" DB flag while still answering "can FranchiseTech print my legal receipt?" as your spec asks.
- Does **not** touch any VAT/fiscal calculation logic, and does not change the server/browser call-site split for the sale path (Issue 2's server-side violations are a separate, pre-existing concern, not something this step introduces or needs to fix in order to ship).

## R. Proposed module selection + dependency behavior

- Replace the current *implicit* two-question profile inference with your spec's *explicit* checkbox step, writing directly to the four existing columns (`inventory_enabled`, `recipe_costing_enabled`, `team_advanced_enabled`, `multi_site_ops_enabled`) via the already-existing `saveOrgModuleFlags` — no new schema.
- **Recipes → auto-enables Stock**: pure client-side checkbox behavior (checking Rețete also checks + visually locks Stoc, with the one-sentence explanation your spec gives) — there's no dependency enforcement in the backend today to build on, but none is needed; this is a UI nicety, not a data-integrity requirement, since both are independent booleans server-side regardless.
- **Achiziții is not a separate flag today — flagging this explicitly for a decision**: your spec lists Stoc and Achiziții as two separate optional checkboxes, but the current schema has exactly one `inventory_enabled` column covering both. Recommended default: present them as two separate, friendly checkboxes in the UI (matches your spec's language exactly) but have both write to the same underlying `inventory_enabled` flag — no schema change, ships faster, and matches reality (Purchases already lives entirely under the "inventory" module in every route guard and entitlement check today). If you want them genuinely independent later (e.g. a café that wants purchase tracking without full stock-quantity tracking), that's a separate, additive follow-up column — not needed to ship this redesign.
- The two already-built-but-unmounted toggle components (`BusinessModulesCard`, `BusinessCapabilitiesCard`) are candidates to adapt rather than rebuild from scratch, though `BusinessCapabilitiesCard` was designed for a settings-page context with plan-lock badges that probably don't belong in first-run onboarding — likely cleaner to build a purpose-built, lighter onboarding module-picker reusing only `saveOrgModuleFlags` underneath.

## S. Proposed resume behavior

- **New column**: `organisations.onboarding_step text` (additive, nullable — safe per your migration rules). Values match the state machine in O.
- `/onboarding/layout.tsx`'s guard reads this column and redirects to the matching sub-route whenever a user with an incomplete org re-enters `/onboarding` — this is what makes "Continuă configurarea" (spec Section 21) actually resume at the right step instead of restarting.
- Keep the existing `localStorage` draft-mirroring as a low-risk UX nicety for unsaved keystrokes within a single step, but make the DB column the authoritative answer to "which step," exactly as your spec requires ("do not guess based purely on local browser state").
- Worth cleaning up in the same migration: `onboarding_completed` (migration 056) and `onboarding_completed_at` (migration 039) are two separately-added columns that appear to have grown independently — reconcile them (e.g. `onboarding_completed_at` becomes the single source of truth, `onboarding_completed` derived/kept in sync) rather than adding a third overlapping concept.

## T. Proposed cache/prefetch/invalidation changes

This is the highest-risk category — `app/app/layout.tsx` and `lib/module-guard.ts` are load-bearing for the entire authenticated app (~25+ routes), and ~140 `revalidatePath` call sites live in `kitchenops.ts` alone. **Recommend sequencing this as a separate workstream after the onboarding UX ships**, not bundled into the same PR — smaller diff, easier rollback, matches your "keep changes scoped to task" discipline for files like `kitchenops.ts`.

Proposed direction, to validate by measuring first (per your own instruction):
1. **Deduplicate org/user context fetching** with a `React.cache()`-wrapped helper shared by the layout, `module-guard.ts`, and the 56 pages currently calling `getKitchenOpsContext()` independently — pure internal refactor, same return shape, low risk.
2. **Parallelize the identified sequential waterfalls** (layout's ~10 queries, POS page's ~15, dashboard's 5) with `Promise.all` where genuinely independent — pure refactor, needs care to confirm no hidden ordering dependency.
3. **Narrow the handful of `revalidatePath("/app","layout")` calls** (currency/industry/site/locale/table-service changes) to their actual affected pages, generalizing the pattern `completeSaleReturn` already models correctly with its own explanatory code comment.
4. **For onboarding specifically**: since the redesign already keeps the whole journey inside `/onboarding` until the very end (Section N), the expensive first `/app` shell crossing happens exactly once, at a moment we control — optionally prefetch `/app`'s critical data while the user is on the result/report-teaser screen, right before they click "Vezi panoul."
5. **Do not** add a realtime/websocket layer — nothing in your spec requires cross-tab sync during a single user's own onboarding session, and none exists anywhere in the codebase today to extend.

## U. Files/routes/components expected to change (high-level — final list depends on which sections you approve)

**New:**
- `app/onboarding/modules/page.tsx`, `app/onboarding/menu/page.tsx`, `app/onboarding/fiscal/page.tsx`, `app/onboarding/first-sale/page.tsx`, `app/onboarding/result/page.tsx`
- `components/onboarding/MenuBuilder.tsx`, `InlineCategoryCreate.tsx`, `ModuleSelector.tsx`, `FiscalOnboardingCard.tsx`, `FirstSaleResult.tsx`
- `app/actions/onboarding-steps.ts` (or extend `app/actions/onboarding.ts`) — one server action per new step, each updating `onboarding_step`
- `lib/fiscalnet/supported-devices.ts` — consolidated hardware list

**Modified:**
- `app/onboarding/layout.tsx` — new guard logic (Section S)
- `app/actions/onboarding.ts` — `completePosOnboarding` split across steps instead of one monolithic action; remove demo-product-claim copy or restore actual seeding (Issue 1 resolution folds in here)
- `components/app/FiscalNetSettingsCard.tsx` — un-hardcode mock mode, add test-connection button, add device selector
- `lib/app-i18n.ts` — remove/replace stale "demo products ready" strings (Issue 1)
- `app/app/setup-checklist/page.tsx` — likely retired/simplified once onboarding itself owns the full journey (the checklist existed to compensate for onboarding stopping early — once it doesn't stop early, the checklist's job shrinks to "resume onboarding" or goes away)
- `lib/setup-progress.ts` — confirmed dead; candidate for removal rather than a second source of truth surviving the redesign

**Deliberately NOT touched in this workstream** (flagged in T): `app/app/layout.tsx`, `lib/module-guard.ts`, the ~140 `revalidatePath` call sites in `kitchenops.ts` — separate follow-up.

## V. Database/schema changes (all additive, nullable, backwards-compatible per your migration rules)

- `organisations.onboarding_step text` — new
- Reconcile `onboarding_completed` / `onboarding_completed_at` (Section S) — no destructive change, just clarify which is authoritative
- No changes needed to `products`/`product_categories` — the `category_type = 'both'` value already supports the unified-category design
- No changes needed to the entitlement/module schema — `inventory_enabled`/`recipe_costing_enabled`/etc. already exist and already work

## W. Migration risks

Low. Everything above is an additive nullable column or a pure application-code change. The one item requiring care is the `onboarding_completed`/`onboarding_completed_at` reconciliation — needs a backfill migration (`coalesce` pattern, same style already used in migration 039) rather than a drop, and should be reviewed for RLS impact per your rules even though it's additive, since both columns are read in gating logic today.

## X. Automated E2E test plan (outline)

Full path: signup → location type → CUI/ANAF (mockable) → module selection → menu builder (bulk-row add + inline category create) → optional stock/recipe setup → FiscalNet (test mode) → first sale (mock fiscal, embedded POS) → result screen → report teaser → dashboard crossing. Should run against the isolated E2E Supabase project already being built (the `20260917*_e2e_*` migration series found in this audit) — but per `docs/lean-cafe-platform-audit-2026-09-17.md`, that environment was noted as currently blocked/incomplete for end-to-end activation testing, so unblocking it is likely a prerequisite, not something to discover mid-implementation.

## Y. Target user actions/time — before vs. after

**Before** (current, and currently broken per Issue 1): ~5 page loads, ~8-11 clicks, blocked at the "tap a product" step because no products are seeded — a fresh signup today cannot actually complete the tour as designed without first detouring through the full `/app/products` page.

**After** (structural target, to be measured against real usage once built, per your own instruction to measure rather than assume): the same real work (choose location type, confirm CUI, pick modules, build a menu, connect or skip fiscal, sell) done as one continuous journey inside `/onboarding`, with exactly **one** cold `/app`-shell crossing (at "Vezi panoul") instead of the current 2+. The menu-builder step alone should let an owner enter 10 products in roughly the time the current flow takes to add one, given the bulk-row + inline-category pattern already proven in `PurchaseForm.tsx`.

---

## Mapping to your success criteria (Section 31)

Everything in your checklist is addressed by some section above except the following, which need an explicit decision from you before I'd consider the design complete:

1. **Achiziții as a separate toggle from Stoc** (your checklist implies independent control) — current recommendation is to fake independence in the UI while sharing one backing flag (Section R). Confirm this is acceptable, or ask for a real second column.
2. **Issue 1 and Issue 2** (top of this doc) — need a triage decision: fixed as part of this redesign, fixed separately and immediately, or explicitly deferred.
3. **Cache/prefetch work (Section T)** — recommended as a separate follow-up workstream rather than bundled in, to keep this redesign's diff reviewable. Confirm that sequencing is acceptable.

---

**Nothing has been implemented.** Per your instructions, this is the design for your review — let me know which sections to proceed on, which need changes, and how you want Issues 1 and 2 triaged.

# Local test pass — Steps 4-10, Gate A, Gate B

Run this against your local dev server (`npm run dev`), logged in as a Dolce Nera
owner/manager. Nothing here has been deployed — the café is still running the old
code. This script exists so a human can confirm the work before it ships.

Where a step needs something I can't see (your own eyes on layout/spacing, or a
decision only you can make), it's marked **[YOU CHECK]**. Everything else I've
already verified by reading the code and querying production data, but a human
click-through is the actual bar per the standing rules — code review isn't proof.

Sections 1-6 cover Steps 4-10 (already signed off if you've run this before —
nothing in them changed). Section 7 is Gate A (VAT fix), already live in
production data, verifiable here without any risk. **Section 8 is Gate B** — most
of it is safe to click through right now, at any hour, with zero risk; the parts
that need the real till and FiscalNet hardware are marked
**[NEEDS REAL TILL — OFF-HOURS]** and are the one thing actually gated on your
schedule.

---

## 0. Setup

```bash
cd ~/projects/franchisetech
npm run dev
```

Log in as a Dolce Nera owner/manager. Confirm you're scoped to org
`b01ce0e0-d01c-4042-0000-000000000042` (Dolce Nera) — if your account has access to
more than one org, make sure you're viewing this one.

---

## 1. New documents render with real Dolce Nera data

Dolce Nera has real sales/stock history, so these should render populated pages, not
empty states (unless a section genuinely has no data — see the "gaps not fabrication"
checks in section 4).

1. Go to `/app/reports/consum` — Consum report should list ingredient consumption for
   the selected period with real product names and quantities.
2. Go to `/app/reports/gestiune` — Gestiune (stock ledger) should show opening/closing
   stock and movements for the period.
3. Go to `/app/reports/balanta` — Balanța should show a stock valuation table.
4. Go to `/app/reports/registru-de-casa` — Registru de casă (cash ledger) should list
   entries per till session, including any `DIF####`-numbered entries for sessions
   that closed with a cash difference (see section 4.4 for how to check this is real).
5. Go to `/app/reports/consum-teoretic` — new report comparing theoretical vs actual
   ingredient consumption. Pick a period with real sales. Variance should be small
   (single digits, not 60-100%) — if you see huge blanket over-consumption across
   most ingredients, that's the bug I already found and fixed once; flag it back to me
   immediately, don't treat it as normal.
6. Go to `/app/inventory` — new inventory count feature. See section 3 for the actual
   count workflow test.
7. **[YOU CHECK]** Open the PDF export on each of consum / gestiune / balanța /
   registru-de-casa (there's a download/print button on each page) and confirm the PDF
   isn't broken — headers render, numbers aren't cut off, Romanian diacritics show
   correctly.

---

## 2. Settings — one page, five sections

`/app/settings` was restructured. All of the following should land you in the right
place with no dead ends:

1. Go to `/app/settings` directly (no `?tab=`) — should default to the **Business**
   tab.
2. Go to `/app/settings?tab=units` — Units tab. Should show the operational units
   (kg, g, l, ml, buc, etc.) as a **read-only list**, not an editable free-text field.
   This is deliberate: unit normalization is settled and shouldn't be re-opened by
   accident.
3. Go to `/app/settings?tab=payment-methods` — should show exactly two methods (card,
   cash) with **no split-payment toggle** visible anywhere on the page.
4. Go to `/app/settings?tab=categories` — category management.
5. Go to `/app/settings?tab=location` — should show Dolce Nera's one site, with **no
   site switcher** (single-location business). If the copy states anywhere that
   multiple locations are possible, that's expected — Dolce Nera's org record has
   `multi_site_ops_enabled = true` — but there should still be nothing to *switch to*
   today since only one site exists.
6. Go to `/app/settings?tab=fiscal` — FiscalNet section. Confirm it shows **measured
   history** — a count of fiscal receipt attempts, the last Z report, sessions closed
   — not just an on/off toggle. If FiscalNet has never run, it should say so plainly
   rather than showing blank space.
7. Now test every alias redirects to the right tab (the URL param changes, or at least
   the correct section renders — check the page content matches, not just the URL):
   - `/app/settings?tab=anaf` → should render the **Fiscal** section
   - `/app/settings?tab=products` → should render **Categories**
   - `/app/settings?tab=operations` → should render **Categories**
   - `/app/settings?tab=general` → should render **Business**
8. **[YOU CHECK]** Confirm nothing you could do in the old settings page (before this
   change) is now missing. If you remember a specific setting you used to change and
   can't find it, tell me which one — I did not intend to remove any actual
   capability, only to reorganize navigation.

---

## 3. Blocked route → redirect with explanation

1. Check which business modules are currently **disabled** for Dolce Nera — the
   Settings page for a disabled module will say so, or ask me and I'll confirm from
   the org's module flags.
2. Try to navigate directly to a route gated behind a disabled module (for example, if
   `recipe_costing` were off, `/app/recipes`; if `inventory` were off, `/app/stock`).
3. Expected: you're redirected to `/app/settings` with a **visible banner explaining
   why** (which module is locked and what it would take to unlock it) — not a blank
   page, not a silent redirect to the dashboard, not a generic 404.
4. If every module Dolce Nera has is currently enabled and you can't find a locked one
   to test, tell me — I'll either point you at one or confirm this check needs to wait
   until a module is intentionally turned off.

---

## 4. Deleted modules are actually gone from navigation

These routes should now 404 (or redirect to login/dashboard — not render HACCP
content) and none of the following should appear anywhere in the app's nav/sidebar:

- `/app/sensors`, `/app/manager-review`, `/app/corrective-actions`, `/app/haccp-flow`,
  `/app/cleaning`, `/app/checks`, `/app/quick-check/...`
- `/app/reports/calibration`, `/app/reports/process-checks`,
  `/app/reports/refrigeration`, `/app/reports/cleaning`, `/app/reports/actions`
- `/app/reminders`, `/app/debug`, `/app/demo-tools`, `/app/how-it-works`,
  `/app/history`, `/app/reports/deliveries`

Steps:
1. **[YOU CHECK]** Click through every visible nav item/menu in the app (main sidebar,
   any settings sub-nav, any dashboard shortcut cards) and confirm none of the above
   routes are linked anywhere. This is the one I can't fully verify myself without
   seeing the rendered UI — I checked the source for links to these paths and found
   none left, but a stray link only shows up by actually looking.
2. Manually visit 2-3 of the routes above directly by URL and confirm they 404 rather
   than error or show stale content.
3. Go to `/app/sites` — this one should **still work** (Dolce Nera has
   `multi_site_ops_enabled = true`, so this route is live even though it looked
   orphaned at first glance). Confirm it shows Dolce Nera's one site.
4. Go to `/app/deliveries` — should still work (delivery tracking is a separate,
   not-yet-due deletion group, kept intentionally).

### 4.4 Registru de casă — confirm DIF entries are real, not fabricated

1. Find a till session that closed with a nonzero cash difference (check
   `pos_sessions.cash_difference` if you have DB access, or look for a session you
   remember closing with a discrepancy).
2. Confirm `/app/reports/registru-de-casa` shows a `DIF####` line for that session
   with an amount matching the actual difference — not a rounded or invented number.
3. Confirm sessions that closed **exactly balanced** show no DIF entry.

---

## 5. Inventory count applies as a batch

1. Go to `/app/inventory`, click **"Începe o numărătoare nouă"** (start a new count).
2. Enter counted quantities for a handful of products — mix some that match current
   system stock and some that don't.
3. Before finalizing, confirm nothing has been written to stock yet — the count
   should sit in **draft** status, not silently adjust stock as you type.
4. Finalize the count.
5. Confirm:
   - Stock movements now reflect **deltas** (counted minus system quantity), not an
     absolute overwrite that would erase movement history.
   - Products where your count matched the system exactly produced **no movement
     record** (no-op, not a zero-adjustment entry cluttering history).
   - The count can't be finalized twice (try re-finalizing or refreshing and
     re-submitting — should be a no-op or blocked, not a duplicate adjustment).

---

## 6. Reports show gaps, not fabricated costs

This is the core fix from earlier in this engagement (`stockMovementUnitCost()` no
longer fabricates a cost from today's price when the historical cost is unknown).

1. On `/app/reports/consum`, `/app/reports/gestiune`, and `/app/reports/balanta`, look
   for any line item marked with an amber "cost unknown" or "partial" indicator.
2. **[YOU CHECK — this is a judgment call, not something I can grep for]** For a couple
   of those flagged rows, does it look *plausible* that the historical cost is
   genuinely unrecoverable (e.g. a very old stock movement, or one from before some
   product's CMP history started)? I'm not asking you to reconstruct the cost — just
   sanity-check that the gaps look like real historical holes, not something that
   should obviously be known.
3. Confirm you do **not** see every single cost silently backfilled with today's
   price — if every line has a number and none are flagged unknown, something has
   regressed back to the old fabrication behavior and this needs to come straight
   back to me.
4. On `/app/products/[id]` for a few products, check the "Cost rețetă" / recipe
   costing display shows **"CMP as of <date>"** rather than a bare number with no
   provenance.

---

## 7. Gate A — VAT fix (already live in production data)

Dolce Nera's data was already corrected directly in production (this isn't a
"will it work" check, it's confirming the correction actually took and stayed).

1. Go to `/app/products`, open a handful of products that used to carry 21% or 11%
   VAT (anything drink/food-related is a safe bet — before the fix, 42 products were
   at 21% and 20 at 11%). Confirm VAT shows **0%** on all of them.
2. Go to `/app/settings?tab=fiscal` (or wherever VAT rates are listed in Settings) —
   confirm **TVA 0%** is the only active/default rate; 21%/11%/5% should show as
   present but inactive, not deleted.
3. Go to `/app/settings/data-repair` — confirm there's a completed VAT repair batch
   dated 2026-09-15 covering 62 products, with a full before/after audit trail per
   product.
4. **[YOU CHECK]** Try to import a CSV of products with a blank VAT column (or edit
   a product and try to manually set VAT to 21%) — confirm it's rejected or forced
   to 0%, not silently accepted. If a product ends up with non-zero VAT through any
   path, that's the exact bug come back — flag it immediately.

---

## 8. Gate B — POS sell screen + fiscal receipt logging

### 8.1 Safe to check right now, no till or off-hours needed

1. Go to `/app/pos` with an open till. Open the **quick-access menu** (the grid
   icon, top-left) — confirm it shows exactly **four** tiles: Pune în așteptare
   (only if the cart has items), Rambursare, Mișcare numerar, Închide casa (the
   last two only if you're an owner/manager). Nothing else should be in this sheet.
2. Find the **"…" (More) button** next to it in the top bar — confirm it opens a
   dropdown with Clienți, Comenzi, and (only if there's something to show) held
   orders and Raport Z. This is where the other 7 destinations that used to be in
   the quick-access sheet moved to — **[YOU CHECK]** confirm you can still do
   everything you used to be able to do from the old 11-item menu, just from here
   or from the main app nav (Settings/Products/Reports) instead. If something you
   relied on is missing from both places, tell me which.
3. Add a few products to the cart and go to the payment step — confirm you see
   exactly **two** payment buttons, Numerar and Card, each large enough to be a
   comfortable target (not a list of every configured payment method). Confirm the
   total shown is the biggest number on that screen.
4. **[YOU CHECK]** Look at the product grid across a few different categories —
   coffee/drink categories should show real photos; **SHOP** and **LIMONADA &
   FRESH** specifically should show clean name+price+colour tiles instead of
   broken/missing-image placeholders (their real photo coverage is 38% and 13%,
   below the threshold this was built around). If any category looks like a mix of
   photo tiles and blank placeholders in the same section, that's the fallback not
   working — tell me which category.
5. Look for the **connection status indicator** — a small pill, fixed in a corner
   of the screen, visible even while you're on the payment screen. It should read
   "Sincronizat" in normal conditions. Turn off your Wi-Fi/network briefly (or use
   your browser's offline dev-tools toggle) — confirm it switches to "Offline"
   within a few seconds, and back to "Sincronizat" (or briefly "Se sincronizează")
   when you reconnect. It should never appear as a popup, toast, or modal — just
   that one small fixed badge.
6. Set FiscalNet to **mock mode** in Settings if it isn't already, complete a test
   sale, then check `/app/settings?tab=fiscal`'s measured-history card — confirm
   the attempt count went up by one and shows a recent timestamp. This is the
   actual bug fix: before this, that count never moved for a real sale, ever.

### 8.2 **[NEEDS REAL TILL — OFF-HOURS]** — the one thing actually gated on your schedule

> **STOP — do not run the steps below during normal service, and not alone.**
> This is the one part of this whole script that touches the real till with real
> FiscalNet, not mock mode or a local dev instance. Arrange a specific window
> first — even 10-15 minutes, before opening or after close — with someone
> physically present to watch the first sale. If you're reading this mid-shift
> with customers waiting, close this section and come back later; nothing above
> section 8.2 needs that.

Once that window is arranged:

1. Complete one real sale on the real till, real FiscalNet connection.
2. Confirm the fiscal receipt printed as expected (unchanged from before — this fix
   doesn't touch how or whether a receipt prints, only whether the outcome gets
   recorded).
3. Immediately after, check `/app/settings?tab=fiscal`'s measured-history card, or
   directly query `fiscal_receipt_attempts` for that transaction — confirm exactly
   **one** row was written, with `status = 'success'` and a real receipt number,
   not stuck at `'pending'` or `'api_pending'`.
4. If you can safely simulate a failure (e.g. temporarily disconnect the FiscalNet
   agent before completing a sale, if your setup allows it without risking a stuck
   till) — confirm the attempt gets logged as `'failed'`, not silently dropped.
   Skip this specific check if there's no safe way to do it without risking the
   real shift.
5. Run a handful of real sales across a real short shift (this is the "done means
   a full real shift ran on it without falling back" bar — not a single test
   transaction). Watch for: the sell screen staying responsive, the connection
   indicator reflecting reality, no duplicate fiscal attempts for one sale, no
   sale that completed without eventually getting *some* fiscal_receipt_status
   other than stuck-pending.

---

## What I'm not asking you to check

- Group C/D deletions (delivery, e-Factura, modifiers, referrals, testimonials) — not
  started, waiting on three months of silence per your instruction.
- Anything requiring FiscalNet hardware/ANAF credentials I don't have access to — if a
  step above needs those and you hit a wall, that's expected; note it and move on.
- Deploying any of this — nothing here has shipped. This whole script runs against
  your local dev server only.

---

## If something fails

Tell me exactly which numbered step, what you expected, and what you saw. Don't try to
patch it yourself first unless it's trivial — I'd rather see the actual failure than a
description of a workaround.

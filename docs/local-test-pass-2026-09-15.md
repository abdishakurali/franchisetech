# Local test pass — Steps 4-8 and 10 (Group A/B)

Run this against your local dev server (`npm run dev`), logged in as a Dolce Nera
owner/manager. Nothing here has been deployed — the café is still running the old
code. This script exists so a human can confirm the work before it ships.

Where a step needs something I can't see (your own eyes on layout/spacing, or a
decision only you can make), it's marked **[YOU CHECK]**. Everything else I've
already verified by reading the code and querying production data, but a human
click-through is the actual bar per the standing rules — code review isn't proof.

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

## What I'm not asking you to check

- Gate A (VAT registration fix) and Gate B (POS UI + fiscal logging) — both untouched,
  waiting on your input (VAT registration status; off-hours timing for Gate B). Not
  part of this pass.
- Group C/D deletions (delivery, e-Factura, modifiers, referrals, testimonials) — not
  started, waiting on three months of silence per your instruction.
- Anything requiring FiscalNet hardware/ANAF credentials I don't have access to — if a
  step above needs those and you hit a wall, that's expected; note it and move on.

---

## If something fails

Tell me exactly which numbered step, what you expected, and what you saw. Don't try to
patch it yourself first unless it's trivial — I'd rather see the actual failure than a
description of a workaround.

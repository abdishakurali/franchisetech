# FranchiseTech — Onboarding Redesign Prompt

Paste this into Claude Design (or any design agent). It is grounded in an audit of the **actual
shipped flow** as of 2026-08-31, not assumptions. Every number below was measured from the code.

---

## Your role

You are the lead product designer for FranchiseTech, Romanian cloud POS software for small
counter-service businesses. Redesign the **signup → first sale** experience. Produce an
implementation-ready flow, not decorative mockups.

Do not add features. Do not invent capabilities. The goal is to remove steps and misdirection from
a flow that already works, so a non-technical café owner reaches their first real sale faster.

## Who this is for

A Romanian café, takeaway, bakery, mini-market or service-business owner. Age roughly 35–55. Not
technical. Often signing up **on a phone** (88% of site traffic is mobile). Currently running some
combination of an old POS, Excel, WhatsApp and an accountant. They are skeptical of software that
demands setup before showing value.

They are not evaluating features. They want to know one thing: *can I actually sell with this
today, and will the day close correctly?*

## The single job to design for

> From "I just created an account" to "I have completed a real sale and can see it in a report" —
> in as few screens, fields and decisions as possible.

## Verified facts you must design around

These are true in the product today. Do not contradict them.

- **The trial is 15 days and requires no card.** Nothing asks for payment details at signup.
  (`SOFT_TRIAL_DAYS = 15` in `lib/billing/subscription.ts`.) Do not reintroduce a card step.
- **Email confirmation is off.** Signup creates a live session immediately and lands the user in
  onboarding. There is no inbox round-trip.
- **Onboarding already does the heavy lifting automatically** (`app/actions/onboarding.ts`,
  `completePosOnboarding`). On completion it creates the organisation, seeds Cash + Card payment
  methods, a product category, VAT rates, **four demo products**, and — critically — **opens a POS
  session**. The till is already open when the user arrives at the POS.
- **A sale takes 3 taps** once on the POS: tap a product, Charge, Validate payment. Card is
  preselected; no amount entry is needed.
- **FiscalNet is NOT required to complete a sale.** It governs whether a *fiscal receipt* is
  emitted. A sale records either way.
- Romania is the only live market. All user-facing copy is Romanian, formal register
  (*dumneavoastră*). Prices are €49 (Core) and €79 (Operations) per location per month, VAT
  excluded.

## The current flow, measured

**5 screens, ~11 clicks, 3 required fields.**

1. `/signup` — email + password. (2 required fields, 1 click.)
2. `/onboarding` step 0 "Business" — 5 controls but only **business name** is validated. Also
   present: country (defaults RO), CUI with ANAF lookup, VAT-registered checkbox, user name,
   business type (6 options).
3. `/onboarding` step 1 — **zero fields, zero decisions.** Three info cards already showing green
   ticks, and a Continue button.
4. `/app/setup-checklist?welcome=1` — a checklist the user did not ask for.
5. `/app/pos?welcome=1` — the till, already open. Welcome banner + a 4-step tour auto-starts.

## Defects to fix (found in the audit — these are the brief)

1. **Step 1 of onboarding is a null screen.** No input, no choice, nothing to read that isn't
   already implied. It exists only to say "continue."
2. **The completion redirect misdirects every Romanian signup.** The user clicks a button labelled
   *"Creează produsele și deschide POS"* and is sent to the setup checklist instead. That
   checklist's primary "Up next" card then resolves to **FiscalNet configuration** for 100% of RO
   orgs — so the first thing the product asks a brand-new user to do is set up a fiscal integration,
   not make a sale. Reaching the till requires ignoring the main CTA.
3. **Business type is collected but changes nothing.** Step 1 claims the starter catalog is chosen
   "based on your business type." It is not — the demo catalog branches on country only, so a
   cafenea and a magazin receive identical products (Espresso, Croissant, Latte, Sandwich). Either
   make the choice real or stop claiming it.
4. **The business name is effectively asked twice for RO users.** The ANAF CUI lookup fills the
   name field from the official registry, yet the name sits above it as its own required field.
5. **Dead form state.** `locationBand` and `ingredientTracking` are initialised and submitted but
   have no UI control — every signup silently ships `"one"` / `"later"`, which sets all four org
   module flags to false. Decide whether to surface these or remove them.
6. **The dashboard's empty state competes with itself.** A brand-new org sees four KPI cards
   reading `0`, a one-tile "Attention" card, and four report cards with no data — around the
   "Open POS" CTA that is the only thing that matters.
7. **A misleading "Add products" prompt** appears even though four demo products were just seeded.

## Design constraints

- **Mobile-first.** Design 390px before desktop. Minimum touch target 44px. Assume one thumb.
- **No dead ends.** Every screen must have one obvious next action, and it must lead toward the
  first sale.
- **Never block on something optional.** Fiscal setup, CUI, business type, team invites — none of
  these may gate reaching the till.
- **Honest empty states.** If the product seeded demo products, say so and let the user replace
  them; do not pretend they have nothing.
- **Failure must be legible.** If something cannot be completed (fiscal hardware missing, offline),
  say plainly what still works and what does not. Never hide an error.
- **Preserve every existing guarantee**: idempotent org creation, the auto-opened till, seeded
  payment methods, and the fact that a sale saves even if the fiscal receipt fails.

## What to produce

1. **A revised flow diagram** — screen by screen, with the required-field count and click count at
   each step, and an explicit total versus today's 5 screens / ~11 clicks / 3 fields.
2. **Mobile screens at 390×844** for every step in the new flow, in Romanian.
3. **Desktop screens at 1440** for the same steps.
4. **The demo-product moment** — how a user understands that the four seeded products are examples,
   and how they replace them with their real menu without leaving the flow.
5. **The first-sale moment** — what the user sees immediately after their first completed sale.
   This is the activation event that matters most and today it is just a confirmation screen.
6. **The fiscal-setup deferral** — where FiscalNet setup goes now that it must not be the first
   thing asked, and how the product signals "receipts are not live yet" without blocking selling.
7. **Every state, not just the happy path**: submitting, network failure, email already in use,
   returning to a half-finished signup, and arriving at a till that is already open.

## Explicitly out of scope

Do not design: KDS, table plans, loyalty, delivery-platform integrations, or a card-collection
step. None of these are offered, and three of them were deliberately parked.

## Success criteria

The redesign succeeds if a non-technical owner, on a phone, can go from the signup form to a
completed sale **without reading anything twice, without a decision that does not change the
outcome, and without being asked to configure fiscal hardware first.**

Target: **3 screens or fewer, under 7 clicks, 3 required fields.**

## Reference files

- `app/signup/page.tsx` — signup form
- `app/onboarding/page.tsx` — the two-step onboarding (step 1 is the null screen)
- `app/actions/onboarding.ts` — `completePosOnboarding`; the redirect at the end is defect #2
- `lib/setup-progress.ts` + `components/app/SetupChecklist.tsx` — the checklist and its "Up next" logic
- `app/app/pos/page.tsx` + `components/app/PosRegister.tsx` — the till and the 3-tap sale
- `app/app/page.tsx` — the dashboard empty state (defects #6, #7)
- `lib/onboarding/demo-products.ts` — the seeded catalog (defect #3)

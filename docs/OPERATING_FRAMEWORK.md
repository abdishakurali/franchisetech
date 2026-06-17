# franchisetech Operating Framework

## Priority levels

### P0 — Live platform safety

**Definition:** Anything that can take the public website or app offline, break deployment, corrupt production, or expose wrong branding to customers.

**Acceptance criteria:**
- Public website returns 200 on all required routes
- franchisetech branding throughout — no KitchenOps
- PM2 running, 0 errored instances
- Deploy script passes pre-deploy guard
- Rollback script has at least one valid target (or a new build is ready)
- Logo and marketing assets return 200

**What is allowed:**
- Emergency rollback
- Hotfix deploy
- Brand text correction
- Asset restoration
- Deploy script repair

**What is blocked:**
- Any P2/P3/P4 work
- Schema changes
- Feature work
- Refactoring

**Current status:** ✅ STABLE as of 2026-06-17 (release `20260617_122603`)

---

### P1 — Business flow and compliance safety

**Definition:** Anything that can cause incorrect money handling, duplicate fiscal events, wrong VAT, broken POS sessions, corrupted stock, or inaccessible customer records.

**Acceptance criteria:**
- POS sale creates one record, charges correct amount
- Cash received/change due do not affect fiscal total
- Opening balance sent exactly once per session
- Z report requires admin, does not auto-run
- Purchases save correctly
- Reports load and show correct data
- Products save and display correctly
- RLS isolates tenants — org A cannot see org B
- Billing and team management require owner role

**What is allowed:**
- Bug fixes to business logic
- Fiscal idempotency fixes
- RLS fixes
- Report data corrections
- Permission enforcement fixes

**What is blocked:**
- Changing VAT calculation
- Changing sale creation logic
- Changing how payments are recorded
- Auto-running fiscal commands
- P2/P3/P4 feature additions during instability

**Current status:** ✅ STABLE — known deferred items:
- FiscalNet opening balance idempotency improvement (tracked, not urgent)
- openPosSession UI hardening (button disable while submitting)

---

### P2 — Current customer-request features

**Definition:** Features that the current customer has explicitly requested.

**Current customer requests (active):**
- Romanian product categories (mărfuri / ingrediente / consumabile)
- Record Purchase flow — TVA, UM, RON/lei
- POS layout: 6 products per row on compact screen
- `is_purchaseable` field on products
- `item_type` classification on products
- Migration 035 applied ✅

**Acceptance criteria per feature:**
- Feature works end-to-end on the till screen
- Does not break any P1 business flows
- Does not add noise to existing workflows
- Works correctly with the customer's existing data

**What is allowed:** Implementing requested features after P0 and P1 are stable.

**What is blocked:** Speculative features, refactoring unrelated code, changing sale/payment logic.

---

### P3 — Customer experience improvements

**Definition:** Improvements that reduce staff mistakes, increase owner trust, or make the product easier to use for a first-time user.

**Backlog items:**
- Smart till closing guidance
- First-day guided mode / onboarding
- Owner daily summary
- Staff mistake prevention (confirmation dialogs, error recovery)
- Support chat improvements
- SUNMI Chrome 86 `@layer` CSS compat

**Acceptance criteria:** Passes the 7 customer experience questions in CLAUDE.md.

---

### P4 — Marketing and growth

**Definition:** Public-facing content changes that do not affect product behaviour.

**Items:** Landing page copy, pricing page claims, case studies, testimonials, growth content, SEO metadata.

**Constraint:** No marketing claim may be added until the feature it describes is verified live and working.

---

## Priority escalation rule

If any task reveals a P0 or P1 issue:
1. Stop current task
2. State: "P0/P1 issue detected: [description]"
3. Fix the higher-priority issue first
4. Resume original task only after higher-priority issue is resolved and verified

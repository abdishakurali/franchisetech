# Customer Experience Principles

## The franchisetech advantage

franchisetech competes on reliability, honesty, and clear workflows — not on feature count.

A staff member at 8am opening the till should never have to think. An owner reviewing end-of-day numbers must be able to trust them completely. A first-time user should be able to complete a sale without reading a manual.

This is the standard every change is measured against.

---

## The seven questions

Every feature, change, or UI decision must answer these:

1. **Does this make the staff member faster or less likely to make a mistake?**
   - Is the happy path obvious?
   - Is there a confirmation where it matters (not on every button)?
   - Is the error message actionable, not technical?

2. **Does this make the owner trust the numbers more?**
   - Is the data accurate?
   - Is the calculation visible and verifiable?
   - Does it handle edge cases (refunds, voids, corrections) consistently?

3. **Does this reduce support burden?**
   - Can the user self-recover from the most common failure?
   - Is the error message specific enough that support can diagnose it quickly?
   - Does the feature have a manual fallback?

4. **Does this work on the till screen?**
   - Till screens are often 10" tablets in portrait mode.
   - Buttons must be large enough to tap accurately under time pressure.
   - No horizontal scroll. No tiny text. No hover-only interactions.
   - Test on the actual device, not just desktop.

5. **Does this preserve existing workflows?**
   - Staff trained on the current flow must not need retraining.
   - If the workflow changes, there must be a transition path.
   - Do not move buttons staff rely on without a strong reason.

6. **Does this handle failure clearly?**
   - Every external call (FiscalNet, drawer, payment terminal) can fail.
   - Failure must be surfaced, not hidden.
   - The user must know what happened and what to do next.
   - "Command sent" is not success — confirm outcome before clearing the screen.
   - Fallback to manual mode must always be available.

7. **Does this respect local tax/fiscal rules?**
   - Romanian customers require TVA (not VAT), RON currency, FiscalNet compliance.
   - Do not assume all customers use the same currency or tax labels.
   - Fiscal amounts must be exact — no rounding that mismatches the fiscal receipt.

---

## Staff mistake prevention

Common mistakes to prevent:

| Mistake | Prevention |
|---|---|
| Entering wrong cash received | Clear "Change due" indicator before confirming |
| Charging the wrong price | Price visible on cart item, not just total |
| Double-submitting a sale | Disable submit button during processing |
| Opening Z report accidentally | Admin-only, labelled clearly, confirmation required |
| Applying wrong VAT rate | Default VAT per product, not per session |
| Losing a sale if drawer fails | Sale saves first, drawer command is secondary |
| Wrong product selected on small screen | Large tap targets, product image visible |

---

## Owner trust

What the owner must be able to rely on:

- End-of-day totals match what was sold, not what was typed into cash received
- Cash in/out is logged separately from revenue
- Discounts and voids are traceable
- Reports do not change retroactively
- Multi-staff usage is separated by staff login (future: per-staff reporting)
- No sale can be created without an open till session

---

## First-day usability

A new customer who has never used franchisetech must be able to:

1. Log in
2. Add their first product
3. Open the till
4. Complete a cash sale
5. See the sale in reports

...without asking for support. If they need support for any of these steps, that is a product failure.

---

## Localisation

Current localised markets:
- **Romania:** TVA, RON, FiscalNet, Romanian UI labels where relevant (e.g. "Poate fi cumpărat", "Tip articol")
- **Ireland:** VAT, EUR, metric units
- **UK:** VAT, GBP, metric units

Rules:
- Tax label (TVA vs VAT) must follow `isRO = currency === 'RON'`
- Currency symbol must follow org setting
- Do not hardcode "€" in UI — use the org's currency setting
- Do not hardcode "VAT" — check `isRO` flag
- Unit of measure labels must match local conventions

---

## Failure state design

Every failure state must include:

1. **What happened** — plain language, not error codes
2. **What the user should do now** — specific next step
3. **What was preserved** — "Your sale has been saved. The receipt printer did not respond."
4. **How to get help** — support chat or contact

Never show:
- Raw stack traces
- Database error messages
- "Something went wrong" without context
- Misleading success messages when the operation failed

---

## Support messaging guidelines

- Always acknowledge the problem before explaining the solution
- Never blame the user for the error
- Offer the manual fallback before escalating to support contact
- Use the customer's language (Romanian/English) consistently
- Do not promise features that do not exist yet

---

## No misleading claims

Marketing claims must reflect actual product behaviour:

- Do not claim a feature works until it is verified live
- Do not claim fiscal compliance until the relevant fiscal workflow is tested
- Do not use "automatic" for features that require manual steps
- Do not use "real-time" for features that batch or delay

This applies to landing page copy, onboarding messages, help articles, and support responses.

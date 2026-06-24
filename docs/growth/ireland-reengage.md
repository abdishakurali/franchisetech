# Ireland customer re-engagement

**Goal:** Reactivate Dolcenera / The Health Bar trials with guided onboarding. Validate that activation fixes (demo products, auto-open till, POS tour) solve the one-day churn.

**Why they stopped:** Onboarding confusion — never reached first sale (confirmed in plan).

**Product state since churn:**

- Onboarding seeds 4 demo products + opens till automatically
- Redirect to `/app/pos?tour=first_sale` with guided tour
- Growth milestones tracked on `organisations.growth_*`

---

## Primary contacts (IE)

| Business | Email | Trial ends | Growth status |
|----------|-------|------------|---------------|
| Dolcenera | office@dolcenera.ro | check Supabase | No milestones |
| Dolcenera | info@dolcenera.ro | newer signup | No milestones |
| The Health Bar | calv131@yahoo.com | ~2026-06-25 | No milestones |

---

## Message template (email or WhatsApp)

**Subject:** 30 minutes to get your till live — free setup walkthrough

Bună / Hi,

You tried franchisetech briefly — thank you for giving it a look.

We've rebuilt the first-day experience: your menu is pre-loaded, the till opens automatically, and a 2-minute guided tour walks you through your first sale.

I'd like to offer a **30-minute screen share** to get you to a real test sale on your own products. No charge for the session. If it fits after that, we can talk about the €199 assisted setup or continuing on trial.

Are you free this week for a short call?

— Franchise Tech
info@franchisetech.ro

---

## Call script (15 min)

1. Confirm business type and current till (Odoo replacement context)
2. Share screen: POS → tap demo product → Charge → Card
3. Swap one demo product for their real item
4. Show Z-report / till close (owner trust moment)
5. Ask: *"Would this replace what you do after close today?"*
6. If yes: offer assisted setup €199 or Pro €79/mo before trial ends

---

## Outcome log (founder fills in)

| Date | Contact | Channel | Result | Next step |
|------|---------|---------|--------|-----------|
| | office@dolcenera.ro | | pending | |
| | calv131@yahoo.com | | pending | |
| | info@dolcenera.ro | | pending | |

**Success criteria:** `growth_first_sale_at` set within 7 days of re-engagement.

---

## Case study permission

If reactivated, ask:

> Can we use "[Business name] moved from Odoo to franchisetech for daily till + reports" on franchisetech.ro (no revenue numbers)?

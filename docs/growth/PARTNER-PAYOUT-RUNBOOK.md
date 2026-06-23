# Partner payout runbook (manual v1)

**Scope:** Founder pays partners by bank transfer. No Stripe Connect, no partner portal until **5+ active paying partners**.

---

## When to pay

| Revenue type | Pay when | Amount |
|--------------|----------|--------|
| Subscription MRR | Client on **active** paid subscription (not trial-only) | 20% of plan MRR |
| Assisted setup | First assisted setup (€199) attributed to partner | €100–150 (agreed per partner) |

**Do not pay** on trial signups alone. Wait for first real `invoice.paid` or active status after trial.

---

## Monthly workflow

1. Run export:
   ```bash
   node scripts/export-growth-weekly.mjs --partners-only > partner-commissions-$(date +%Y-%m).csv
   ```
2. Filter rows where `billing_status` = `active` and `commission_due_eur` > 0.
3. Group by `acquisition_content` (partner slug).
4. Pay via bank transfer; log in founder sheet:
   - `partner_slug`, `period`, `clients_count`, `mrr_total`, `commission_paid`, `payment_date`, `reference`
5. Check `partner_waitlist` in Supabase for new interest — invite manually when gate opens.

---

## Plan MRR reference (EUR)

| Plan | MRR | 20% commission |
|------|-----|----------------|
| Starter | €49 | €9.80 |
| Pro | €79 | €15.80 |
| Multi-location | €99 | €19.80 |

Source of truth: [lib/billing/plans.ts](../../lib/billing/plans.ts).

---

## Churn

Commission **stops** when subscription cancels or pauses. No clawback in v1.

---

## Dolce Nera (controlled partner #1)

- UTM: `partner_operator_champion`, `utm_content=dolce-nera`
- First referred client: free assisted onboarding (founder runs setup)
- Track manually until first full loop → then flip `PARTNER_PROGRAM_OPEN=true`

---

## When to build partner portal

Revisit self-serve portal (login, earnings dashboard) when **manual payout genuinely hurts** — target: **5+ active paying partners**.

Until then: this runbook + CSV export is sufficient.

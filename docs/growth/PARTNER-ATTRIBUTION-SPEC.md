# Partner attribution spec

Single source of truth for **customer referrals** vs **partner channel** attribution.

---

## Two parallel systems

| Track | Attribution | Reward |
|-------|-------------|--------|
| **Customer referral** | `?ref=FT-XXXXXX` on signup → `organisations.referred_by_code` | 1 free month credit to referring org (not cash) |
| **Partner channel** | `utm_source=partner_*` on signup → `organisations.acquisition_*` | ~20% recurring cash commission (manual payout) |

Do not mix: partner links use UTMs, not `FT-*` codes.

---

## Partner UTM convention

Defined in [lib/marketing/partner-links.ts](../../lib/marketing/partner-links.ts).

| Field | Example |
|-------|---------|
| `utm_source` | `partner_contabil_horeca` |
| `utm_campaign` | `ro-partner-2026-h2` |
| `utm_medium` | `partner` |
| `utm_content` | Partner slug, e.g. `contabilitate-popescu` or `dolce-nera` |

**Client trial link (co-pilot):**

```
https://franchisetech.ro/signup?plan=pro&lang=ro&utm_source=partner_contabil_horeca&utm_campaign=ro-partner-2026-h2&utm_medium=partner&utm_content={partner_slug}-client-{client_slug}
```

---

## Where data is stored

| Data | Table / column |
|------|----------------|
| Partner UTMs at signup | `organisations.acquisition_source`, `acquisition_campaign`, `acquisition_content`, `acquisition_medium` |
| Customer referral code | `organisations.referred_by_code` |
| Subscription status | `billing_subscriptions.status`, `plan` |
| Waitlist interest | `partner_waitlist` |

---

## SQL: partner-sourced orgs with billing

```sql
select
  o.id,
  o.name,
  o.created_at,
  o.acquisition_source,
  o.acquisition_content as partner_slug,
  b.plan,
  b.status as billing_status
from organisations o
left join billing_subscriptions b on b.organisation_id = o.id
where o.acquisition_source like 'partner_%'
order by o.created_at desc;
```

---

## CSV export (founder)

```bash
node scripts/export-growth-weekly.mjs --partners-only > partner-commissions.csv
```

Columns include `mrr_eur`, `commission_pct` (20), `commission_due_eur` for active/trialing partner-attributed subs.

---

## Gate: when partner links go live

`PARTNER_PROGRAM_OPEN=true` only after Dolce Nera loop completes. See [P0-REFERRAL-PLAYBOOK.md](./P0-REFERRAL-PLAYBOOK.md).

Until then: `/partners` is waitlist-only — do not send cold outreach promising live client onboarding.

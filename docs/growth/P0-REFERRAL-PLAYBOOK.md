# P0 — Warm referral conversion (Dolce Nera pipeline)

**Priority:** P0 — runs in parallel with marketing truth slice. This is founder + engineering work, not a landing-page task.

## Success metric

One referred location live with: till open → first sale → Z report, without founder emergency rescue.

## Checklist

| Step | Owner | Done |
| --- | --- | --- |
| Call/message Dolce Nera owner — recover **lost referral list** | Founder | [ ] |
| Pick **one** referral (single site, single PC, single printer) | Founder | [ ] |
| Schedule **assisted install** (on-site or screen-share — not email-only) | Founder | [ ] |
| Connector + FiscalNet path bulletproof for that site | Engineering | [ ] |
| Post-mortem: what failed last time vs fix applied | Founder + eng | [ ] |
| Promise **Starter path only** on the call (till, sale, Z) — no Pro/stock pitch until live | Founder | [ ] |
| Do **not** scale cold outreach or SEO until this referral completes | GTM | [ ] |

## Under-promise script (referral call)

- "We get you live on casă, prima vânzare, și raport Z — cu instalare asistată."
- Stoc, rețete, display bucătărie = Pro, **after** Starter works on their hardware.
- FiscalNet: same PC as casă, same imprimantă — we walk through connector step by step.

## What blocked last referrals (verify fixed)

- [ ] FiscalNet driver / printer firmware on cashier PC
- [ ] Connector install and permissions
- [ ] Opening balance sent once (no duplicate)
- [ ] Owner knows how to close till and read Z report
- [ ] WhatsApp / phone support path for install day

## After first win

- Ask for one sentence testimonial (named or anonymized)
- Only then re-open Dolce Nera list for referral #2
- Full marketing refresh (screenshots, SEO, need-based IA) gated at **3–5 paying customers**

---

## Partner program gate (`PARTNER_PROGRAM_OPEN`)

Dolce Nera owner = **controlled partner #1**. Track manually in a sheet until the loop below completes.

**UTM for Dolce Nera referrals:** `utm_source=partner_operator_champion`, `utm_content=dolce-nera`, campaign `ro-partner-2026-h2`.

### Flip `PARTNER_PROGRAM_OPEN=true` only when ALL are true

| Milestone | Criterion |
| --- | --- |
| Intro | Dolce Nera owner referred **one** client with named UTM |
| Install | Assisted install completed — connector + FiscalNet on client PC |
| Activation | Client: till open → first sale → Z report (no founder emergency rescue) |
| Revenue | Client on **paid** subscription (not trial-only) |
| Payout | First manual commission calculated and logged in founder sheet |

Until then: `/partners` stays **waitlist** (gated). Cold partner outreach must not promise live client onboarding.

### Manual tracking columns (founder sheet)

`partner_slug` · `client_org` · `intro_date` · `till_opened` · `first_sale` · `z_report` · `first_payment` · `plan` · `mrr_eur` · `commission_pct` · `commission_due_eur` · `paid_to_partner`

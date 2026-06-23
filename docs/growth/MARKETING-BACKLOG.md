# Marketing backlog — Romania Q2 2026

Last updated: 2026-06-21 (deployed release `20260621_185700`)
Source of truth: `.agents/product-marketing-context.md`

## North star

**Trial → first sale în 48h** (founder SLA). Marketing aduce trafic calificat; activarea rămâne umană până la ~10 trialuri/săptămână.

---

## Status matrix

| Workstream | Status | Owner | Next action |
|------------|--------|-------|-------------|
| Compare hub RO (FAQ, CTA, table chrome) | Deployed | Product | GSC index |
| Compare detail RO (disclaimer, UTMs) | Deployed | Product | Verify PostHog signup by `utm_content` |
| Saga + RezoSoft deep compare | Deployed | Product | Link in cold email batch |
| Expressoft / hePOS / VilicoRest depth | Deployed | Content | Link in outreach where relevant |
| App reports RO i18n | Deployed | Product | Browser smoke on Emerald Bites |
| Competitor profiles 8/12 missing | P2 | Research | saga, rezosoft, expressoft, hepos, vilicorest, smartbill refresh |
| Feature/resource `seo-ro` gaps | P2 | SEO | food-safety-records + 5 EN resources |
| Founder activation SLA | P1 | Founder | WhatsApp ≤24h every RO trial |
| Partner follow-up (4 RO) | In progress | Founder | `docs/growth/partner-followup.md` |

---

## Top 5 marketing ideas (early-stage RO food SaaS)

### 1. Competitor alternative pages as outbound landing (Programmatic SEO #4 + Cold email)

**Why it fits:** Cold email already links `/compare/ebriza`; highest intent for cost-shock wedge.
**How to start:** UTMs on compare CTAs (done); track `utm_content=ebriza` in PostHog; A/B subject lines with compare URL.
**Expected outcome:** Higher signup rate from outreach vs generic homepage.
**Resources:** 0 dev; 2h/week copy refresh.

### 2. Parallel trial playbook (Product-led #87 + Founder email #47)

**Why it fits:** Activation audit shows onboarding live but 0% first-sale — bottleneck is human, not UI.
**How to start:** Template WhatsApp RO în 24h; Cal.com link; checklist „deschide casa → prima vânzare”.
**Expected outcome:** Till opened / first sale within 48h.
**Resources:** Founder time 30 min/trial.

### 3. Accountant coexistence content (Customer language #139)

**Why it fits:** #1 objection „Am SmartBill/Saga” — Saga/RezoSoft pages now frame coexistence.
**How to start:** Send `/compare/saga` + `/resources/objections-pos-romania` in follow-up #2.
**Expected outcome:** Lower objection rate; longer trial engagement.
**Resources:** 0 dev; update outreach CSV snippets.

### 4. GSC indexing sprint (Easy keyword ranking #1)

**Why it fits:** 12 compare pages built but thin indexing on wedge URLs.
**How to start:** Submit fixed `index-priority-urls.txt`; monitor impressions on „alternativă ebriza”.
**Expected outcome:** Impressions on 5+ compare queries in 4–6 weeks.
**Resources:** 30 min one-time GSC.

### 5. Partner co-marketing (Partnership #54)

**Why it fits:** ExpertPos, Q Retail, Anzi Soft, Vlarox — warm RO partners, 20% recurring.
**How to start:** Day-3 follow-up from `partner-followup.md`; partner signup links with UTM.
**Expected outcome:** 1 partner-sourced trial/month.
**Resources:** Founder 1h/week.

---

## Customer research — VOC themes (confidence: medium)

| Theme | Quote pattern | Implication |
|-------|---------------|-------------|
| Till truth | „Casa nu se potrivește cu sertarul” | Homepage + Z-report messaging |
| Cost shock | „Plătesc extra doar pentru raport” | Compare Ebriza/Oblio pricing rows |
| Coexistence | „Contabilul vrea Saga” | Saga/SmartBill pages — not replacement |
| Time poverty | „Nu am timp să configurez” | €199 setup + founder SLA |
| Per-seat fear | „Taxă per ospătar” | Unlimited staff on all compare pages |

**Research gap:** No recorded win/loss interviews yet — schedule 3 calls with trial users who opened till but didn’t sell.

---

## Competitor content depth

| Competitor | Depth | Priority |
|------------|-------|----------|
| Ebriza | Strong | Maintain pricing quarterly |
| Oblio | Strong | Maintain |
| Bit-Soft | Strong | Maintain |
| SmartBill | Good | Add migration section |
| Saga | **Deepened** | Index + outreach |
| RezoSoft | **Deepened** | Index + outreach |
| Expressoft | **Deepened** | Maintain |
| hePOS | **Deepened** | Maintain |
| VilicoRest | **Deepened** | Maintain |

---

## Your decisions needed

1. **Deploy marketing + i18n changes?** (requires your explicit approve per deploy rules)
2. **Next compare page to deepen:** Expressoft vs hePOS/VilicoRest?
3. **Founder SLA:** Confirm WhatsApp number + template for RO trials this week?
4. **Research:** Can you share 2–3 trial call notes for VOC quote bank?

---

## Files changed this session (marketing)

- `lib/marketing/compare-locale.ts` — RO hub FAQ, table labels, signup UTMs
- `lib/marketing/comparisons.ts` — Saga + RezoSoft deep content
- `app/compare/page.tsx`, `app/compare/[slug]/page.tsx` — localized chrome
- `components/marketing/CompareStickyTrialBar.tsx` — UTM signup links
- `components/app/AuditExportButtons.tsx`, `app/app/reports/audit-export/page.tsx` — RO audit export
- `docs/growth/index-priority-urls.txt` — fixed typo + wedge URLs

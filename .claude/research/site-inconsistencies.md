# franchisetech.ro — Marketing Site Inconsistency & Credibility Audit

**Date:** 2026-08-25
**Scope:** `app/` marketing routes, `components/marketing/`, `components/billing/`, `lib/marketing/`, `lib/billing/plans.ts`, `lib/app-i18n.ts` (signup/onboarding surfaces)
**Method:** static source audit, read-only. No files modified.
**Baseline facts used:** Starter €49 / Pro €79 / Multi-location €99-per-location / assisted setup €199 one-time / 15-day trial starting **after** a €1 Stripe card verification. Romanian VAT: 21% / 11% / 5% / 0%.

---

## 0. Executive priority index

### P0 — factually false, legally risky, or broken

| # | Finding | Location |
|---|---|---|
| P0-1 | Signup page says "5 days free, no card required" directly above badges saying "Verificare card 1 € · Trial 15 zile" | `lib/app-i18n.ts:1190-1191`, `2416-2417`; rendered `app/signup/page.tsx:124` + `:183-184` |
| P0-2 | Onboarding step badge says "Trial 5 zile · fără card" | `app/onboarding/page.tsx:135`, `:186` |
| P0-3 | English site states "No credit card required" in 6 places; a card IS required | `lib/marketing/i18n/en.ts:28,322,444,448,452,477,588` |
| P0-4 | Old Romanian VAT rates 19%/9% presented as current on live industry pages | `lib/marketing/industry-page-content.ts:333,345,373`; `lib/marketing/i18n/seo-ro-industries.ts:180`; `lib/marketing/seo.ts:945` |
| P0-5 | In-app VAT setup UI offers "Standard (19%)" / "Reduced (9%)" as the FiscalNet group labels | `components/app/VatRatesCard.tsx:29-30,231` |
| P0-6 | Pricing page meta description contradicts its own page body on multi-location price (€109 vs €89) | `lib/marketing/i18n/ro.ts:447` + `:562`; `en.ts:444` + `:559`; render `components/billing/PricingPlansSection.tsx:405` |
| P0-7 | Kitchen Display billed as a "+€19/lună" add-on in the pricing comparison, but the blog claims it is included in Pro €79 and builds the whole €336/year saving claim on that | `lib/marketing/ebriza-pricing-comparison.ts:66-71`, `lib/billing/plan-features.ts:135,164` vs `lib/marketing/blog.ts:195,199,235` |
| P0-8 | Takeaway industry H1 claims Glovo + Bolt + Tazz are all handled; the home FAQ says only Glovo is automatic; the blog says franchisetech has **no** delivery integration and **no** loyalty module (loyalty is shipped) | `lib/marketing/i18n/seo-ro-industries.ts:128,130` vs `ro.ts:330` vs `blog.ts:203` |
| P0-9 | Hard "99.99% uptime and instant support" claim with no SLA | `lib/marketing/i18n/ro.ts:592`, `en.ts:588` |
| P0-10 | `getMarketingLocale()` hardcoded to `"ro"`, but hreflang/canonical still declare the bare URL as English and emit `?lang=ro` duplicates in the sitemap | `lib/marketing/locale-server.ts:3-5` vs `lib/marketing/site-locale.ts:15-33`, `app/sitemap.ts:26-34` |

### P1 — contradiction a prospect can see

P1-1 … P1-14 — see sections below.

### P2 — polish

P2-1 … P2-11 — see sections below.

---

## 1. Pricing inconsistencies

### The source of truth itself disagrees with the stated catalogue

`lib/billing/plans.ts` is declared "Single source of truth … Never hardcode plan prices elsewhere" (`:1-3`), yet:

| Plan | `plans.ts` | Brief / stated real pricing | Verdict |
|---|---|---|---|
| Starter (rendered as "Core") | `€49` (`:76`) | €49 | OK |
| Pro (rendered as "Operations") | `€79` (`:92`) | €79 | OK |
| **Scale** | `€109` (`:108`) | *not in the stated catalogue at all* | **Undocumented 4th plan sold on the live pricing page** |
| **Multi-location** | `€89` (`:124`) | **€99**/location | **P0 — €10/location wrong** |
| Assisted setup | `€199` (`:143`, `:156`) | €199 | OK |
| Multi-location rollout | `€349` (`:161`) | *not in stated catalogue* | P1 — unverified |
| RO fiscal on-site setup | `€499` (`:166`) | *not in stated catalogue* | P1 — unverified |

**P0-6 — Multi-location has three different prices across the site:**

- `lib/billing/plans.ts:124` → `price: "€89"` (this is what renders)
- `components/billing/PricingPlansSection.tsx:405` → `multiPlan?.price ?? "€89"` — the pricing page card shows **€89/locație suplimentară/lună**
- `lib/marketing/i18n/ro.ts:447` (pricing page `<meta name="description">`):
  > "Prețuri franchisetech: Starter €49/lună, Pro €79/lună, **Multi-locație €109/lună**."
- `lib/marketing/i18n/en.ts:444`:
  > "franchisetech pricing: Starter €49/mo, Pro €79/mo, **Multi-location €109/mo**."
- `lib/marketing/i18n/ro.ts:562` (FAQ on the same page):
  > "Multi-locație adaugă **€89/locație** pe lângă un plan Scale."
- `lib/marketing/i18n/en.ts:559`: "Multi-location adds **€89/site**"
- `lib/marketing/industry-page-content.ts:624,637,679,690,712` → **€89/location** ×5
- Brief / stated reality → **€99/location**

A prospect who reads the Google snippet (€109), lands on the page (€89), and was quoted €99 sees three numbers.

**P0-6b — "Scale €99" vs "Scale €109".** The Ebriza comparison table column header prices Scale at €99:

- `lib/marketing/i18n/ro.ts:533` → `colFranchisetech: "franchisetech Scale €99"`
- `lib/marketing/i18n/en.ts:530` → same
- `lib/billing/plans.ts:108` → Scale is `€109`

The table's own title is *"Cost lunar real vs Ebriza"* / *"Real monthly cost"* (`ro.ts:530`). The "real monthly cost" row then totals franchisetech at `€118` (`lib/marketing/ebriza-pricing-comparison.ts:100`) = €99 + €19 KDS. At the true €109 the total is €128, which is **more than Ebriza Pro's €107+** — inverting the conclusion the table exists to prove.

**P1-1 — "49–99€/lună" repeated as the public price range.** Actual public range is €49–€109.

- `lib/marketing/i18n/ro.ts` Bit-Soft summary: *"franchisetech publică 49–99€/lună pentru locații independente 1–3."*
- `lib/marketing/i18n/en.ts:520`: *"franchisetech publishes €49–€99/month"*
- `lib/marketing/comparisons.ts:847, 932, 946, 988, 1049, 1133, 1166, 1187, 1259` — nine more occurrences of `"49–99€/lună listat pe site"`

**P1-2 — Plan names differ between meta and page.** Meta descriptions say "Starter" / "Pro" (`ro.ts:447`, `en.ts:444`), the homepage trust signal says "**Pro** adaugă stoc și rețete" (`ro.ts:142`), but the pricing page renders "**Core**" / "**Operations**" / "**Scale**" (`components/billing/PricingPlansSection.tsx:34-41`, `lib/billing/plans.ts:75,91,107`). Four brand names for two products.

**P1-3 — Currency-symbol placement is inconsistent on the homepage.** `lib/marketing/i18n/ro.ts:142` uses `"De la 49€/lună"` (symbol after) while every other string uses `€49` (symbol before) — including `ro.ts:447` on the linked pricing page.

**P1-4 — App upsell hardcodes a price.** `app/app/reports/page.tsx:47` → `"Upgrade to Operations — €79/mo."` — English string in the Romanian app, and a hardcoded price bypassing `plans.ts`.

**P2-1 — Blog prices are correct but use a different naming scheme again.** `lib/marketing/blog.ts:235` lists "Franchisetech Core €49 / Operations €79 / **Scale €109**" — the only place on the site with the correct Scale price, and it contradicts the comparison table (€99) on `/pricing`.

**P2-2 — €1 verification price ID is live-hardcoded** (`lib/billing/plans.ts:37`) with an env override — fine, noted only for completeness.

---

## 2. VAT rate errors

Correct current Romanian rates are **21 / 11 / 5 / 0**. `lib/vat-rates.ts:17-22` has them right. These do not:

### P0-4 — Public marketing pages presenting 19%/9% as current

| File:line | Text | Renders on |
|---|---|---|
| `lib/marketing/industry-page-content.ts:333` | "…high-value drinks stock, **TVA 9% vs 19%**, unlimited staff…" | `<meta description>` of `/industries/bar-pub` |
| `lib/marketing/industry-page-content.ts:345` | "**TVA 9% and 19%** on the right products" | `/industries/bar-pub` bullet list |
| `lib/marketing/industry-page-content.ts:373` | "Products carry the right TVA rate — **9% or 19%** as configured." | `/industries/bar-pub` body |
| `lib/marketing/i18n/seo-ro-industries.ts:180` | "POS bar și pub: mese pe plan sală, stoc băuturi, **TVA 9% vs 19%**…" | RO `<meta description>` of `/industries/bar-pub` |
| `lib/marketing/seo.ts:945` | "Afișaj lei, **cote TVA 19/9/5%**, FiscalNet dacă aveți nevoie de bon fiscal…" | `/industries/romania` |

No "până în 2025" framing anywhere — all four are presented as the current configuration. This is the single most damaging credibility item on the site: the product's core promise is fiscal correctness, and the bar/pub landing page tells a Romanian owner the wrong VAT rates.

### P0-5 — In-app VAT settings UI

`components/app/VatRatesCard.tsx:28-34`:
```
const FISCALNET_GROUPS = [
  { value: "1", label: "1 — Standard (19%)" },
  { value: "2", label: "2 — Reduced (9%)" },
  …
```
Plus the input placeholder at `:231` → `placeholder="e.g. TVA 19%"`.

This is the screen where an owner maps VAT groups to FiscalNet. The labels contradict `lib/vat-rates.ts:17-22` (which correctly seeds 21/11/5/0 for RO) and will actively mislead someone configuring fiscal groups. Out of marketing scope but escalated per the P1 rule in `CLAUDE.md`.

### Correct usages (no action)

- `components/marketing/RaportZLandingRedesign.tsx:9,85-86` — "TVA 21% / 11% / 5%" ✓
- `lib/marketing/seo.ts:496,501,511,524` and `lib/vat-rates.ts:26` — 23/13.5/9 are **Irish** rates on `/industries/ireland`, correct.
- `lib/help/articles.ts:265` — 0/9/13.5/23, Irish context, correct.

### P2-3 — Stale identifiers

`app/api/reports/gestiune/pdf/route.ts:122-123` — keys `tva19` / `tva9` now carry labels "TVA 21%" / "TVA 11%". Output is correct; the field names are stale and invite a future regression. Same in `lib/fiscalnet/types.ts:67` (`// e.g. 19 for 19%`) and `lib/fiscalnet/receipt-examples.ts:7,76`.

---

## 3. Brand violations

### "KitchenOps" — CLEAN

Zero customer-facing occurrences. Every hit (`grep -rn KitchenOps app components lib`) is an internal identifier — `getKitchenOpsContext`, `@/lib/kitchenops/metrics`, `@/app/actions/kitchenops` — never inside a rendered string or JSX text node. `scripts/predeploy-guard.sh`'s guard is not being tripped.

### Capitalisation — lowercase `franchisetech` dominates; two outlier forms

| Form | Occurrences (app + components + lib) | Status |
|---|---|---|
| `franchisetech` | ~1019 | **dominant / canonical** |
| `Franchisetech` | 28 | outlier |
| `FranchiseTech` | 25 | outlier |
| `FRANCHISETECH` | 10 | uppercase styling contexts |

The logo alt text is lowercase (`components/marketing/MarketingBrand.tsx:16` → `alt="franchisetech"`), confirming lowercase is canonical.

**P1-5 — `FranchiseTech` in customer-facing copy:**

- `components/marketing/RaportZLandingRedesign.tsx:32,33,149,150,250,275,276` — 7 occurrences on the Meta/Google landing page, including inside a FAQ answer: *"**FranchiseTech** trimite datele vânzării prin FiscalNet"*
- `lib/marketing/i18n/ro.ts:293,300,310` and `lib/marketing/i18n/en.ts:290,297` — inside the homepage testimonials and the "productProof" subtitle
- `components/billing/PricingPlansSection.tsx:96` and `lib/billing/plan-features.ts:136` — *"FiscalNet este inclus în **FranchiseTech**"* — appears in the plan feature accordion on `/pricing`
- `components/billing/BillingPanel.tsx:69,104`, `components/app/IntegrationCards.tsx:52,146`, `lib/billing/catalog.ts:155,156`
- `components/app/AppShell.tsx:169` — logo `alt="FranchiseTech"` (contradicts the marketing logo's lowercase alt)

**P1-6 — `Franchisetech` in the blog (26 occurrences across `lib/marketing/blog.ts`),** including post titles: `:181` → *"Ebriza vs **Franchisetech** — prețul real…"*, and headings `:194,202,266,302`. The same file uses lowercase `franchisetech` 165 times. So the blog is internally inconsistent, let alone against the rest of the site.

**P2-4 — Comparison table column labels:** `lib/marketing/compare-locale.ts:117` uses lowercase; `app/compare/[slug]/page.tsx:140` and `components/marketing/PricingEbrizaComparisonTable.tsx:55` render variables named `tableFranchisetech` / `colFranchisetech` — naming only, output is fine.

**P2-5 — YouTube handle** `components/marketing/social.tsx:2` → `https://www.youtube.com/@Franchisetech` — external, cannot be changed silently; noted for consistency.

---

## 4. Overclaiming / unverifiable social proof

You have "only a handful of real customers." Every item below is a risk.

### P0-9 — Uptime and support SLA

- `lib/marketing/i18n/ro.ts:592` → *"De la {starter}/lună. Trial 15 zile cu verificare card 1 €. **99,99% uptime și suport instant**."*
- `lib/marketing/i18n/en.ts:588` → *"…**99.99% uptime and instant support**."*

Renders in the homepage pricing strip. This is a flat performance guarantee, not a target, with no SLA behind it and no status page. The pricing page hedges it correctly two files away (`ro.ts:452` → "Uptime **țintă** 99,99%", `en.ts:449` → "99.99% uptime **target**") — so the site both hedges and doesn't hedge the same number.

### P1-7 — Testimonials that read as fabricated

`lib/marketing/i18n/ro.ts:288-306` and `lib/marketing/i18n/en.ts:285-303` — the homepage "Ce spun clienții" / "What customers say" block:

1. **"Sherif A." — "CEO, Gourmet Coffee SRL"** — badge `metric: "✓ Client verificat"` / `"✓ Verified Customer"`
   > *"FranchiseTech a transformat modul în care gestionăm afacerea noastră cu cafea. De la producție la punct de vânzare, totul este conectat într-un singur sistem…"*
2. **"Adam L." — "UREP"** — badge `"✓ Client verificat"`
   > *"Aveam nevoie de o platformă care să corespundă cerințelor operaționale fără complexitate inutilă…"*

Problems, in order of severity:
- **"✓ Client verificat" / "✓ Verified Customer" is a trust badge with no verification mechanism** — it asserts third-party validation that does not exist. This is the riskiest single string in the block.
- Neither name is plausibly the Romanian café owner ICP; "Sherif A." heading a Romanian SRL and "Adam L." at an unexplained acronym ("UREP") will read as placeholder to a Romanian prospect.
- The register is generic enterprise-vendor English translated into Romanian ("vizibilitate clară asupra operațiunilor", "cerințelor operaționale fără complexitate inutilă") — nothing a café owner would say, and nothing specific (no city, no venue type, no number).
- Both quotes use the wrong brand capitalisation (see P1-5), which is itself a tell.
- The EN and RO versions are the same two people saying the same thing — fine if real, damning if not.

**Recommendation:** either attach a real venue name + city + a concrete number from a real customer, or delete the block. A homepage with no testimonials is more credible than one with two that look invented.

### P1-8 — Placeholder shipped to production

- `lib/marketing/i18n/ro.ts` `productProof.videoPlaceholder: "Video demo în curând"` / `en.ts` `"Demo video coming soon"` — a "coming soon" box in the homepage social-proof section.
- `productProof.demoCta: "Programează un demo"` / `"Book a demo"` — the demo button only renders when `NEXT_PUBLIC_DEMO_BOOKING_URL` is set (`components/marketing/MarketingCta.tsx:10,62`; `app/pricing/page.tsx:15,91`). If unset in prod, the pricing hero silently drops its secondary CTA.

### P1-9 — Third-party numbers asserted as fact

`lib/marketing/comparisons.ts:1187,1194` — *"Nexus ERP … **6.291+ clienți**"* / *"**6.291+ clienți activi în România** — platformă matură"*. Stated as fact with no source or date on a page whose credibility depends on being the honest comparison. Either cite and date it (the Ebriza table does this correctly at `ro.ts:539`: *"verificate pe ebriza.com/ro/preturi la 24 iunie 2026"*) or soften it.

### P1-10 — Setup-time claims

- `lib/marketing/seo.ts:278,281,288` — *"most cafes finish core steps in **under an hour**"*, *"0–15 min / 15–45 min / 45–60 min"*
- `lib/marketing/i18n/ro.ts:455` — *"sub o oră până la prima vânzare"*
- `app/signup/page.tsx:185` — *"✓ Live în sub o oră"*

"Most cafes" is a volume claim implying a population you don't have. Reframe as a design target ("Pașii de bază durează sub o oră") rather than an observed distribution.

### Clean (no action)

- `lib/marketing/i18n/ro.ts:137` / `en.ts:135` — *"Pentru proprietarii care vor control zilnic…"* — positioning, not a count. Good pattern.
- `components/marketing/RaportZLandingRedesign.tsx:36-37` — *"**Nu promitem asta fără verificare.**"* — exemplary honesty; use this voice elsewhere.
- No star ratings, awards, "trusted by N businesses", or "sute de cafenele" anywhere. That is genuinely good.

---

## 5. Language inconsistencies

### P1-11 — The nav question, answered

**`lib/marketing/tokens.ts:10-16` (English nav: Features / Industries / Suppliers / Pricing / Resources) is DEAD CODE.** Nothing imports it — `grep -rn "navLinks"` returns only its own definition plus a *locally shadowed* `const navLinks` inside `components/marketing/MarketingHeader.tsx:26`.

What actually renders (`MarketingHeader.tsx:26-31`) is **hardcoded Romanian, not localised at all**:
```
{ href: "/#control",              label: "Control seara" },
{ href: "/#workflow",             label: "Ziua de lucru" },
{ href: "/pricing",               label: "Prețuri" },
{ href: "/resources/suppliers",   label: "Furnizori" },
```

Three consequences:

1. **Romanian visitors get a Romanian nav** — so the tokens.ts English nav is *not* the live problem it looked like. But it is a live trap: the next person who edits `tokens.ts` will change nothing and not know why.
2. **English visitors get a Romanian nav.** The industry dropdown beside it *is* localised (`MarketingHeader.tsx:23-24, 105-119` via `PRIMARY_INDUSTRY_NAV.labelEn`), so an `?lang=en` visitor sees `Control seara | Ziua de lucru | [Business type ▾ → Cafés, Restaurants…] | Prețuri | Furnizori`. Half-translated header.
3. **The i18n nav keys are orphaned.** `ro.ts:4-12` / `en.ts:2-9` define `nav.features`, `nav.industries`, `nav.pricing`, `nav.resources`, `nav.blog`, `nav.partners` — only `nav.businessTypes` is consumed (`MarketingHeader.tsx:100`). `nav.blog` is defined in both languages and rendered nowhere.

### P1-12 — All 11 `/resources/*` pages render English body copy to Romanian visitors

`app/resources/[slug]/page.tsx` **never calls `localizeSeoPage`** (compare `app/features/[slug]/page.tsx:36,50` and `app/industries/[slug]/page.tsx:17,25`, which both do). It reads `page.title`, `page.intro`, `page.sections` straight from the English `resourcePages` array in `lib/marketing/seo.ts:739+`, then wraps them in Romanian chrome:

- `app/resources/[slug]/page.tsx:38` — hardcoded English breadcrumb `<Link href="/resources">Resources</Link>`
- `app/resources/[slug]/page.tsx:40` — Romanian CTA buttons `{t.cta.getStarted}` / `{t.cta.seeFeatures}`
- `app/resources/[slug]/page.tsx:14-23` — `generateMetadata` never resolves locale → English `<title>`/`<meta>` always, and no `alternates.languages` (no hreflang)

`lib/marketing/i18n/seo-ro.ts` has **no override for any resource slug** (it covers 12 feature slugs + `romania`, `health-bars`, and the 7 industries via `seo-ro-industries.ts`). So these render English H1 + English body + Romanian buttons:

`/resources/cash-up-at-end-of-day`, `/choose-pos-romania`, `/food-business-stock-control`, `/objections-pos-romania`, `/pos-software-romania`, `/pos-system-for-small-cafes`, `/recipe-costing-for-cafes`, `/smartbill-si-franchisetech`, `/stock-management-romania`, `/switch-from-ebriza`, `/z-report-explained`

Note the irony: `/resources/pos-software-romania`, `/resources/stock-management-romania`, `/resources/objections-pos-romania` and `/resources/smartbill-si-franchisetech` have Romania-targeted (one literally Romanian-language) slugs and render in English.

Also missing RO overrides: `/industries/retail-shops` and `/industries/salons` (`eu` and `ireland` are legitimately English-market pages).

### P1-13 — Romanian formality (`tu` vs `dumneavoastră`) is mixed *within single components*

The site has no formality policy. Dominant pattern is **`tu`** (informal) in CTAs and headings; **`dumneavoastră`** (formal) leaks into body copy. Worst cases are adjacent lines:

| File:line | Informal (`tu`) | Formal (`dvs.`) |
|---|---|---|
| `lib/marketing/i18n/ro.ts:28` vs `:29` | `getStartedTitle: "Gata să **începi**?"` | `subtagline: "**Vindeți**, urmăriți stocul, **închideți** casa și **vedeți** cifre reale"` — **one line apart, same footer block** |
| `ro.ts:29` vs `:83` | `"Gata să **începi**?"` (footer) | `readyTitle: "Gata să **încercați**?"` (every SEO page) — **the same question, both forms, site-wide** |
| `ro.ts:138` vs `:143` | `trialNote: "…**Anulezi** oricând"` | `trustSignals[3]: "**Creșteți** echipa fără taxe per loc."` — **same homepage hero block** |
| `ro.ts:167` vs `:168` | `label: "**Controlezi** costurile"` | `body: "**Vedeți** costul per porție … înainte să **schimbați** meniul"` — **same card** |
| `ro.ts:263` | `title: "**Deschide** casa"` | `text: "**Porniți** o sesiune și **vindeți** de pe orice dispozitiv."` — **same list item** |
| `ro.ts:598` vs `:599` | `signupTitle: "**Începe** contul gratuit"` | `signupDescription: "…**Deschideți** casa azi."` — **the signup page header** |
| `lib/app-i18n.ts:2415` vs `:2416` | `title: "…**începe** trialul"` | `descDefault: "**Deschideți** casa azi…"` — **the signup card** |
| `ro.ts:560,562,564` (pricing FAQ) | — | `"**Puteți** configura…"`, `"…dacă **continuați**"`, `"…**exceptând**"` — all formal |
| `ro.ts:441` | — | `"**Scrieți** la info@franchisetech.ro sau **încercați** din nou."` |
| `components/marketing/RaportZLandingRedesign.tsx:12-14,28,37,47-56` | — | Consistently formal: `"**Închideți** casa…"`, `"De ce **cereți**…"`, `"**Testați** închiderea…"`, `"**Vedeți** fluxul…"`, `"localul **dumneavoastră**"` |

**Dominant pattern:** `tu`. **The single most formal surface** is the Meta/Google landing page `RaportZLandingRedesign.tsx` — which is also the highest-intent paid traffic. A prospect clicking an ad (formal) then browsing to the homepage (informal) then to `/pricing` (formal FAQ, informal CTA) is reading three different companies.

### P2-6 — Other language leaks

- `lib/app-i18n.ts:1183-1185` — Supabase error copy leaks implementation detail to end users in both locales: *"…configure Google OAuth in Supabase"* / *"…configurează OAuth Google în Supabase."* (`ro.ts` equivalent at `:2410`).
- `components/app/PublicNavAuth.tsx:23` — `"Start free trial"` (English, and "free" — see §8).
- `app/app/reports/page.tsx:47` — `"Upgrade to Operations — €79/mo."` (English in the RO app).
- `components/billing/BillingPanel.tsx:44,54` and `lib/billing/subscription.ts:76` — `"Trial gratuit"` / `"Free trial"` (see §8).
- Plan display names `Core` / `Operations` / `Scale` / `Multi-location` are untranslated on the Romanian pricing page (`components/billing/PricingPlansSection.tsx:34-41`) — arguably deliberate as product names, but they conflict with the Romanian "Starter/Pro" naming in the meta description.
- `lib/marketing/industry-page-content.ts` is entirely English (it is the fallback layer; RO comes from `seo-ro-industries.ts`) — correct architecture, but it means any *new* industry page ships English until an override is added.

---

## 6. Broken / dead internal links and 404 risk

### Link integrity: PASSING

Every internal `href` extracted from marketing pages, components, and content data files resolves to a real route. Cross-checked against:

- Static routes under `app/`
- `featurePages` (12 slugs, `lib/marketing/seo.ts:63-463`)
- `industryPages` (13 slugs = 7 from `primaryIndustryPages` in `industry-page-content.ts:18` + `eu`, `health-bars`, `ireland`, `retail-shops`, `romania`, `salons`)
- `resourcePages` (11 slugs)
- `comparisonPages` (17 slugs, `lib/marketing/comparisons.ts:32`)
- `HELP_ARTICLES` (20 slugs)
- `skagLandingPages` (7 slugs, `lib/marketing/skag-landing-pages.ts:18-82`)
- Homepage anchors `#control` / `#workflow` → confirmed present at `components/marketing/HomePageContent.tsx:130,172`
- All `showcaseAssets` images → confirmed present in `public/showcase/`

**No dead links found.** `/lp/raport-z-casa-de-marcat` exists and renders (`skag-landing-pages.ts:56`, special-cased at `app/lp/[slug]/page.tsx:73`).

**Note — fixed mid-audit:** `skag-landing-pages.ts` was edited on disk during this audit. The previously-404ing `/lp/raport-x-casa-de-marcat` was added at `:65-72`, along with a new `/lp/soft-restaurant` at `:74-81`. Both now resolve. Two follow-ups on the new entries:

- `/lp/soft-restaurant` subhead (`:77`) promises *"POS, **mese**, stocuri și rapoarte zilnice"*. Table management exists in-product (`app/app/tables/`), but `lib/marketing/blog.ts:203` publicly states *"Franchisetech nu are încă **gestiunea meselor pentru ospătari**"*. Pick one — see P0-8.
- Neither new page has a matching entry in Google Ads unless the campaign `final_url` was updated too; the file's own header comment (`:6-7`) requires the SKAG's `final_url` to point at `/lp/<slug>` before unpausing. Verify in the ads account, not in source.

### P0-10 — Sitemap declares a language that no page serves

`lib/marketing/locale-server.ts` has been reduced to:
```
export async function getMarketingLocale(): Promise<MarketingLocale> {
  return "ro";
}
```
Every server-rendered marketing page is therefore Romanian, unconditionally — `?lang=en` and the locale cookie are ignored server-side.

But the SEO layer was not updated to match:

- `app/sitemap.ts:26-34` emits **two URLs per path** — `https://franchisetech.ro/pricing` (declared `en`) and `https://franchisetech.ro/pricing?lang=ro` (declared `ro`). Both serve identical Romanian HTML. That is ~2× sitemap bloat, entirely duplicate content.
- `lib/marketing/site-locale.ts:26-32` emits `hreflang` pointing the bare URL at `en`. Google is told the canonical URL is English; it serves Romanian.
- `lib/marketing/site-locale.ts:5` — `MARKETING_LANG = "en"`.
- `lib/marketing/seo.ts:1141` — `pageMetadata(page, locale: MarketingLocale = "en")` still defaults to English.
- Client fallback disagrees with the server: `lib/marketing/locale-client.ts:13,22` returns `"en"` when no cookie/localStorage exists, so any client component rendered outside `MarketingLocaleProvider` (`lib/marketing/marketing-locale-context.tsx:56`) falls back to English strings on a Romanian page.

### P1-14 — Orphan pages (exist, reachable, invisible)

| Route | In sitemap? | Linked from nav/footer? | Notes |
|---|---|---|---|
| `/blog` + **110 posts** | **NO** | **NO** | `publicPaths` (`lib/marketing/seo.ts:1117-1132`) omits blog entirely, and `allSitemapPaths()` (`lib/marketing/sitemap-paths.ts:48-58`) does not add it. Only inbound link is the back-link from an individual post (`app/blog/[slug]/page.tsx:65`). The 100-post Romanian SEO push (commit `d7f6ba3`) is currently invisible to Google and to visitors. |
| `/partners` | **NO** | **NO** | Fully orphaned. `t.footer.partners` exists but is wired to `/resources/suppliers` (`MarketingFooter.tsx:20`). |
| `/compare` (hub) + 17 comparison pages | yes | **NO** | `t.footer.compare: "Compară POS"` is defined in `ro.ts:39` / `en.ts:37` but appears in **none** of `productLinks` / `supportLinks` / `legalLinks` (`MarketingFooter.tsx:17-37`). |
| `/legal-disclaimer` | yes (`seo.ts:1131`) | **NO** | In the sitemap, linked nowhere. |
| `/features` (hub) | yes | footer only | Removed from the header when the nav was hardcoded. |
| `/industries` (hub) | yes | **NO** | Footer links the 7 verticals directly, never the hub. |
| `/resources` (hub) | yes | footer only | |

### P2-7 — Sitemap lists a URL that 301-redirects

`next.config.ts:22` → `{ source: "/compare/hepos", destination: "/compare/ebriza", permanent: true }`, but `hepos` is still in `comparisonPages` (`lib/marketing/comparisons.ts`), so `/compare/hepos` is emitted in the sitemap and linked from `related` blocks. Sitemaps should not contain redirecting URLs.

### P2-8 — Inconsistent canonical strategy

`app/pricing/page.tsx:23` sets `canonical: "/pricing"`; `lib/marketing/seo.ts:1148` (used by feature/industry pages) sets `canonical: "/pricing?lang=ro"` via `localeAlternates`; `app/resources/[slug]/page.tsx:20` sets `canonical: page.path` with no hreflang at all. Three canonical conventions across four page types.

### P2-9 — Stray asset

`public/showcase/Screenshot 2026-06-29 at 17.16.22.png` — unreferenced file with a space in the name, shipped in the public directory.

---

## 7. CTA inconsistency

Your suspicion is correct: **12 distinct primary CTA labels** are in play, and they disagree on the offer, the verb, and the formality.

### Inventory, grouped by surface

| Surface | Label (RO) | Form | Source |
|---|---|---|---|
| Header button | **"Începe"** | tu | `ro.ts:15` `header.getStarted` |
| Header (alt key) | "Începe trialul" | tu | `ro.ts:16` |
| Announcement bar | **"Începe acum"** | tu | `ro.ts:24` |
| Footer CTA card | **"Începe"** | tu | `ro.ts:31` |
| **Homepage hero / all `CtaRow` / mobile sticky** | **"Deschide casa gratuit 15 zile"** | tu | `ro.ts:65` `cta.getStarted` — the dominant one |
| Secondary everywhere | "Vezi prețuri" | — | `ro.ts:69` |
| Assisted-trial variant | "Începe trialul asistat" | tu | `ro.ts:67` |
| Compare pages | "Trial paralel 15 zile — aceeași echipă, aceeași închidere de zi" | — | `ro.ts:68` |
| SEO feature/industry pages | **"Începe"** / "Începe trial 15 zile" / "Începe trial" | tu | `ro.ts:78,79,85` |
| Pricing page hero | **"Deschide casa gratuit 15 zile"** (`t.cta.getStarted`) | tu | `app/pricing/page.tsx:89` |
| Pricing plan cards + multi-location card | **"Începe"** | tu | `ro.ts:465` `pricing.getStarted`, `PricingPlansSection.tsx:342,375,401` |
| Homepage productProof | **"Încearcă gratuit"** | tu | `ro.ts:312` |
| Blog post footer | **"Deschide casa gratuit 15 zile"** | tu | `app/blog/[slug]/page.tsx:142` |
| SKAG landing pages (`/lp/*`) | **"Începe proba de 15 zile"** | tu | `app/lp/[slug]/page.tsx:119,174` |
| **Raport-Z landing (`/lp/raport-z-casa-de-marcat`)** | **"Testați închiderea de zi gratuit"** | **dvs.** | `RaportZLandingRedesign.tsx:52` |
| Raport-Z secondary | **"Vedeți fluxul unei zile"** | **dvs.** | `RaportZLandingRedesign.tsx:56` |
| Industry landing CTAs | "Deschide casa gratuit — 15 zile" / "Încearcă POS restaurant — 15 zile gratuit" / "Pornește POS takeaway — 15 zile gratuit" / "Deschide POS bar — 15 zile gratuit" / "Începe POS patiserie — 15 zile gratuit" / "Încearcă POS food truck — 15 zile gratuit" | tu | `seo-ro-industries.ts:62,119,172,225,278,331` — **six different verbs across six sibling pages** |
| Public app nav | **"Start free trial"** | English | `components/app/PublicNavAuth.tsx:23` |
| Signup submit | "Creează cont" | — | `ro.ts:605` |

### Analysis

- **Verb sprawl:** `Începe` / `Deschide` / `Încearcă` / `Pornește` / `Testați` / `Vedeți` — six imperatives for one action.
- **Offer sprawl:** the same click is variously "gratuit 15 zile", "proba de 15 zile", "trialul asistat", "trial paralel 15 zile", and (in English) "free trial".
- **Formality split:** `tu` dominates (~18 of 20 labels). The **only** `dumneavoastră` CTAs are the two on `RaportZLandingRedesign.tsx:52,56` — which is your highest-intent paid landing page. It is also the only page whose *body* copy is consistently formal, so it is internally coherent but externally out of step with the whole site.
- **The six industry landing pages** (`seo-ro-industries.ts:62,119,172,225,278,331`) are the clearest single fix: six sibling pages built from one template, each with a different CTA verb.
- **Structural cause:** `t.cta.getStarted` ("Deschide casa gratuit 15 zile"), `t.header.getStarted` ("Începe"), `t.pricing.getStarted` ("Începe"), `t.seoPage.getStarted` ("Începe"), and `t.footer.getStartedCta` ("Începe") are five separate i18n keys for the same button. Four are identical, which suggests the split was never intentional.

**Recommendation:** collapse to one primary label and one secondary, defined once. Given the €1 card reality, the honest primary is something like **"Începe proba de 15 zile"** (already used on `/lp/*`) — it avoids the word "gratuit", which §8 shows to be the site's central credibility problem.

---

## 8. Trial / card-verification messaging

This is the highest-value section. The €1 card verification is explained **eleven different ways**, denied outright in seven places, and the trial length is wrong in four.

### P0-1 — The signup page contradicts itself in one viewport

`app/signup/page.tsx:124` renders `a.descDefault`, which is `lib/app-i18n.ts:2416`:
> **"Deschideți casa azi. Prima vânzare ghidată. 5 zile gratuit, fără card."**

…and `app/signup/page.tsx:183-184`, roughly 200px below it, renders:
> **"✓ Verificare card 1 €"  "✓ Trial 15 zile"**

Same card, same screen. The description says *5 days, no card*; the badges say *15 days, €1 card*. Both wrong-and-right at once, on the single page where the prospect decides whether to hand over a card. English equivalent at `lib/app-i18n.ts:1190`: *"Open your till today. Guided first sale. **5 days free, no card required.**"*

Plan-selected variant is equally wrong: `lib/app-i18n.ts:1191` → `"5-day free trial · ${plan} after"`; `:2417` → `"Trial gratuit 5 zile · ${plan} după"`.

### P0-2 — Onboarding repeats it

`app/onboarding/page.tsx:135` → `trialBadge: "Trial 5 zile · fără card"`
`app/onboarding/page.tsx:186` → `trialBadge: "5-day trial · no card needed"`

Shown *during* onboarding, after the user has already been asked for a card.

### P0-3 — English marketing site denies the card requirement, six times

| File:line | Text |
|---|---|
| `lib/marketing/i18n/en.ts:28` | footer: *"15-day assisted trial. **No credit card to open the till.**"* |
| `lib/marketing/i18n/en.ts:322` | homepage FAQ: *"…**No credit card to start.**"* |
| `lib/marketing/i18n/en.ts:444` | `/pricing` meta description: *"15-day free trial, **no credit card required**."* |
| `lib/marketing/i18n/en.ts:448` | `/pricing` hero stat: *"**No credit card required**"* |
| `lib/marketing/i18n/en.ts:452` | `/pricing` setup strip: *"**Start free.** In-app setup included…"* |
| `lib/marketing/i18n/en.ts:477` | pricing fairness list: *"15-day trial, **no credit card to start**"* |
| `lib/marketing/i18n/en.ts:588` | homepage pricing strip: *"15 days free, **no credit card required**."* |

Each has a Romanian counterpart in the **same slot** that says the opposite:

| Slot | EN | RO |
|---|---|---|
| `footer.getStartedText` | `en.ts:28` "No credit card to open the till." | `ro.ts:30` "Verificare card 1 € la început" |
| `pricing.heroStatFrom` | `en.ts:448` "No credit card required" | `ro.ts:451` "Verificare card 1 €" |
| `pricing.freeSetupStrip` | `en.ts:452` "Start free." | `ro.ts:455` "Trial 15 zile cu verificare card 1 €" |
| `pricing.description` | `en.ts:444` "no credit card required" | `ro.ts:447` "Trial 15 zile cu verificare card 1 €" |
| `pricing.homeTeaser.text` | `en.ts:588` "no credit card required" | `ro.ts:592` "cu verificare card 1 €" |

Because `getMarketingLocale()` now returns `"ro"` unconditionally, most of these English strings do not currently render — but they are one config change (or one client-side fallback, `locale-client.ts:22`) away from being live, and they are what an English-reading investor, partner, or journalist sees in the repo.

### The eleven variants of the explanation (RO)

| # | Text | Location |
|---|---|---|
| 1 | *"Verificare card 1 € la început, fără abonament în perioada de probă."* | `ro.ts:30` (footer) |
| 2 | *"Verificare card 1€ · Setup ghidat în aplicație · Anulezi oricând"* | `ro.ts:138` (home hero) — note `1€` not `1 €` |
| 3 | *"Trialul începe după verificarea cardului de 1 €; abonamentul nu se încasează în perioada de probă."* | `ro.ts` home FAQ (~`:318`) |
| 4 | *"Verificare card 1 €"* | `ro.ts:451` (pricing hero stat) |
| 5 | *"Trial 15 zile cu verificare card 1 €. Configurare în aplicație inclusă…"* | `ro.ts:455` (pricing strip) |
| 6 | *"Trial 15 zile, verificare card 1 €"* | `ro.ts` pricing fairness list |
| 7 | *"Trial 15 zile cu verificare card 1 €. 99,99% uptime și suport instant."* | `ro.ts:592` (home pricing strip) |
| 8 | *"Verificare card 1 €. Deschideți casa azi. Prima vânzare ghidată."* | `ro.ts:599` (auth) — **not used by the signup page, which uses `app-i18n.ts` instead** |
| 9 | *"✓ Verificare card 1 €"* | `app/signup/page.tsx:183` |
| 10 | *"Verificare card 1 € · anulezi oricând · suport în limba română"* | `app/lp/[slug]/page.tsx:129` |
| 11 | *"15 zile cu configurare asistată · verificare card 1 € la început · fără plată în perioada de probă · anulare oricând"* | `RaportZLandingRedesign.tsx:67` |
| 12 | *"De ce cereți verificare de card de 1 €?" → "Este o verificare ca să nu deschidem conturi false. Nu este plata abonamentului. În perioada de probă nu se încasează abonamentul."* | `RaportZLandingRedesign.tsx:28-29` |
| 13 | *"…15 zile trial, configurare gratuită în aplicație, cu o verificare de card de 1 € la început."* | `lib/marketing/blog.ts:207,239` |
| 14 | *"15 zile (verificare card 1 €)"* | `lib/marketing/comparisons.ts:1012,1074,1093` |

**Variant #12 (`RaportZLandingRedesign.tsx:28-29`) is the only one that answers the objection** — it names the reason (fraud prevention), distinguishes it from the subscription charge, and confirms nothing else is charged. Every other variant states the fact without addressing the fear. This is your best asset and it lives on one noindex paid landing page.

### P0/P1 — Pages with a signup CTA and NO card explanation

| Surface | CTA | Card mentioned? |
|---|---|---|
| **Announcement bar** (every page) | "Începe acum" → `/signup?plan=starter` | **NO** — `ro.ts:23-24`: *"15 zile să vezi dacă seara se închide corect — configurare asistată inclusă."* |
| **Header button** (every page) | "Începe" → `/signup` | **NO** |
| **Mobile sticky CTA** (every page, mobile) | "Deschide casa **gratuit** 15 zile" → `/signup` | **NO** — `MobileStickyCta.tsx`; this is the CTA most of your traffic actually taps |
| **`FinalCta` / `CTASection`** (bottom of most SEO pages) | "Deschide casa **gratuit** 15 zile" | **NO** — `MarketingCta.tsx:92` shows `t.cta.setupHelp` (`ro.ts:73`), which mentions setup but not the card |
| **All 12 `/features/*` pages** | "Începe" / "Începe trial 15 zile" | **NO** — `ro.ts:83-85` `seoPage.readyText`: *"Trial asistat 15 zile cu ajutor la produse, casă și prima vânzare."* |
| **All 13 `/industries/*` pages** | 6 different labels | **NO** — `seo-ro-industries.ts:62,119,172,225,278,331` |
| **All 11 `/resources/*` pages** | "Deschide casa gratuit 15 zile" | **NO** |
| **All 110 `/blog/*` posts** | "Deschide casa gratuit 15 zile" | **NO** — `app/blog/[slug]/page.tsx:142` |
| **4 of 5 `/lp/*` SKAG pages** | "Începe proba de 15 zile" | **YES** — `app/lp/[slug]/page.tsx:129` ✓ |
| **`/lp/raport-z-casa-de-marcat`** | "Testați închiderea de zi gratuit" | **YES + full FAQ** ✓ |
| **`/pricing`** | "Deschide casa gratuit 15 zile" | **YES** — `ro.ts:451,455` ✓ |
| **Homepage** | "Deschide casa gratuit 15 zile" | **YES** — `ro.ts:138` hero trialNote ✓ |
| **`/signup`** | "Creează cont" | **YES (badges) + NO (description)** — see P0-1 |

So: the card is explained on the homepage, `/pricing`, `/signup`, and the 5 paid landing pages. It is **not** explained on ~146 other indexable pages (12 features + 13 industries + 11 resources + 110 blog posts) that all carry a signup CTA — nor in the announcement bar, header, or mobile sticky CTA that appear on every one of them.

### P1 — The word "gratuit" fights the €1 charge

The dominant primary CTA is `ro.ts:65` → **"Deschide casa gratuit 15 zile"**. It is the label on the mobile sticky bar, every `CtaRow`, every `FinalCta`, the pricing hero, and all 110 blog posts. "Gratuit" is also in:

- `ro.ts:312` — "Încearcă **gratuit**"
- `ro.ts:598` — "Începe contul **gratuit**"
- `app/blog/[slug]/page.tsx:142` — "Deschide casa **gratuit** 15 zile"
- `seo-ro-industries.ts:62,119,172,225,278,331` — "**gratuit**" ×6
- `components/billing/BillingPanel.tsx:44,54`, `lib/billing/subscription.ts:76`, `lib/email/billing.ts:36-37` — "Trial gratuit" / "Free trial"
- `components/app/PublicNavAuth.tsx:23` — "Start **free** trial"
- `RaportZLandingRedesign.tsx:52` — "Testați închiderea de zi **gratuit**"

A €1 charge is small, but a prospect who clicks a button reading "gratuit" and then hits a Stripe card form has been surprised — which is exactly the conversion failure mode you're worried about. The fix is not to hide the €1; it is to stop promising "free" and instead lead with variant #12's framing.

### Trial length: 5 vs 15

`5 days` appears in `lib/app-i18n.ts:1190,1191,2416,2417` and `app/onboarding/page.tsx:135,186`. Everywhere else (and in `lib/billing/plans.ts:36`, `lib/billing/verification.ts`, `app/onboarding/verify-card/page.tsx:26`) it is **15 days**. The 5-day strings sit on signup and onboarding — the two pages where the number matters most.

---

## Appendix — Files with the highest defect density

| File | P0 | P1 | P2 |
|---|---|---|---|
| `lib/marketing/i18n/en.ts` | 8 | 4 | 2 |
| `lib/marketing/i18n/ro.ts` | 2 | 8 | 3 |
| `lib/app-i18n.ts` | 4 | 1 | 2 |
| `lib/marketing/industry-page-content.ts` | 3 | 5 | — |
| `lib/billing/plans.ts` | 2 | 3 | — |
| `app/onboarding/page.tsx` | 2 | — | — |
| `components/app/VatRatesCard.tsx` | 2 | — | — |
| `lib/marketing/blog.ts` | 2 | 26 (brand) | — |
| `lib/marketing/comparisons.ts` | — | 11 | 2 |
| `lib/marketing/locale-server.ts` | 1 | — | — |
| `components/marketing/MarketingHeader.tsx` | — | 3 | — |
| `app/resources/[slug]/page.tsx` | — | 3 | 1 |

## Appendix — Suggested fix order

1. **Delete every "no card required" / "5 days" string** (`lib/app-i18n.ts:1190-1191,2416-2417`, `app/onboarding/page.tsx:135,186`, `en.ts:28,322,444,448,452,477,588`). One-line changes, removes the worst credibility failure.
2. **Fix the VAT rates** (`industry-page-content.ts:333,345,373`, `seo-ro-industries.ts:180`, `seo.ts:945`, `VatRatesCard.tsx:29-30,231`).
3. **Pick one multi-location price** and make `plans.ts` the only place it lives; fix `ro.ts:447` / `en.ts:444` / `:530,533` / `:559,562`.
4. **Resolve the KDS included-vs-add-on contradiction** before anyone quotes the €336/year saving.
5. **Add `/blog` + posts to `publicPaths`** and link the blog from the footer.
6. **Collapse the CTA set** to one primary + one secondary, and put a card-verification microcopy line under every one of them.
7. **Delete or substantiate the two testimonials** and the "99.99% uptime and instant support" claim.
8. Pick `tu` or `dumneavoastră` and sweep `ro.ts` + `seo-ro*.ts` + `RaportZLandingRedesign.tsx`.
9. Wire `localizeSeoPage` into `app/resources/[slug]/page.tsx` and add RO overrides for the 11 resource slugs.
10. Reconcile hreflang/sitemap with the hardcoded `"ro"` locale.

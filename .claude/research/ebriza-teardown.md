# Ebriza competitive teardown

**Researched:** 2026-08-25
**Primary source:** https://www.ebriza.com/ro/preturi (fetched raw HTML, full comparison matrix parsed cell-by-cell)
**Method:** every number below comes from a URL cited inline. Anything I could not verify is labelled **UNVERIFIED**.

> **Read section 0 first.** Four claims currently live on franchisetech.ro/compare/ebriza are false or unsupportable and carry legal risk under Legea 158/2008 (publicitate comparativă).

---

## 0. URGENT — false / outdated claims in our repo and on our live site

Comparative advertising in Romania is regulated by **Legea 158/2008**: a comparison must be objective, verifiable, non-misleading, and must not discredit the competitor. Claiming a competitor charges a fee they publicly and explicitly say they do not charge is the textbook failure mode. These are live now.

### 🔴 P0 — FALSE, live on the site, fix today

**1. "Ebriza charges implementation/training fees."**

- Our claim — `lib/marketing/comparisons.ts:704` row:
  `["Cost configurare self-serve", "0€ — ghid în aplicație", "Taxe implementare / training — contact comercial"]`
  This renders live on https://franchisetech.ro/compare/ebriza (verified by fetching the page).
- Reality — Ebriza's own FAQ, https://www.ebriza.com/ro/preturi:
  > "Ebriza nu percepe niciun fel de cost inițial pentru implementare. Pentru configurarea contului beneficiați de asistență gratuită de la un consultant, în cadrul unor întâlniri video."
- **This is not a grey area.** Ebriza charges €0 setup and gives free consultant-led video onboarding. *We* charge €199 for assisted setup. We are asserting the opposite of the truth, in the one row where they beat us.
- **Action:** delete the row or replace with the true fact — "Ebriza: 0€, onboarding video gratuit cu consultant / franchisetech: 0€ self-serve, €199 opțional cu asistență."

**2. "Ebriza includes POS hardware in the plan."**

- Our claim — `lib/marketing/comparisons.ts:643`, listed as an Ebriza *strength*:
  `"Hardware POS inclus pe plan (1–2 dispozitive/locație)"`
- Reality — https://www.ebriza.com/ro/produse/hardware FAQ:
  > "Ebriza nu comercializează hardware. Atât tableta, casa de marcat și imprimantele nefiscale le vei achiziționa după preferințe."
  And the cafenea-page FAQ clarifies what the "1–2 devices" actually are:
  > "Pachetul Pro are o **licență** inclusă în pachet (Premium și Titanium, două licențe) dar poți oricând să adaugi **licențe suplimentare**" — https://www.ebriza.com/ro/domenii/cafenea
- The "1–2 dispozitive" are **software seat licences at €29/device/month**, not hardware. We credited them with a benefit they don't offer *and* buried the per-terminal fee that is our best attack. Double loss.

**3. "Time to first sale with Ebriza: days to weeks (typical implementation)."**

- Our claim — `comparisons.ts:703`: `["Timp până la prima vânzare", "Sub o oră (cale ghidată)", "Zile–săptămâni (implementare tipică)"]`
- No public Ebriza source supports this. Their model is self-serve install + 15-day trial from the moment the plan is installed, with free video onboarding. A third-party description of Ebriza calls it a "do it yourself" system taking "between a few hours and a maximum of 3 days" (https://start-up.ro/ebriza-primul-serviciu-de-pos-gratuit-din-romania/) — not weeks.
- **Action:** remove, or restate as verifiable ("franchisetech: ghid în aplicație, prima vânzare în sub o oră").

**4. "franchisetech trial doesn't require a card." — false about *ourselves*.**

- Our claim — `comparisons.ts` Ebriza section, "Cum să testați în 15 zile": `"franchisetech trial nu cere card pentru deschiderea casei."`
- Reality — `lib/billing/plans.ts:37` `STRIPE_CARD_VERIFICATION_PRICE_ID` / `CARD_VERIFICATION_AMOUNT_CENTS = 100`; our own live /pricing page says *"Verificare card 1 € la început."*
- Two adjacent bullets on the same page contradict each other (`franchisetechStrengths` correctly says "verificare card 1 €"). A prospect who spots this stops trusting the whole table.
- Note this also kills a differentiator: **Ebriza also requires a card** — *"Cardul se înregistrează la momentul instalării planului ales"* (https://www.ebriza.com/ro/preturi). Card-required is a tie, not an edge.

### 🟠 P1 — misleading framing, defensible but weak

**5. "49€ + 19€ Insights ≈ 68€+" as the cost of "casă + rapoarte clare".**

- `comparisons.ts:712`. Insights at €19/mo is real and correctly priced. But Ebriza Pro at €49 already ships **"Raportare în timp real"** and **"Registru de casă"** as ticked features (verified in the raw comparison matrix). Insights buys *custom/personalised* reports, not the ability to see yesterday's sales.
- As written we imply you must pay €68 to see basic daily sales. That is attackable and, if a prospect checks, it costs us the sale.
- **Action:** narrow the wording to "rapoarte personalizate" everywhere. The claim survives; the exaggeration does not.

**6. `roAccountingReports: ebrizaPro "excluded", ebrizaPremium "excluded"`** (`ebriza-pricing-comparison.ts`)
Row label is "Bon de consum / Balanță / Raport gestiune". **Bon de consum is wrong** — Ebriza's Gestiune page explicitly lists *"Bon de consum pentru fiecare materie primă/produs finit"* and *"Valoare stoc raportată la costul mediu ponderat"* (CMP) — https://www.ebriza.com/ro/produse/gestiune. They have both, on Premium+. Split the row: keep Balanță/Raport gestiune (unverified for them), drop Bon de consum.

**7. `sagaExport: franchisetech "included"` vs `ebriza +€39`.** Price is correct (verified: €39/mo on all three tiers). But ours is an **XML export file**; theirs is a **live two-way integration**. Not like-for-like. Add a footnote or a competitor beats us on "you compared a file dump to an integration."

**8. `browserBased: ebriza "excluded"` — CORRECT, but needs scoping.**
Ebriza's *POS register* is genuinely an iOS/Android app only (tooltip: *"Numărul de dispozitive iOS/android pe care instalați aplicația Ebriza POS"*; hardware page: *"Ebriza POS e o aplicație în AppStore/Google Play"*). But their **Control Center back-office is browser-based** (help centre categories "Control Center - Vânzări / Rapoarte / Gestiune" — https://help.ebriza.com/ro/). Say "POS în browser, fără app de instalat" not "browser-based" flat.

### 🟡 P2 — internal inconsistencies (we're misrepresenting *ourselves*)

**9. `kitchenDisplay: franchisetech { addon: "+€19/lună" }`** — **false about us.** `lib/billing/catalog.ts:86` says Kitchen Display is *"Inclus în planul Operations — fără taxă suplimentară."* We are voluntarily adding €19 to our own total and handing Ebriza a tie on the row where we win outright.

**10. The whole `realMonthlyCost` row makes us look more expensive than Ebriza.**
`franchisetech: €118` vs `ebrizaPro: €107+` vs `ebrizaPremium: €157+`. The €118 comes from the i18n column header **"franchisetech Scale €99"** + €19 KDS. So the table we built to prove we're cheaper concludes **we cost €11/mo more than Ebriza Pro**. Fix the inputs (Operations €79, KDS €0) and it becomes €79 vs €107 vs €157 — the story we actually want.

**11. Two price facts in the repo are stale.**
- `i18n/ro.ts:533` + `en.ts:530` say **"franchisetech Scale €99"**. `lib/billing/plans.ts` says Scale is **€109**. One of these is wrong and Stripe is the source of truth.
- The task brief given to me said "Multi-location €99/location". `plans.ts` says **€89/additional location, requires a Scale base plan**. Reconcile before any pricing copy ships.

**12. `PricingEbrizaComparisonTable` is dead code.** Defined in `components/marketing/PricingEbrizaComparisonTable.tsx`, imported nowhere (grep across `app/` + `components/`). `lib/marketing/ebriza-pricing-comparison.ts` exists only to feed it. Silver lining: the €118-vs-€107 own-goal is not live. But we built a comparison table and never shipped it.

**13. Footnote date is stale but the numbers still hold.** Footnote says "verified 24 June 2026". I re-verified 2026-08-25: **all Ebriza prices are unchanged** (49/99/179, KDS 19, Insights 19, Saga 39, delivery 0.06/0.04). Bump the date; the figures are good.

---

## 1. Ebriza pricing — exact and complete

**Source:** https://www.ebriza.com/ro/preturi (raw HTML parsed 2026-08-25). Mirrored at https://www.ebriza.com/app/public/pricing.
**All prices in EUR, per location, per month, VAT excluded** — *"Prețurile nu conțin TVA"*. At the 21% RO rate, €49 → €59.29 gross.

### Base plans

| | **Pro** | **Premium** (RECOMANDAT) | **Titanium** |
|---|---|---|---|
| Price | **49 €/locație/lună** | **99 €/locație/lună** | **179 €/locație/lună** |
| Positioning | *"Tot ce ai nevoie pentru vânzări… la masă sau la tejghea"* | *"Pentru control deplin al costurilor și vânzare prin canale multiple"* | *"Ideal pentru afaceri cu locații multiple și volum mare de livrări"* |
| POS device licences | **1 inclusă/locație** | **2 incluse/locație** | **2 incluse/locație** |
| Extra device | **+29 €/dispozitiv** | **+29 €/dispozitiv** | **+29 €/dispozitiv** |
| Imprimante de secție | Nelimitat | Nelimitat | Nelimitat |
| Case de marcat | Nelimitat | Nelimitat | Nelimitat |
| Utilizatori | Nelimitat | Nelimitat | Nelimitat |

### Feature matrix (✓ = ticked in their own table)

| Group | Feature | Pro | Premium | Titanium |
|---|---|---|---|---|
| **POS** | Offline Mode (prints fiscal receipts w/o internet, no cloud upload) | ✓ | ✓ | ✓ |
| | Metode de plată multiple | ✓ | ✓ | ✓ |
| | Stornare produse | ✓ | ✓ | ✓ |
| | Discount-uri rapide | ✓ | ✓ | ✓ |
| | Împărțirea notei (split bill / split payment) | ✓ | ✓ | ✓ |
| | CUI pe bon | ✓ | ✓ | ✓ |
| | Integrări soft POS (bank NFC apps) | ✓ | ✓ | ✓ |
| **Administrare** | Configurare Săli | ✓ | ✓ | ✓ |
| | **Registru de casă** | ✓ | ✓ | ✓ |
| | **Raportare în timp real** | ✓ | ✓ | ✓ |
| | **Facturare & e-Factura** | ✓ | ✓ | ✓ |
| **Gestiune** | Intrări & NIR (auto-NIR from e-Factura) | ✗ | ✓ | ✓ |
| | Furnizori | ✗ | ✓ | ✓ |
| | Inventar | ✗ | ✓ | ✓ |
| | Stocuri în timp real | ✗ | ✓ | ✓ |
| | Comenzi Furnizori | ✗ | ✓ | ✓ |

### Add-ons — the complete list

| Add-on | Pro | Premium | Titanium |
|---|---|---|---|
| **Ebriza Operations App** (manager mobile: reports, inventory, supplier orders) | ✓ free | ✓ free | ✓ free |
| **Afișaj Client** (customer display + tips) | ✓ free | ✓ free | ✓ free |
| **Insights** — rapoarte personalizate | **19 €/lună** | **19 €/lună** | ✓ included |
| **Kitchen Display Screen & ecran comenzi** | **19 €/lună** | **19 €/lună** | **19 €/lună** |
| **Integrare Saga** | **39 €/lună** | **39 €/lună** | **39 €/lună** |
| **Integrări Delivery / Meniu digital** | **0.06 €/comandă** | 1500 comenzi incluse, apoi **0.04 €/comandă** | Nelimitat |

### Commercial terms (all quoted verbatim from their FAQ)

| Item | Ebriza | Source |
|---|---|---|
| Setup / implementation | **€0.** *"Ebriza nu percepe niciun fel de cost inițial pentru implementare."* Free consultant video onboarding. | /ro/preturi |
| Hardware | **They don't sell it.** *"Ebriza nu comercializează hardware."* Recommends partners. | /ro/produse/hardware |
| Minimum contract | **None.** *"Nu există perioadă contractuală cu Ebriza, poți renunța oricând… și vei fi taxat doar pentru perioada în care ai folosit."* | /ro |
| Cancellation | Self-service uninstall, **no termination fee**: *"fără costuri de reziliere."* | /ro/preturi |
| Trial | **15 days** from plan install. | /ro/preturi |
| Card required? | **Yes.** *"Cardul se înregistrează la momentul instalării planului ales"*, auto-debit monthly. | /ro/preturi |
| Dunning | Card fail → retry, then 10 days grace, then account blocked. | /ro/preturi + T&C |
| Support | **Free, 7/7, in-app chat (Crisp), 2–5 min response.** | /ro/preturi |
| **Price changes** | ⚠️ *"The Company may modify, at its sole discretion, any of the prices… **without submitting a prior notice** to the End Customers, the prices being applicable from the beginning of the next tariff cycle."* | https://ebriza.com/TermsAndConditions/html |
| **Uptime SLA** | ⚠️ **None.** *"The Company is not responsible and does not warrant the continuous operation… and their availability."* | T&C |
| **Liability cap** | Max = fees paid in the **last 6 months**, and only on proven gross fault. | T&C |
| e-Factura | **Included in every tier**, no add-on. Auto send + fetch from SPV. | /ro/preturi, /ro/produse/pos |
| Loyalty module | **Not listed anywhere on public pricing or help centre.** | **UNVERIFIED** |
| Annual discount | Not published. *"Pot plăti Ebriza în avans? Da, contactează echipa de vânzări."* | /ro/preturi |

### VERDICT on "they have hidden fees and we're cheaper at €79 flat"

**Half true, and the half that's false is the half that matters.**

**Disproved:** Ebriza does *not* have hidden fees in the classic sense. Their pricing page is more complete than ours — every add-on price is on one public page, there is **no setup fee**, **no minimum contract**, **no cancellation fee**, and support is free. Their own claim *"Prețuri transparente… Fără costuri ascunse"* is substantially accurate. In a market where boogiT, VilicoRest, POSnet and Pynbooking all hide pricing behind a demo call, **Ebriza and franchisetech are the two transparent vendors.** "They hide fees" is not a winnable attack.

**Confirmed:** there *is* one genuine cost multiplier we are not using — **€29/month per extra POS device**. It scales with exactly the thing a growing venue adds (a second till, a waiter's phone). This is our best price attack and it appears nowhere on our site.

**Like-for-like, VAT-excl., monthly** (franchisetech figures from `lib/billing/plans.ts`):

| Scenario | Ebriza | franchisetech | Winner |
|---|---|---|---|
| Café, 1 till, POS + daily reports + e-Factura | **€49** (Pro) | €49 Core (€39 annual) | **Tie monthly / us on annual.** Ebriza Pro also ships e-Factura, offline mode, customer display, manager app at that price. |
| Café, **2 tills** | €49 + €29 = **€78** | **€49** Core | **Us, by €29/mo (€348/yr).** Strongest verifiable attack. |
| Restaurant, stock + NIR + recipes, 2 tills, KDS | €99 + €19 = **€118** | **€79** Operations (KDS + loyalty included) | **Us, by €39/mo.** |
| Same + Saga | €99 + €19 + €39 = **€157** | **€79** (Saga XML export included) | **Us, by €78/mo** — but XML export ≠ live integration; footnote it. |
| **3 locations, stock** | €99 × 3 = **€297** | Scale €109 + 2 × €89 = **€287** | Us, by €10/mo. Marginal. |
| **3 locations, POS only, no stock** | €49 × 3 = **€147** | Scale €109 + 2 × €89 = **€287** | **Ebriza, by €140/mo.** We have no cheap multi-site path. |
| **High delivery volume** (Glovo/Bolt/Wolt) | €179 Titanium, unlimited integrated orders | **No delivery integrations at all** | **Ebriza outright.** Not a price question. |
| Basic till + fiscal register, cheapest possible | €49 | €49 | **Neither** — SmartBill POS is €10.9/mo. |

**Say this plainly internally:** "we're cheaper at €79 flat" is false against **Ebriza Pro €49**, which is the plan most 1-location cafés in our ICP would actually buy. Our €79 only wins where the prospect genuinely needs stock/NIR/recipes — i.e. against **Premium €99**. Lead with the segment, never with the flat number.

---

## 2. Positioning and messaging

**Homepage** — https://www.ebriza.com/ro

- **H1:** *"Crește-ți afacerea cu Ebriza"*
- **Subhead:** *"Următoarea generație de POS și soluție de management"*
- **Primary hero CTA:** *"Cere Demo Ebriza"* — a **demo request**, not a trial. Self-serve *"Încearcă Gratuit"* is demoted to the nav bar.
- **Pain they lead with** (first body block, H2 *"Gata de schimbare?"*):
  > *"Spune adio tabletelor multiple, rapoartelor greoaie și haosului din Excel. Cu Ebriza, îți simplifici afacerea într-o singură platformă cloud — rapidă, accesibilă de oriunde și adaptată nevoilor tale."*
  ⚠️ **This is our positioning, already taken.** "One workspace instead of Excel + WhatsApp + old POS" is verbatim what they say. We cannot win this frame by restating it.
- **Six benefit blocks:** Vinde cu ușurință · Controlează costurile la sânge · Scapă de colecția de tablete · Deschide ușor locații noi · Uită de NIR linie cu linie · Rapoarte în timp real.
- **Vocabulary:** *cel mai prietenos POS de pe piață*, *pionieri ai integrărilor*, *costurile la sânge*, *lași tableta să vândă singură*, *cel mai inovator POS în cloud din România* (page titles). Confident, idiomatic, slightly slangy Romanian. Written by a native, not translated.

**Proof they show**

| Type | What | Source |
|---|---|---|
| Named customer stories w/ quotes | Meron Coffee (Bogdan), Magic Sushi (Bianca), Pulcinella (Andrei) | /ro, /ro/preturi |
| Named venues (no logos, photo cards) | Bistro de l'Arte Brașov, Crispy Store, Sloane, Calif, BAR TON, Le BAB, Cimbru, Gist Iași, Stația de Cafea Timișoara | /ro, /ro/domenii/cafenea |
| Integration partner wall (17 logos) | Bolt Food, Glovo, Wolt, Deliverect, Saga, Adhoc, Poftigo, IALOC, Gloria Food, Viva, GP Tom, ING SoftPOS, MarketMan, Glovo On Demand, Rapidonkey, Tookan, Packageez | /ro |
| Company stats | **25 aplicații · 500+ afaceri ajutate · 1000 mil. euro tranzacționați · 5 țări ajutate** | /ro/resurse/despre-noi |
| Team | 9 named people with photos and one-line personalities | /ro/resurse/despre-noi |
| Founded | 2015; first RO cloud POS launched summer 2016 | /ro/resurse/despre-noi |
| Review scores | **None displayed anywhere.** No G2/Capterra/Trustpilot badge, no star rating. | — |

**Segments targeted** — seven dedicated `/ro/domenii/` pages: Restaurant · Servire Rapidă · Patiserie · Cafenea · Bar · Servicii & Retail · Lanțuri & Francize. Broader than us (we don't do bar or retail; they don't do food-truck/health-bar as named segments).

---

## 3. Their site as a conversion machine — what they do better

Concrete enough to build from.

**Page structure (homepage, in order):** sticky header → hero (H1 + subhead + single "Cere Demo" CTA) → *"Folosit cu încredere"* segment strip (7 chips) → 3-column product split (Vânzare / Gestiune / Livrări) → "Ce poate face Ebriza" 6-benefit grid with **dual CTA (Cere Demo + Încearcă Gratuit)** mid-page → customer story carousel (~16 cards, photo + one-line, some with quotes) → 17-logo integration wall → hardware teaser → **9-question FAQ inline on the homepage** → demo form → footer.

**Pricing page structure:** hero (*"Planuri tarifare potrivite pentru tine / Fără contract minim. Plătești cât folosești. Fără costuri ascunse."*) → 5 reassurance chips (*O aplicație pentru fiecare situație · Set-up rapid și simplu · Suport 7/7 · Testezi gratuit · Nevoi minime de hardware*) → 3 plan cards → **full 30-row "Compară planurile" matrix, grouped HARDWARE / POS / ADMINISTRARE / GESTIUNE / ADD-ONS, with a sticky plan header that follows you as you scroll and tooltip "i" icons on 8 ambiguous rows** → CTA band → customer stories → integrations → 4-pillar trust block (Prețuri transparente · Suport adevărat · Plată cu cardul · Cloud · Open API) → **7-question pricing FAQ** → demo form.

**Things worth stealing, ranked:**

1. **The sticky, grouped, tooltipped comparison matrix.** On mobile it collapses to a tab switcher (`tab-pro` / `tab-premium` / `tab-titanium` classes) so one plan column shows at a time — no horizontal scroll. Ours is `min-w-[640px]` with `overflow-x-auto`, i.e. a horizontal-scroll table on phones. Theirs is strictly better on mobile, and mobile is where our ICP browses.
2. **Tooltips on ambiguous rows.** Eight "i" icons explain exactly what "Dispozitive POS", "Offline Mode", "Intrări & NIR", "Integrări Delivery" mean. It preempts the "what does that actually include?" objection *inside* the table instead of in an FAQ 800px below.
3. **The pricing FAQ answers the seven questions that actually block a purchase** — how billing works, what implementation costs, what support costs, can I pay annually, can I test first, how do I cancel. Each answered in 2–3 concrete sentences, no hedging. This is a trust machine.
4. **Reassurance chips directly under the pricing H1** before any number appears — *Fără contract minim · Plătești cât folosești · Fără costuri ascunse.* Objection-handling before the price reveal.
5. **Free 7/7 support with a quantified SLA on the pricing page** — *"răspund în termen de 2-5 minute."* A number, not an adjective.
6. **Crisp live chat** on every page (detected in page source). Real-time objection handling.
7. **Dual CTA strategy:** high-intent/high-ACV visitors get *"Cere Demo"* (hero, primary, dark button); self-serve visitors get *"Încearcă Gratuit"* (nav + mid-page). Both always reachable. We push one path.
8. **Demo form is only 5 fields** (Nume, Email, Telefon, Oraș, Mesaj) and sits inline at the bottom of *every* page, not behind a modal.

**Where they are weak or we already match:**

- **No pricing calculator, no ROI calculator, no interactive demo, no video.** Static pages, photo cards, zero motion. A working interactive cost calculator would be a genuine differentiator for us.
- **No customer count on the homepage.** "500+" is buried on /resurse/despre-noi. Their strongest social proof is one click too deep.
- **Every `/ro/domenii/*` page reuses the identical H1** *"Crește-ți afacerea cu Ebriza"* — only the H2 changes (*"Cafenelele se trezesc cu Ebriza"*). That is an on-page SEO gift: our industry pages can outrank them on `soft cafenea`, `program restaurant`, etc. with genuine per-page H1s.
- **The Marketplace page is a client-rendered SPA that serves an empty HTML shell** (verified: fetched HTML contains only the `<title>`). Invisible to search engines.
- **No phone number in the header or footer.** Only `+40 721 273 700` on their Google Play developer listing and `office@ebriza.com`. FAQ text is inconsistent — the pricing page promises support *"prin telefon și mesagerie text"*, the homepage FAQ promises only *"mesagerie text în aplicație."* A visible RO phone number is a cheap trust win for us.
- **Speed:** ebriza.com/ro TTFB **0.33s**, /ro/preturi **0.15s**. franchisetech.ro/ TTFB **0.76s**, /pricing **0.35s**. They are roughly **2× faster to first byte**. Not fatal, but on 4G in a café it shows.
- **Romanian language quality: excellent, native, idiomatic.** No advantage available here — we must match, not beat.
- **Imagery: real photos of real venues**, no stock illustrations, but **no product screenshots of the POS UI in the main flow.** A prospect cannot see the till before booking a demo. **Screenshots of our actual till screen are a free win.**

---

## 4. Weaknesses / attack surface

Ranked by how usable each one is in copy.

**A. €29/month per extra POS device — the only real cost multiplier.**
Verified twice (pricing tooltip + cafenea FAQ). A café that adds a second till or lets a waiter take orders on a phone pays €29/mo forever, per device. franchisetech has **no per-device fee** (nothing in `lib/billing/catalog.ts` or `plans.ts`). A 3-device venue: Ebriza Pro €49+€58 = **€107** vs franchisetech Core **€49**. *This is our headline and it is not on our site anywhere.*

**B. Fiscal hardware lock-in — only two supported models.**
https://www.ebriza.com/ro/produse/hardware lists exactly: **Partner 200/600** and **Datecs DP25MX**. Any other casa de marcat = buy new hardware. Also Android 11 minimum, and NFC required for SoftPOS card payments. If our FiscalNet path supports a wider range, that is a concrete switching-cost argument for venues with existing kit.

**C. Unilateral price changes with no prior notice.**
> *"The Company may modify, at its sole discretion, any of the prices… without submitting a prior notice to the End Customers."* — https://ebriza.com/TermsAndConditions/html
Legitimate, sourced, quotable. Pair it with a franchisetech commitment (e.g. 30 days' notice) and it becomes a positioning asset rather than a smear.

**D. No uptime SLA, liability capped at 6 months of fees.**
> *"The Company is not responsible and does not warrant the continuous operation… and their availability."* — T&C
Same source. Only use if we are prepared to publish a better commitment.

**E. Mobile-app-only POS register.**
Register is iOS/Android only — no browser till, no Windows/PC option. Committing to a tablet fleet is a real cost and a real constraint. (Their back-office *is* browser-based; scope the claim to the register.)

**F. Stale mobile apps.**
- iOS: v5.15, released **2025-04-17** — ~16 months without an update (iTunes lookup API, `id=1203604280`).
- Android: last updated **17 iul. 2025** — ~13 months (Google Play, `com.ebrizasoftware.POS`).
For a product whose entire POS is that app, and in a year with active RO fiscal change, that is a legitimate "how actively is this maintained?" question. **Use as a question, never as an accusation** — they may ship via server-side config.

**G. Thin public review footprint.**
- App Store: **4.14/5, 28 ratings** (`averageUserRating 4.14286`, `userRatingCount 28`).
- Google Play: **4.6/5, 10 reviews, 1K+ downloads**.
- Facebook: 86% recommend, **5 reviews** (per search result, https://www.facebook.com/ebrizadotcom/).
- **No Capterra, G2, Software Advice, or Trustpilot presence found.** Searched; nothing returned.
- 500+ claimed businesses vs ~1K app downloads and 43 total public ratings.
**No substantive negative reviews were found in any language.** I searched Romanian complaint terms, forums, and review aggregators and found none. **Do not fabricate a support-complaint narrative — there is no evidence for one, and their support offer (free, 7/7, 2–5 min) is stronger than ours on paper.** The honest read: they are small, well-liked, and under-reviewed.

**H. Small company.**
9 people on the team page, founded 2015, 500+ businesses, ~€1bn lifetime transacted, 5 countries. Not an enterprise vendor. Useful for calibrating expectations internally — not usable as an attack (we are smaller).

**I. Feature gaps we could own** (each **needs internal confirmation that we actually ship it better**):
- **Loyalty:** no loyalty/fidelitate module on Ebriza's public pricing or help centre. We ship a phone-number stamp card **included in Operations** (`lib/billing/catalog.ts:117`). Strong, unused differentiator.
- **SAF-T:** no SAF-T articles in their help centre. **UNVERIFIED** whether they support it — and per our own notes we deferred it too. Do not claim.
- **Assisted onboarding:** they give free consultant video calls. We charge €199. **They win this.** Consider making basic assisted setup free.

---

## 5. Other Romanian competitors — the real price band

**The most important market fact:** a guide to RO restaurant software states *"Prețul variază între **100-500 RON/lună**"* and *"Majoritatea restaurantelor plătesc între **100-300 RON/lună**"* (https://startup-delivery.ro/blog/soft-restaurant-2026-ghid-complet-alegere-implementare/). At ~5 RON/EUR that is **€20–60/month typical**. Both Ebriza (€49–99) and franchisetech (€49–109) sit at or above the top of that band. We are not fighting Ebriza on price — we are both fighting the market's price anchor.

**Second fact:** almost nobody publishes prices. boogiT, POSnet, Pynbooking, Criasoft all require a demo call. **Ebriza and franchisetech are the two transparent vendors** — which is why "transparent pricing" cannot be our differentiator *against Ebriza* even though it works against everyone else.

| Vendor | What it is | Price (verified) |
|---|---|---|
| **SmartBill (POS / Gestiune)** — smartbill.ro | Invoicing-first SaaS with a POS module. Not a table-service HoReCa POS, but the price anchor every RO owner has heard of. | **SmartBill POS €10.9/lună + TVA**; **POS + Gestiune €27.22/lună + TVA**; extra user €3.5 (POS) / €9 (POS+Gest). **30-day free trial**, **12 months free** for companies in their first year, **free cash register** with POS subscription. — https://www.smartbill.ro/preturi/vanzare-cu-casa-marcat |
| **VilicoRest** — vilicorest.ro | Modular RO HoReCa POS, subscription *or* perpetual licence. 450+ venues. The most granular public price list in the market. | VilicoPOS **€42–73/lună** by venue size; VilicoGest **€15–22**; VilicoCook (KDS) **€3**; **Saga export €7/lună**; VilicoTab €5–7; maintenance **€17–50/lună**. Perpetual licences €286–550. **€165 install fee on monthly contracts** (waived if paid annually). 30-day trial, no minimum term, **50% off additional locations**. — https://vilicorest.ro/preturi/ ⚠️ Their **Saga export at €7** vs Ebriza's **€39** is a useful anchor. |
| **FGO** — fgo.ro | Online invoicing + e-Factura automation. Not a POS. | From **15 lei/lună**; Jan-2026 promo showed **55 lei/lună** (from 100), prices ex-VAT. — https://www.fgo.ro/abonamente/ |
| **boogiT** — pos.boogit.ro | Cloud restaurant POS, positions as *"Integratorul nr.1 Bolt, Wolt, Glovo"*. Direct Ebriza rival on delivery. | **Not published.** Two components: one-off implementation fee + monthly subscription. Claims **no per-device / per-user / per-KDS / per-order fees** and unlimited everything — a direct shot at Ebriza's €29/device. Phone +40 755 111 774. |
| **POSnet** — posnet.ro | Local/cloud/hybrid HoReCa POS. | **Not published.** Perpetual-licence model, no subscription. |
| **Criasoft / SoftOK** — tehnicafiscala.ro, softok.ro | Rental POS packages incl. hardware. | **450 lei/lună, TVA inclus** (~€90 gross incl. hardware rental). |
| **Pynbooking** — pyn.ro | Cloud restaurant POS. | **Not published** — demo required. |
| **Oscar POS** | Requested, but no Romanian HoReCa vendor by this name found. Results returned an Australian company (oscarpos.com.au). | **NOT FOUND** — likely a name mix-up. |
| **Aigel / Dataware POS** | Requested; no public RO HoReCa pricing or vendor page found. | **NOT FOUND / UNVERIFIED** |
| **Mozaic** | Requested; no RO HoReCa POS vendor found under this name. | **NOT FOUND / UNVERIFIED** |
| **Sagenta** | Requested; no RO HoReCa POS vendor found under this name. | **NOT FOUND / UNVERIFIED** |

Other names that surfaced repeatedly and may matter more than the four not-found ones: **Expressoft**, **rKeeper**, **Unity POS (ARI-Studio)**, **Startup Delivery**, **FreyaPOS**. Several are already in `lib/marketing/competitor-brands.ts`.

---

## 6. Recommendations — ranked by impact ÷ effort

### Do today (legal/trust exposure)

**R1. Remove the four false claims from `lib/marketing/comparisons.ts`.** (§0 items 1–4.) Effort: 30 min. Impact: eliminates a Legea 158/2008 exposure and stops the self-contradiction on the card question. **Nothing else on this list matters if this isn't done.**

**R2. Narrow the Insights claim to "rapoarte personalizate" everywhere.** Ebriza Pro includes real-time reporting and registru de casă. Effort: 20 min. Impact: the claim becomes bulletproof instead of checkable-and-wrong.

**R3. Fix the self-harming inputs in `ebriza-pricing-comparison.ts`.** KDS is included in our Operations (`catalog.ts:86`) — stop charging ourselves €19. Compare **Operations €79**, not Scale. Reconcile Scale €99 vs €109 and Multi-location €89 vs €99 against `plans.ts`. Effort: 1h. Impact: the table's bottom line flips from "we cost €11 more" to "we cost €28 less."

### High impact, low effort

**R4. Put the €29/device fee at the centre of the comparison.** New table row: *"A doua casă / telefon ospătar — franchisetech: inclus · Ebriza: +29 €/lună/dispozitiv."* Then a worked example: *"Cafenea cu 2 case: 49 € la noi, 78 € la Ebriza. Cu 3 dispozitive: 49 € vs 107 €."* Sourced to their own tooltip. Effort: 2h. Impact: **the single strongest true price attack we have, currently unused.**

**R5. Ship `PricingEbrizaComparisonTable` — it's dead code.** Wire it into `/pricing` (RO locale) after R3. Effort: 2h. Impact: we already built the asset.

**R6. Rewrite the comparison table for mobile, Ebriza-style.** Replace `min-w-[640px]` + horizontal scroll with their tab-switcher pattern (one plan column at a time under 768px) and add tooltips on ambiguous rows. Effort: 4h. Impact: our ICP browses on a phone; horizontal-scroll tables get abandoned.

**R7. Add a 7-question pricing FAQ modelled on theirs.** Cost of implementation · cost of support · minimum contract · how to cancel · annual payment · what happens if the card fails · can I test first. Concrete 2–3 sentence answers. Effort: 3h. Impact: removes the objections that silently kill self-serve signups.

**R8. Put a visible Romanian phone number in the header and footer.** Ebriza has none on-site, and their own FAQ contradicts itself about whether phone support exists. Effort: 1h. Impact: for a 35–55-year-old non-technical owner, a phone number is the trust signal.

**R9. Add product screenshots of the actual till screen above the fold.** Ebriza shows venue photos but never the POS UI. A prospect cannot see their software before booking a demo; they can see ours in 3 seconds. Effort: 3h.

**R10. Make basic assisted setup free; keep €199 for migrations/training only.** Ebriza gives free consultant video onboarding. Today they beat us on this and we told the world the opposite. Effort: pricing decision. Impact: closes a real gap.

### Medium effort, high impact

**R11. Build the interactive cost calculator.** Inputs: locations, tills/devices, need stock?, need KDS?, need Saga?, delivery orders/month. Output: side-by-side monthly cost, every Ebriza figure footnoted to their pricing page. **Ebriza has no calculator, and the maths genuinely favours us in the multi-device and stock scenarios.** Effort: 1–2 days. Impact: highest-ceiling item on the list. *Only build after R1–R3 — a calculator built on wrong inputs multiplies the legal risk.*

**R12. Give every `/industries/*` page a genuine industry-specific H1.** All seven Ebriza `/ro/domenii/` pages share one H1. Free organic ground on `soft cafenea`, `program gestiune restaurant`, `POS patiserie`. Effort: 1 day.

**R13. Lead with loyalty.** No loyalty module appears anywhere in Ebriza's public pricing or help centre; ours is included in Operations. Verify internally, then make it a headline feature comparison. Effort: 4h.

**R14. Publish a price-change and data-portability commitment.** Their T&C permits unilateral price changes with no prior notice and disclaims any uptime warranty. Counter with a concrete promise (e.g. 30 days' notice, one-click full data export) rather than quoting their T&C at prospects. Effort: 1 day incl. legal review.

**R15. Fix TTFB.** 0.76s vs their 0.33s on the homepage. Effort: investigation. Impact: modest but compounding.

### Strategic — decide, don't drift

**R16. We have no answer to Ebriza Titanium.** No Glovo/Bolt/Wolt integration means every delivery-driven venue is unwinnable, and delivery is a large slice of RO HoReCa. Either build/partner for aggregator integration, or explicitly disqualify delivery-led venues in ICP and stop spending acquisition budget on them.

**R17. Our multi-location pricing loses badly to Ebriza Pro.** 3 POS-only sites: Ebriza €147, us €287. Requiring a **Scale €109 base** before €89/site prices us out of exactly the "1–3 locations" ICP we target. Consider allowing Core or Operations as the multi-location base.

**R18. Stop competing on "escape Excel chaos."** Ebriza's homepage already says *"Spune adio… haosului din Excel"* — and they've said it to 500+ businesses since 2016. Our differentiated ground is the one thing their site never mentions: **"Închizi ziua cu adevărul"** — cash drawer vs expected, till reconciliation, the owner trusting the number. Search their entire site: they sell *speed, integrations, and cost control*. They do not sell *trust in the daily close*. Own that.

---

## Source index

| Fact | URL |
|---|---|
| Full pricing + feature matrix + FAQ | https://www.ebriza.com/ro/preturi |
| Same, app subdomain | https://www.ebriza.com/app/public/pricing |
| H1, positioning, homepage FAQ, integrations | https://www.ebriza.com/ro |
| POS is an iOS/Android app; e-Factura in SPV | https://www.ebriza.com/ro/produse/pos |
| Gestiune: Rețete, Costuri, Bon de consum, CMP | https://www.ebriza.com/ro/produse/gestiune |
| No hardware sold; Partner 200/600 + Datecs DP25MX only | https://www.ebriza.com/ro/produse/hardware |
| "Câte dispozitive POS pot folosi?" — extra licences | https://www.ebriza.com/ro/domenii/cafenea |
| 2015 · 500+ businesses · €1bn · 5 countries · 25 apps | https://www.ebriza.com/ro/resurse/despre-noi |
| Price changes w/o notice · no uptime warranty · 6-month liability cap | https://ebriza.com/TermsAndConditions/html |
| Control Center is browser-based (help categories) | https://help.ebriza.com/ro/ |
| iOS 4.14/5, 28 ratings, v5.15 of 2025-04-17 | https://itunes.apple.com/lookup?id=1203604280&country=ro |
| Android 4.6/5, 10 reviews, 1K+ installs, updated 17 iul. 2025 | https://play.google.com/store/apps/details?id=com.ebrizasoftware.POS |
| Facebook 86% recommend (5 reviews) | https://www.facebook.com/ebrizadotcom/ |
| "do it yourself", hours to 3 days to start selling | https://start-up.ro/ebriza-primul-serviciu-de-pos-gratuit-din-romania/ |
| RO market band 100–500 RON/lună, most 100–300 | https://startup-delivery.ro/blog/soft-restaurant-2026-ghid-complet-alegere-implementare/ |
| SmartBill POS €10.9 / POS+Gestiune €27.22 | https://www.smartbill.ro/preturi/vanzare-cu-casa-marcat |
| VilicoRest full price list, €165 install, Saga €7 | https://vilicorest.ro/preturi/ |
| FGO from 15 lei/lună | https://www.fgo.ro/abonamente/ |
| boogiT: no per-device/user/KDS/order fees, price on request | https://pos.boogit.ro/ |
| Our plan prices (source of truth) | `lib/billing/plans.ts` |
| KDS + loyalty included in Operations | `lib/billing/catalog.ts` |
| Live false claims | `lib/marketing/comparisons.ts` (Ebriza block, ~L625–715) |

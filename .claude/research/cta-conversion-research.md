# CTA & Conversion Research — franchisetech.ro
**Date:** 2026-08-25
**Scope:** Homepage H1/CTA, the €1 card-verification gate, Romanian-market selling norms, concrete rewrite proposal.
**Constraint that frames every recommendation:** top-of-funnel volume, not lead quality. Per project memory, only 3 orgs have ever existed and activation is ~100%. We are not leaking at activation. We are leaking before signup.

---

## 0. TL;DR — the five findings that matter

1. **We are running the worst possible hybrid.** We lead with a self-serve trial CTA (like SmartBill/FGO, who require no card) but gate it behind a card charge (like Ebriza, who *don't lead with a trial at all*). We pay the volume cost of the card gate without the sales-assisted funnel that justifies it.
2. **Nobody in the Romanian HoReCa/SMB software category asks for a card up front except Ebriza** — and Ebriza's primary CTA is `Cere Demo Ebriza`, not the trial. The trial is their *secondary* CTA and the card is disclosed after a human conversation.
3. **It's not a €1 "verification" to the buyer — it's a foreign-currency card charge.** `CARD_VERIFICATION_AMOUNT_CENTS = 100` in EUR via Stripe Checkout `payment` mode. In the EU this triggers PSD2/SCA — the owner must open their banking app and approve a €-denominated transaction to a company they've known for 90 seconds. In a market where 51–65% of e-commerce is still cash-on-delivery *because of distrust of digital payments*, this is close to the highest-friction ask available.
4. **All five Romanian competitors examined use informal "tu".** Our own `lib/marketing/i18n/ro.ts` mixes "tu" and "dumneavoastră" *on the same page* (21 informal vs 10 formal constructions). That reads as machine translation to a native speaker and quietly costs trust.
5. **Prices are shown in EUR only.** The ICP budgets in lei. `€49/lună` is an abstraction; `249 lei/lună` is a decision.

---

## 1. Evidence-based CTA research

### 1.1 Card-required vs card-not-required trials — the core trade-off

The effect is large, well-replicated, and cuts both ways. What matters is *which* metric you are optimising.

| Source | Card required (opt-out) | No card (opt-in) |
|---|---|---|
| Totango SaaS Conversions Benchmark | ~50% trial→paid | ~15% trial→paid |
| Totango, visitor→trial signup rate | ~2% of visitors | ~10% of visitors |
| Totango, 90-day retention | 20% *lower* | baseline |
| Aggregate 2026 benchmarks | 35–55% (median 44%) | 8–22% (median 14%) |
| Common "good/great" bands | good 25–35%, great 50–60% | good 4–6%, great 10–15% |

The decisive number is the **visitor→trial** row. The card gate multiplies trial→paid by roughly **3.3x**, but divides trial starts by roughly **5x**. Under those two published figures alone, removing the card produces *more* paying customers end-to-end:

- With card: 1000 visitors → 20 trials → ~10 customers
- Without card: 1000 visitors → 100 trials → ~15 customers

**Sources:** [Totango via Chargebee](https://www.chargebee.com/blog/saas-free-trial-credit-card-verdict/), [growthspree B2B benchmarks 2026](https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card), [Baremetrics](https://baremetrics.com/blog/trial-conversion-rate-metrics-explained), [Userpilot](https://userpilot.com/blog/saas-average-conversion-rate/).

### 1.2 Named case studies — including one that cuts against us

**PhoneBurner** (SMB sales tool, non-technical buyers, 25 Jan – 2 May 2014) — the most rigorous public test, and I'm reporting it honestly because *its short-term result favours the card*:

- Removing the card: **+239% new users**
- Trial→paid collapsed from **73% → 22%**
- Net short-term: the card funnel produced **35% more paying customers** and **16% more revenue**
- **But:** card-acquired customers **churned at ~2x the rate**, and the no-card funnel produced **77% more team accounts** (worth ~10x an individual seat). Long-run LTV favoured no-card.
- They replaced the card gate with usage limits (60 free dialing minutes), free 20-min demos, and proactive sales follow-up.

Source: [PhoneBurner](https://www.phoneburner.com/blog/what-removing-credit-cards-from-our-saas-signup-did-to-our-revenue)

Other reported results: **Firstsales.io +71% trial signups** after dropping the card; an anonymised SaaS reporting **+340% signups**, conversion 38%→15%, netting 28 customers/month vs 17. ([ProductLed](https://productled.com/blog/free-trial-signups), [LeadSync](https://leadsync.me/blog/ditching-credit-card-requirements-for-free-trials/))

**Why PhoneBurner's counter-result does not transfer to us:** their card funnel converted at 73% because they *already had enough traffic to fill it*. Our binding constraint is that the top of the funnel is nearly empty. A 44% conversion rate on ~zero trials is zero customers, and — just as damaging at our stage — zero learning. We cannot optimise onboarding, pricing, or messaging from a sample of 3.

### 1.3 "Book a demo" vs "start free trial" for non-technical SMB

- `Book a demo` rarely exceeds **~1.5%** conversion (Matt Lerner, ex-PayPal growth, from a large sample of B2B sites). It self-selects for high-intent, extroverted, non-busy prospects — the *opposite* of a café owner mid-service.
- Demo forms with **>5 fields** show bounce rates up to **67%** (Formstack, via HowdyGo). Cutting fields 4→3 lifts form conversion **~50%** (HubSpot).
- But for buyers needing setup help, demos convert far better *per lead*: enterprise demo-driven 55–75% vs enterprise trial 10–15%.
- **Public interactive demos** (watch the product without signing up) were associated with **+63% conversions**, 1.5x better MQL:SQL, and 23% faster closes in a HockeyStack analysis of ~2M sites.

**Reading for our ICP:** the café owner is non-technical *and* time-poor *and* conflict-averse about sales calls. Both "give me your card" and "book a call with a salesman" are high-commitment. The gap in the middle — **see the product with no signup and no call** — is unoccupied in the Romanian HoReCa POS category. That is where our secondary CTA belongs.

**Sources:** [Matt Lerner](https://www.linkedin.com/posts/matthewlerner_ive-never-seen-book-a-demo-convert-more-activity-7183393459230134274-C12j), [HowdyGo](https://www.howdygo.com/blog/your-book-a-demo-button-is-losing-conversions), [Userpilot free trial vs demo](https://userpilot.com/blog/free-trial-vs-demo-saas/)

### 1.4 First-person CTA phrasing

The canonical test: Michael Aagaard (ContentVerve / Unbounce) changed `Start your free 30 day trial` → `Start my free 30 day trial`, producing **+90% CTR**. The mechanism is the endowment effect — "my" makes the visitor mentally take ownership. Replications typically land in the **+10–40%** range, so treat 90% as an outlier but the direction as reliable.

**Caveat I want flagged:** every replication I found is in English. First-person imperative button copy is *less idiomatic in Romanian* than in English — see §3.4. Test it, don't assume it.

**Source:** [Disruptive Advertising](https://disruptiveadvertising.com/blog/landing-pages/effective-ctas/), [Kissmetrics](https://kissmetrics.io/blog/cta-button-best-practices)

### 1.5 CTA specificity

- Button copy is the highest-leverage element of a CTA — single-word changes swing conversion **10–30%**.
- Benefit-oriented copy over generic: reported lifts up to **+161%**; personalised CTAs **+202%**.
- Mechanism: specificity reduces uncertainty about *what happens after the click*. For a risk-averse buyer, ambiguity about the next screen is itself the friction.
- **Critical constraint:** multiple competing CTAs in one view can depress conversion by up to **266%**. One primary. One visually subordinate secondary. Nothing else.

**Sources:** [Unbounce CTA critique](https://unbounce.com/conversion-rate-optimization/cta-copy-critiqued-for-conversion/), [Kissmetrics](https://kissmetrics.io/blog/cta-button-best-practices), [Omniconvert](https://www.omniconvert.com/blog/above-the-fold-design/)

### 1.6 Risk-reversal microcopy

- `No credit card required` placed directly under the button is repeatedly cited as removing the single largest pre-click objection.
- Risk-reversal guarantee blocks averaged **+27% conversion**; businesses offering generous guarantees report refund rates under 5–10% — the lift dwarfs the cost.
- Effective microcopy stacks three reassurances: **cost** ("fără card"), **commitment** ("fără contract / anulezi oricând"), **effort** ("configurare în ~30 de minute, te ajutăm noi").

**Sources:** [River — guarantee templates](https://rivereditor.com/blogs/guarantee-risk-reversal-paragraphs-remove-90-percent-objections), [ActiveCampaign microcopy](https://www.activecampaign.com/blog/microcopy), [Studio1](https://studio1design.com/how-to-use-risk-reversal-to-boost-your-conversions/)

### 1.7 Mobile above-the-fold

- Mobile ATF ≈ **top 300–500px**. ~**80% of attention** is above the fold (NN/g), so decisions there carry ~4x the weight.
- The CTA button **must** be above the fold; visitors who have to scroll to find the action path frequently don't scroll.
- The winning ATF formula: headline + one supporting sentence + one visible CTA + relevant visual + **exactly one** credibility cue.

**Source:** [Omniconvert](https://www.omniconvert.com/blog/above-the-fold-design/), [Evoke](https://madebyevoke.com/blog/above-the-fold-design-guide)

---

## 2. The card-verification question — recommendation

### 2.1 What we actually do today

From `lib/billing/plans.ts`:
```
export const STRIPE_CARD_VERIFICATION_PRICE_ID = "price_1TqythQSKBSEqRxE8y8aX5Ga";
export const CARD_VERIFICATION_AMOUNT_CENTS = 100;
```
Per `AGENTS.md`, this runs as **Stripe Checkout in `payment` mode** — a real €1.00 charge, not a €0 `SetupIntent`. The trial only starts after it succeeds (`startTrialAfterCardVerification`). It is surfaced in the hero as `trialNote: "Verificare card 1€ · Setup ghidat în aplicație · Anulezi oricând"` and repeated in ~7 more places across `lib/marketing/i18n/ro.ts`.

### 2.2 Why this is worse than a generic card gate

Four compounding penalties, in order of severity:

1. **PSD2 / SCA.** A €1 charge on an EU-issued card almost always triggers 3D Secure. The owner is bounced into their bank app mid-signup. Q1-2019 data showed **22% of payments sent to 3DS were lost**; even a well-implemented modern 3DS2 flow runs at *under* 10% abandonment. That is a 10–20% tax layered *on top of* the ~5x volume loss from the card gate itself.
2. **Currency.** The charge and the plan prices are in **EUR**, on a Romanian business card. Romanian banks commonly apply FX handling to EUR transactions, and the owner sees a foreign-currency debit from an unfamiliar merchant. This is the exact pattern their bank's fraud education tells them to be suspicious of.
3. **Market-level card distrust.** **51–65% of Romanian e-commerce orders are still cash-on-delivery**, explicitly attributed to distrust of online payment. Card-first onboarding fights a national behavioural default. ([ThePaypers Romania 2025](https://thepaypers.com/payments/expert-views/romania-2025-analysis-of-payments-and-ecommerce-trends), [ecommerceGermany](https://ecommercegermany.com/blog/european-ecommerce-overview-romania/))
4. **Category mismatch.** SmartBill (170k customers) and FGO (170k firms) — the two products this ICP most likely already uses — both onboard with **zero card**. We are asking for *more* commitment than the incumbents the buyer already trusts.

### 2.3 Recommendation: **drop the €1 charge from the signup path.**

Not "soften it", not "reword it" — remove it as a precondition for the trial starting.

The trade-off literature says the card gate buys higher trial→paid and less junk. **We do not have a junk problem.** With 3 orgs ever and ~100% activation, every signup we get is real and every one activates. We are paying a 5x volume tax and a 3DS tax to solve a problem we don't have, in a market with the EU's strongest card-distrust signal, against competitors who don't charge it.

There is also a compounding argument that outranks the arithmetic: **at this volume the card gate destroys our ability to learn.** We cannot A/B test copy, price, or onboarding on a handful of signups a month. Volume is the input to every other improvement on this list.

**Concrete implementation:**
- Trial starts immediately on email + business name. Nothing else.
- Keep `startTrialAfterCardVerification` and the Stripe plumbing intact — just move the card request to **day 12 of 15**, in-app, framed as "continuă fără întrerupere" (avoid losing your data/config), plus the existing dunning path. This is the standard opt-in→opt-out conversion pattern and preserves all billing code.
- Replace the removed qualification function with **product-side qualification**, exactly as PhoneBurner did: assisted setup inside the app, a real first-sale milestone, and founder-led follow-up on the existing activation events (`till_session_opened`, `first_sale_recorded`).
- Expect trial→paid to fall from whatever it is now toward the 14–22% band. **That is the correct trade and should be pre-agreed, or the first weekly metrics review will read as a regression and cause a panic revert.**
- Instrument it: keep `visitor → signup → till_session_opened → first_sale_recorded → subscription_created` as the funnel of record. The number that must go up is **subscription_created per 1000 visitors**, not trial→paid.

**Migration risk note:** this is a P1-adjacent change (billing flow). It should ship behind a flag with the old path intact, and it does not require a DB migration if the card request simply moves later in the lifecycle. Get explicit owner approval before deploy per `CLAUDE.md`.

### 2.4 If we keep it anyway — how to word it so it doesn't scare people

If the decision is to retain the gate, these are the mitigations, roughly in order of value:

1. **Switch from a €1 charge to a €0 `SetupIntent`** (card authorisation, not payment). Same anti-fraud value, no money moves, and the copy becomes truthful in the way the buyer wants: *"Nu se ia niciun ban."* This alone removes the worst of the objection.
2. **Move the card behind the CTA, not in front of it.** Let them create the account, name the business, and *see the POS screen* first. Ask for the card at the end of onboarding, once value is visible. The card is not the problem; the card *as the first thing a stranger asks for* is.
3. **Never call it "verificare card" in the button or hero.** That phrase makes the card the headline. Put it in the microcopy, framed as an outcome.
4. **Price it in lei and state the reversal explicitly.** Suggested Romanian:

   > **"1 leu se blochează pe card ca să confirmăm că ești o afacere reală. Nu se încasează nimic și banii revin în 3–5 zile. Abonamentul nu pornește automat — îți cerem acordul înainte."**

   (Only use "se blochează / revin" if we actually switch to an auth or a refunded charge. If it stays a real captured €1, the honest version is: *"Se încasează 1 €, o singură dată, ca verificare. Atât. Abonamentul nu pornește fără acordul tău."*)
5. **Add a card-free escape hatch as the secondary CTA** — a WhatsApp/phone line where a human sets the account up for them. This recovers the segment that will never type a card number into a new site, which in this market is large.

---

## 3. Romanian-market specifics

### 3.1 What the competitors actually do (primary research, fetched 2026-08-25)

| Company | H1 | Primary CTA | Card for trial? | Phone visible | Register |
|---|---|---|---|---|---|
| **Ebriza** (direct competitor) | *Crește-ți afacerea cu Ebriza* | **`Cere Demo Ebriza`** | Yes — card added at install, auto-debited | No phone; in-app chat, "7/7", 2–5 min response | **tu** |
| **SmartBill** | *Cel mai folosit program de facturare si gestiune* | **`Începe Acum Gratuit`** | No | Yes — 031.710.4215 | **tu** |
| **FGO** | *Platformă completă pentru facturare în România* | **`FOLOSEȘTE FGO GRATUIT 30 DE ZILE`** | No — *"fără obligații"* | Footer — 037 449 00 78 | **tu** |
| **FreyaPOS** (HoReCa) | *Soluții avansate dedicate industriei HoReCa și retailului* | **`Discută cu un consultant`** | N/A — no self-serve | **Yes, top of page** — +4 021 539 7878 | **tu** |
| **VilicoRest** (HoReCa) | *Soft restaurant și gestiune HoReCa* | **`Solicită o demonstrație Gratuit • Fără obligații`** | No — 30 zile gratuit | No | **tu** |

**Three conclusions:**

- **Free trial vs demo splits by segment, not by country.** The horizontal SaaS players (SmartBill, FGO) lead with a no-card free trial. The **HoReCa POS players lead with a human** — demo, consultant, demonstration. We are a HoReCa POS product selling to the most risk-averse end of that segment, yet we offer neither a frictionless trial nor a human. We offer a card.
- **Ebriza's structure is the one to study.** Primary CTA `Cere Demo`, secondary `Încearcă Gratuit`, card disclosed only inside the paid-plan install flow, after a free consultant video call. They earn the card by spending human time first. We ask for it cold.
- **`fără obligații` is the category's standard risk-reversal phrase** (FGO, VilicoRest both use it verbatim). We should too.

### 3.2 Is a visible phone number / WhatsApp expected?

**Yes for HoReCa POS, and it is a real gap for us.** FreyaPOS puts the phone at the top of the page. SmartBill and FGO both publish landlines. Ebriza substitutes an aggressive in-app SLA ("7/7", "2–5 minute").

General evidence supports this: a physical address plus phone number raises measured trust score ~**+35%**, and in a Google study of 3,000+ mobile searchers, **47% said they'd be frustrated and more likely to go elsewhere** if they couldn't call the company directly. For a buyer whose scar tissue is "software that needed an IT person", a visible human number is not a contact detail — it is the product claim.

**WhatsApp specifically:** none of the five competitors surfaced a WhatsApp button on the homepage. But WhatsApp is the ICP's native operating channel (the AGENTS.md ICP literally runs on it), so a WhatsApp button is a **differentiator, not a norm** — it meets them where they already are while nobody else does. Recommend adding it; do not assume it replaces a phone number, since the older half of the 35–55 band will still want to call.

### 3.3 "tu" vs "dumneavoastră"

**Use "tu". Unambiguously.** All five companies examined — including the two most conservative, accounting-adjacent ones — use "tu" throughout. This has become the settled register for Romanian SMB software marketing.

**We currently violate this by mixing.** In `lib/marketing/i18n/ro.ts` the same page contains:

- informal: *"Vinzi ziua, închizi casa"*, *"Seara știi exact câți bani ai făcut"*
- formal: *"Vedeți costul per porție"* (L168), *"Vedeți numerarul așteptat"* (L181), *"Creșteți echipa fără taxe per loc"* (L143), *"Închideți ziua cu vânzări și stoc clare"* (L264), *"Începeți pe dispozitivele pe care le aveți deja"*, *"Puteți configura produsele mele?"* (L560), *"dacă continuați"* (L561)

Rough count in that file: **21 informal vs 10 formal** constructions. A native speaker reads this as translated-by-machine, and it lands hardest on the exact trust axis we're weakest on. **This is a cheap, high-confidence fix: normalise everything to "tu".**

Two caveats worth stating:
- Keep **"dumneavoastră" in transactional/legal contexts** — Terms, GDPR notices, invoices, and formal email to accountants. Register-switching there is expected, not sloppy.
- My evidence for the "tu" norm is observational (five competitor sites) rather than a published linguistic or CRO study for Romanian. It is consistent across all five, including the most conservative, so I'd treat it as high confidence — but it is not a controlled test.

### 3.4 Linguistic flags (things I am deliberately not confident about)

- **First-person button copy is weaker in Romanian.** English `Start my free trial` has no clean one-word Romanian equivalent. The idiomatic first-person form is the longer **"Vreau să încerc gratuit"**, which is common on Romanian landing pages but costs button width on mobile. The +90% ContentVerve result should **not** be assumed to transfer. Test it.
- **"casa" is ambiguous to a cold reader.** Inside HoReCa, *"închizi casa"* clearly means closing the till. To a first-time visitor arriving from an ad, *casă* first reads as "house". Our current CTA `Deschide casa gratuit 15 zile` is insider language on the coldest possible surface. Safer for the hero: *"casa de marcat"*, *"ziua"*, or *"sertarul"*. Keep *"închizi casa"* for in-app and for pages where context is established.
- **"trial" is startup jargon.** `lib/marketing/i18n/ro.ts` uses the English loanword "trial" 10+ times (*"Trial asistat 15 zile"*, *"Începe trial 15 zile"*). A 50-year-old café owner in Constanța does not use this word. The native forms are **"perioadă de probă"**, **"testezi gratuit"**, **"gratuit 15 zile"**. Competitors use those. Replace "trial" everywhere in customer-facing Romanian copy.
- **Diacritics are correct** — verified: 210 × `ș` (U+0219) and 270 × `ț` (U+021B), zero cedilla variants (U+015F/U+0163). Nothing to fix; keep it that way, as cedilla diacritics are a classic tell of sloppy Romanian localisation.
- **"cofetărie" vs "patiserie"**: AGENTS.md says patisserie. Both are used; *cofetărie* skews to cakes/desserts, *patiserie* to savoury/baked goods. If we target both, list both — don't pick one and lose the other's self-recognition.

### 3.5 Trust signals that matter locally

Ranked by what the competitor set actually leads with:

1. **Fiscal / ANAF compatibility, stated plainly.** VilicoRest states *"Compatibilitate deplină cu casele de marcat fiscale"* and explains that ANAF transmission happens via the fiscal register. SmartBill leads on e-Factura / e-Transport / SAF-T. **This is the #1 anxiety.** Note the nuance we can exploit: per project memory, ANAF real-time transmission is handled by FiscalNet — so the honest and reassuring claim is *"funcționează cu casa ta de marcat fiscală, nu o înlocuiește"*.
2. **Scale numbers.** SmartBill: 170.000 clienți, 19 ani. FGO: 170.000 firme. FreyaPOS: 2.000+ companii, 20 ani. VilicoRest: 450+ restaurante. **We cannot compete here and must not fake it.** With 3 customers, the honest substitutes are: a named real customer with city and business type, a founder's name and face, and a specific verifiable claim.
3. **Support availability, stated as a number.** "7/7", "24/7", "răspuns în 2–5 minute", "15–30 de minute". Vague "suport dedicat" is worthless in this category; everyone claims it. State hours or state a response time.
4. **Named, real, local customers.** Ebriza shows 20+ logos; FreyaPOS names Berăria H, Patiseriile Luca. One real named café with a city beats ten stock photos.
5. **Romanian company registration + address + phone.** CUI, J-number, street address, landline. Cheap, and directly answers "is this a real company or someone's side project".
6. **Integrations with what they already use.** Ebriza leads with Bolt Food / Glovo / Wolt / **Saga**. Saga is the accountant's software. Per project memory we already export Saga C XML — **that is a top-tier trust signal we are currently under-selling.**

---

## 4. Concrete rewrite proposal

### 4.1 Current state

- **H1:** *"Seara știi exact câți bani ai făcut."*
- **Sub:** *"Vinzi ziua, închizi casa și vezi imediat ce a intrat, ce lipsește din stoc și ce trebuie cumpărat mâine."*
- **CTA labels in use:** `Deschide casa gratuit 15 zile`, `Începe trial 15 zile`
- **Under-CTA note:** *"Verificare card 1€ · Setup ghidat în aplicație · Anulezi oricând"*
- **Hero also renders 4 `trustSignals` cards**, which on a phone push the CTA toward or below the fold.

**Honest assessment:** the H1 is better than average — it's outcome-first, concrete, uses "tu", and avoids feature-speak. Its three weaknesses are (a) **no category clarity** — a cold visitor can't tell if this is a POS, an accounting tool, or a dashboard; (b) *"câți bani ai făcut"* is ambiguous between revenue and profit, and the ICP's real anxiety is the *discrepancy* and the *margin*, not the top line; (c) the card appears in the first screen, which is where the objection is most expensive.

### 4.2 Five alternative H1s

Each targets a different hypothesis. Don't ship all five — ship the one matching your traffic source.

**1. `Casa de marcat, stocul și raportul Z — într-un singur loc. Seara, sertarul se potrivește.`**
> **Why it beats the current one:** category clarity, which is the single biggest fix for cold ad traffic. The current H1 describes an outcome but never says what the product *is*; a visitor who can't categorise a product in 5 seconds bounces. This names the three things the owner already does daily, then delivers the outcome. Best for cold Google Ads traffic where intent is "program gestiune restaurant".

**2. `Seara, banii din sertar se potrivesc cu raportul. De fiecare dată.`**
> **Why it beats the current one:** it names the *discrepancy*, not the total. "Câți bani ai făcut" is something they can already guess. What actually keeps them up is whether the drawer matches — that's the moment of doubt about staff, about theft, about their own memory. "De fiecare dată" adds the reliability claim that is our stated core advantage. Most emotionally precise of the five.

**3. `Contabilul primește raportul Z, nu poze făcute pe fugă.`**
> **Why it beats the current one:** maximum ICP recognition. This is a literal description of what they do today — photographing Z reports and sending them on WhatsApp. Copy that describes the reader's actual behaviour outperforms copy that describes benefits, because it proves you know their job. It also smuggles in the accountant, who is often the real influencer on the purchase. Best for referral, organic, and outreach traffic where the reader already has some context.

**4. `Știi cât ai încasat, cât ai în sertar și cât îți rămâne de fapt.`**
> **Why it beats the current one:** it adds the **margin** dimension, which the current H1 omits entirely and which AGENTS.md names as half the core pain. The three-part rhythm escalates from easy (revenue) to hard (real margin), and *"de fapt"* does the competitive work — it implies their current numbers are wrong without insulting them. Best for the owner who already has a POS and is asking "why would I switch?".

**5. `Îl folosește și angajatul nou, din prima zi. Fără IT, fără contract pe 2 ani.`**
> **Why it beats the current one:** it leads with the two objections that actually kill this deal — "my staff won't manage it" and "I got burned by a locked contract that needed an IT guy". The current H1 sells the *reward*; this sells the *removal of risk*, which for a risk-averse, previously-burned buyer is the stronger motivator. Also directly contrasts with Ebriza's card-on-file auto-debit model. Best for retargeting and for the pricing page hero.

**My pick for the homepage: #2**, with #1's category line demoted to the subheadline. That combination gets both emotional precision and category clarity into the first screen.

### 4.3 CTA recommendation

**Recommended primary:**

> ## `Începe gratuit — fără card`

**Rationale:** imperative form matches the category norm (SmartBill's `Începe Acum Gratuit`); `gratuit` is the word that carries the decision; and `fără card` puts our single strongest differentiator versus Ebriza **inside the button**, where it pre-empts the objection before the click rather than after. Per §1.5, the button is the highest-leverage copy on the page and specificity beats generic — this is the most information-dense label available to us. Short enough for a full-width mobile button.

**Three alternatives to test:**

| Variant | Hypothesis being tested |
|---|---|
| `Vreau să încerc gratuit 15 zile` | First-person / endowment effect (§1.4), in its idiomatic Romanian form. Tests whether the ContentVerve result transfers to Romanian. |
| `Deschide prima casă în 10 minute` | Time-to-value framing. Tests whether *effort* is the binding objection rather than *cost*. |
| `Încearcă gratuit 15 zile` | Neutral control matching FGO/SmartBill convention. The baseline any winner must beat. |

**Secondary CTA:**

> `Vezi cum arată închiderea de zi (2 min)`

A no-signup, no-call product view — 2-minute screen recording or interactive walkthrough of the day-close. This occupies the unclaimed middle ground identified in §1.3 and is supported by the interactive-demo evidence (+63% conversions, HockeyStack). Render as a **text link with a play icon**, never a second solid button — competing equal-weight CTAs can cost up to 266% (§1.5).

**Persistent header contact (not a CTA):** WhatsApp icon + tap-to-call phone number, visible on mobile. Category norm per FreyaPOS; trust value per §3.2.

### 4.4 Exact microcopy under the CTA

**Recommended (card removed) — this is the version to ship:**

> **15 zile gratuit. Fără card, fără contract.**
> Te ajutăm să adaugi produsele și să faci prima vânzare — în aceeași zi.
> Suport în română, la telefon și pe WhatsApp. Renunți când vrei, dintr-un buton.

Covers all four required elements: trial terms (15 zile gratuit), card (fără card), cancellation (renunți când vrei, dintr-un buton), support language (în română, la telefon și pe WhatsApp). The middle line pre-empts the effort objection, which for this ICP is as strong as the price objection.

**Compact single-line variant for the sticky mobile CTA bar:**

> `15 zile gratuit · fără card · anulezi oricând`

**If the card is retained (fallback wording, §2.4):**

> **15 zile gratuit. Fără contract.**
> La început blocăm 1 leu pe card ca să confirmăm că ești o afacere reală — nu se încasează nimic și suma revine în câteva zile.
> Abonamentul nu pornește automat. Îți cerem acordul înainte de orice plată.

⚠️ **Only use the "blocăm / revine" wording if we actually switch to a €0 `SetupIntent` or a refunded charge.** Today it is a captured €1 in EUR, and that wording would be false. If it stays a real charge, the honest version is: *"Se încasează o singură dată 1 €, ca verificare. Atât. Abonamentul nu pornește fără acordul tău."*

**Also fix regardless of the card decision:** show **lei alongside euro** everywhere prices appear — *"de la 249 lei/lună (49 €)"*. The ICP budgets in lei. ⚠️ Verify the EUR/RON rate before shipping and decide whether to round or track it; I have not verified today's rate.

### 4.5 Recommended above-the-fold structure (mobile-first)

Budget: **~300–500px** before the fold (§1.7). Everything below is what must fit *above* it, in order.

```
┌─────────────────────────────────────┐
│ [logo]              [WhatsApp] [☎]  │  Sticky header, 48px.
│                                     │  Tap-to-call. Trust signal, not a CTA.
├─────────────────────────────────────┤
│ Pentru cafenele, restaurante și     │  Eyebrow, 13px, muted.
│ cofetării din România               │  Audience qualifier → instant "asta e
│                                     │  pentru mine". Do not skip this.
├─────────────────────────────────────┤
│ Seara, banii din sertar se          │  H1. Max 2 lines on a 375px screen.
│ potrivesc cu raportul.              │  Bold, 28–32px.
├─────────────────────────────────────┤
│ POS, stoc și raport Z pentru        │  Subhead, ONE sentence.
│ cafenele mici. Închizi ziua în      │  Carries the category clarity the H1
│ 5 minute, de pe telefon.            │  gives up. Names POS explicitly.
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │   Începe gratuit — fără card    │ │  Full-width primary. Min 48px tall.
│ └─────────────────────────────────┘ │  In the thumb zone. Must be above fold.
│  15 zile gratuit · fără card ·      │  Microcopy, 12–13px, directly beneath.
│  anulezi oricând                    │
├─────────────────────────────────────┤
│ ▸ Vezi cum arată închiderea de zi   │  Secondary as a TEXT LINK. Never a
│                                     │  second solid button.
├─────────────────────────────────────┤
│ ✓ Funcționează cu casa ta de        │  EXACTLY ONE credibility cue.
│   marcat fiscală                    │  This is the #1 local anxiety (§3.5).
└─────────────────────────────────────┘
     ↓ fold ↓
   [Z-report screenshot, cropped so the numbers are legible at 375px]
   [Named customer: "Dolce Nera, București"]
```

**Changes this implies to the current hero:**
- **Move the 4 `trustSignals` cards below the fold.** On a phone they are the main thing pushing the CTA down, and per §1.7 the CTA being above the fold matters more than any of them.
- **Remove `Verificare card 1€` from the first screen entirely.**
- **Exactly one solid button in the viewport.**
- Crop the hero screenshot to the **Z-report / day-close**, not the POS grid. The day-close is the promise in the H1; showing a product grid instead breaks message match.
- Delete the word "trial" from all customer-facing Romanian copy (§3.4).
- Normalise the whole file to "tu" (§3.3).

### 4.6 Objection → the copy that kills it

| # | Objection (as they'd actually say it) | Copy that kills it |
|---|---|---|
| 1 | *"De ce trebuie să dau cardul dacă zice că e gratuit?"* | **"Nu îți cerem cardul. Îți ceri contul, intri și vinzi. Cardul vine la sfârșit, doar dacă vrei să continui."** |
| 2 | *"Trebuie să-mi schimb casa de marcat?"* | **"Nu. franchisetech funcționează cu casa ta de marcat fiscală — nu o înlocuiește. Bonul fiscal se emite ca până acum, iar datele merg la ANAF prin casa de marcat, exact ca acum."** |
| 3 | *"Angajații mei nu o să se descurce."* | **"Grilă de produse, apeși, încasezi. Un ospătar nou vinde din prima zi, fără instruire specială. Dacă vrei, îl învățăm noi la telefon — gratuit."** |
| 4 | *"Am mai luat un program și a trebuit să chem un IT-ist."* | **"Nu ai nevoie de niciun IT-ist. Se deschide în browser, pe telefonul, tableta sau laptopul pe care le ai deja. Noi îți configurăm produsele — tu doar confirmi."** |
| 5 | *"N-am timp să introduc 200 de produse."* | **"Trimite-ne meniul — poză, Excel sau PDF. Îți încărcăm noi produsele și prețurile. Tu deschizi casa și vinzi."** |
| 6 | *"Dacă pică internetul, rămân blocat în plin serviciu?"* | **"POS-ul merge și fără internet. Vânzările se salvează local și se sincronizează singure când revine conexiunea. Nu pierzi niciun bon."** |
| 7 | *"49 € pe lună? Cât e asta în lei, și de ce în euro?"* | **"249 lei pe lună, TVA inclus. Fără taxă per angajat, fără cost de instalare, fără costuri ascunse."** ⚠️ verify rate + VAT treatment before publishing |
| 8 | *"Mă leagă vreun contract?"* | **"Fără contract și fără perioadă minimă. Plătești luna în curs și te oprești când vrei, dintr-un buton. Datele tale rămân ale tale și le poți exporta oricând."** |
| 9 | *"Contabilul meu lucrează pe Saga. O să-mi facă scandal."* | **"Exportăm direct în format Saga. Contabilul primește fișierul, nu poze de pe telefon — și te sună mai rar."** |
| 10 | *"E legal? Ce zice ANAF?"* | **"Bonul fiscal rămâne emis de casa ta de marcat, omologată ANAF. Noi nu atingem partea fiscală — îți dăm raportul Z, TVA-ul defalcat și vânzările, gata de trimis contabilului."** |
| 11 | *"Cine sunteți voi, de fapt? N-am auzit de voi."* | **"Companie românească, [CUI], [oraș]. Ne găsești la telefon, nu prin formular. Suportul e în română și răspunde un om, nu un robot."** ⚠️ insert real CUI/city |
| 12 | *"Cine îmi vede rețetele și cifrele?"* | **"Datele tale sunt ale tale. Nimeni din afara afacerii tale nu le vede, nu le vindem și le poți exporta sau șterge oricând. Servere în UE, conform GDPR."** ⚠️ confirm hosting region before publishing |
| 13 | *"Sunt deja pe Ebriza. De ce aș schimba?"* | **"Poți testa în paralel 15 zile, pe aceeași casă și cu aceeași echipă. Dacă seara nu se închide mai simplu, rămâi unde ești — nu ți-am cerut cardul."** |
| 14 | *"Și dacă mă blochez la ceva sâmbătă seara, în plin serviciu?"* | **"Ne suni. Suport în română, [ore], și pe WhatsApp. Nu ticket, nu formular — telefon."** ⚠️ state real hours; do not claim 24/7 unless true |

---

## 5. Prioritised action list

| # | Action | Effort | Expected impact | Priority |
|---|---|---|---|---|
| 1 | Remove the €1 card gate from the signup path; move card request to day 12 in-app | M | Highest — the ~5x volume lever | P1 (billing flow, needs approval + flag) |
| 2 | Rewrite the hero: H1 #2, new CTA, new microcopy, trustSignals below fold | S | High | P4 |
| 3 | Normalise all customer-facing Romanian to "tu"; delete "trial" → "perioadă de probă" / "gratuit" | S | Medium-high (trust) | P4 |
| 4 | Add lei alongside euro on all prices | S | Medium-high | P4 |
| 5 | Add phone + WhatsApp to the sticky mobile header | S | Medium-high (category norm) | P4 |
| 6 | Build the 2-minute "închiderea de zi" no-signup demo as secondary CTA | M | Medium-high | P4 |
| 7 | Add the fiscal-compatibility credibility line to the hero | XS | Medium | P4 |
| 8 | Surface the Saga export as a homepage trust signal | XS | Medium | P4 |
| 9 | Publish CUI, address, phone in the footer | XS | Medium | P4 |
| 10 | Set up the funnel metric as `subscription_created per 1000 visitors`, not trial→paid, before shipping #1 | S | Prevents a false-alarm revert | P1 |

**Data hygiene issue found in passing:** `lib/marketing/i18n/ro.ts:447` states *"Multi-locație €109/lună"*, but `AGENTS.md` specifies **€99/location/mo**. One of these is wrong and it is on a public pricing page. Worth resolving before any pricing-copy work.

---

## 6. Sources

**Trial / card gate**
- [Chargebee — SaaS Free Trial: Credit Card Or No Credit Card](https://www.chargebee.com/blog/saas-free-trial-credit-card-verdict/) (Totango data)
- [PhoneBurner — What removing credit cards from our SaaS signup did to our revenue](https://www.phoneburner.com/blog/what-removing-credit-cards-from-our-saas-signup-did-to-our-revenue)
- [ProductLed — One Crazy Way to Boost Your Free Trial Signups](https://productled.com/blog/free-trial-signups)
- [LeadSync — Why SaaS Companies Are Ditching Credit Card Requirements](https://leadsync.me/blog/ditching-credit-card-requirements-for-free-trials/)
- [Growthspree — B2B SaaS Trial-to-Paid Benchmarks 2026](https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card)
- [Baremetrics — Trial Conversion Rate](https://baremetrics.com/blog/trial-conversion-rate-metrics-explained)
- [Userpilot — SaaS Average Conversion Rate](https://userpilot.com/blog/saas-average-conversion-rate/)

**CTA / copy**
- [Unbounce — What Makes a Great CTA](https://unbounce.com/conversion-rate-optimization/cta-copy-critiqued-for-conversion/)
- [Kissmetrics — CTA Button Best Practices](https://kissmetrics.io/blog/cta-button-best-practices)
- [Disruptive Advertising — Effective CTAs](https://disruptiveadvertising.com/blog/landing-pages/effective-ctas/) (ContentVerve first-person test)
- [Matt Lerner — "Book a demo" conversion](https://www.linkedin.com/posts/matthewlerner_ive-never-seen-book-a-demo-convert-more-activity-7183393459230134274-C12j)
- [HowdyGo — Your "Book a Demo" button is losing conversions](https://www.howdygo.com/blog/your-book-a-demo-button-is-losing-conversions)
- [Userpilot — Free Trial vs Demo](https://userpilot.com/blog/free-trial-vs-demo-saas/)
- [Omniconvert — Above the Fold Design](https://www.omniconvert.com/blog/above-the-fold-design/)
- [Evoke — Above the Fold Design Guide](https://madebyevoke.com/blog/above-the-fold-design-guide)
- [River — Guarantee / risk-reversal templates](https://rivereditor.com/blogs/guarantee-risk-reversal-paragraphs-remove-90-percent-objections)
- [ActiveCampaign — Microcopy](https://www.activecampaign.com/blog/microcopy)

**Payments / Romania**
- [ThePaypers — Romania 2025 payments and ecommerce trends](https://thepaypers.com/payments/expert-views/romania-2025-analysis-of-payments-and-ecommerce-trends)
- [ecommerceGermany — European Ecommerce Overview: Romania](https://ecommercegermany.com/blog/european-ecommerce-overview-romania/)
- [Stripe — A guide to payments in Romania](https://stripe.com/resources/more/payments-in-romania)
- [Ravelin — Guide to PSD2, SCA & 3D Secure](https://www.ravelin.com/insights/ultimate-guide-psd2-strong-customer-authentication)
- [GPayments — 3D Secure and PSD2 SCA](https://www.gpayments.com/blog/article/3d-secure-and-psd2-strong-customer-authentication-a-guide-for-european-and-uk-psps/)

**Trust signals**
- [Gourmet Ads — Phone Number Boosts Conversions](https://www.gourmetads.com/articles/phone-number-boosts-ecommerce-conversions/)
- [Scalify — Website Trust Signal Statistics 2026](https://www.scalify.ai/blog/website-trust-signal-statistics-what-makes-visitors-stay-2026)

**Competitors (fetched directly, 2026-08-25)**
- [Ebriza](https://www.ebriza.com/) · [SmartBill](https://www.smartbill.ro/) · [FGO](https://www.fgo.ro/) · [FreyaPOS](https://freyapos.ro/) · [VilicoRest](https://vilicorest.ro/)

**Internal files referenced**
- `/Users/abdishakuurally/projects/franchisetech/lib/marketing/i18n/ro.ts`
- `/Users/abdishakuurally/projects/franchisetech/lib/billing/plans.ts`
- `/Users/abdishakuurally/projects/franchisetech/AGENTS.md`

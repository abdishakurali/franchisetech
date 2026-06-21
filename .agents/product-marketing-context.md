# franchisetech — Product Marketing Context (Romania-first)

Last updated: 2026-06-20

## Product summary

**franchisetech** is a browser-based cloud workspace for food businesses: POS register, kitchen display, stock & purchases, recipe costing, till close, and owner reports. Not payments-first POS — **operations-first** control for owners who need sales, cash, stock, and margins in one place.

**Positioning line (outreach v2):** „Workspace în browser pentru afaceri cu mâncare — nu doar plăți: casă, stoc, rețete și rapoarte.”

**Primary GTM market (Q2 2026):** Romania — cafenele, restaurante mici, takeaway/patiserie, operatori 2+ locații.

**Site:** franchisetech.ro (locales: en, ro, it)

---

## Ideal customer profile (Romania)

| Attribute | Detail |
|-----------|--------|
| **Role** | Proprietar, manager, administrator |
| **Business** | Cafenea, restaurant (10–80 locuri), takeaway, patiserie, lanț mic 2–5 locații |
| **Size** | 3–25 angajați, 1–2 locații (segment D: 2+) |
| **Geography** | București, Cluj-Napoca, Timișoara, Iași, Brașov, Constanța |
| **Current stack** | Casă veche + Excel, SmartBill/Saga parțial, POS plăți fără stoc/rețete |
| **Trigger events** | Deschidere locație nouă, schimb casă fiscală, audit/contabil cere NIR/TVA clar, marje „invizibile”, casa nu se potrivește cu sertarul |

### Jobs to be done

- **Functional:** Vinde rapid, închide casa corect, urmărește stoc/NIR, vezi marja pe rețete, raport Z pentru contabil
- **Emotional:** Să știu la finalul zilei ce s-a întâmplat — nu luna viitoare de la contabil
- **Social:** Să par profesionist față de parteneri/contabil; echipa folosește un singur sistem

### Top pains (RO language)

- „Casa nu se potrivește cu sertarul după program”
- „Marjele stau în Excel — nu știu dacă un produs chiar câștigă”
- „Surprize de stoc în timpul serviciului”
- „POS, gestiune și bonuri fiscale în sisteme diferite”
- „Taxă per angajat la alte soluții”

### Alternatives considered

- Excel + casă fiscală tradițională
- SmartBill / Saga (facturare + parțial POS)
- Square / SumUp class (plăți-first, fără stoc/rețete adânc)
- „Facem așa cum am făcut mereu”

### Objections

| Objection | Response |
|-----------|----------|
| Am deja SmartBill/Saga | Trial 15 zile paralel — POS + stoc + rețete în același flux zilnic |
| FiscalNet e complicat | Ghid pas cu pas; contabilul verifică; Multi-location + integrare când e activată |
| E scump | €79/lună Pro vs POS + inventar + 3h/săptămână reconciliere; personal nelimitat |
| Nu am timp | Setup asistat €199 — produse, plăți, prima vânzare ghidată |

---

## Ideal partner profile (Romania)

| Archetype | Why they fit |
|-----------|--------------|
| Contabil / consultant HORECA | Clienți au nevoie de NIR, TVA, raport Z — venit recurent + setup |
| Reseller casă fiscală / POS | Stack complet dincolo de hardware; 20% recurent |
| Consultant FiscalNet | Multi-location + ghid `/help/romania-fiscalnet` |
| Integrator software gestiune | Clienți depășesc Excel; POS browser + stoc |
| Operator multi-site / franciză mică | €99/locație, raport central |

### Partner economics (from product)

- **~20% recurring** on active subscriptions (referral/reseller)
- **Setup fee €199** one-time — partners who onboard keep **~€100–150** per setup
- Volume partners: wholesale ~20% off list (discussed case-by-case)
- franchisetech runs: platform, hosting, updates, core support
- Partner runs: sales, local onboarding, relationship

---

## Pricing (source: `lib/billing/plans.ts`)

| Plan | Price | Best for |
|------|-------|----------|
| Starter | €39/mo | Casă + produse + raport Z — cafenea simplă |
| Pro | €79/mo | Stoc, rețete, bucătărie, sertar — restaurant/takeaway |
| Multi-location | €99/loc/mo | 2+ locații, FiscalNet când e activat |
| Assisted setup | €199 one-time | Configurare ghidată |
| Trial | 15 days assisted | Fără card pentru deschiderea casei |

**Value metric:** per shop / per location — **not** per seat.

---

## Romania-specific proof (use honestly)

- NIR purchase receiving (14-3-1A) on Pro/Multi
- TVA rates per product (19%, 9%, 5%, 0%)
- FiscalNet integration guide: `/help/romania-fiscalnet` (Multi-location; requires provider credentials + accountant sign-off)
- 15-day assisted trial with human setup help
- Unlimited staff — no per-user fees
- Browser POS — no hardware lock-in

## Do NOT claim

- Invented customer quotes or fake metrics
- 99.9% uptime without verified data
- ANAF certification or legal/fiscal guarantee
- That franchisetech replaces accountant or legal obligations

## Beta / early-stage messaging

Use: „Program pentru primii operatori și parteneri din România” — assisted onboarding, direct founder/partner support.

---

## Outreach links (UTM)

**v2 relaunch (correct sender info@franchisetech.ro):**

**Customers:**
`https://franchisetech.ro/signup?plan={starter|pro|multi_location}&lang=ro&utm_source=zoho&utm_campaign=ro-customer-q2-r2&utm_content={company_slug}`

**Partners:**
`https://franchisetech.ro/partners?lang=ro&utm_source=zoho&utm_campaign=ro-partner-q2-r2&utm_content={company_slug}`

**Sender:** info@franchisetech.ro (Franchise Tech). v1 sends from wrong account archived — do not reuse `ro-customer-q2` / `ro-partner-q2` UTMs for new sends.

---

## Voice (RO cold email)

- Peer tone, not vendor pitch
- Observation → problem → one proof → interest CTA
- Subject: 2–4 words, lowercase (`casa după program`, `parteneriat HORECA`)
- One link only; plaintext; opt-out line required (GDPR B2B)

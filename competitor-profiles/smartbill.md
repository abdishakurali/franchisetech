# SmartBill — Competitor Profile

**URL**: https://www.smartbill.ro
**Generated**: 2026-06-20
**Depth**: Marketing scrape (public pages, no login)
**Market**: Romania (B2B invoicing, stock management, fiscal compliance)
**Parent**: VISMA (Norway) — infrastructure on AWS

---

## Raw Data Sources

- `competitor-profiles/raw/smartbill/2026-06-20/scrapes/homepage.md`
- `competitor-profiles/raw/smartbill/2026-06-20/scrapes/pricing.md`
- `competitor-profiles/raw/smartbill/2026-06-20/scrapes/features.md`

Pages scraped: homepage, `/preturi`, `/produse/facturare`, `/gestiune`, `/e-factura`.
Note: `/functionalitati` returned 404; features compiled from product pages above.

---

## At a Glance

| Metric | Value |
|--------|-------|
| Tagline | „Cel mai folosit program de facturare si gestiune” |
| Experience | 19 ani (founded ~2007) |
| Customers claimed | 170.000 firme |
| Volume claimed | 6,9M facturi/luna; 48 mld € facturati/an |
| e-Factura volume claimed | 9M e-Facturi trimise |
| Entry price (Facturare) | **Silver: 5,84 €/luna + TVA** (30 facturi, 1 user) |
| Entry price (Gestiune) | **16,32 €/luna + TVA** (2 users) |
| New company offer | **12 luni gratuit** — Platinum sau Gestiune Plus |
| Trial | 30 zile gratuit, fara obligatii |
| Mobile | iOS + Android native apps |
| Fiscal hardware | Conectare casa de marcat; SmartBill POS (licenta separata per dispozitiv) |
| Support | Email, telefon (031.710.4215), chat; ~30+ Customer Care |

---

## Positioning & Messaging

**Primary value proposition**: Romania’s #1 online invoicing and stock program — solve e-Factura, SAF-T, invoicing, collections, and (optionally) inventory in one cloud app, with extreme ease of use.

**Target audience**: Romanian SMEs broadly — PFA, II, IF, SRL — including startups (12-month free), freelancers, retailers, wholesalers, e-commerce, and businesses needing ANAF compliance. Testimonials span medical, courier, accounting firms, not HORECA-specific.

**Positioning angle**: Compliance-first + simplicity + trust (VISMA/Amazon). „Magia SmartBill” — invoice in 30 seconds, no accounting knowledge required.

**Key messaging themes**:
- e-Factura / e-Transport / SAF-T handled — „uiti de grija e-Factura”
- Two product lines: **Facturare** (documents + collections) vs **Gestiune + Facturare** (stock + NIR + POS)
- Mobile-first invoicing (+588% mobile billing growth cited)
- Aggressive startup hook: 12 months Platinum/Gestiune Plus free for year-one companies
- Price anchoring: „cat un bilet la cinema” (Silver); gestiune „3% din salariul minim”

---

## Product Architecture: Facturare vs Gestiune

SmartBill sells two parallel product families on one platform:

### SmartBill Facturare (from 5,84 €/luna + TVA)

**Purpose**: Emit and collect on fiscal documents without full stock operations.

**Includes**: Facturi, proforme, avize, chitante, e-Factura emit/receive (tiered limits), registru de casa, cheltuieli furnizori, rapoarte standard/premium, case de marcat connection, mobile apps.

**Tiers**: Silver (30 facturi, 1 user) → Gold (100 facturi, 3 users, recurenta) → Platinum (unlimited, API, e-commerce plugins).

**Best for**: Service businesses, low invoice volume, accountants’ clients who only need compliant billing.

### SmartBill Gestiune + Facturare (from 16,32 €/luna + TVA)

**Purpose**: Stock ledger + sales documents + optional production and POS.

**Includes**: Everything needed for NIR, multi-warehouse stock, inventar, bon consum/transfer, profit per produs, SAF-T stocuri, barcode, import extrase bancare, SmartBill POS, case de marcat, e-Factura (higher receive limits).

**Tiers**: Gestiune → Gestiune Plus (+ API, stoc minim alerts, rotatie/vechime stoc, e-commerce plugins).

**Add-ons**: Modul productie (8,16 €/luna), e-Transport (de la 1,99 €/luna), e-commerce optional.

**Best for**: Retail, wholesale, light manufacturing, businesses that invoice from stock movements.

### Overlap and upsell path

- Gestiune bundles facturare; Facturare alone does **not** include NIR, inventar, or recipe/production depth.
- Homepage presents both as equal entry points; gestiune is ~3× the Silver price.
- Sedii secundare (locations): separate subscription at 60% of plan price each — can mix plan types.

---

## e-Factura (RO)

**Status**: Core differentiator; marketed as included in all current plans (not a separate fee).

**Capabilities**:
- SPV authorization via qualified digital certificate; auto re-auth every 90 days
- Emit, send (manual / bulk / auto), receive, store beyond SPV’s 60-day retention
- XML validation before send; 99,9% validation rate claimed
- Partner data auto-fill; UM mapping; TVA regime handling (SDD, SFDD, reverse charge, export)
- NC/CPV codes for high fiscal-risk products

**Plan limits on receiving e-Facturi** (important for restaurants buying from many suppliers):

| Plan | Primire e-Facturi/luna |
|------|------------------------|
| Silver | 5 |
| Gold | 15 |
| Platinum | 50 |
| Gestiune | 100 |
| Gestiune Plus | 150 |

**B2C**: Obligatory from 1 Jan 2025 — SmartBill positions for all operators, not just VAT payers.

---

## Pricing Summary

| Plan | Price (EUR + TVA/luna) | Users | Facturi | Key limit |
|------|------------------------|-------|---------|-----------|
| **Silver** | **5,84** | 1 | 30 | e-Factura primire 5/luna |
| Gold | (not on summary table — between Silver/Platinum) | 3 | 100 | e-Factura primire 15/luna |
| Platinum | (higher — trial default) | Unlimited | Unlimited | e-Factura primire 50/luna |
| **Gestiune** | **16,32** | 2 | Bundled | Stock + POS + SAF-T stocuri |
| **Gestiune Plus** | **23,84** | 2+ | Bundled | + API, advanced stock analytics |
| Extra user (Facturare) | 1,5 | — | — | — |
| Extra user (Gestiune) | 5,5 | — | — | — |
| SmartBill POS | Separate license per device | — | — | Not included in base gestiune price |
| Punct de lucru | 60% of plan | — | — | Own subscription |

**Promotions**:
- **12 luni gratuit**: Companies in first year after incorporation → Platinum or Gestiune Plus, all features
- PFA/II/IF: 50% off year 1 when paying 12 months with Visa (until 31 Dec 2026)
- 30-day free trial on paid tiers

---

## Mobile & Fiscal Receipt (Casa de Marcat)

**Mobile apps (iOS/Android)**:
- Emit invoices, send e-Factura, collections, business reports
- Android: connect cash registers and mobile printers — fiscal receipts or print invoices/receipts in the field
- Gestiune: mobile sales update stock

**Cash register / fiscal**:
- „Conectare la casa de marcat” on Facturare Silver+ and all Gestiune plans
- **SmartBill POS** — separate product; each installed device needs its own license/subscription
- Marketing frames POS as simple alternative to expensive hardware; not positioned as full restaurant POS (no table service, kitchen display, or HORECA workflow language on scraped pages)

**FiscalNet**: No mention on scraped pages — SmartBill uses its own POS + cash register integration story, not FiscalNet specifically.

---

## Strengths (vs franchisetech)

| Area | SmartBill strength |
|------|-------------------|
| **Brand & trust** | 170k customers, 19 years, VISMA backing, 98% recommendation claim |
| **e-Factura / compliance** | Deep ANAF integration, SAF-T, e-Transport, legal updates, accountant ecosystem (SmartBill Conta) |
| **Price (invoicing)** | Silver at 5,84 €/mo undercuts almost everything for pure billing |
| **Startup offer** | 12 months free Platinum/Gestiune Plus is a strong acquisition wedge |
| **Ease of use** | Consistently praised; 30-second invoice narrative |
| **Mobile invoicing** | Mature iOS/Android apps for owner-operator billing on the go |
| **Stock (retail/wholesale)** | NIR auto from e-Factura, multi-warehouse, profit per product, SAF-T stocuri |
| **e-commerce** | Plugins (WooCommerce, PrestaShop, etc.), eMAG/FashionDays flow |
| **Support** | Large Customer Care team, phone/chat/email |

---

## Gaps & Weaknesses (HORECA / daily operations — franchisetech opportunity)

| Area | SmartBill gap | franchisetech angle |
|------|---------------|---------------------|
| **Product positioning** | Invoicing/stock/accounting software — **not** „close the day” HORECA operations | „Close the day with truth” — till session, expected vs counted cash, Z-report |
| **POS / till workflow** | SmartBill POS is add-on with per-device license; pages describe fiscal receipt emission, not shift-based register UX | Browser POS with products, cart, refunds, till open/close as core loop |
| **Recipe / food costing** | Gestiune has „modul productie” (recipes, BOM) as **paid add-on** (8,16 €/mo) — retail/manufacturing framing, not café menu margins | Recipe builder, cost per portion, margin, can-make counts built for food |
| **Kitchen / service** | No table service, KDS, course firing, or front-of-house language on scraped pages | Restaurant/café daily service flows (if in scope) |
| **Purchases for food ops** | Supplier payments and NIR yes; not positioned around ingredient purchasing rhythm for restaurants | Purchases, suppliers, low-stock for kitchen ingredients |
| **HORECA-specific reports** | Profit per product, TVA, vanzari pe agent — generic business reports | Z-report, margins, stock for food businesses, owner daily summary |
| **Fiscal (RO HORECA)** | Casa de marcat connection; no FiscalNet mention in marketing scrape | FiscalNet integration when configured (local agent model) |
| **Pricing model for staff** | Per-user fees on top of base (1,5–5,5 €/user); POS per device | Unlimited staff on paid plans |
| **Invoice volume limits** | Silver capped at 30 facturi/luna — cafés with many B2C receipts may need higher tier | POS records sales as transactions, not monthly invoice caps |
| **e-Factura receive caps** | Low on cheap tiers (5/month Silver) — food businesses with many suppliers hit limits | Different product category — not invoice-receive limited |
| **Activation story** | Accountant/owner sets up billing compliance | Trial → till open → first sale → Z-report funnel |
| **ICP clarity** | All Romanian SMEs | Explicit: 1–3 location food businesses (café, restaurant, takeaway) |

---

## Competitive Summary for franchisetech

**SmartBill is not a direct POS replacement** — it is Romania’s default cloud layer for **fiscal documents, e-Factura, and retail-style stock**. A HORECA owner may already use SmartBill (or be pushed by their accountant) for e-Factura and supplier invoices.

**Where SmartBill wins**: Compliance breadth, brand, price for pure invoicing, accountant integrations, e-Factura depth, startup free year.

**Where franchisetech wins**: Daily food operations — POS till sessions, cash reconciliation, recipe/margin visibility, ingredient stock and purchases, Z-report as owner trust moment, unlimited staff, FiscalNet path for existing RO fiscal setups.

**Positioning line**: SmartBill helps you stay legal on paper; franchisetech helps you **know if today’s service actually made money**.

**Overlap to monitor**: SmartBill Gestiune + POS + modul productie encroaches on stock/recipe territory at lower headline price (16–32 €/mo + add-ons) but without HORECA-native UX or till-close narrative.

---

## Sources & Freshness

| Page | URL | Status |
|------|-----|--------|
| Homepage | https://www.smartbill.ro | OK |
| Pricing | https://www.smartbill.ro/preturi | OK |
| Facturare | https://www.smartbill.ro/produse/facturare | OK |
| Gestiune | https://www.smartbill.ro/gestiune | OK |
| e-Factura | https://www.smartbill.ro/e-factura | OK |
| Features (legacy) | https://www.smartbill.ro/functionalitati | 404 |

Verify pricing and promotions before publish — Visa 50% offer expires 31 Dec 2026 per pricing page.

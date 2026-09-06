# High-Traffic Page Redesign Prompts — mobile-first

Measured from PostHog, last 60 days, 2026-08-31. Read section 1 before choosing what to work on:
**the page absorbing almost all your traffic is not one of the pages that gets talked about.**

---

## 1. What the traffic actually is

| Cluster | Views | People | Pages | Mobile |
|---|---:|---:|---:|---:|
| **`/lp/*` landing pages** | **1,987** | **1,846** | 7 | **98%** |
| `/blog/*` | 228 | 185 | 48 | 69% |
| `/features/*` | 70 | 40 | 9 | 23% |

Inside the LP cluster, a single page is essentially all of it:

| Page | Views | People | Mobile |
|---|---:|---:|---:|
| **`/lp/raport-z-casa-de-marcat`** | **1,922** | **1,788** | **99%** |
| `/lp/raport-x-casa-de-marcat` | 26 | 25 | 50% |
| `/features/qr-code-receipts` | 17 | 16 | 47% |
| `/blog/bon-fiscal-obligatoriu-cand-si-cum` | 36 | 32 | 69% |

**`/lp/raport-z-casa-de-marcat` is ~74× the traffic of `/lp/raport-x` and ~113× `/features/qr-code-receipts`.**

### The number that matters

Of the **1,788 people** who landed on `/lp/raport-z-casa-de-marcat`:

- **1,772 (99%) viewed that one page and left.**
- **7 (0.39%)** ever reached `/signup`.
- **8 (0.45%)** ever reached `/pricing`.

100% of that traffic is paid Facebook (`utm_campaign=soft_pos_gestiune`), 99% mobile, and
`m.facebook.com` alone accounts for 852 views — meaning most arrive **inside the Facebook in-app
browser on a phone**.

You are paying to send ~1,800 mobile Romanians to a page that 99% of them leave without a single
click. Fixing this one page is worth more than every other page on the site combined.

**Priority order: (A) the LP template — especially raport-z, (B) the blog template, (C) feature pages.**

---

## 2. Shared rules for all three prompts

- **Design at 390×844 first.** Desktop is an afterthought here — 98% of LP traffic and 69% of blog
  traffic is mobile.
- **Assume the Facebook in-app browser**: no autofill, awkward viewport height, users one tap from
  swiping back to their feed. Nothing may depend on hover.
- **Minimum touch target 44px.** One thumb, one hand.
- **The trial is 15 days and needs no card.** Never imply payment details are required.
- Romanian, formal register (*dumneavoastră*). Prices €49 / €79 per location per month, VAT excluded.
- **Never invent capability.** No delivery-platform integrations (Glovo/Bolt/Tazz are not offered),
  no KDS, no table plans, no loyalty, no certification or uptime claims.
- Every factual claim must be checkable against `lib/billing/plans.ts` and `lib/billing/market.ts`.

---

## PROMPT A — Landing page template (do this first)

> You are redesigning `/lp/raport-z-casa-de-marcat`, the single page that receives 87% of
> FranchiseTech's public traffic: **1,788 visitors in 60 days, 99% on mobile, 100% from a Facebook
> ad, and a 99% bounce rate.** Seven of those 1,788 people ever reached the signup page.
>
> The visitor is a Romanian café/shop owner who tapped an ad about "Raport Z casă de marcat" while
> scrolling Facebook on their phone. They are in the Facebook in-app browser. They have a specific
> worry — the daily Z report and whether their till reconciles — and roughly four seconds of
> patience. They are not browsing a software company; they are checking whether this solves a
> problem they already have.
>
> **What exists today** (`components/marketing/RaportZLandingRedesign.tsx`, 309 lines, rendered
> inside `MarketingShell`):
> - Full marketing header — logo, 4 nav links, an industry dropdown — and the full 4-column footer.
>   Every one of those is an exit route from a page whose only job is one conversion.
> - Seven stacked sections before the page ends: hero, three explainer blocks, an FAQ, a trust
>   strip, a closing CTA.
> - The H1 is "Raport Z Casă de Marcat" — the ad's keyword restated, not an answer.
>
> **Diagnose before you design.** A 99% single-page rate on matched-intent paid traffic is not a
> styling problem. Work out what is missing in the first viewport and design for that.
>
> **Design:**
> 1. **The first viewport at 390×844.** Decide exactly what occupies it. The visitor must, without
>    scrolling, understand what they get and be able to act. Show the actual Z report — this
>    audience recognises it instantly and it is more persuasive than any sentence.
> 2. **One action, repeated.** Decide the single action worth asking for. Consider that "start a
>    trial" may be too large a first step for this traffic — a lower-commitment action (see the Z
>    report, leave a phone number for a callback) may convert far better. The contact form is now
>    **one field: a phone number** (`components/marketing/ContactForm.tsx`) — a callback ask is
>    genuinely cheap here.
> 3. **Strip the exits.** Propose what the header and footer should be on a paid landing page.
>    Justify anything you keep.
> 4. **Sequence for a thumb.** How many screens of scroll before the decision, and what earns each one.
> 5. **A sticky action** that stays reachable without hiding content, safe-area-inset aware.
>
> **Produce:** mobile screens at 390×844 for the full scroll; the first viewport called out
> separately; the sticky CTA in both states; a desktop 1440 version; and a short rationale tying
> each change to the 99% bounce. Also state which changes should generalise to the other six
> `/lp/*` pages via the shared template, and which are specific to Raport Z.

---

## PROMPT B — Blog template (second priority)

> You are redesigning the blog article template for FranchiseTech (`app/blog/[slug]/page.tsx`),
> which renders **~100 Romanian SEO articles**. In the last 60 days, 48 distinct posts drew 228
> views from 185 people at **69% mobile**. No individual post is large — the leverage is the
> template, applied ~100 times.
>
> Representative posts, all fiscal-anxiety queries:
> `/blog/bon-fiscal-obligatoriu-cand-si-cum` (36 views) ·
> `/blog/cum-anulezi-un-bon-fiscal-emis-gresit` (23) ·
> `/blog/ce-este-raportul-z-si-cum-il-faci` (20) ·
> `/blog/program-legal-de-lucru-horeca-romania` (16) ·
> `/blog/raport-x-vs-raport-z-diferenta` (14)
>
> This reader arrived from search with a **compliance worry**, not shopping intent: *is this
> mandatory, am I doing it wrong, will I be fined?* They want an answer. Selling to them before
> answering will lose them — but sending them away with the answer and nothing else wastes every
> one of these visits.
>
> **Design:**
> 1. **A mobile reading experience that respects the question** — answer visible early, scannable
>    structure, comfortable line length and type scale at 390px. Long Romanian legal terms must not
>    overflow.
> 2. **The conversion moment.** Decide where a product mention belongs *after* the answer is
>    delivered, and what it should say. It must be specific to the article's problem — a post about
>    cancelling a mis-issued receipt should not carry the same generic CTA as one about working hours.
> 3. **What comes next.** Related articles, or a single next step — decide which, and defend it.
> 4. **Trust markers** appropriate to legal/fiscal content: last-updated date, what the article is
>    and is not (it is not legal advice), and where the rules come from.
>
> **Constraint:** these articles cite Romanian fiscal rules. The design must make it easy to show a
> "verified on <date>" signal, because the underlying law changes and stale advice is a liability.
>
> **Produce:** the mobile article template at 390×844 (top, mid-article CTA, end); a desktop 1440
> version; the in-article CTA in at least two topical variants; and a specification of which parts
> are fixed template versus per-article content.

---

## PROMPT C — Feature page template (lowest priority)

> You are redesigning the feature-detail template (`app/features/[slug]/page.tsx`), using
> `/features/qr-code-receipts` as the worked example.
>
> **Be aware of the scale before investing effort:** this page drew **17 views from 16 people** in
> 60 days, and the whole `/features/*` cluster drew 70 views. It is ~1/113th of the Raport Z
> landing page. It is also the only cluster that is majority *desktop* (23% mobile) — a different
> visitor: someone already evaluating the product, comparing capabilities, probably at a laptop.
>
> Only five feature pages are publicly reachable (`pos`, `z-report`, `offline`,
> `setup-onboarding`, `qr-code-receipts` — see `lib/product-scope.ts`); the rest of the data file
> is not linked anywhere.
>
> **Design:** a template that explains one capability honestly to an evaluating reader — what it
> does, what it does not do, which plan it belongs to (Core €49 / Operations €79), and what it
> requires (for fiscal features: compatible hardware and FiscalNet running locally on the cashier
> device — the cloud never drives the fiscal hardware directly).
>
> **Produce:** desktop 1440 primary, mobile 390 secondary (inverting the priority of prompts A and
> B, deliberately), and a clear pattern for the "what this does not do" block — that honesty is a
> differentiator against competitors who list everything as available.

---

## 3. Before designing anything, know this

Two facts that constrain what a redesign can achieve:

1. **Attribution is not landing.** The Facebook traffic carries `utm_campaign=soft_pos_gestiune`,
   but every organisation in the database has `acquisition_source = NULL`. Signups from this
   campaign are currently unattributable, so you cannot measure whether a redesign worked. Verify
   the UTM capture end-to-end first — otherwise you are redesigning blind.
2. **The bounce may not be the page's fault alone.** The ad promises "Raport Z casă de marcat".
   If the ad creative sets an expectation the page does not immediately meet, no layout fixes that.
   Compare the live ad creative against the page's first viewport before assuming the page is wrong.

## 4. Reference files

- `app/lp/[slug]/page.tsx` — LP routing; `raport-z` and `raport-x` get purpose-built components
- `components/marketing/RaportZLandingRedesign.tsx` — the page to fix first
- `components/marketing/SkagLandingShell.tsx` — generic template for the other five LPs
- `lib/marketing/skag-landing-pages.ts` — LP copy and slugs
- `app/blog/[slug]/page.tsx`, `lib/marketing/blog.ts` — blog template and ~100 posts
- `app/features/[slug]/page.tsx`, `lib/marketing/seo.ts` — feature template and content
- `components/marketing/ContactForm.tsx` — the one-field phone callback form
- `components/marketing/MarketingHeader.tsx` / `MarketingFooter.tsx` — the shell, and the exits

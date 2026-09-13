# Simplified Homepage Design

## Objective

Make the FranchiseTech homepage easier for a Romanian food-business owner to understand and act on within one screenful, while retaining the current photographic café identity.

## Direction

Use the supplied project artifact as visual and content reference only. Keep the live site's café photography, typography, localization, SEO, analytics, and mobile-first behavior. Reduce the homepage to five conversion-focused sections and move secondary education to existing dedicated pages.

## Information architecture

1. **Hero** — one outcome-led promise, one short supporting sentence, one primary trial CTA, one secondary product CTA, and the existing café photograph.
2. **Product proof** — one large product visual with a compact four-item selector for POS, stock, recipe cost, and reports. Avoid explanatory paragraphs above and below it.
3. **Four connected benefits** — sales, live stock, real margins, and end-of-day truth. Each benefit gets a short title and one sentence; no nested feature lists.
4. **Customer proof** — one credible café story, a small set of verified operating metrics, and the existing customer video where available.
5. **Pricing and final CTA** — Starter and Pro presented together, followed immediately by one trial CTA and the minimum pricing qualification.

## Content hierarchy

The hero should answer: what it is, who it is for, and why it matters. Recommended Romanian message: “POS și gestiune pentru un local care vrea să știe ce îi rămâne.” Supporting copy connects sales, stock, recipe costs, margins, and close-of-day reporting without enumerating every module.

The primary CTA remains the 15-day assisted trial. The secondary CTA scrolls to product proof. Claims must stay within current product behavior; offline and fiscal printing limitations must not be elevated into hero messaging.

## Visual system

- Retain the current full-bleed café hero photograph and dark overlay.
- Use the existing blue action color, warm white surfaces, dark neutral text, and current display/body fonts.
- Prefer open composition and strong type hierarchy over bordered cards.
- Use one dominant product image at a time.
- Keep section transitions quiet; avoid decorative gradients, icon walls, carousels, and dense anchor navigation.

## Responsive behavior

Mobile uses a single column, full-width CTAs, horizontally scrollable product selectors when needed, and no content hidden behind hover. Desktop uses a two-column hero and customer-proof section. Tap targets remain at least 44px and headings use balanced wrapping.

## Retained behavior

- Romanian/English locale switching and equivalent localized content.
- Existing signup route and CTA analytics.
- Existing product imagery and video facade.
- Existing metadata and structured data.
- Accessible tabs, keyboard interaction, reduced-motion behavior, and semantic headings.

## Removed from homepage

The quick-link navigation, standalone offline section, language section, hardware catalogue, full FAQ, and extended pricing explanation move to their existing feature, hardware, support, or pricing destinations. The homepage may link to those destinations from the footer or compact contextual links.

## Validation

Add component tests for section order, primary CTA destination, locale parity, and removed homepage-only content. Verify at mobile and desktop widths, run the relevant tests and lint/type checks, and confirm analytics callbacks remain attached.

## Research reference

Lazyweb reference set: https://www.lazyweb.com/agentic-search/86a10418-7ab5-42af-85f9-0869fc0927ef

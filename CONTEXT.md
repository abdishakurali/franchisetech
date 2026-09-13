# franchisetech Marketing Site

The public-facing marketing/acquisition site (`app/(marketing pages)`), as distinct from the logged-in product at `/app/*`.

## Language

**Field system**:
The current visual design system for the marketing site (2026-09) — dark ink bands (`#0D0F0E`) with a blue radial glow, warm paper background (`#FAF8F4`), Space Grotesk display type, IBM Plex Sans body, IBM Plex Mono for numbers/codes/eyebrows. Defined in `lib/marketing/tokens.ts`.
_Avoid_: "the new design," "the redesign," "the NovaPOS style"

**Persuasion page**:
A marketing page whose job is to convert a visitor toward signup — homepage, pricing, features, compare. Gets the Field system's dark hero band.
_Avoid_: "marketing page" (too broad — includes reference pages too)

**Reference page**:
A marketing page a visitor lands on to find a specific answer, not to be sold to — blog posts, help articles, the supplier directory. Gets the Field system's typography and tokens, but stays on the warm paper background throughout — no dark hero band.
_Avoid_: "content page," "support page"

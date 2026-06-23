# Activation audit — POS first-sale tour

**Date:** 2026-06-21
**Trigger:** Ireland customer churn (onboarding — never reached first sale)

## Product state

| Layer | Status |
|-------|--------|
| Onboarding seeds demo products + opens till | Live (`app/actions/onboarding.ts`) |
| Redirect to `/app/pos?tour=first_sale` | Live |
| `PosFirstSaleTour` + `TourOverlay` | Live |
| Growth milestones (`growth_*` on organisations) | Live (migration 041) |
| PostHog `tour_started` / `tour_completed` / `tour_skipped` | **Added** (`TourOverlay` + `lib/analytics/client-events.ts`) |

## Stuck trials (Supabase)

Run `STUCK_TRIALS_SQL` from `lib/growth/founder-sla.ts` — filter `sla_action IS NOT NULL`.

**Finding (2026-06-21):** All IE trials (Dolcenera, The Health Bar) have null `growth_*` despite accounts existing. Milestones may not fire until explicit till/sale/report actions — verify `recordGrowthMilestone` is called on first sale path.

## PostHog queries (after deploy)

- Funnel: `tour_started` → `tour_completed` (filter `tour_id = pos_first_sale`)
- Drop-off signal: high `tour_skipped` rate

## Founder action

See `docs/growth/ireland-reengage.md` — personal screen share beats more product surface.

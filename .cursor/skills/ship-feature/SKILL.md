---
name: ship-feature
description: End-to-end feature shipping workflow. Use when I describe a feature I want to build. Plans, builds, tests, and deploys.
---

# Ship Feature

## Process

### Phase 1 — Plan (use Plan Mode: Shift+Tab)

1. Search codebase for existing related code before planning anything new
2. Identify all files that will change
3. List any new Supabase migrations needed
4. List any new Loops events needed
5. List any new n8n webhooks needed
6. Estimate: how many files touched? Any fiscal/POS/billing risk?
7. Present plan. Wait for my confirmation.

### Phase 2 — Build

1. New migration file if DB change needed (never modify existing)
2. Server action or API route changes
3. UI changes (mobile-first, Romanian strings)
4. Add Loops trackLoopsEvent if new activation-relevant event
5. Add PostHog event capture if new user behavior to track

### Phase 3 — Pre-deploy checklist

Run locally before deploying:

- npm run build (must pass with 0 errors)
- npm run lint (must pass)
- If DB migration: test migration on staging or confirm it's reversible

### Phase 4 — Deploy

ssh do-server 'cd /opt/franchisetech && bash predeploy-guard.sh && git pull && npm run build && pm2 restart fridgeproof'

Show me PM2 status after restart:

ssh do-server 'pm2 status'
ssh do-server 'pm2 logs fridgeproof --lines 20'

### Phase 5 — Verify

- Test the specific user flow that was changed
- Check PostHog for the new event firing (if applicable)
- Check Supabase for any DB changes applied correctly

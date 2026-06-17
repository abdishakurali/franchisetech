#!/bin/bash
# ============================================================
# postdeploy-smoke.sh — franchisetech post-deploy smoke tests
# Run after every deploy to verify the live site is healthy.
#
# Usage:
#   bash scripts/postdeploy-smoke.sh [BASE_URL]
#
# BASE_URL defaults to https://franchisetech.ro
# ============================================================
set -euo pipefail

BASE="${1:-https://franchisetech.ro}"
FAIL=0

pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1" >&2; FAIL=1; }

echo ""
echo "============================================================"
echo "Post-deploy smoke test — $BASE"
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# ── HTTP route checks ─────────────────────────────────────────
echo ""
echo "Public routes (must be 200):"

check_200() {
  local path="$1"
  local CODE
  CODE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "$BASE$path" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    pass "$path → $CODE"
  else
    fail "$path → $CODE (expected 200)"
  fi
}

check_not_error() {
  local path="$1"
  local CODE
  CODE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "$BASE$path" 2>/dev/null || echo "000")
  if [ "$CODE" = "500" ] || [ "$CODE" = "502" ] || [ "$CODE" = "503" ] || [ "$CODE" = "504" ] || [ "$CODE" = "000" ]; then
    fail "$path → $CODE (server error)"
  else
    pass "$path → $CODE"
  fi
}

check_200 "/"
check_200 "/pricing"
check_200 "/help"
check_200 "/industries"
check_200 "/industries/cafes"
check_200 "/industries/restaurants"
check_200 "/industries/takeaways"
check_200 "/industries/food-trucks"
check_200 "/industries/health-bars"
check_200 "/features"
check_200 "/resources"
check_200 "/login"
check_200 "/signup"

echo ""
echo "Authenticated routes (must not be 5xx):"
check_not_error "/app/pos"
check_not_error "/app/settings"
check_not_error "/app/products"

echo ""
echo "Assets:"
check_200 "/franchise-tech-logo.png"
check_200 "/franchise-tech-logo.svg"
check_200 "/favicon.ico"

# ── Branding content check ────────────────────────────────────
echo ""
echo "Branding content:"

HOMEPAGE=$(curl -sL --max-time 20 "$BASE/" 2>/dev/null || echo "")

if echo "$HOMEPAGE" | grep -qi 'franchisetech'; then
  pass "Homepage contains 'franchisetech'"
else
  fail "Homepage does NOT contain 'franchisetech'"
fi

if echo "$HOMEPAGE" | grep -qi 'KitchenOps'; then
  fail "Homepage contains stale 'KitchenOps' branding"
else
  pass "Homepage is free of 'KitchenOps'"
fi

# ── PM2 status (requires SSH to do-server) ────────────────────
echo ""
echo "PM2 status:"
if ssh do-server "pm2 jlist 2>/dev/null" > /tmp/pm2_status.json 2>/dev/null; then
  ONLINE=$(python3 -c "
import json,sys
data=json.load(open('/tmp/pm2_status.json'))
apps=[a for a in data if a.get('name')=='fridgeproof']
online=[a for a in apps if a.get('pm2_env',{}).get('status')=='online']
print(f'{len(online)}/{len(apps)} instances online')
" 2>/dev/null || echo "unknown")
  if echo "$ONLINE" | grep -q "^0/"; then
    fail "PM2 fridgeproof: $ONLINE"
  else
    pass "PM2 fridgeproof: $ONLINE"
  fi
else
  echo "  (skipped — SSH to do-server not available in this context)"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "============================================================"
if [ "$FAIL" -eq 0 ]; then
  echo "Smoke test: PASSED"
else
  echo "Smoke test: FAILED — see errors above"
  echo "Rollback if needed: ssh do-server 'bash /var/www/fp-releases/rollback.sh'"
fi
echo "============================================================"
echo ""

exit "$FAIL"

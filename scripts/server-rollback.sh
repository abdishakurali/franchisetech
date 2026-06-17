#!/bin/bash
# ============================================================
# server-rollback.sh — validated rollback for fp-releases
# Deployed to: /var/www/fp-releases/rollback.sh
# Usage: bash /var/www/fp-releases/rollback.sh [release_name]
# ============================================================
set -euo pipefail

RELEASES_ROOT="/var/www/fp-releases"
CURRENT="$RELEASES_ROOT/current"

echo ""
echo "============================================================"
echo "[rollback.sh] Scanning releases for valid rollback targets..."
echo "============================================================"

CURRENT_RELEASE=$(readlink "$CURRENT" 2>/dev/null || echo "unknown")
echo "Currently serving: $CURRENT_RELEASE"
echo ""

ALL_RELEASES=$(ls -dt "$RELEASES_ROOT"/releases/*/ 2>/dev/null | sed 's|/$||' || echo "")

VALID_TARGETS=()
QUARANTINED=()

for release in $ALL_RELEASES; do
  if [ "$release" = "$CURRENT_RELEASE" ]; then continue; fi

  VALIDATION=$(bash "$RELEASES_ROOT/validate-release.sh" "$release" 2>&1)
  if [ $? -eq 0 ]; then
    VALID_TARGETS+=("$release")
  else
    reason=$(echo "$VALIDATION" | grep '✗' | head -1 | sed 's/.*✗ //')
    [ -z "$reason" ] && reason="validation failed"
    QUARANTINED+=("$release [$reason]")
  fi
done

echo "Valid rollback targets:"
if [ ${#VALID_TARGETS[@]} -eq 0 ]; then
  echo "  (none)"
else
  for i in "${!VALID_TARGETS[@]}"; do
    echo "  $((i+1))) ${VALID_TARGETS[$i]}"
  done
fi

echo ""
if [ ${#QUARANTINED[@]} -gt 0 ]; then
  echo "Quarantined (will not be offered):"
  for q in "${QUARANTINED[@]}"; do echo "  x $q"; done
  echo ""
fi

if [ ${#VALID_TARGETS[@]} -eq 0 ]; then
  echo "ERROR: No valid rollback target available." >&2
  echo "       No prior release passed validation." >&2
  echo "       Build a corrected release from Mac: bash deploy.sh" >&2
  exit 1
fi

# Select target
if [ -n "${1:-}" ]; then
  TARGET="$RELEASES_ROOT/releases/$1"
  FOUND=0
  for v in "${VALID_TARGETS[@]}"; do
    if [ "$v" = "$TARGET" ]; then FOUND=1; break; fi
  done
  if [ $FOUND -eq 0 ]; then
    echo "ERROR: '$1' is not a valid rollback target." >&2
    echo "       It either doesn't exist or failed validation." >&2
    exit 1
  fi
else
  TARGET="${VALID_TARGETS[0]}"
fi

echo "Target: $TARGET"
echo ""

if [ -t 0 ]; then
  read -p "Confirm rollback? [y/N] " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled."
    exit 0
  fi
fi

echo "[rollback.sh] Switching current -> $TARGET"
ln -sfn "$TARGET" "$CURRENT"

echo "[rollback.sh] Reloading PM2 (rolling, zero-downtime)..."
pm2 reload fridgeproof --update-env
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3001/" 2>/dev/null || echo "000")
echo "[rollback.sh] / returned HTTP $HTTP_CODE"
pm2 status fridgeproof

echo ""
echo "============================================================"
echo "[rollback.sh] Rollback complete."
echo "  current -> $(readlink $CURRENT)"
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "307" ] && [ "$HTTP_CODE" != "302" ]; then
  echo "WARNING: Health check returned $HTTP_CODE."
  echo "  Check: pm2 logs fridgeproof --lines 50"
fi
echo "Note: Database migrations are NOT reversed by rollback."
echo "      Design migrations to be forwards-compatible."
echo "============================================================"

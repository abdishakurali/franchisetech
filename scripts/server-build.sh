#!/bin/bash
# ============================================================
# server-build.sh — server-side release builder
# Deployed to: /var/www/fp-releases/build.sh
# Called by deploy.sh on Mac after rsync.
# Usage: bash /var/www/fp-releases/build.sh <release_dir>
# ============================================================
set -euo pipefail

RELEASE_DIR="${1:-}"
RELEASES_ROOT="/var/www/fp-releases"
CURRENT="$RELEASES_ROOT/current"
ENV_SOURCE="/var/www/fridgeproof/.env.local"

if [ -z "$RELEASE_DIR" ]; then
  echo "[build.sh] ERROR: release directory argument required." >&2; exit 1
fi
if [ ! -d "$RELEASE_DIR" ]; then
  echo "[build.sh] ERROR: release directory not found: $RELEASE_DIR" >&2; exit 1
fi

echo ""
echo "============================================================"
echo "[build.sh] Release: $RELEASE_DIR"
echo "[build.sh] $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# Symlink .env.local — Next.js auto-loads it from cwd
echo "[build.sh] Linking .env.local..."
ln -sfn "$ENV_SOURCE" "$RELEASE_DIR/.env.local"

# Install dependencies
echo "[build.sh] npm ci..."
cd "$RELEASE_DIR"
if [ -f package-lock.json ]; then
  npm ci --include=dev 2>&1 | tail -5
else
  npm install --include=dev 2>&1 | tail -5
fi

# Build
echo "[build.sh] npm run build..."
npm run build

# Verify build completed
if [ ! -d "$RELEASE_DIR/.next" ]; then
  echo "[build.sh] ERROR: .next missing after build. Aborting — live app untouched." >&2
  exit 1
fi

BUILD_ID=""
[ -f "$RELEASE_DIR/.next/BUILD_ID" ] && BUILD_ID=$(cat "$RELEASE_DIR/.next/BUILD_ID")
echo "[build.sh] Build OK. BUILD_ID=${BUILD_ID:-unknown}"

# Write RELEASE.json (used by validate-release.sh to confirm build was orchestrated)
if [ ! -f "$RELEASE_DIR/RELEASE.json" ]; then
  cat > "$RELEASE_DIR/RELEASE.json" <<JSONEOF
{
  "release": "$(basename "$RELEASE_DIR")",
  "build_id": "${BUILD_ID:-unknown}",
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSONEOF
  echo "[build.sh] RELEASE.json written."
fi

# Validate release before going live
echo "[build.sh] Validating release..."
if ! bash "$RELEASES_ROOT/validate-release.sh" "$RELEASE_DIR"; then
  echo "[build.sh] ERROR: Release validation failed. Aborting — live app untouched." >&2
  exit 1
fi

# Atomic symlink swap
PREV=$(readlink "$CURRENT" 2>/dev/null || echo "")
echo "[build.sh] Swapping current:"
echo "  old: $PREV"
echo "  new: $RELEASE_DIR"
ln -sfn "$RELEASE_DIR" "$CURRENT"

# Zero-downtime rolling reload
echo "[build.sh] pm2 reload (rolling, zero-downtime)..."
pm2 reload fridgeproof --update-env
sleep 5

# Health check
echo "[build.sh] Health check..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "http://localhost:3001/api/health" 2>/dev/null || echo "000")
if [ "$CODE" = "200" ]; then
  echo "[build.sh] /api/health → HTTP 200 OK"
else
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "http://localhost:3001/" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "302" ]; then
    echo "[build.sh] / → HTTP $CODE OK"
  else
    echo "[build.sh] WARNING: health check HTTP $CODE." >&2
    echo "[build.sh] Rollback: ssh do-server 'bash $RELEASES_ROOT/rollback.sh'" >&2
  fi
fi

# Prune old releases — keep last 5
COUNT=$(ls -dt "$RELEASES_ROOT/releases"/*/ 2>/dev/null | wc -l || echo 0)
if [ "$COUNT" -gt 5 ]; then
  echo "[build.sh] Pruning oldest releases (keeping 5)..."
  ls -dt "$RELEASES_ROOT/releases"/*/ | tail -n +6 | sed 's|/$||' | xargs -r rm -rf
fi

echo "[build.sh] Kept releases:"
ls -dt "$RELEASES_ROOT/releases"/*/ 2>/dev/null | xargs -I{} basename {} || echo "  (none yet)"

echo ""
echo "============================================================"
echo "[build.sh] DONE. current -> $(readlink $CURRENT)"
echo "[build.sh] $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

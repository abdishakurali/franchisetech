#!/bin/bash
# ============================================================
# deploy.sh — franchisetech zero-downtime deployment
# Run from the repository root on your local Mac:
#   bash deploy.sh
#
# Requires: rsync, ssh alias "do-server" in ~/.ssh/config
# Safe deploy only — never builds in the live directory.
# ============================================================
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")" && pwd)"
REMOTE="do-server"
RELEASES_ROOT="/var/www/fp-releases"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="$RELEASES_ROOT/releases/$TIMESTAMP"

echo ""
echo "============================================================"
echo "Deploying franchisetech — release $TIMESTAMP"
echo "============================================================"

# ── Pre-deploy guards ─────────────────────────────────────────
bash "$SOURCE/scripts/predeploy-guard.sh" "$SOURCE"

# ── Create release directory on server ───────────────────────
echo "Creating release directory: $RELEASE_DIR"
ssh "$REMOTE" "mkdir -p '$RELEASE_DIR'"

# ── Sync source files ─────────────────────────────────────────
echo "Syncing source files..."
rsync -av --delete \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.swp' \
  --exclude='._*' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production.local' \
  --exclude='.env.local.example' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  --exclude='fridgeproof-demo-screenshots' \
  --exclude='fridgeproof-full-flow-screenshots' \
  --exclude='fridgeproof-full-flow-png' \
  --exclude='kitchenops-pos-qa-screenshots' \
  --exclude='fridgeproof-final-retest-screenshots' \
  --exclude='*.mp4' \
  --exclude='efactura docs' \
  --exclude='.cursor' \
  --exclude='.agents' \
  --exclude='data' \
  "$SOURCE/" "$REMOTE:$RELEASE_DIR/"

# ── Write RELEASE.json into the release ──────────────────────
GIT_SHA=$(git -C "$SOURCE" rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_MSG=$(git -C "$SOURCE" log -1 --pretty=format:'%s' 2>/dev/null || echo "unknown")
ssh "$REMOTE" "cat > '$RELEASE_DIR/RELEASE.json'" <<JSONEOF
{
  "release": "$TIMESTAMP",
  "git_sha": "$GIT_SHA",
  "git_message": "$GIT_MSG",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSONEOF

# ── Build on server ───────────────────────────────────────────
echo "Building on server (this takes ~2 minutes)..."
ssh "$REMOTE" "bash $RELEASES_ROOT/build.sh '$RELEASE_DIR'"

# ── Post-deploy smoke check ───────────────────────────────────
echo "Running smoke tests..."
sleep 3
bash "$SOURCE/scripts/postdeploy-smoke.sh" "https://franchisetech.ro"

echo ""
echo "============================================================"
echo "Deploy complete. Release $TIMESTAMP is live."
echo "Rollback: ssh do-server 'bash /var/www/fp-releases/rollback.sh'"
echo "============================================================"

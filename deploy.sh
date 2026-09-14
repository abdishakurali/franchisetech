#!/bin/bash
# ============================================================
# deploy.sh — franchisetech zero-downtime deployment
#
#   bash deploy.sh [sha]      # defaults to HEAD
#
# Requires: git, ssh alias "do-server" in ~/.ssh/config, and a bare repo
# at $REMOTE_REPO on the server.
#
# Deploys a COMMIT, not a working directory. The server extracts exactly
# the tree at <sha> via `git archive` (which honors .gitattributes
# export-ignore, versioned with that same commit) — so the shipped bytes
# are the sha by construction. RELEASE.json records what was actually
# extracted; there is nothing to compare and no window in which
# provenance can drift, because there was never a separate "what got
# copied" question to answer.
#
# Safe deploy only — never builds in the live directory.
# ============================================================
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")" && pwd)"
REMOTE="do-server"
RELEASES_ROOT="/var/www/fp-releases"
REMOTE_REPO="$RELEASES_ROOT/franchisetech.git"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="$RELEASES_ROOT/releases/$TIMESTAMP"

SHA_ARG="${1:-HEAD}"
SHA=$(git -C "$SOURCE" rev-parse "$SHA_ARG")

echo ""
echo "============================================================"
echo "Deploying franchisetech — release $TIMESTAMP"
echo "sha: $SHA"
echo "============================================================"

# ── Refuse on a dirty tree ─────────────────────────────────────
# Not a provenance guard — the archive is the sha by construction
# regardless of what else sits in the working directory. This is a
# usability guard: so you don't walk away believing uncommitted work is
# live when it isn't. Lists exactly what would be left out.
DIRTY="$(git -C "$SOURCE" status --porcelain)"
if [ -n "$DIRTY" ]; then
  echo "ERROR: working tree is dirty. Only the committed tree at $SHA ships." >&2
  echo "       These files would be ignored by this deploy:" >&2
  echo "$DIRTY" | sed 's/^/         /' >&2
  echo "" >&2
  echo "Commit or stash them, or pass an explicit sha if deploying an" >&2
  echo "older commit on purpose: bash deploy.sh <sha>" >&2
  exit 1
fi

# ── Pre-deploy guards ─────────────────────────────────────────
bash "$SOURCE/scripts/predeploy-guard.sh" "$SOURCE"

# ── Ensure the server has this commit ──────────────────────────
echo "Pushing $SHA to the server's repo..."
git -C "$SOURCE" push "$REMOTE:$REMOTE_REPO" "$SHA:refs/deploys/$TIMESTAMP"

# ── Create release directory and extract exactly that commit ──
echo "Creating release directory: $RELEASE_DIR"
ssh "$REMOTE" "mkdir -p '$RELEASE_DIR' && git --git-dir='$REMOTE_REPO' archive '$SHA' | tar -x -C '$RELEASE_DIR'"

# ── Write RELEASE.json into the release ────────────────────────
GIT_MSG=$(git -C "$SOURCE" log -1 --pretty=format:'%s' "$SHA")
ssh "$REMOTE" "cat > '$RELEASE_DIR/RELEASE.json'" <<JSONEOF
{
  "release": "$TIMESTAMP",
  "git_sha": "$SHA",
  "git_message": "$GIT_MSG",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSONEOF

# ── Build on server ─────────────────────────────────────────────
echo "Building on server (this takes ~2 minutes)..."
ssh "$REMOTE" "bash $RELEASES_ROOT/build.sh '$RELEASE_DIR'"

# ── Post-deploy smoke check ─────────────────────────────────────
echo "Running smoke tests..."
sleep 3
bash "$SOURCE/scripts/postdeploy-smoke.sh" "https://franchisetech.ro"

echo ""
echo "============================================================"
echo "Deploy complete. Release $TIMESTAMP is live."
echo "  sha: $SHA"
echo "Rollback: ssh do-server 'bash /var/www/fp-releases/rollback.sh'"
echo "============================================================"

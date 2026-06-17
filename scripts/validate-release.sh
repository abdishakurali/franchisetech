#!/bin/bash
# ============================================================
# validate-release.sh — shared release validator
# Used by rollback.sh and deploy pipeline to validate a release.
#
# Usage:
#   bash scripts/validate-release.sh <release_dir>
#
# Exit 0 = valid. Exit 1 = invalid (reason printed to stderr).
# ============================================================
set -euo pipefail

RELEASE_DIR="${1:-}"

if [ -z "$RELEASE_DIR" ]; then
  echo "Usage: validate-release.sh <release_dir>" >&2
  exit 1
fi

# Resolve symlink if passed /var/www/fp-releases/current
if [ -L "$RELEASE_DIR" ]; then
  RELEASE_DIR=$(readlink -f "$RELEASE_DIR")
fi

if [ ! -d "$RELEASE_DIR" ]; then
  echo "ERROR: Not a directory: $RELEASE_DIR" >&2
  exit 1
fi

FAIL=0
ERRORS=""

fail() {
  FAIL=1
  ERRORS="$ERRORS\n  ✗ $1"
}

# ── Checks ────────────────────────────────────────────────────

# 1. Build exists
if [ ! -f "$RELEASE_DIR/.next/BUILD_ID" ]; then
  fail ".next/BUILD_ID missing — build did not complete"
fi

# 2. package.json
if [ ! -f "$RELEASE_DIR/package.json" ]; then
  fail "package.json missing"
fi

# 3. Homepage source
if [ ! -f "$RELEASE_DIR/app/page.tsx" ]; then
  fail "app/page.tsx missing"
fi

# 4. Homepage branding
if [ -f "$RELEASE_DIR/app/page.tsx" ]; then
  if ! grep -q 'franchisetech' "$RELEASE_DIR/app/page.tsx" 2>/dev/null; then
    fail "app/page.tsx does not contain 'franchisetech' — stale or wrong source"
  fi
  if grep -q 'KitchenOps\|Simple POS and operations for small food businesses' "$RELEASE_DIR/app/page.tsx" 2>/dev/null; then
    fail "app/page.tsx contains stale KitchenOps branding"
  fi
fi

# 5. Required marketing components
if [ ! -f "$RELEASE_DIR/components/marketing/MarketingShell.tsx" ]; then
  fail "components/marketing/MarketingShell.tsx missing"
fi

# 6. Logo
if [ ! -f "$RELEASE_DIR/public/franchise-tech-logo.png" ]; then
  fail "public/franchise-tech-logo.png missing"
fi

# 7. RELEASE.json (written by build.sh — confirms build was orchestrated correctly)
if [ ! -f "$RELEASE_DIR/RELEASE.json" ]; then
  # Soft warning only — older releases may not have this
  echo "  ⚠ RELEASE.json missing (older release — may be ok)" >&2
fi

# 8. Migration history integrity
if [ ! -f "$RELEASE_DIR/supabase/migrations/035_purchase_inventory_model.sql" ]; then
  fail "supabase/migrations/035_purchase_inventory_model.sql missing — source may be stale"
fi

# ── Report ────────────────────────────────────────────────────
if [ "$FAIL" -eq 0 ]; then
  BUILD_ID=$(cat "$RELEASE_DIR/.next/BUILD_ID" 2>/dev/null || echo "unknown")
  RELEASE_NAME=$(basename "$RELEASE_DIR")
  echo "VALID: $RELEASE_NAME (BUILD_ID: $BUILD_ID)"
  exit 0
else
  RELEASE_NAME=$(basename "$RELEASE_DIR")
  echo "INVALID: $RELEASE_NAME" >&2
  printf "%b\n" "$ERRORS" >&2
  exit 1
fi

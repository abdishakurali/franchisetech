#!/bin/bash
# ============================================================
# predeploy-guard.sh — franchisetech pre-deploy validation
# Run before every deploy. Blocks on any branding or file issue.
#
# Usage:
#   bash scripts/predeploy-guard.sh [SOURCE_DIR]
#
# SOURCE_DIR defaults to the directory containing this script's parent.
# ============================================================
set -euo pipefail

SOURCE="${1:-$(cd "$(dirname "$0")/.." && pwd)}"

FAIL=0
ERRORS=""

fail() {
  FAIL=1
  ERRORS="$ERRORS\n  ✗ $1"
}

echo ""
echo "============================================================"
echo "Pre-deploy guard — franchisetech"
echo "Source: $SOURCE"
echo "============================================================"

# ── 1. Source directory must exist ────────────────────────────
if [ ! -d "$SOURCE" ]; then
  echo "ERROR: Source directory not found: $SOURCE" >&2
  exit 1
fi

# ── 2. Stale KitchenOps branding ─────────────────────────────
echo "Checking for stale KitchenOps branding..."
STALE_FILES=(
  "app/page.tsx"
  "app/pricing/page.tsx"
  "app/layout.tsx"
)
for f in "${STALE_FILES[@]}"; do
  if [ -f "$SOURCE/$f" ]; then
    MATCH=$(grep -in 'KitchenOps\|Simple POS and operations for small food businesses' "$SOURCE/$f" 2>/dev/null || true)
    if [ -n "$MATCH" ]; then
      fail "Stale KitchenOps branding in $f:"
      while IFS= read -r line; do
        ERRORS="$ERRORS\n      $line"
      done <<< "$MATCH"
    fi
  fi
done

# ── 3. Homepage must contain franchisetech ────────────────────
echo "Checking homepage branding..."
if [ -f "$SOURCE/app/page.tsx" ]; then
  COUNT=$(grep -c 'franchisetech' "$SOURCE/app/page.tsx" 2>/dev/null || true)
  COUNT="${COUNT:-0}"
  if [ "$COUNT" -eq 0 ]; then
    fail "app/page.tsx does not contain 'franchisetech' — wrong file or stale source"
  fi
else
  fail "app/page.tsx is missing entirely"
fi

# ── 4. Required marketing and public files ────────────────────
echo "Checking required files..."
REQUIRED_FILES=(
  "components/marketing/MarketingShell.tsx"
  "components/marketing/JsonLd.tsx"
  "app/page.tsx"
  "app/pricing/page.tsx"
  "app/industries/page.tsx"
  "app/help/page.tsx"
  "public/franchise-tech-logo.png"
  "public/franchise-tech-logo.svg"
  "public/favicon.ico"
  "supabase/migrations/035_purchase_inventory_model.sql"
)
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$SOURCE/$f" ]; then
    fail "Required file missing: $f"
  fi
done

# ── 5. Required public route source directories ───────────────
echo "Checking required route directories..."
REQUIRED_DIRS=(
  "app/industries"
  "app/help"
  "app/features"
  "app/resources"
)
for d in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$SOURCE/$d" ]; then
    fail "Required route directory missing: $d"
  fi
done

# ── 6. Protected paths must not be modified ───────────────────
echo "Checking for protected path changes..."
if git -C "$SOURCE" rev-parse --git-dir > /dev/null 2>&1; then
  CHANGED=$(git -C "$SOURCE" diff --name-only HEAD 2>/dev/null || true)
  CHANGED_S=$(git -C "$SOURCE" diff --name-only --staged 2>/dev/null || true)
  ALL_CHANGED="$CHANGED $CHANGED_S"
  PROTECTED_PATTERNS=(
    'public/downloads'
    'fp-android'
    'android-connector'
    '\.apk$'
  )
  for pattern in "${PROTECTED_PATTERNS[@]}"; do
    if echo "$ALL_CHANGED" | grep -qE "$pattern"; then
      fail "Protected path change detected (pattern: $pattern). Unstage before deploying."
    fi
  done
fi

# ── 7. Stale source markers ───────────────────────────────────
echo "Checking for stale source markers..."
STALE_MARKERS=(
  "app/page.tsx:KitchenOps POS"
  "app/layout.tsx:KitchenOps"
)
for marker in "${STALE_MARKERS[@]}"; do
  file="${marker%%:*}"
  text="${marker##*:}"
  if [ -f "$SOURCE/$file" ] && grep -q "$text" "$SOURCE/$file" 2>/dev/null; then
    fail "Stale source marker found in $file: '$text'"
  fi
done

# ── 8. package.json must exist ────────────────────────────────
if [ ! -f "$SOURCE/package.json" ]; then
  fail "package.json missing — source directory may be wrong"
fi

# ── 9. types/chatwoot.d.ts must exist (TypeScript build requires it) ──
if [ ! -f "$SOURCE/types/chatwoot.d.ts" ]; then
  fail "types/chatwoot.d.ts missing — TypeScript build will fail (Chatwoot globals undeclared)"
fi

# ── Report ────────────────────────────────────────────────────
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "============================================================"
  echo "Pre-deploy guard: PASSED"
  echo "============================================================"
  echo ""
  exit 0
else
  echo "============================================================"
  echo "Pre-deploy guard: BLOCKED"
  echo ""
  printf "%b\n" "$ERRORS"
  echo ""
  echo "Fix the issues above before deploying."
  echo "Pull fresh source from server if files are missing:"
  echo "  rsync -av do-server:/var/www/fridgeproof/<dir>/ <local-dir>/"
  echo "============================================================"
  echo ""
  exit 1
fi

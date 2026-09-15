#!/bin/bash
# ============================================================
# check-schema-drift.sh — the database half of the append-only guard.
#
# predeploy-guard.sh already refuses a deploy that modifies or deletes a
# committed migration file (app code half). This is the other direction:
# refuse a deploy if PRODUCTION has a migration applied that this repo does
# not know about — the exact failure mode found on 2026-09-15, where 9
# migrations (including a stock-writer fix) were live for weeks with no
# commit anywhere, and post_nir_purchase's fix very nearly got reverted by
# building on the stale checked-in copy instead of the live one.
#
# One direction only: production must never be ahead of the repo. A local
# migration not yet applied to production is the normal, expected state of
# a not-yet-deployed change — not drift — so that direction is not checked.
#
# Every version in production's supabase_migrations.schema_migrations must
# be either (a) a version this repo's migration filenames start with, or
# (b) present in supabase/.migration_audit_baseline.json — the fixed list
# of versions verified by the 2026-09-15 full content audit (see git log
# for that commit). New drift after that baseline is never grandfathered —
# only history already checked by hand is.
#
# Usage: bash scripts/check-schema-drift.sh
# Requires DIRECT_DB_URL in .env.local (Session mode URI, Supabase
# Dashboard → Settings → Database) and the psql client.
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
BASELINE_FILE="$ROOT/supabase/.migration_audit_baseline.json"
MIGRATIONS_DIR="$ROOT/supabase/migrations"

if [ ! -f "$ENV_FILE" ]; then
  echo "SKIP: $ENV_FILE not found — cannot check live schema drift without DIRECT_DB_URL." >&2
  echo "      Not a pass: this check did not run. Run it manually before deploying if in doubt." >&2
  exit 0
fi

DIRECT_DB_URL=$(grep -m1 '^DIRECT_DB_URL=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "$DIRECT_DB_URL" ]; then
  echo "SKIP: DIRECT_DB_URL not set in .env.local — cannot check live schema drift." >&2
  exit 0
fi

if ! command -v psql > /dev/null 2>&1; then
  echo "SKIP: psql not installed locally — cannot check live schema drift." >&2
  exit 0
fi

REMOTE_VERSIONS=$(psql "$DIRECT_DB_URL" -t -A -c "select version from supabase_migrations.schema_migrations order by version;")

FAIL=0

# Local versions: the leading run of digits before the first underscore in each filename.
LOCAL_VERSIONS=$(ls "$MIGRATIONS_DIR" | grep -E '\.sql$' | sed -E 's/^([0-9]+)_.*/\1/' | sort -u)

# Check 1: every remote version must be locally known or pre-baselined.
while IFS= read -r v; do
  [ -z "$v" ] && continue
  if echo "$LOCAL_VERSIONS" | grep -qx "$v"; then
    continue
  fi
  if [ -f "$BASELINE_FILE" ] && grep -q "\"$v\"" "$BASELINE_FILE"; then
    continue
  fi
  echo "DRIFT: production has migration version $v with no matching local file and it is not in the audit baseline."
  FAIL=1
done <<< "$REMOTE_VERSIONS"

if [ "$FAIL" -eq 0 ]; then
  echo "Schema drift check: PASSED — production and repo migration history match."
  exit 0
else
  echo ""
  echo "Schema drift check: BLOCKED — see DRIFT lines above."
  echo "Every schema change must ship as a committed migration file before (or as part of) this deploy."
  exit 1
fi

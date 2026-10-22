#!/bin/bash
# ============================================================
# apply-migrations-production.sh — apply reviewed migration files to the
# production database in ONE transaction, and record them in
# supabase_migrations.schema_migrations (same shape as `supabase db push`:
# version, name, statements = [file contents]).
#
# Guards:
#   * ALLOW_PROD_MIGRATE=1 required
#   * a verified backup (scripts/backup/export-public-data.sh) younger than
#     2 hours must exist
#   * lock_timeout 5s / statement_timeout 120s — fails cleanly instead of
#     queueing behind live POS traffic; nothing is applied on any error
#   * refuses versions already recorded
#
# Usage:
#   ALLOW_PROD_MIGRATE=1 bash scripts/apply-migrations-production.sh \
#     supabase/migrations/<file>.sql [more files...]
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ "${ALLOW_PROD_MIGRATE:-}" = "1" ] || { echo "Refusing: set ALLOW_PROD_MIGRATE=1 to modify production." >&2; exit 1; }
[ "$#" -ge 1 ] || { echo "Usage: ALLOW_PROD_MIGRATE=1 $0 <migration.sql>..." >&2; exit 1; }

URL=$(grep -m1 '^DIRECT_DB_URL=' "$ROOT/.env.local" | cut -d= -f2-)
[ -n "$URL" ] || { echo "DIRECT_DB_URL missing in .env.local" >&2; exit 1; }
case "$URL" in *ycqzxlahhfqwuteistvf*) ;; *) echo "DIRECT_DB_URL is not the production project" >&2; exit 1 ;; esac

LATEST_BACKUP=$(ls -dt "$HOME"/franchisetech-backups/supabase/pre-migration-* 2>/dev/null | head -1 || true)
if [ -z "$LATEST_BACKUP" ] || ! grep -q "count_mismatches=0" "$LATEST_BACKUP/verify.txt" 2>/dev/null \
   || [ -n "$(find "$LATEST_BACKUP/verify.txt" -mmin +120)" ]; then
  echo "Refusing: no verified backup from the last 2 hours. Run scripts/backup/export-public-data.sh first." >&2
  exit 1
fi
echo "Using verified backup: $LATEST_BACKUP"

SCRIPT=$(mktemp)
trap 'rm -f "$SCRIPT"' EXIT
{
  echo "\\set ON_ERROR_STOP on"
  echo "begin;"
  echo "set local lock_timeout = '5s';"
  echo "set local statement_timeout = '120s';"
  i=0
  for f in "$@"; do
    i=$((i + 1))
    base=$(basename "$f" .sql)
    version=${base%%_*}
    name=${base#*_}
    echo "do \$guard\$ begin if exists (select 1 from supabase_migrations.schema_migrations where version = '$version') then raise exception 'migration $version already applied'; end if; end \$guard\$;"
    echo "\\echo == applying $base"
    echo "\\i $ROOT/$f"
    echo "\\set file_$i \`cat $ROOT/$f\`"
    echo "insert into supabase_migrations.schema_migrations (version, name, statements) values ('$version', '$name', array[:'file_$i']);"
  done
  echo "commit;"
} > "$SCRIPT"

psql "$URL" -v ON_ERROR_STOP=1 -P pager=off -f "$SCRIPT"
echo "APPLIED: $*"

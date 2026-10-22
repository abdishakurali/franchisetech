#!/bin/bash
# ============================================================
# export-public-data.sh — pre-migration data backup without pg_dump.
#
# Local pg_dump is v15 and refuses to dump the Postgres 17 server, so this
# exports every public base table to CSV with psql \copy, all inside ONE
# read-only REPEATABLE READ transaction (a consistent snapshot), then checks
# each file's "COPY n" against count(*) taken in that same snapshot.
#
# Output: ~/franchisetech-backups/supabase/pre-migration-<UTC timestamp>/
#   <table>.csv, manifest.tsv (table, rows), verify.txt
# Read-only. Contains production customer data — keep it local.
#
# Usage: bash scripts/backup/export-public-data.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
URL=$(grep -m1 '^DIRECT_DB_URL=' "$ROOT/.env.local" | cut -d= -f2-)
[ -n "$URL" ] || { echo "DIRECT_DB_URL missing in .env.local" >&2; exit 1; }

OUT="$HOME/franchisetech-backups/supabase/pre-migration-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT"
chmod 700 "$OUT"

TABLES=$(psql "$URL" -t -A -c "select tablename from pg_tables where schemaname = 'public' order by 1;")

SCRIPT="$OUT/.export.sql"
{
  echo "begin isolation level repeatable read read only;"
  for t in $TABLES; do
    echo "select 'COUNT', '$t', count(*) from public.\"$t\";"
    echo "\\copy (select * from public.\"$t\") to '$OUT/$t.csv' with (format csv, header)"
  done
  echo "rollback;"
} > "$SCRIPT"

psql "$URL" -v ON_ERROR_STOP=1 -t -A -F $'\t' -f "$SCRIPT" > "$OUT/.export.log" 2>&1
rm -f "$SCRIPT"

# Pair each COUNT line with the COPY n that follows it.
awk -F'\t' '
  $1 == "COUNT" { table = $2; expected = $3; next }
  /^COPY [0-9]+$/ { split($0, a, " "); printf "%s\t%s\t%s\n", table, expected, a[2] }
' "$OUT/.export.log" > "$OUT/manifest.tsv"

TABLE_COUNT=$(echo "$TABLES" | wc -w | tr -d ' ')
EXPORTED=$(wc -l < "$OUT/manifest.tsv" | tr -d ' ')
MISMATCH=$(awk -F'\t' '$2 != $3' "$OUT/manifest.tsv" | wc -l | tr -d ' ')
TOTAL_ROWS=$(awk -F'\t' '{s += $3} END {print s}' "$OUT/manifest.tsv")

{
  echo "tables_in_schema=$TABLE_COUNT"
  echo "tables_exported=$EXPORTED"
  echo "count_mismatches=$MISMATCH"
  echo "total_rows=$TOTAL_ROWS"
  echo "size=$(du -sh "$OUT" | cut -f1)"
} | tee "$OUT/verify.txt"

if [ "$EXPORTED" != "$TABLE_COUNT" ] || [ "$MISMATCH" != "0" ]; then
  echo "BACKUP NOT VERIFIED — do not migrate. See $OUT/.export.log" >&2
  exit 1
fi
echo "BACKUP VERIFIED: $OUT"

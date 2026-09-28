#!/bin/bash
# Manual database restore from a pg_dump backup.
# Run this on do-server via SSH when you need to recover from data loss or corruption,
# OR to rehearse a restore into a scratch database — which is the common case, and
# why this script requires an explicit target rather than defaulting to production.
#
# Usage:
#   ssh do-server
#   bash /var/www/fp-releases/restore-db-backup.sh "postgresql://...scratch-project.../postgres"
#
# To restore onto PRODUCTION specifically (rare — a real incident, not a rehearsal):
#   bash /var/www/fp-releases/restore-db-backup.sh --force-production
#
# Prerequisites:
#   - postgresql-client installed (pg_dump, psql)
#   - Backup files in /var/www/fp-releases/backups/
#   - For --force-production: DIRECT_DB_URL set in /var/www/fridgeproof/.env.local

set -euo pipefail

BACKUP_DIR="/var/www/fp-releases/backups"
ENV_FILE="/var/www/fridgeproof/.env.local"

# Require an explicit target — no default, no implicit fallback to production.
# The old version of this script read DIRECT_DB_URL unconditionally, which meant
# "testing the restore" and "restoring onto production" were the same command.
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "ERROR: no target given." >&2
  echo "" >&2
  echo "  Restore into a scratch/non-production database:" >&2
  echo "    bash $0 \"postgresql://...\"" >&2
  echo "" >&2
  echo "  Restore onto PRODUCTION (only for a real incident, never to test this script):" >&2
  echo "    bash $0 --force-production" >&2
  exit 1
fi

if [[ "$TARGET" == "--force-production" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: $ENV_FILE not found" >&2
    exit 1
  fi
  DIRECT_DB_URL=$(grep '^DIRECT_DB_URL=' "$ENV_FILE" | cut -d= -f2-)
  if [[ -z "$DIRECT_DB_URL" ]]; then
    echo "ERROR: DIRECT_DB_URL not set in $ENV_FILE" >&2
    exit 1
  fi
  echo ""
  echo "!!! --force-production: this targets the LIVE production database. !!!"
else
  DIRECT_DB_URL="$TARGET"
fi

# List available backups
echo ""
echo "Available backups in $BACKUP_DIR:"
echo "---"
backups=($(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || true))
if [[ ${#backups[@]} -eq 0 ]]; then
  echo "No backups found." >&2
  exit 1
fi

for i in "${!backups[@]}"; do
  size=$(du -sh "${backups[$i]}" | cut -f1)
  name=$(basename "${backups[$i]}")
  echo "  [$i] $name  ($size)"
done

echo ""
read -rp "Enter the number of the backup to restore: " choice

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -ge "${#backups[@]}" ]]; then
  echo "Invalid choice." >&2
  exit 1
fi

selected="${backups[$choice]}"
echo ""
echo "Selected: $selected"
echo ""
echo "⚠️  WARNING: This will overwrite ALL live data in the database."
echo "   The app will continue serving traffic during restore — consider taking"
echo "   it offline first (pm2 stop fridgeproof) if data integrity is critical."
echo ""
read -rp "Type RESTORE to confirm: " confirm

if [[ "$confirm" != "RESTORE" ]]; then
  echo "Aborted." >&2
  exit 1
fi

echo ""
echo "Starting restore from $(basename "$selected")..."
gunzip -c "$selected" | psql "$DIRECT_DB_URL"

echo ""
echo "Restore complete."

#!/bin/bash
# Manual database restore from a pg_dump backup.
# Run this on do-server via SSH when you need to recover from data loss or corruption.
#
# Usage:
#   ssh do-server
#   bash /var/www/fp-releases/restore-db-backup.sh
#
# Prerequisites:
#   - postgresql-client installed (pg_dump, psql)
#   - DIRECT_DB_URL set in /var/www/fridgeproof/.env.local
#   - Backup files in /var/www/fp-releases/backups/

set -euo pipefail

BACKUP_DIR="/var/www/fp-releases/backups"
ENV_FILE="/var/www/fridgeproof/.env.local"

# Load DIRECT_DB_URL from env file
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

DIRECT_DB_URL=$(grep '^DIRECT_DB_URL=' "$ENV_FILE" | cut -d= -f2-)
if [[ -z "$DIRECT_DB_URL" ]]; then
  echo "ERROR: DIRECT_DB_URL not set in $ENV_FILE" >&2
  exit 1
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

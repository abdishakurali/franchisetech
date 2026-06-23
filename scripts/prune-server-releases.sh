#!/usr/bin/env bash
# Prune old franchisetech releases on the DO VPS to avoid ENOSPC during deploys.
# Run on server: ssh do-server 'bash -s' < scripts/prune-server-releases.sh
# Or cron weekly: 0 4 * * 0 root /var/www/fp-releases/prune-server-releases.sh

set -euo pipefail

KEEP_RELEASES="${KEEP_RELEASES:-2}"
RELEASES_DIR="${RELEASES_DIR:-/var/www/fp-releases/releases}"
CURRENT_LINK="${CURRENT_LINK:-/var/www/fp-releases/current}"

if [[ ! -d "$RELEASES_DIR" ]]; then
  echo "No releases dir: $RELEASES_DIR"
  exit 0
fi

CURRENT=""
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT=$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)
fi

echo "Disk before:"
df -h / | tail -1

mapfile -t ALL < <(ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null | sed 's:/*$::' || true)

if [[ ${#ALL[@]} -le $KEEP_RELEASES ]]; then
  echo "Only ${#ALL[@]} release(s); keeping all (KEEP_RELEASES=$KEEP_RELEASES)."
  exit 0
fi

KEEP_SET=()
for ((i = 0; i < KEEP_RELEASES && i < ${#ALL[@]}; i++)); do
  KEEP_SET+=("${ALL[$i]}")
done
if [[ -n "$CURRENT" ]]; then
  KEEP_SET+=("$CURRENT")
fi

for dir in "${ALL[@]}"; do
  skip=0
  for k in "${KEEP_SET[@]}"; do
    if [[ "$dir" == "$k" ]]; then
      skip=1
      break
    fi
  done
  if [[ $skip -eq 1 ]]; then
    echo "keep $dir"
  else
    echo "rm   $dir"
    rm -rf "$dir"
  fi
done

if command -v npm >/dev/null 2>&1; then
  npm cache clean --force >/dev/null 2>&1 || true
fi

echo "Disk after:"
df -h / | tail -1

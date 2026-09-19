#!/bin/bash
# Runs the dev server against the isolated franchisetech-e2e-core sandbox
# instead of production. Never used for anything but local verification —
# see .env.e2e.local (gitignored, not production credentials).
set -a
# shellcheck disable=SC1091
source "$(dirname "$0")/../.env.e2e.local"
set +a
exec npx next dev -p 3200

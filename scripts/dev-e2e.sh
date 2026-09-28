#!/bin/bash
# Runs the dev server against the isolated franchisetech-e2e-core sandbox
# instead of production. Never used for anything but local verification —
# see .env.e2e.local (gitignored, not production credentials).
set -a
# shellcheck disable=SC1091
source "$(dirname "$0")/../.env.e2e.local"
set +a
# NEXT_DIST_DIR (read by next.config.ts): the actual root cause of the
# "Persisting failed" / ENOENT build-manifest errors wasn't Turbopack or this
# sandbox's filesystem — it was this server and a plain `npm run dev` server
# both writing into the same default .next directory whenever both ran at
# once. Two dev servers sharing one .next corrupt each other's build
# manifests under either bundler; `next dev` has no --dist-dir CLI flag, so
# the output directory is set via next.config.ts instead. --webpack is kept
# only as a secondary safeguard, not the actual fix.
export NEXT_DIST_DIR=.next-e2e
exec npx next dev -p 3200 --webpack

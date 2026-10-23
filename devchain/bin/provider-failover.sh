#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${DEVCHAIN_URL:-http://127.0.0.1:43125}"
PROJECT_ID="${DEVCHAIN_PROJECT_ID:-9ca11883-79b1-4b64-b550-819deb212052}"
THRESHOLD="${DEVCHAIN_FAILOVER_THRESHOLD:-95}"
INTERVAL="${DEVCHAIN_FAILOVER_INTERVAL:-60}"
MODE="once"
SIMULATE_SOURCE=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --watch) MODE="watch" ;;
    --once) MODE="once" ;;
    --simulate-source) SIMULATE_SOURCE="$2"; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

require_command() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1" >&2; exit 1; }
}

counterpart() {
  case "$1" in
    Brainstormer) echo "Architect" ;;
    Architect) echo "Brainstormer" ;;
    "Epic Manager") echo "Code Reviewer" ;;
    "Code Reviewer") echo "Epic Manager" ;;
    *) return 1 ;;
  esac
}

provider_for_agent() {
  case "$1" in
    Brainstormer|"Epic Manager") echo "claude" ;;
    Architect|"Code Reviewer") echo "codex" ;;
    *) return 1 ;;
  esac
}

used_percent() {
  provider="$1"
  printf '%s' "$USAGE_JSON" | jq -r --arg provider "$provider" '
    [.accounts[] | select(.provider == $provider) | .windows[].usedPercent] | max // 100'
}

handoff_provider() {
  source_provider="$1"
  target_provider="claude"
  [ "$source_provider" = "claude" ] && target_provider="codex"

  source_used="$(used_percent "$source_provider")"
  target_used="$(used_percent "$target_provider")"
  if [ -z "$SIMULATE_SOURCE" ] && [ "$source_used" -lt "$THRESHOLD" ]; then
    return 0
  fi
  if [ "$target_used" -ge "$THRESHOLD" ]; then
    echo "failover skipped: $target_provider is also at ${target_used}%" >&2
    return 0
  fi

  agents_json="$(curl -fsS "$BASE_URL/api/agents?projectId=$PROJECT_ID")"
  epics_json="$(curl -fsS "$BASE_URL/api/epics?projectId=$PROJECT_ID&type=all&limit=100")"

  printf '%s' "$epics_json" | jq -c '.items[] | select(.agentId != null)' | while IFS= read -r epic; do
    source_id="$(printf '%s' "$epic" | jq -r '.agentId')"
    source_name="$(printf '%s' "$agents_json" | jq -r --arg id "$source_id" '.items[] | select(.id == $id) | .name')"
    [ -n "$source_name" ] || continue
    [ "$(provider_for_agent "$source_name" 2>/dev/null || true)" = "$source_provider" ] || continue

    target_name="$(counterpart "$source_name")"
    target_id="$(printf '%s' "$agents_json" | jq -r --arg name "$target_name" '.items[] | select(.name == $name) | .id')"
    [ -n "$target_id" ] || { echo "missing counterpart: $target_name" >&2; continue; }

    epic_id="$(printf '%s' "$epic" | jq -r '.id')"
    title="$(printf '%s' "$epic" | jq -r '.title')"
    description="$(printf '%s' "$epic" | jq -r '.description // ""')"
    version="$(printf '%s' "$epic" | jq -r '.version')"
    content="HANDOFF_LIMIT_REACHED

Source: $source_name ($source_provider, ${source_used}% used)
Target: $target_name ($target_provider, ${target_used}% used)
Objective: $title
Acceptance/context: $description
Existing decisions, files, commands, tests, and blockers remain in the complete epic comment history.
Exact next action: read the entire epic, acknowledge this handoff, verify the current worktree, and continue without expanding authority."

    curl -fsS -X POST "$BASE_URL/api/epics/$epic_id/comments" \
      -H 'content-type: application/json' \
      --data "$(jq -n --arg author "Failover Watchdog" --arg content "$content" '{authorName:$author,content:$content}')" >/dev/null
    curl -fsS -X PUT "$BASE_URL/api/epics/$epic_id" \
      -H 'content-type: application/json' \
      --data "$(jq -n --arg target "$target_id" --argjson version "$version" '{agentId:$target,version:$version}')" >/dev/null
    echo "handed off $epic_id: $source_name -> $target_name"
  done
}

run_once() {
  USAGE_JSON="$(curl -fsS "$BASE_URL/api/provider-usage?projectId=$PROJECT_ID&maxAgeSec=60")"
  if [ -n "$SIMULATE_SOURCE" ]; then
    handoff_provider "$SIMULATE_SOURCE"
  else
    handoff_provider claude
    handoff_provider codex
  fi
}

require_command curl
require_command jq

if [ "$MODE" = "watch" ]; then
  while true; do
    run_once || echo "failover check failed at $(date -u +%FT%TZ)" >&2
    sleep "$INTERVAL"
  done
else
  run_once
fi

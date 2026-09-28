#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
required=(APP_DOMAIN NEXT_PUBLIC_APP_URL NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY CRON_SECRET)

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file. Copy server-config-template.txt and set its values."
  exit 1
fi

for key in "${required[@]}"; do
  value="$(awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$env_file")"
  if [[ -z "$value" || "$value" == *"REPLACE_"* || "$value" == *"YOUR_"* ]]; then
    echo "Missing usable $key in $env_file"
    exit 1
  fi
done

app_url="$(awk -F= '$1 == "NEXT_PUBLIC_APP_URL" { sub(/^[^=]*=/, ""); print; exit }' "$env_file")"
site_url="$(awk -F= '$1 == "NEXT_PUBLIC_SITE_URL" { sub(/^[^=]*=/, ""); print; exit }' "$env_file")"
if [[ "$app_url" != "$site_url" ]]; then
  echo "NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_SITE_URL must match for this single-domain deployment."
  exit 1
fi

echo "Docker preflight passed for $(awk -F= '$1 == "APP_DOMAIN" { print $2; exit }' "$env_file")."

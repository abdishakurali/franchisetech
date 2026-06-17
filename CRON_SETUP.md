# FridgeProof Reminder Cron Setup

Env vars needed on server (add to /var/www/fridgeproof/.env.local):
  RESEND_API_KEY=re_...  (already set)
  RESEND_FROM_EMAIL=FridgeProof <reminders@yourdomain.com>
  CRON_SECRET=$(openssl rand -hex 32)
  SUPABASE_SERVICE_ROLE_KEY=...  (Supabase project -> API keys)

Script /usr/local/bin/fridgeproof-send-reminders.sh:
  #!/bin/bash
  set -a; source /var/www/fridgeproof/.env.local; set +a
  curl -s -X POST https://fridgeproof.franchisetech.ro/api/cron/send-reminders
    -H "Authorization: Bearer ${CRON_SECRET}"
    >> /var/log/fridgeproof-reminders.log 2>&1

crontab entry: */5 * * * * /usr/local/bin/fridgeproof-send-reminders.sh

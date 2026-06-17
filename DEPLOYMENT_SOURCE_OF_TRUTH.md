The active source of truth for FridgeProof is:
/Users/abdishakuurally/Documents/Codex/2026-06-02/files-mentioned-by-the-user-pasted/work/fridgeproof

Do not deploy from /Users/abdishakuurally/fridgeproof unless it has been intentionally synced.

Production path:
/var/www/fridgeproof

Last deployed: 2026-06-03
Build status: ✅ 51 routes built successfully (build passes locally and on server)
PM2: online (restarts after each request due to missing .env.local)

⚠️  ACTION REQUIRED: .env.local was deleted during server cleanup.
    Copy /var/www/fridgeproof/.env.local.example to .env.local and fill in:
      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY
      - RESEND_API_KEY (already have it)
      - RESEND_FROM_EMAIL
      - CRON_SECRET (run: openssl rand -hex 32)
    Then: pm2 restart fridgeproof --update-env

New features added (2026-06-03):
  - /app/reminders — reminder schedules page
  - /api/cron/send-reminders — cron endpoint (needs CRON_SECRET)
  - /api/reminders/test-email — send test email
  - supabase/migrations/008_reminder_schedules.sql — apply to Supabase

-- Replaces the disabled n8n workflow (outreach/n8n-owner-digest-cron.workflow.ts)
-- as the trigger for /api/cron/owner-digest. Vercel Cron on this account's
-- Hobby plan is limited to once/day, but the route needs a 5-minute cadence
-- (OWNER_DIGEST_SEND_WINDOW_MINUTES = 15 in lib/owner-digest/schedule.ts) to
-- catch each org's own configured local send time. pg_cron + pg_net run this
-- directly from the database, independent of both n8n and Vercel's cron limits.
--
-- The bearer token is stored in Supabase Vault (secret name
-- 'pg_cron_owner_digest_secret', created separately via the dashboard/MCP,
-- not in this file) and looked up at run time. It is a separate value from
-- the app's own CRON_SECRET env var (see app/api/cron/owner-digest/route.ts),
-- so rotating either one can never break the other trigger path.
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule('owner-digest-every-5-min')
where exists (select 1 from cron.job where jobname = 'owner-digest-every-5-min');

select cron.schedule(
  'owner-digest-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://www.franchisetech.ro/api/cron/owner-digest',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pg_cron_owner_digest_secret')
    ),
    timeout_milliseconds := 20000
  );
  $$
);

# Customer notification schedules

Production reminders run through Vercel Cron and Resend. They do not depend on n8n.

Schedules are declared in `vercel.json`:

- Billing reminders: daily at 08:00 UTC.

Vercel sends `Authorization: Bearer $CRON_SECRET`. The route also accepts authenticated POST requests for operational retries.

Billing reminders use the trial end or grace-period end as a stable incident key. A customer receives at most one email of each type for each billing incident.

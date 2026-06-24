import {
  workflow,
  node,
  trigger,
  expr,
  newCredential,
} from '@n8n/workflow-sdk';

const manualTrigger = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Manual Trigger' },
});

const dailySchedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Daily 7am Bucharest',
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '0 5 * * *',
          },
        ],
      },
    },
  },
});

const planC2Customers = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan C2 Customers',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const sb = 'https://ycqzxlahhfqwuteistvf.supabase.co/rest/v1';
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
const cron = $env.CRON_SECRET;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
if (!cron) throw new Error('CRON_SECRET missing');

const sbHeaders = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function profileExists(email) {
  const url = sb + '/profiles?email=eq.' + encodeURIComponent(email) + '&select=email';
  const rows = await this.helpers.httpRequest({ method: 'GET', url, headers: sbHeaders, json: true });
  return Array.isArray(rows) && rows.length > 0;
}

async function logRow(entry) {
  await this.helpers.httpRequest({ method: 'POST', url: sb + '/outreach_log', headers: sbHeaders, body: entry, json: true });
}

const resp = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://franchisetech.ro/api/outreach/followup?type=customer&step=2&limit=10',
  headers: { Authorization: 'Bearer ' + cron },
  json: true,
});

const rows = resp.rows || [];
let planned = 0;
let skipped = 0;

for (const row of rows) {
  const email = String(row.email || '').trim().toLowerCase();
  if (!email) continue;
  const base = {
    email,
    company: row.company || null,
    type: 'customer',
    step: 2,
    campaign: 'v2-franchisetech',
  };
  if (await profileExists.call(this, email)) {
    await logRow.call(this, { ...base, status: 'skipped_existing_user' });
    skipped += 1;
  } else {
    await logRow.call(this, { ...base, status: 'planned' });
    planned += 1;
  }
}

return [{ json: { c2_planned: planned, c2_skipped: skipped } }];
`,
    },
  },
});

const buildSummary = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Summary',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const j = $input.first().json;
const p = j.c2_planned || 0;
const text = p > 0
  ? '📧 C2 follow-up ready: ' + p + ' customer emails queued (day 4).\\nRun /daily-outreach in Cursor with step=2.'
  : '📧 C2 follow-up: none due today.';
return [{ json: { message: text, c2_planned: p } }];
`,
    },
  },
});

const telegramSummary = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Telegram Summary',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '8505337023',
      text: expr('={{ $json.message }}'),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('My Telegram') },
  },
});

export default workflow('outreach-c2-planner', 'Outreach — C2 Follow-up Planner')
  .add(manualTrigger)
  .to(planC2Customers)
  .to(buildSummary)
  .to(telegramSummary)
  .add(dailySchedule)
  .to(planC2Customers);

import {
  workflow,
  node,
  trigger,
  merge,
  expr,
  newCredential,
} from '@n8n/workflow-sdk';

const manualTrigger = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Manual Trigger' },
});

const planCustomers = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Customers (dedup + log)',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const sb = 'https://ycqzxlahhfqwuteistvf.supabase.co/rest/v1';
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
const cron = $env.CRON_SECRET;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing on n8n');
if (!cron) throw new Error('CRON_SECRET missing on n8n — add from production .env.local');

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
  url: 'https://franchisetech.ro/api/outreach/customers?limit=10',
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
    step: 1,
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

return [{ json: { customer_planned: planned, customer_skipped: skipped } }];
`,
    },
  },
});

const planPartners = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Partners (dedup + log)',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const sb = 'https://ycqzxlahhfqwuteistvf.supabase.co/rest/v1';
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
const cron = $env.CRON_SECRET;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing on n8n');
if (!cron) throw new Error('CRON_SECRET missing on n8n');

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
  url: 'https://franchisetech.ro/api/outreach/partners?limit=4',
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
    type: 'partner',
    step: 1,
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

return [{ json: { partner_planned: planned, partner_skipped: skipped } }];
`,
    },
  },
});

const combineCounts = merge({
  version: 3.2,
  config: {
    name: 'Combine Counts',
    parameters: { mode: 'combine', combineBy: 'combineByPosition' },
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
const items = $input.all();
const customer = items.find(i => i.json.customer_planned !== undefined)?.json || { customer_planned: 0, customer_skipped: 0 };
const partner = items.find(i => i.json.partner_planned !== undefined)?.json || { partner_planned: 0, partner_skipped: 0 };
const cp = customer.customer_planned || 0;
const pp = partner.partner_planned || 0;
const text = '📧 Outreach plan ready: ' + cp + ' customer + ' + pp + ' partner emails queued.\\nRun /daily-outreach in Cursor to send.';
return [{ json: { message: text, customer_planned: cp, partner_planned: pp } }];
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
      text: expr("={{ $json.message }}"),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('My Telegram') },
  },
});

export default workflow('outreach-daily-planner', 'Outreach — Daily Planner')
  .add(manualTrigger)
  .to(planCustomers.to(combineCounts.input(0)))
  .add(manualTrigger)
  .to(planPartners.to(combineCounts.input(1)))
  .add(combineCounts)
  .to(buildSummary)
  .to(telegramSummary);

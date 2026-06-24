import {
  workflow,
  node,
  trigger,
  expr,
  newCredential,
} from '@n8n/workflow-sdk';

const mondaySchedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Monday 8am Bucharest',
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '0 6 * * 1',
          },
        ],
      },
    },
  },
});

const manualTrigger = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Manual Trigger' },
});

const buildMetrics = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Weekly Metrics',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const sb = 'https://ycqzxlahhfqwuteistvf.supabase.co/rest/v1';
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing on n8n');

const headers = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

async function count(path) {
  const url = sb + path;
  const res = await this.helpers.httpRequest({
    method: 'GET',
    url,
    headers: { ...headers, Prefer: 'count=exact' },
    json: false,
    returnFullResponse: true,
  });
  const range = res.headers['content-range'] || res.headers['Content-Range'] || '';
  const m = /\\/(\d+)$/.exec(range);
  return m ? parseInt(m[1], 10) : 0;
}

const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

const signups = await count.call(this, '/organisations?select=id&created_at=gte.' + encodeURIComponent(weekAgo));
const till = await count.call(this, '/organisations?select=id&created_at=gte.' + encodeURIComponent(weekAgo) + '&growth_till_opened_at=not.is.null');
const sale = await count.call(this, '/organisations?select=id&created_at=gte.' + encodeURIComponent(weekAgo) + '&growth_first_sale_at=not.is.null');
const report = await count.call(this, '/organisations?select=id&created_at=gte.' + encodeURIComponent(weekAgo) + '&growth_first_report_at=not.is.null');
const activated = await count.call(this, '/organisations?select=id&created_at=gte.' + encodeURIComponent(weekAgo) + '&growth_activated_at=not.is.null');

const outreachSent = await count.call(this, '/outreach_log?select=id&campaign=eq.v2-franchisetech&status=eq.sent&sent_at=gte.' + encodeURIComponent(weekAgo));

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

const weekOf = new Date().toISOString().slice(0, 10);
let focus = 'Guide every new trial to first sale within 48h (founder call + POS tour).';
if (signups > 0 && sale / signups < 0.5) {
  focus = 'Weakest: first sale — call IE/RO trials stuck after 24h; offer 30-min screen share.';
} else if (sale > 0 && report / sale < 0.5) {
  focus = 'Weakest: Z-report — walk owners through till close after first sale.';
} else if (signups === 0) {
  focus = 'Weakest: signups — keep RO outreach + partner follow-ups running daily.';
}

const text = [
  '📊 Weekly Digest — Week of ' + weekOf,
  '',
  'FUNNEL (7d)',
  'Trial signups: ' + signups,
  '→ Till opened: ' + till + ' (' + pct(till, signups) + '%)',
  '→ First sale: ' + sale + ' (' + pct(sale, signups) + '%)',
  '→ Z-report: ' + report + ' (' + pct(report, signups) + '%)',
  '→ Activated: ' + activated + ' (' + pct(activated, signups) + '%)',
  '',
  'OUTREACH (7d sent): ' + outreachSent,
  '',
  'NEXT WEEK FOCUS',
  focus,
].join('\\n');

return [{ json: { message: text } }];
`,
    },
  },
});

const telegramDigest = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Telegram Digest',
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

export default workflow('weekly-metrics-digest', 'Growth — Weekly Metrics Digest')
  .add(mondaySchedule)
  .to(buildMetrics)
  .to(telegramDigest)
  .add(manualTrigger)
  .to(buildMetrics);

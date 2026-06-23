import {
  workflow,
  node,
  trigger,
} from '@n8n/workflow-sdk';

// Fires every hour at :00. isOwnerDigestDue() inside the route decides
// whether each org's scheduled window has arrived -- so hourly is correct.
const hourlySchedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Every Hour',
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '0 * * * *',
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

const callDigestCron = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Call Owner Digest Cron',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const cron = $env.CRON_SECRET;
if (!cron) throw new Error('CRON_SECRET missing from n8n environment variables');

const res = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://franchisetech.ro/api/cron/owner-digest',
  headers: { Authorization: 'Bearer ' + cron },
  json: true,
  returnFullResponse: true,
});

if (res.statusCode !== 200) {
  throw new Error('Digest cron failed: HTTP ' + res.statusCode + ' -- ' + JSON.stringify(res.body));
}

const { checked = 0, sent = 0, failed = 0, skipped = 0 } = res.body || {};
return [{ json: { checked, sent, failed, skipped, ok: failed === 0 } }];
`,
    },
  },
});

const telegramAlert = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Telegram -- Digest Result',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '8505337023',
      text: "={{ '\u2709\ufe0f Owner digest: ' + $json.sent + ' sent, ' + $json.failed + ' failed, ' + $json.skipped + ' skipped (checked: ' + $json.checked + ')' }}",
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: { name: 'My Telegram' } },
  },
});

export default workflow('owner-digest-cron', 'Owner Digest -- Hourly Cron')
  .add(hourlySchedule)
  .to(callDigestCron)
  .to(telegramAlert)
  .add(manualTrigger)
  .to(callDigestCron);

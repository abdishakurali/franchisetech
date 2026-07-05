import {
  workflow,
  node,
  trigger,
} from '@n8n/workflow-sdk';

// Fires daily at 23:00 UTC = 02:00 EET (summer UTC+3) / 01:00 EET (winter UTC+2).
// After the workflow runs, check Telegram for backup confirmation.
const dailySchedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Daily 23:00 UTC',
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '0 23 * * *',
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

const callBackupCron = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Call Backup Cron',
    executeOnce: true,
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `
const cron = $env.CRON_SECRET;
if (!cron) throw new Error('CRON_SECRET missing from n8n environment variables');

const res = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://franchisetech.ro/api/cron/backup-db',
  headers: { Authorization: 'Bearer ' + cron },
  json: true,
  returnFullResponse: true,
});

if (res.statusCode === 503) {
  throw new Error('Backup not configured: ' + (res.body?.error ?? 'DIRECT_DB_URL missing on server'));
}

if (res.statusCode !== 200 || !res.body?.success) {
  throw new Error('Backup failed: HTTP ' + res.statusCode + ' -- ' + JSON.stringify(res.body));
}

const { timestamp = '', sizeBytes = 0, backupsKept = 0 } = res.body;
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);
return [{ json: { timestamp, sizeBytes, sizeMB, backupsKept } }];
`,
    },
  },
});

const telegramAlert = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Telegram -- Backup Result',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '8505337023',
      text: "={{ '💾 DB backup OK — ' + $json.timestamp + ', ' + $json.sizeMB + ' MB, ' + $json.backupsKept + ' backups kept' }}",
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: { name: 'My Telegram' } },
  },
});

export default workflow('db-backup-daily', 'DB Backup -- Daily 02:00 EET')
  .add(dailySchedule)
  .to(callBackupCron)
  .to(telegramAlert)
  .add(manualTrigger)
  .to(callBackupCron);

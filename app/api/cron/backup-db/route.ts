// POST /api/cron/backup-db
// Requires: Authorization: Bearer <CRON_SECRET>
// Schedule via n8n daily at 02:00 EET (see outreach/n8n-db-backup.workflow.ts).
// Prerequisites on do-server:
//   apt-get install -y postgresql-client-17
//   Add DIRECT_DB_URL to /var/www/fridgeproof/.env.local (Session mode URI from Supabase dashboard)

import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, stat, readdir } from "fs/promises";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);
const BACKUP_DIR = "/var/www/fp-releases/backups";
const RETENTION_DAYS = 7;
// Use the versioned binary — system pg_dump may lag behind Supabase's Postgres version
const PG_DUMP = "/usr/lib/postgresql/17/bin/pg_dump";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const directDbUrl = process.env.DIRECT_DB_URL;
  if (!directDbUrl) {
    return NextResponse.json(
      { error: "DIRECT_DB_URL not configured — add Session mode URI from Supabase Dashboard → Settings → Database to .env.local on do-server" },
      { status: 503 }
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupFile = `${BACKUP_DIR}/backup_${timestamp}.sql.gz`;

  try {
    await mkdir(BACKUP_DIR, { recursive: true });

    // Run pg_dump and gzip in one pipeline. 5-minute timeout covers large dumps.
    await execAsync(
      `${PG_DUMP} ${JSON.stringify(directDbUrl)} | gzip > ${JSON.stringify(backupFile)}`,
      { timeout: 5 * 60 * 1000, shell: "/bin/bash" }
    );

    const { size: sizeBytes } = await stat(backupFile);

    // Prune backups older than RETENTION_DAYS
    await execAsync(
      `find ${JSON.stringify(BACKUP_DIR)} -name 'backup_*.sql.gz' -mtime +${RETENTION_DAYS} -delete`,
      { shell: "/bin/bash" }
    );

    const remaining = await readdir(BACKUP_DIR);
    const backupsKept = remaining.filter((f) => f.startsWith("backup_") && f.endsWith(".sql.gz")).length;

    return NextResponse.json({ success: true, timestamp, sizeBytes, backupsKept, path: backupFile });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

#!/usr/bin/env node
/**
 * Apply migration 037 to production Postgres (DDL only).
 * Requires explicit opt-in and DATABASE_URL — never commit or write credentials.
 *
 * Usage:
 *   ALLOW_PROD_MIGRATE=1 \
 *   DATABASE_URL='postgresql://postgres.[ref]:PASSWORD@...' \
 *     node scripts/apply-migration-037-production.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const PRODUCTION_REF = "ycqzxlahhfqwuteistvf";
const MIGRATION_FILE = "037_nir_purchase_fields.sql";

const PURCHASE_COLUMNS = [
  "nir_number",
  "nir_date",
  "supplier_invoice_date",
  "site_id",
  "received_by_user_id",
  "posted_at",
  "posted_by",
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = resolve(root, "supabase/migrations", MIGRATION_FILE);

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function redactDatabaseUrl(dbUrl) {
  try {
    const parsed = new URL(dbUrl.replace(/^postgresql:\/\//, "http://"));
    return {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.replace(/^\//, "") || "postgres",
      user: parsed.username || "(unknown)",
    };
  } catch {
    return { host: "(invalid DATABASE_URL)", port: "", database: "", user: "" };
  }
}

function assertProductionTarget(dbUrl) {
  if (process.env.ALLOW_PROD_MIGRATE !== "1") {
    fail(
      "Refusing production migration apply.\n" +
        "Set ALLOW_PROD_MIGRATE=1 to confirm you intend to modify production."
    );
  }

  if (!dbUrl) {
    fail(
      "DATABASE_URL is required.\n" +
        "Get it from Supabase Dashboard → Project Settings → Database → Connection string (URI)."
    );
  }

  if (!dbUrl.includes(PRODUCTION_REF)) {
    fail(
      `Refusing: DATABASE_URL must reference production project ${PRODUCTION_REF}.\n` +
        "Use the connection string for ycqzxlahhfqwuteistvf only."
    );
  }
}

async function columnExists(client, table, column) {
  const { rows } = await client.query(
    `select 1
     from information_schema.columns
     where table_schema = 'public'
       and table_name = $1
       and column_name = $2
     limit 1`,
    [table, column]
  );
  return rows.length > 0;
}

async function tableExists(client, table) {
  const { rows } = await client.query(
    `select 1
     from information_schema.tables
     where table_schema = 'public'
       and table_name = $1
     limit 1`,
    [table]
  );
  return rows.length > 0;
}

async function functionExists(client, name) {
  const { rows } = await client.query(
    `select 1
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = $1
     limit 1`,
    [name]
  );
  return rows.length > 0;
}

async function migrationAlreadyApplied(client) {
  for (const col of PURCHASE_COLUMNS) {
    if (!(await columnExists(client, "purchases", col))) return false;
  }
  if (!(await tableExists(client, "nir_sequences"))) return false;
  if (!(await functionExists(client, "post_nir_purchase"))) return false;
  if (!(await functionExists(client, "next_nir_number"))) return false;
  return true;
}

const dbUrl = process.env.DATABASE_URL?.trim();
assertProductionTarget(dbUrl);

let sql;
try {
  sql = readFileSync(migrationPath, "utf8");
} catch {
  fail(`Migration file not found: supabase/migrations/${MIGRATION_FILE}`);
}

if (!sql.trim()) {
  fail(`Migration file is empty: supabase/migrations/${MIGRATION_FILE}`);
}

const target = redactDatabaseUrl(dbUrl);
console.log("Production migration apply");
console.log(`  project ref: ${PRODUCTION_REF}`);
console.log(`  host: ${target.host}`);
console.log(`  port: ${target.port}`);
console.log(`  database: ${target.database}`);
console.log(`  user: ${target.user}`);
console.log(`  migration: supabase/migrations/${MIGRATION_FILE}`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  if (await migrationAlreadyApplied(client)) {
    console.log("\nMigration 037 already fully applied (idempotent verification).");
    console.log("No changes made.");
    process.exit(0);
  }

  const partial =
    (await columnExists(client, "purchases", "nir_number")) ||
    (await tableExists(client, "nir_sequences")) ||
    (await functionExists(client, "post_nir_purchase"));

  if (partial) {
    fail(
      "Migration 037 appears partially applied.\n" +
        "Do not re-run blindly. Inspect production schema and finish manually or restore from backup."
    );
  }

  console.log("\nApplying migration …");
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log("Migration 037 applied successfully.");
  console.log("\nNext: ALLOW_PROD_SCHEMA_CHECK=1 DATABASE_URL=... npm run check-prod-nir-schema");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  fail(`Migration failed: ${err.message}`);
} finally {
  await client.end().catch(() => {});
}

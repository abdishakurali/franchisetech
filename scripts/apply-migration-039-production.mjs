#!/usr/bin/env node
/**
 * Apply migration 039 (business profile + module flags) to production Postgres.
 *
 * Usage:
 *   ALLOW_PROD_MIGRATE=1 \
 *   DATABASE_URL='postgresql://postgres.[ref]:PASSWORD@...' \
 *     node scripts/apply-migration-039-production.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const PRODUCTION_REF = "ycqzxlahhfqwuteistvf";
const MIGRATION_FILE = "039_business_profile_modules.sql";
const REQUIRED_COLUMNS = ["inventory_enabled", "recipe_costing_enabled", "business_profile"];

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
    fail("DATABASE_URL is required (Supabase → Database → Connection string URI).");
  }
  if (!dbUrl.includes(PRODUCTION_REF)) {
    fail(`DATABASE_URL must reference production project ${PRODUCTION_REF}.`);
  }
}

async function columnExists(client, column) {
  const { rows } = await client.query(
    `select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'organisations' and column_name = $1
     limit 1`,
    [column]
  );
  return rows.length > 0;
}

async function migrationAlreadyApplied(client) {
  for (const col of REQUIRED_COLUMNS) {
    if (!(await columnExists(client, col))) return false;
  }
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

const target = redactDatabaseUrl(dbUrl);
console.log("Production migration apply");
console.log(`  project ref: ${PRODUCTION_REF}`);
console.log(`  host: ${target.host}`);
console.log(`  migration: supabase/migrations/${MIGRATION_FILE}`);

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();

  if (await migrationAlreadyApplied(client)) {
    console.log("\nMigration 039 already applied. No changes made.");
    process.exit(0);
  }

  const partial = await columnExists(client, "inventory_enabled");
  if (partial) {
    fail("Migration 039 appears partially applied. Inspect schema before re-running.");
  }

  console.log("\nApplying migration …");
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log("Migration 039 applied successfully.");
  console.log("\nNext: DATABASE_URL=... node scripts/check-prod-module-flags-schema.mjs");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  fail(`Migration failed: ${err.message}`);
} finally {
  await client.end().catch(() => {});
}

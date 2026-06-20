#!/usr/bin/env node
/**
 * Read-only check: migration 039 module columns on organisations.
 */
import pg from "pg";

const PRODUCTION_REF = "ycqzxlahhfqwuteistvf";
const REQUIRED_COLUMNS = [
  "business_profile",
  "inventory_enabled",
  "recipe_costing_enabled",
  "team_advanced_enabled",
  "multi_site_ops_enabled",
  "onboarding_completed_at",
];

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) fail("Set DATABASE_URL to run this check.");
  if (!dbUrl.includes(PRODUCTION_REF)) {
    fail(`DATABASE_URL must reference production project ${PRODUCTION_REF}.`);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows } = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema = 'public'
       and table_name = 'organisations'
       and column_name = any($1::text[])`,
    [REQUIRED_COLUMNS]
  );

  const found = new Set(rows.map((r) => r.column_name));
  const missing = REQUIRED_COLUMNS.filter((c) => !found.has(c));

  if (missing.length) {
    console.log("Migration 039 NOT applied. Missing columns on organisations:");
    for (const col of missing) console.log(`  - ${col}`);
    process.exit(2);
  }

  console.log("Migration 039 appears APPLIED — all module columns present.");
  await client.end();
}

main().catch((err) => fail(err?.message ?? String(err)));

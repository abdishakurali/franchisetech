#!/usr/bin/env node
/**
 * Read-only production schema check for migration 037.
 * Requires explicit opt-in — never loads repo .env or stores credentials.
 *
 * Usage:
 *   ALLOW_PROD_SCHEMA_CHECK=1 \
 *   DATABASE_URL='postgresql://postgres.[ref]:PASSWORD@...' \
 *     node scripts/check-prod-nir-schema.mjs
 */
import pg from "pg";

const PRODUCTION_REF = "ycqzxlahhfqwuteistvf";

const PURCHASE_COLUMNS = [
  "nir_number",
  "nir_date",
  "supplier_invoice_date",
  "site_id",
  "received_by_user_id",
  "posted_at",
  "posted_by",
];

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
  if (process.env.ALLOW_PROD_SCHEMA_CHECK !== "1") {
    fail(
      "Refusing production schema check.\n" +
        "Set ALLOW_PROD_SCHEMA_CHECK=1 to confirm you intend to probe production."
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

async function functionGrants(client, name) {
  const { rows } = await client.query(
    `select grantee, privilege_type
     from information_schema.routine_privileges
     where routine_schema = 'public'
       and routine_name = $1
     order by grantee, privilege_type`,
    [name]
  );
  return rows;
}

const dbUrl = process.env.DATABASE_URL?.trim();
assertProductionTarget(dbUrl);

const target = redactDatabaseUrl(dbUrl);
console.log("Production schema check");
console.log(`  project ref: ${PRODUCTION_REF}`);
console.log(`  host: ${target.host}`);
console.log(`  port: ${target.port}`);
console.log(`  database: ${target.database}`);
console.log(`  user: ${target.user}`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const colResults = {};
  for (const col of PURCHASE_COLUMNS) {
    colResults[col] = await columnExists(client, "purchases", col);
  }

  const nirSeqExists = await tableExists(client, "nir_sequences");
  const postRpcExists = await functionExists(client, "post_nir_purchase");
  const nextRpcExists = await functionExists(client, "next_nir_number");

  let grants = [];
  if (postRpcExists) {
    grants = await functionGrants(client, "post_nir_purchase");
  }

  const { rows: legacyRows } = await client.query(
    `select id, status, nir_number
     from public.purchases
     where status = 'received'
     limit 3`
  );

  console.log("\n=== purchases columns (037) ===");
  for (const [col, exists] of Object.entries(colResults)) {
    console.log(`  ${col}: ${exists ? "EXISTS" : "MISSING"}`);
  }
  console.log(`  nir_sequences table: ${nirSeqExists ? "EXISTS" : "MISSING"}`);
  console.log(`  post_nir_purchase(): ${postRpcExists ? "EXISTS" : "MISSING"}`);
  console.log(`  next_nir_number(): ${nextRpcExists ? "EXISTS" : "MISSING"}`);

  if (grants.length) {
    console.log("  post_nir_purchase grants:");
    for (const row of grants) {
      console.log(`    ${row.grantee}: ${row.privilege_type}`);
    }
  } else if (postRpcExists) {
    console.log("  post_nir_purchase grants: (none listed via information_schema)");
  }

  console.log(`  legacy received sample: ${legacyRows.length} row(s)`);

  const applied =
    Object.values(colResults).every(Boolean) &&
    nirSeqExists &&
    postRpcExists &&
    nextRpcExists;

  console.log("\nVERDICT:", applied ? "037 APPLIED" : "037 NOT APPLIED");
  process.exit(applied ? 0 : 2);
} catch (err) {
  fail(`Schema check failed: ${err.message}`);
} finally {
  await client.end().catch(() => {});
}

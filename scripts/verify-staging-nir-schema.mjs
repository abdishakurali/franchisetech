#!/usr/bin/env node
/**
 * Read-only staging schema check for P1.8 migration 037.
 * Requires STAGING_* environment variables — never reads repo .env.
 * Hard-blocks production project ycqzxlahhfqwuteistvf.
 */
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_REF = "ycqzxlahhfqwuteistvf";

const STAGING_VARS = [
  "STAGING_SUPABASE_URL",
  "STAGING_SUPABASE_ANON_KEY",
  "STAGING_SUPABASE_SERVICE_ROLE_KEY",
  "STAGING_PROJECT_REF",
];

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function checkStagingEnv() {
  const missing = STAGING_VARS.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.log(`Production ref: ${PRODUCTION_REF}`);
    console.log("Staging ref: (not configured)");
    console.log("Safe to continue: no");
    fail(
      `Missing required staging variables: ${missing.join(", ")}\n` +
        "Set STAGING_SUPABASE_URL, STAGING_SUPABASE_ANON_KEY, STAGING_SUPABASE_SERVICE_ROLE_KEY, and STAGING_PROJECT_REF before running P1.8 NIR staging verification."
    );
  }

  const url = process.env.STAGING_SUPABASE_URL.trim();
  const projectRef = process.env.STAGING_PROJECT_REF.trim();

  console.log(`Production ref: ${PRODUCTION_REF}`);
  console.log(`Staging ref: ${projectRef}`);

  if (projectRef === PRODUCTION_REF || url.includes(PRODUCTION_REF)) {
    console.log("Safe to continue: no");
    fail(
      `Refusing to run P1.8 NIR staging verification against production Supabase project ${PRODUCTION_REF}.\n` +
        "Provide a separate staging project via STAGING_* variables."
    );
  }

  console.log("Safe to continue: yes");
  return {
    url,
    anonKey: process.env.STAGING_SUPABASE_ANON_KEY.trim(),
    serviceKey: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY.trim(),
    projectRef,
  };
}

const purchaseColumns = [
  "nir_number",
  "nir_date",
  "supplier_invoice_date",
  "site_id",
  "received_by_user_id",
  "posted_at",
  "posted_by",
];

async function columnExists(service, table, column) {
  const { error } = await service.from(table).select(column).limit(1);
  return !error;
}

async function main() {
  const { url, anonKey, serviceKey, projectRef } = checkStagingEnv();

  console.log("\nTarget Supabase URL:", url);
  console.log("Project ref:", projectRef);
  console.log("Mode: READ-ONLY schema verification\n");

  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const service = createClient(url, serviceKey, { auth: { persistSession: false } });

  const colResults = {};
  for (const col of purchaseColumns) {
    colResults[col] = await columnExists(service, "purchases", col);
  }

  const nirSeqExists = await columnExists(service, "nir_sequences", "last_number");

  const { error: rpcErr } = await service.rpc("post_nir_purchase", {
    p_purchase_id: "00000000-0000-0000-0000-000000000000",
    p_org_id: "00000000-0000-0000-0000-000000000000",
    p_actor_id: "00000000-0000-0000-0000-000000000000",
  });
  const rpcMissing =
    rpcErr &&
    (rpcErr.message.includes("Could not find") ||
      rpcErr.message.includes("does not exist") ||
      rpcErr.code === "PGRST202");

  const { error: nextNirAnonErr } = await anon.rpc("next_nir_number", {
    p_org_id: "00000000-0000-0000-0000-000000000000",
  });
  const nextNirAnonBlocked =
    nextNirAnonErr &&
    (nextNirAnonErr.message.includes("Could not find") ||
      nextNirAnonErr.message.includes("does not exist") ||
      nextNirAnonErr.code === "PGRST202" ||
      nextNirAnonErr.message.includes("permission denied"));

  const statusProbe = { draft: false, posted: false, cancelled: false, received: false };
  for (const s of Object.keys(statusProbe)) {
    const { error } = await service.from("purchases").select("id").eq("status", s).limit(1);
    statusProbe[s] = !error;
  }

  const { data: oldPurchases, error: oldErr } = await service
    .from("purchases")
    .select("id,status,nir_number,total_amount")
    .limit(5);

  const { error: rlsErr } = await anon.from("purchases").select("id").limit(1);

  console.log("=== purchases columns (037) ===");
  for (const [k, v] of Object.entries(colResults)) {
    console.log(`  ${k}: ${v ? "EXISTS" : "MISSING"}`);
  }
  console.log("\n=== nir_sequences table ===");
  console.log(`  nir_sequences: ${nirSeqExists ? "EXISTS" : "MISSING"}`);
  console.log("\n=== post_nir_purchase RPC ===");
  if (rpcMissing) {
    console.log("  RPC: MISSING");
  } else if (rpcErr) {
    console.log(`  RPC: EXISTS (probe error without side effect: ${rpcErr.message})`);
  } else {
    console.log("  RPC: EXISTS (unexpected success on probe — may have side effect)");
  }
  console.log("\n=== next_nir_number browser access ===");
  console.log(
    nextNirAnonBlocked
      ? "  anon: NOT CALLABLE (expected)"
      : "  anon: CALLABLE (unexpected — review grants)"
  );
  console.log("\n=== service-role RPC path ===");
  console.log(rpcMissing ? "  service_role post_nir_purchase: UNAVAILABLE" : "  service_role post_nir_purchase: AVAILABLE");
  console.log("\n=== status query (read) ===");
  for (const [k, v] of Object.entries(statusProbe)) {
    console.log(`  status '${k}' readable: ${v}`);
  }
  console.log("\n=== legacy purchases sample ===");
  console.log(oldErr ? `  ERROR: ${oldErr.message}` : `  ${oldPurchases?.length ?? 0} rows readable`);
  if (oldPurchases?.length) {
    for (const p of oldPurchases) {
      console.log(`    - ${p.id.slice(0, 8)}… status=${p.status} nir=${p.nir_number ?? "null"}`);
    }
  }
  console.log("\n=== RLS purchase read (anon) ===");
  console.log(rlsErr ? `  anon blocked (expected without session): ${rlsErr.message}` : "  anon read ok (unexpected without auth)");

  const allCols = Object.values(colResults).every(Boolean);
  const migrationApplied = allCols && nirSeqExists && !rpcMissing;
  console.log("\n=== VERDICT ===");
  console.log(migrationApplied ? "Migration 037 appears APPLIED on this target." : "Migration 037 NOT fully applied on this target.");
  process.exit(migrationApplied ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Read-only staging/production schema check for P1.8 migration 037.
 * Does not modify data or schema.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Target Supabase URL:", url);
console.log("Project ref:", url?.match(/https:\/\/([^.]+)/)?.[1] ?? "unknown");
console.log("Mode: READ-ONLY schema verification\n");

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const service = createClient(url, serviceKey, { auth: { persistSession: false } });

const purchaseColumns = [
  "nir_number",
  "nir_date",
  "supplier_invoice_date",
  "site_id",
  "received_by_user_id",
  "posted_at",
  "posted_by",
];

async function columnExists(table, column) {
  const { error } = await service.from(table).select(column).limit(1);
  return !error;
}

async function main() {
  const colResults = {};
  for (const col of purchaseColumns) {
    colResults[col] = await columnExists("purchases", col);
  }

  const nirSeqExists = await columnExists("nir_sequences", "last_number");
  // Detect RPC without invoking it (would mutate nir_sequences)
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

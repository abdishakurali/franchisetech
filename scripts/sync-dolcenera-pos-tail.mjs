#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const values = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const split = line.indexOf("=");
    if (split < 1) continue;
    values[line.slice(0, split)] = line.slice(split + 1).replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const sourceEnv = loadEnv(".env.local");
const targetEnv = loadEnv(".env.e2e.local");
const source = createClient(sourceEnv.NEXT_PUBLIC_SUPABASE_URL, sourceEnv.SUPABASE_SERVICE_ROLE_KEY);
const target = createClient(targetEnv.NEXT_PUBLIC_SUPABASE_URL, targetEnv.SUPABASE_SERVICE_ROLE_KEY);
const apply = process.argv.includes("--apply");

const SOURCE_ORG = "b01ce0e0-d01c-4042-0000-000000000042";
const TARGET_ORG = "4cc40c07-c944-4189-9415-153899fe7c02";

const txColumns = [
  "id", "transaction_number", "sold_at", "sold_by", "payment_method_id", "subtotal",
  "tax_total", "total", "notes", "status", "created_at", "subtotal_net", "discount_total",
  "total_gross", "session_id", "subtotal_gross_before_discount", "customer_id", "customer_name",
  "fiscal_receipt_required", "fiscal_receipt_status", "fiscal_receipt_number",
  "fiscal_receipt_attempt_id", "tip_amount", "site_id", "discount_pct", "order_source",
  "external_order_id", "table_tab_id", "idempotency_key",
];
const itemColumns = [
  "id", "transaction_id", "product_id", "product_name", "quantity", "unit_price", "vat_rate",
  "line_total", "unit_price_gross", "net_amount", "vat_amount", "gross_amount", "discount_amount",
  "site_id", "discount_pct", "modifiers_snapshot", "recipe_id",
];
const sessionColumns = [
  "id", "opened_by", "opened_at", "opening_cash", "closed_by", "closed_at", "counted_cash",
  "expected_cash", "cash_difference", "notes", "status", "created_at", "updated_at",
  "fiscal_z_report_done", "fiscal_z_report_at", "fiscal_z_report_log_id",
  "fiscal_opening_balance_done", "fiscal_opening_balance_at", "site_id", "cash_breakdown",
];

function assertNoError(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data ?? [];
}

async function selectIn(client, table, columns, key, values) {
  const rows = [];
  for (let index = 0; index < values.length; index += 100) {
    const part = values.slice(index, index + 100);
    if (!part.length) continue;
    rows.push(...assertNoError(await client.from(table).select(columns.join(",")).in(key, part), table));
  }
  return rows;
}

function addMap(map, from, to, label) {
  if (!from) return;
  if (!to) throw new Error(`Missing target ${label} for ${from}`);
  const previous = map.get(from);
  if (previous && previous !== to) throw new Error(`Ambiguous ${label} mapping for ${from}`);
  map.set(from, to);
}

const latest = assertNoError(
  await target.from("pos_transactions").select("sold_at").eq("organisation_id", TARGET_ORG)
    .order("sold_at", { ascending: false }).limit(1),
  "target cutoff",
)[0]?.sold_at;
if (!latest) throw new Error("Target has no baseline transaction; refusing an unbounded copy");

const sourceTail = assertNoError(
  await source.from("pos_transactions").select(txColumns.join(",")).eq("organisation_id", SOURCE_ORG)
    .gt("sold_at", latest).order("sold_at"),
  "source transactions",
);
const transactionIds = sourceTail.map((row) => row.id);
const items = await selectIn(source, "pos_transaction_items", itemColumns, "transaction_id", transactionIds);
const sessionIds = [...new Set(sourceTail.map((row) => row.session_id).filter(Boolean))];
const sessions = await selectIn(source, "pos_sessions", sessionColumns, "id", sessionIds);

const baselineTarget = assertNoError(
  await target.from("pos_transactions").select("id,site_id,sold_by,payment_method_id")
    .eq("organisation_id", TARGET_ORG).order("sold_at", { ascending: false }).limit(500),
  "target mapping baseline",
);
const baselineSource = await selectIn(source, "pos_transactions", ["id", "site_id", "sold_by", "payment_method_id"], "id", baselineTarget.map((row) => row.id));
const targetById = new Map(baselineTarget.map((row) => [row.id, row]));
const siteMap = new Map();
const profileMap = new Map();
const methodMap = new Map();
for (const row of baselineSource) {
  const mapped = targetById.get(row.id);
  addMap(siteMap, row.site_id, mapped?.site_id, "site");
  addMap(profileMap, row.sold_by, mapped?.sold_by, "profile");
}
const neededMethodIds = [...new Set(sourceTail.map((row) => row.payment_method_id).filter(Boolean))];
const sourceMethods = await selectIn(source, "payment_methods", ["id", "type"], "id", neededMethodIds);
const targetMethods = assertNoError(
  await target.from("payment_methods").select("id,type").eq("organisation_id", TARGET_ORG).eq("active", true),
  "target payment methods",
);
for (const row of sourceMethods) {
  const matches = targetMethods.filter((candidate) => candidate.type === row.type);
  if (matches.length !== 1) throw new Error(`Expected one target payment method of type ${row.type}, found ${matches.length}`);
  methodMap.set(row.id, matches[0].id);
}

for (const row of sourceTail) {
  if (row.site_id && !siteMap.has(row.site_id)) throw new Error(`Unmapped site ${row.site_id}`);
  if (row.sold_by && !profileMap.has(row.sold_by)) throw new Error(`Unmapped seller ${row.sold_by}`);
  if (row.payment_method_id && !methodMap.has(row.payment_method_id)) throw new Error(`Unmapped payment method ${row.payment_method_id}`);
  if (row.customer_id || row.table_tab_id) throw new Error(`Transaction ${row.id} has an unsupported customer/table reference`);
}
for (const row of sessions) {
  if (row.opened_by && !profileMap.has(row.opened_by)) throw new Error(`Unmapped session opener ${row.opened_by}`);
  if (row.closed_by && !profileMap.has(row.closed_by)) throw new Error(`Unmapped session closer ${row.closed_by}`);
}

const productIds = [...new Set(items.map((row) => row.product_id).filter(Boolean))];
const targetProducts = await selectIn(target, "products", ["id"], "id", productIds);
if (targetProducts.length !== productIds.length) throw new Error(`Target is missing ${productIds.length - targetProducts.length} referenced products`);
const recipeIds = [...new Set(items.map((row) => row.recipe_id).filter(Boolean))];
const targetRecipes = await selectIn(target, "recipes", ["id"], "id", recipeIds);
if (targetRecipes.length !== recipeIds.length) throw new Error(`Target is missing ${recipeIds.length - targetRecipes.length} referenced recipes`);

const mappedSessions = sessions.map((row) => ({
  ...row,
  organisation_id: TARGET_ORG,
  site_id: row.site_id ? siteMap.get(row.site_id) : null,
  opened_by: row.opened_by ? profileMap.get(row.opened_by) : null,
  closed_by: row.closed_by ? profileMap.get(row.closed_by) : null,
  fiscal_z_report_log_id: null,
}));
const mappedTransactions = sourceTail.map((row) => ({
  ...row,
  organisation_id: TARGET_ORG,
  site_id: row.site_id ? siteMap.get(row.site_id) : null,
  sold_by: row.sold_by ? profileMap.get(row.sold_by) : null,
  payment_method_id: row.payment_method_id ? methodMap.get(row.payment_method_id) : null,
  customer_id: null,
  table_tab_id: null,
  fiscal_receipt_attempt_id: null,
}));
const mappedItems = items.map((row) => ({
  ...row,
  organisation_id: TARGET_ORG,
  site_id: row.site_id ? siteMap.get(row.site_id) : null,
}));

const sourceTotal = sourceTail.reduce((sum, row) => sum + Number(row.total), 0);
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", cutoff: latest, transactions: sourceTail.length, items: items.length, sessions: sessions.length, total: sourceTotal.toFixed(2) }, null, 2));

if (apply && sourceTail.length) {
  assertNoError(await target.from("pos_sessions").upsert(mappedSessions, { onConflict: "id", ignoreDuplicates: true }), "insert sessions");
  assertNoError(await target.from("pos_transactions").upsert(mappedTransactions, { onConflict: "id", ignoreDuplicates: true }), "insert transactions");
  assertNoError(await target.from("pos_transaction_items").upsert(mappedItems, { onConflict: "id", ignoreDuplicates: true }), "insert items");

  const copiedTx = await selectIn(target, "pos_transactions", ["id", "total"], "id", transactionIds);
  const copiedItems = await selectIn(target, "pos_transaction_items", ["id"], "transaction_id", transactionIds);
  const copiedTotal = copiedTx.reduce((sum, row) => sum + Number(row.total), 0);
  if (copiedTx.length !== sourceTail.length || copiedItems.length !== items.length || copiedTotal.toFixed(2) !== sourceTotal.toFixed(2)) {
    throw new Error(`Verification failed: ${copiedTx.length}/${sourceTail.length} transactions, ${copiedItems.length}/${items.length} items, ${copiedTotal.toFixed(2)}/${sourceTotal.toFixed(2)} total`);
  }
  console.log("Verified target row counts and transaction total.");
}

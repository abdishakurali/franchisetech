#!/usr/bin/env node
/**
 * Regression check: ambiguous product_categories embed must return PGRST201.
 * Explicit FK hints must pass PostgREST parsing (may still 401 without auth).
 */
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "ycqzxlahhfqwuteistvf";
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BASE = `https://${PROJECT_REF}.supabase.co/rest/v1/products`;

const PRODUCT_LIST_SELECT =
  "*,inventory_category:product_categories!category_id(name,color)";
const PRODUCT_POS_SELECT =
  "*,inventory_category:product_categories!category_id(id,name,color),pos_category:product_categories!pos_category_id(id,name,color)";

if (!ANON_KEY) {
  console.error("Set SUPABASE_ANON_KEY to run this test.");
  process.exit(1);
}

async function probe(select) {
  const url = `${BASE}?select=${encodeURIComponent(select)}&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const body = await res.json();
  return { status: res.status, code: body?.code, message: body?.message };
}

const broken = await probe("*,product_categories(name,color)");
const list = await probe(PRODUCT_LIST_SELECT);
const pos = await probe(PRODUCT_POS_SELECT);

let failed = false;

if (broken.code !== "PGRST201") {
  console.error("FAIL: expected PGRST201 for ambiguous embed, got", broken);
  failed = true;
} else {
  console.log("OK  ambiguous embed rejected (PGRST201)");
}

for (const [label, result] of [
  ["products list", list],
  ["POS list", pos],
]) {
  if (result.code === "PGRST201") {
    console.error(`FAIL: ${label} still ambiguous`, result);
    failed = true;
  } else {
    console.log(`OK  ${label} passes embed parsing (HTTP ${result.status})`);
  }
}

process.exit(failed ? 1 : 0);

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [
  ["core operating schema", "supabase/migrations/20260917092553_e2e_core_operating_schema.sql", [/create table public\.pos_sessions/i, /create table public\.stock_movements/i, /create table public\.purchases/i]],
  ["POS posting contract", "supabase/migrations/20260917160000_e2e_post_pos_document.sql", [/function public\.post_pos_document/i, /idempotency_key/i]],
  ["NIR posting contract", "supabase/migrations/20260917163000_e2e_post_nir_purchase.sql", [/function public\.post_nir_purchase/i, /stock_movements/i]],
  ["growth activation contract", "supabase/migrations/20260918120000_e2e_growth_activation_contract.sql", [/growth_first_sale_at/i, /growth_activated_at/i]],
];

let failed = false;
for (const [label, relative, patterns] of checks) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${label}: missing ${relative}`);
    failed = true;
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (!pattern.test(source)) {
      console.error(`FAIL ${label}: ${pattern} not found`);
      failed = true;
    }
  }
  if (!failed) console.log(`PASS ${label}`);
}

const kitchenops = fs.readFileSync(path.join(root, "app/actions/kitchenops.ts"), "utf8");
for (const [label, pattern] of [
  ["sale action uses atomic POS RPC", /rpc\("post_pos_document"/],
  ["purchase action uses atomic NIR RPC", /rpc\("post_nir_purchase"/],
  ["first sale milestone is recorded", /recordGrowthMilestone\([^\n]+first_sale/],
]) {
  if (!pattern.test(kitchenops)) {
    console.error(`FAIL ${label}`);
    failed = true;
  } else console.log(`PASS ${label}`);
}

if (failed) process.exitCode = 1;
else {
  console.log("Isolated first-sale contract is statically verified; no database was contacted.");
}

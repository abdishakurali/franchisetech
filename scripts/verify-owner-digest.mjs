#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

console.log("Owner digest notification reliability verification\n");

const action = read("app/actions/owner-digest.ts");
const card = read("components/app/OwnerDigestCard.tsx");
const settings = read("app/app/settings/page.tsx");
const cron = read("app/api/cron/owner-digest/route.ts");
const testRoute = read("app/api/owner-digest/test/route.ts");
const fetchDigest = read("lib/owner-digest/fetch.ts");
const buildDigest = read("lib/owner-digest/build.ts");
const schedule = read("lib/owner-digest/schedule.ts");
const n8nWorkflow = read("outreach/n8n-owner-digest-cron.workflow.ts");
const n8nImport = read("outreach/n8n-owner-digest-cron.import.json");
const migration050Path = "supabase/migrations/050_digest_remove_inventory_gate.sql";
const migration050 = existsSync(resolve(root, migration050Path)) ? read(migration050Path) : "";
const operationalMigrationPath = "supabase/migrations/20260626160000_owner_digest_operational_day_lock.sql";
const operationalMigration = existsSync(resolve(root, operationalMigrationPath)) ? read(operationalMigrationPath) : "";

assert("migration 050 exists", Boolean(migration050));
assert("migration 050 redefines get_owner_digest_orgs", migration050.includes("CREATE OR REPLACE FUNCTION public.get_owner_digest_orgs"));
const migrationWhere = migration050.match(/WHERE[\s\S]*?;/i)?.[0] ?? "";
assert("migration 050 has no inventory-enabled WHERE gate", !/inventory_enabled/i.test(migrationWhere));
assert("operational-day migration exists", Boolean(operationalMigration));
assert("operational-day migration adds cutoff setting", operationalMigration.includes("business_day_cutoff_time"));
assert("operational-day migration permits processing status", operationalMigration.includes("'processing'"));
assert("operational-day migration creates claim RPC", operationalMigration.includes("CREATE OR REPLACE FUNCTION public.claim_owner_digest_window"));
assert("settings action has no inventory module imports", !action.includes("fetchOrgModuleFlags") && !action.includes("isModuleEnabled"));
assert("settings action has no inventory_required branch", !action.includes("inventory_required"));
assert("digest card has no inventory prop/gate", !card.includes("inventoryEnabled") && !card.includes("inventoryRequired"));
assert("settings page does not pass inventoryEnabled to digest card", !/OwnerDigestCard[\s\S]*inventoryEnabled/.test(settings));
assert("cron route does not skip non-inventory orgs", !cron.includes("if (!row.inventory_enabled)"));
assert("test route has no hardcoded recipient", !testRoute.includes("sherif.abdala@gmail.com"));
assert("test route sends to provided email or caller", /body[\s\S]*email/.test(testRoute) && testRoute.includes("user.email"));
assert("digest data includes prior period label", fetchDigest.includes("priorPeriodLabel") && buildDigest.includes("priorPeriodLabel"));
assert("daily comparison uses same weekday last week", fetchDigest.includes("addCalendarDays(p.year, p.month, p.day, -7)"));
assert("digest uses operational-day cutoff", fetchDigest.includes("businessDayCutoffTime") && schedule.includes("businessDayCutoffTime"));
assert("digest includes cash drawer difference", fetchDigest.includes("cashDifference") && buildDigest.includes("Status tură"));
assert("digest includes till open/close timestamps", fetchDigest.includes("openedAt") && fetchDigest.includes("closedAt") && buildDigest.includes("Deschis"));
assert("digest includes low-stock actions", fetchDigest.includes("lowStockItems") && buildDigest.includes("Stock — reorder"));
assert("digest includes refunds and void values", fetchDigest.includes("refundTotal") && fetchDigest.includes("voidTotal"));
assert("digest includes top products", fetchDigest.includes("topProducts") && buildDigest.includes("Top products"));
assert("digest builds dynamic VAT breakdown from item snapshots", fetchDigest.includes("vat_rate") && fetchDigest.includes("net_amount") && fetchDigest.includes("vat_amount") && buildDigest.includes("vatBreakdown"));
assert("digest email does not rely on scalar VAT line", !buildDigest.includes("TVA colectată: ${m(data.vatTotal)}"));
assert("cron claims lock before fetching data", cron.indexOf("claim_owner_digest_window") > -1 && cron.indexOf("claim_owner_digest_window") < cron.indexOf("const digestData = await fetchOwnerDigestData"));
assert("cron logs processing lock outcome", cron.includes('p_recipient: "__lock__"') && cron.includes("locked"));
assert("cron logs successful sends", cron.includes('p_status: result.success ? "sent" : "failed"'));
assert("cron logs thrown failures", cron.includes('p_status: "failed"') && cron.includes("p_error_message: message"));
assert("cron marks sent only on provider success", cron.includes("mark_owner_digest_sent") && cron.includes("if (result.success)"));
assert("cron route documents five-minute scheduler requirement", cron.includes("Schedule via n8n or server crontab every 5 minutes"));
assert("cron response exposes checked/due/sent/failed/skipped", cron.includes("checked") && cron.includes("due") && cron.includes("sent") && cron.includes("failed") && cron.includes("skipped"));
assert("schedule enforces tight send window", schedule.includes("OWNER_DIGEST_SEND_WINDOW_MINUTES") && schedule.includes("schMins + OWNER_DIGEST_SEND_WINDOW_MINUTES"));
assert("schedule lock key uses cutoff window", schedule.includes("parseCutoff") && schedule.includes("zonedDateTimeUtc") && schedule.includes("delta = frequency === \"weekly\" ? -7 : -1"));
assert("digest states exact reporting period", fetchDigest.includes("periodDetailLabel") && buildDigest.includes("Perioadă raportată"));
assert("schedule blocks duplicate daily sends", schedule.includes("owner_digest_last_sent_at") && schedule.includes("lastTz.getDate() === tzNow.getDate()"));
assert("schedule blocks duplicate weekly sends", schedule.includes("getIsoWeekKey(lastTz)") && schedule.includes("getIsoWeekKey(tzNow)"));
assert("schedule respects weekly selected day", schedule.includes('owner_digest_frequency === "weekly"') && schedule.includes("isoDay !== org.owner_digest_day_of_week"));
assert("n8n workflow source runs every 5 minutes", n8nWorkflow.includes("*/5 * * * *") && !n8nWorkflow.includes("0 * * * *"));
assert("n8n import runs every 5 minutes", n8nImport.includes('"expression": "*/5 * * * *"'));
assert("n8n workflow reports due and recipient counts", n8nWorkflow.includes("recipientsSent") && n8nWorkflow.includes("due"));
assert("n8n import reports due and recipient counts", n8nImport.includes("recipientsSent") && n8nImport.includes("due"));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

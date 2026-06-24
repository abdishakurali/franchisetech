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
const migration050Path = "supabase/migrations/050_digest_remove_inventory_gate.sql";
const migration050 = existsSync(resolve(root, migration050Path)) ? read(migration050Path) : "";

assert("migration 050 exists", Boolean(migration050));
assert("migration 050 redefines get_owner_digest_orgs", migration050.includes("CREATE OR REPLACE FUNCTION public.get_owner_digest_orgs"));
const migrationWhere = migration050.match(/WHERE[\s\S]*?;/i)?.[0] ?? "";
assert("migration 050 has no inventory-enabled WHERE gate", !/inventory_enabled/i.test(migrationWhere));
assert("settings action has no inventory module imports", !action.includes("fetchOrgModuleFlags") && !action.includes("isModuleEnabled"));
assert("settings action has no inventory_required branch", !action.includes("inventory_required"));
assert("digest card has no inventory prop/gate", !card.includes("inventoryEnabled") && !card.includes("inventoryRequired"));
assert("settings page does not pass inventoryEnabled to digest card", !/OwnerDigestCard[\s\S]*inventoryEnabled/.test(settings));
assert("cron route does not skip non-inventory orgs", !cron.includes("if (!row.inventory_enabled)"));
assert("test route has no hardcoded recipient", !testRoute.includes("sherif.abdala@gmail.com"));
assert("test route sends to provided email or caller", /body[\s\S]*email/.test(testRoute) && testRoute.includes("user.email"));
assert("digest data includes prior period label", fetchDigest.includes("priorPeriodLabel") && buildDigest.includes("priorPeriodLabel"));
assert("daily comparison uses same weekday last week", fetchDigest.includes("addCalendarDays(p.year, p.month, p.day, -7)"));
assert("digest includes cash drawer difference", fetchDigest.includes("cashDifference") && buildDigest.includes("Last till close"));
assert("digest includes low-stock actions", fetchDigest.includes("lowStockItems") && buildDigest.includes("Stock — reorder"));
assert("digest includes refunds and voids", fetchDigest.includes("refundCount") && fetchDigest.includes("voidCount"));
assert("digest includes top products", fetchDigest.includes("topProducts") && buildDigest.includes("Top products"));
assert("cron logs successful sends", cron.includes('p_status: result.success ? "sent" : "failed"'));
assert("cron logs thrown failures", cron.includes('p_status: "failed"') && cron.includes("p_error_message: message"));
assert("cron marks sent only on provider success", cron.includes("mark_owner_digest_sent") && cron.includes("if (result.success)"));
assert("cron route documents hourly scheduler requirement", cron.includes("Schedule via n8n or server crontab every hour"));
assert("cron response exposes checked/sent/failed/skipped", cron.includes("checked") && cron.includes("sent") && cron.includes("failed") && cron.includes("skipped"));
assert("schedule enforces 60-minute send window", schedule.includes("nowMins < schMins") && schedule.includes("schMins + 60"));
assert("schedule blocks duplicate daily sends", schedule.includes("owner_digest_last_sent_at") && schedule.includes("lastTz.getDate() === tzNow.getDate()"));
assert("schedule blocks duplicate weekly sends", schedule.includes("getIsoWeekKey(lastTz)") && schedule.includes("getIsoWeekKey(tzNow)"));
assert("schedule respects weekly selected day", schedule.includes('owner_digest_frequency === "weekly"') && schedule.includes("isoDay !== org.owner_digest_day_of_week"));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

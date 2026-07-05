#!/usr/bin/env node
/**
 * Seed restaurant floor for Emerald Bites Café (idempotent).
 * Usage: node scripts/seed-emerald-floor.mjs
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env (or .env.local).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ORG_ID = "b362146d-57e9-4ced-9f0d-660b4c3ffe96";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const SECTIONS = [
  { name: "Sală", sort_order: 0, tables: 12 },
  { name: "Terasă", sort_order: 1, tables: 8 },
  { name: "Bar", sort_order: 2, tables: 4 },
];

const SHAPES = ["square", "rectangle", "round"];
const CAPACITIES = [2, 2, 4, 4, 4, 6, 6, 8];

function layoutFor(index, total) {
  const cols = Math.min(6, Math.ceil(Math.sqrt(total)));
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    layout_x: 40 + col * 130,
    layout_y: 40 + row * 110,
    layout_w: index % 3 === 1 ? 110 : 80,
    layout_h: index % 5 === 4 ? 80 : 80,
    shape: SHAPES[index % SHAPES.length],
    capacity: CAPACITIES[index % CAPACITIES.length],
  };
}

async function main() {
  const { data: org } = await supabase
    .from("organisations")
    .select("id, name")
    .eq("id", ORG_ID)
    .maybeSingle();
  if (!org) {
    console.error("Org not found:", ORG_ID);
    process.exit(1);
  }
  console.log("Seeding floor for", org.name);

  const { data: sites } = await supabase
    .from("sites")
    .select("id")
    .eq("organisation_id", ORG_ID)
    .limit(1);
  const siteId = sites?.[0]?.id ?? null;

  // Deactivate duplicate legacy sections
  const { data: oldSections } = await supabase
    .from("restaurant_floor_sections")
    .select("id, name")
    .eq("organisation_id", ORG_ID);

  const targetNames = new Set(SECTIONS.map((s) => s.name));
  for (const sec of oldSections ?? []) {
    if (!targetNames.has(sec.name)) {
      await supabase.from("restaurant_tables").update({ is_active: false }).eq("section_id", sec.id);
    }
  }

  const sectionIds = {};

  for (const spec of SECTIONS) {
    let { data: existing } = await supabase
      .from("restaurant_floor_sections")
      .select("id")
      .eq("organisation_id", ORG_ID)
      .ilike("name", spec.name)
      .maybeSingle();

    if (!existing) {
      const { data: created, error } = await supabase
        .from("restaurant_floor_sections")
        .insert({
          organisation_id: ORG_ID,
          site_id: siteId,
          name: spec.name,
          sort_order: spec.sort_order,
          background_preset: "wood",
        })
        .select("id")
        .single();
      if (error) throw error;
      existing = created;
      console.log("Created section:", spec.name);
    } else {
      await supabase
        .from("restaurant_floor_sections")
        .update({ sort_order: spec.sort_order, name: spec.name })
        .eq("id", existing.id);
    }
    sectionIds[spec.name] = existing.id;

    const { data: existingTables } = await supabase
      .from("restaurant_tables")
      .select("id, name")
      .eq("organisation_id", ORG_ID)
      .eq("section_id", existing.id)
      .eq("is_active", true);

    const have = existingTables?.length ?? 0;
    for (let i = have; i < spec.tables; i++) {
      const layout = layoutFor(i, spec.tables);
      const name = String(i + 1);
      const { error } = await supabase.from("restaurant_tables").insert({
        organisation_id: ORG_ID,
        site_id: siteId,
        section_id: existing.id,
        section: spec.name,
        name,
        capacity: layout.capacity,
        sort_order: i,
        is_active: true,
        shape: layout.shape,
        layout_x: layout.layout_x,
        layout_y: layout.layout_y,
        layout_w: layout.layout_w,
        layout_h: layout.layout_h,
      });
      if (error) {
        console.warn("Skip table", spec.name, name, error.message);
      } else {
        console.log("Added table", spec.name, name);
      }
    }
  }

  await supabase
    .from("organisations")
    .update({ table_service_enabled: true })
    .eq("id", ORG_ID);

  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", ORG_ID)
    .eq("is_active", true);

  console.log("Done. Active tables:", count);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

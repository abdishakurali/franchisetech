#!/usr/bin/env node
/**
 * Publish a reviewed HoReCa vendor-directory batch to production.
 *
 * This script IS the review-gate enforcement point: running it is the
 * "approve" action. It must only ever be run after a human has reviewed
 * the batch file's PR diff (website URLs, logo provenance, category
 * assignment) — nothing in SQL can verify that a human actually did so.
 *
 * Usage:
 *   node scripts/publish-vendor-batch.mjs --batch=scripts/vendor-batches/2026-07-04-coffee-equipment.json --reviewer=you@franchisetech.ro
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or .env.local).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Authorized reviewers — hardcoded allowlist, not just "any profiles row" ──
// A profiles-row match alone is NOT sufficient: profiles includes customers,
// not just staff. This allowlist is what actually proves a named, authorized
// person approved the batch, not that a plausible-looking email was typed.
const AUTHORIZED_VENDOR_REVIEWERS = (process.env.AUTHORIZED_VENDOR_REVIEWERS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_LOGO_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const LOGO_BUCKET = "vendor-logos";

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

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, "").split("=");
      return [key, rest.join("=")];
    }),
  );
  return args;
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function fetchLogo(logoSourceUrl, websiteUrl) {
  const sourceDomain = domainOf(logoSourceUrl);
  const siteDomain = domainOf(websiteUrl);
  if (!sourceDomain || !siteDomain || sourceDomain !== siteDomain) {
    return {
      ok: false,
      reason: `logo_source_url domain (${sourceDomain}) does not match website_url domain (${siteDomain}) — refusing to re-host. Fix the entry and re-run.`,
    };
  }

  const res = await fetch(logoSourceUrl);
  if (!res.ok) {
    return { ok: false, reason: `Fetch failed: HTTP ${res.status}` };
  }
  const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_LOGO_CONTENT_TYPES.includes(contentType)) {
    return { ok: false, reason: `Unexpected content-type "${contentType}" — refusing to store.` };
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_LOGO_BYTES) {
    return { ok: false, reason: `Logo is ${buffer.byteLength} bytes, exceeds ${MAX_LOGO_BYTES} byte cap.` };
  }
  return { ok: true, buffer, contentType };
}

async function main() {
  loadEnv();
  const args = parseArgs();

  if (!args.reviewer) {
    console.error("Missing --reviewer=<email>. This is required — a batch can never publish anonymously.");
    process.exit(1);
  }
  if (!args.batch) {
    console.error("Missing --batch=<path to batch JSON file>.");
    process.exit(1);
  }

  const reviewerEmail = args.reviewer.trim().toLowerCase();
  if (!AUTHORIZED_VENDOR_REVIEWERS.length) {
    console.error(
      "AUTHORIZED_VENDOR_REVIEWERS is not set (comma-separated staff emails). Refusing to publish without an allowlist.",
    );
    process.exit(1);
  }
  if (!AUTHORIZED_VENDOR_REVIEWERS.includes(reviewerEmail)) {
    console.error(
      `"${reviewerEmail}" is not on the authorized reviewer allowlist. A profiles-row match alone is not sufficient — this must be a named, authorized staff member.`,
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const { data: reviewerProfile, error: reviewerErr } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", reviewerEmail)
    .maybeSingle();
  if (reviewerErr || !reviewerProfile) {
    console.error(`Reviewer "${reviewerEmail}" is on the allowlist but has no matching profiles row. Refusing to publish.`);
    process.exit(1);
  }

  const batchPath = resolve(process.cwd(), args.batch);
  if (!existsSync(batchPath)) {
    console.error(`Batch file not found: ${batchPath}`);
    process.exit(1);
  }
  const batch = JSON.parse(readFileSync(batchPath, "utf8"));
  if (!Array.isArray(batch) || batch.length === 0) {
    console.error("Batch file must be a non-empty JSON array.");
    process.exit(1);
  }
  if (batch.length > 25) {
    console.error(`Batch has ${batch.length} entries — max 25 per batch. Split into multiple files.`);
    process.exit(1);
  }

  console.log(`Publishing ${batch.length} entries, reviewer: ${reviewerEmail} (profile ${reviewerProfile.id})`);

  const results = { published: [], skipped: [] };

  for (const entry of batch) {
    const requiredFields = ["legal_name", "slug", "category", "description", "website_url", "logo_source_url"];
    const missing = requiredFields.filter((f) => !entry[f]);
    if (missing.length) {
      results.skipped.push({ slug: entry.slug ?? "(no slug)", reason: `Missing fields: ${missing.join(", ")}` });
      continue;
    }

    const logoResult = await fetchLogo(entry.logo_source_url, entry.website_url);
    if (!logoResult.ok) {
      results.skipped.push({ slug: entry.slug, reason: logoResult.reason });
      continue;
    }

    const ext = logoResult.contentType === "image/svg+xml" ? "svg" : logoResult.contentType.split("/")[1];
    const storagePath = `${entry.slug}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(storagePath, logoResult.buffer, { contentType: logoResult.contentType, upsert: true });
    if (uploadErr) {
      results.skipped.push({ slug: entry.slug, reason: `Logo upload failed: ${uploadErr.message}` });
      continue;
    }
    const { data: publicUrlData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(storagePath);

    const { data: vendorRow, error: vendorErr } = await supabase
      .from("vendors")
      .upsert(
        {
          legal_name: entry.legal_name,
          brand_name: entry.brand_name ?? null,
          cui: entry.cui ?? null,
          slug: entry.slug,
          category: entry.category,
          subcategories: entry.subcategories ?? [],
          description: entry.description,
          website_url: entry.website_url,
          hq_city: entry.hq_city ?? null,
          logo_url: publicUrlData.publicUrl,
          logo_background: entry.logo_background === "dark" ? "dark" : "light",
          logo_source_url: entry.logo_source_url,
          contact_email: entry.contact_email ?? null,
          contact_phone: entry.contact_phone ?? null,
          verification_status: entry.verification_status ?? "listed",
          serves_all_counties: entry.serves_all_counties ?? false,
          last_checked: entry.last_checked ?? new Date().toISOString().slice(0, 10),
          reviewed_by: reviewerProfile.id,
          reviewed_at: new Date().toISOString(),
          // No DB trigger keeps this current — there's no updated_at
          // auto-update mechanism on this table, so it must be set
          // explicitly on every upsert or it goes stale after the first write.
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (vendorErr || !vendorRow) {
      results.skipped.push({ slug: entry.slug, reason: `Vendor upsert failed: ${vendorErr?.message}` });
      continue;
    }

    if (Array.isArray(entry.counties) && entry.counties.length) {
      await supabase.from("vendor_regions").delete().eq("vendor_id", vendorRow.id);
      await supabase
        .from("vendor_regions")
        .insert(entry.counties.map((county_slug) => ({ vendor_id: vendorRow.id, county_slug })));
    }

    if (Array.isArray(entry.sources) && entry.sources.length) {
      await supabase.from("vendor_sources").insert(
        entry.sources.map((s) => ({
          vendor_id: vendorRow.id,
          kind: s.kind,
          url: s.url,
          note: s.note ?? null,
          checked_at: s.checked_at ?? new Date().toISOString().slice(0, 10),
        })),
      );
    }

    results.published.push(entry.slug);
  }

  console.log(`\nPublished: ${results.published.length}`);
  for (const slug of results.published) console.log(`  ✓ ${slug}`);
  console.log(`Skipped: ${results.skipped.length}`);
  for (const s of results.skipped) console.log(`  ✗ ${s.slug} — ${s.reason}`);

  if (results.skipped.length) process.exitCode = 1;
}

main();

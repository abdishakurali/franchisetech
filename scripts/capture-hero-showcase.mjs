#!/usr/bin/env node
/**
 * Capture marketing showcase PNGs from /marketing/hero-preview.
 * Requires: dev server on localhost:3000, playwright in node_modules or npx.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = (name) => path.join(root, "public/showcase", name);

const browser = await chromium.launch();
const base = "http://localhost:3000/marketing/hero-preview";

const dash = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await dash.goto(base, { waitUntil: "networkidle" });
await dash.locator("#owner-dashboard").screenshot({ path: out("reports-dashboard.png") });

const floor = await browser.newPage({ viewport: { width: 1400, height: 800 } });
await floor.goto(base, { waitUntil: "networkidle" });
await floor.locator("#table-floor").screenshot({ path: out("table-floor.png") });

const pos = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await pos.goto(base, { waitUntil: "networkidle" });
await pos.locator("#pos-table-order").screenshot({ path: out("pos-table-order.png") });

await browser.close();
console.log("Saved showcase PNGs to public/showcase/");

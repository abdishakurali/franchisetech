#!/usr/bin/env node
/**
 * Build plaintext outreach emails from CSV rows.
 * Usage: node outreach/render-email.mjs partner|customer < row.json
 * Zoho sends use ZohoMail_sendEmail MCP with accountId 6147765000000002002
 */
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

const ZOHO_ACCOUNT_ID = "6147765000000002002";
const FROM = "info@garaad.org";

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function greeting(name) {
  return name && name !== "Echipă" ? ` ${name}` : "";
}

export function renderPartnerEmail(row, step = 1) {
  const slug = slugify(row.company);
  const link = `https://franchisetech.ro/partners?lang=ro&utm_source=zoho&utm_campaign=ro-partner-q2&utm_content=${slug}`;
  const g = greeting(row.contact_name);
  const subjects = ["parteneriat HORECA", "stoc + NIR", "20% recurent", "ultim mesaj"];
  const bodies = [
    `Bună ziua${g},\n\n${row.hook_line}\n\nfranchisetech e POS în browser pentru cafenele și restaurante: casă, stoc, NIR (14-3-1A) și rapoarte — fără taxă per angajat. Partenerii primesc ~20% recurent din abonament și ~100–150€ la setup-ul asistat (199€) când onboardați un client.\n\nMerită 10 minute să vedeți dacă se potrivește rețelei voastre?\n\n${link}\n\n— franchisetech\nhello@franchisetech.ro\n\nRăspundeți „stop” dacă nu doriți alte mesaje.`,
    `Bună ziua${g},\n\nRevin scurt: clienții HORECA pierd timp când POS-ul nu vorbește cu stocul și NIR-ul. franchisetech le ține pe toate în același workspace.\n\nAveți 1–2 clienți care ar beneficia acum?\n\n${link}\n\n— franchisetech`,
    `Bună ziua${g},\n\nModel simplu: recomandați franchisetech → clientul primește trial asistat 15 zile → la activare primiți comision recurent (~20%) + partajare din setup (199€).\n\n${link}\n\n— franchisetech`,
    `Bună ziua${g},\n\nUltimul mesaj — dacă parteneriatul POS+stoc+NIR nu e pe agenda voastră acum, e în regulă.\n\nDacă revine tema: ${link}\n\n— franchisetech`,
  ];
  return {
    to: row.email,
    from: FROM,
    accountId: ZOHO_ACCOUNT_ID,
    subject: subjects[step - 1],
    content: bodies[step - 1],
    mailFormat: "plaintext",
  };
}

export function renderCustomerEmail(row, step = 1) {
  const slug = slugify(row.company);
  const plan = row.recommended_plan || "pro";
  const link = `https://franchisetech.ro/signup?plan=${plan}&lang=ro&utm_source=zoho&utm_campaign=ro-customer-q2&utm_content=${slug}`;
  const g = greeting(row.contact_name);
  const subjects = ["casa după program", "trial 15 zile", "ultim mesaj"];
  const bodies = [
    `Bună ziua${g},\n\n${row.personalization_line}\n\nMulte unități ca ${row.company} încă închid ziua cu numere care nu se potrivesc cu sertarul. franchisetech leagă POS, stoc și raport Z într-un singur loc — trial asistat 15 zile, fără card pentru deschiderea casei, personal nelimitat.\n\nV-ar fi util să vedeți cum arată pentru locația voastră?\n\n${link}\n\n— franchisetech\nhello@franchisetech.ro\n\nRăspundeți „stop” dacă nu doriți alte mesaje.`,
    `Bună ziua${g},\n\nRevin la ${row.company}: onboarding-ul include produse demo, deschidere casă și ghidare la prima vânzare.\n\nPlan recomandat: ${plan} (de la 39€/lună, fără taxă per angajat).\n\n${link}\n\n— franchisetech`,
    `Bună ziua${g},\n\nNu vă mai scriu după acest mesaj. Dacă vreți să testați POS + stoc fără angajament: trial 15 zile asistat.\n\n${link}\n\n— franchisetech`,
  ];
  return {
    to: row.email,
    from: FROM,
    accountId: ZOHO_ACCOUNT_ID,
    subject: subjects[step - 1],
    content: bodies[step - 1],
    mailFormat: "plaintext",
  };
}

if (process.argv[1]?.endsWith("render-email.mjs")) {
  const type = process.argv[2];
  const file = process.argv[3];
  const step = Number(process.argv[4] || 1);
  const rows = parse(readFileSync(file, "utf8"), { columns: true, skip_empty_lines: true, relax_quotes: true });
  const render = type === "partner" ? renderPartnerEmail : renderCustomerEmail;
  console.log(JSON.stringify(rows.map((r) => render(r, step)), null, 2));
}

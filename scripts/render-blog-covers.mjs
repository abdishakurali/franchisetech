// Renders one cover image per blog post into public/blog/covers/<slug>.webp and
// writes lib/marketing/blog-covers.json, which BlogTopicHeader reads.
//
// Two kinds, mixed on purpose:
// - "screen": a real app screen (public/blog/screens/*.png, captured 2026-11-13
//   from the Emerald Bites Café demo account: Romanian menu, lei, test data) for
//   posts about something the app does: stock, NIR, recipes, closing, POS, reports.
// - "card": a branded card for legal, fiscal-risk, staff and money topics, where a
//   screenshot would suggest the app solves something it does not.
//
// Usage: node scripts/render-blog-covers.mjs [extra blog.ts files...]
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1600;
const H = 900;
const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/blog/covers");
const SCREENS = path.join(ROOT, "public/blog/screens");
const LOGO = path.join(ROOT, "public/franchise-tech-logo.png");
const MANIFEST = path.join(ROOT, "lib/marketing/blog-covers.json");

// Site palette (app/globals.css :root)
const INK = "#1c1712";
const BRASS = "#b4903f";
const PAPER = "#f2efe7";
const CARD = "#fbf9f4";
const MID = "#8a7f70";
const SERIF = "Charter, Georgia, serif"; // closest local face to the site's Fraunces
const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
const MONO = "Menlo, monospace";

const SCREEN_INFO = {
  stock: { alt: "Pagina de stoc din franchisetech", note: "Stoc pe articol, cu minim și status" },
  purchases: { alt: "Cumpărături și NIR în franchisetech", note: "NIR emis = stoc actualizat" },
  recipes: { alt: "Rețete cu cost pe porție și marjă în franchisetech", note: "Cost pe porție și marjă pe produs" },
  zreport: { alt: "Raportul de închidere a casei în franchisetech", note: "Numerar numărat vs așteptat" },
  reports: { alt: "Raportul de vânzări din franchisetech", note: "Vânzări, bon mediu, top produse" },
  pos: { alt: "Ecranul de vânzare (POS) din franchisetech", note: "Vânzare rapidă, pe categorii" },
  dashboard: { alt: "Panoul proprietarului în franchisetech", note: "Ce se întâmplă azi, dintr-o privire" },
};

// tag -> screen. A post gets the screen of its first tag found here (tags are
// written most-important first).
const TAG_SCREEN = {
  "raport-z": "zreport", "raport-x": "zreport", "inchidere-zi": "zreport", "registru-de-casa": "zreport",
  "multi-casierie": "zreport", reconciliere: "zreport", numerar: "zreport",
  nir: "purchases", achizitii: "purchases", furnizori: "purchases",
  stoc: "stock", inventar: "stock", "materii-prime": "stock", transfer: "stock", "stoc-negativ": "stock", risipa: "stock",
  retete: "recipes", "cost-reteta": "recipes", pret: "recipes", "menu-engineering": "recipes", marja: "recipes",
  rapoarte: "reports", kpi: "reports", vanzari: "reports", export: "reports", "export-contabil": "reports", saga: "reports",
  pos: "pos", storno: "pos", bacsis: "pos", fiscalnet: "pos", offline: "pos",
  cafenea: "dashboard", checklist: "dashboard", deschidere: "dashboard",
};
// Fines and inspections always get a card: a till screenshot next to "what you risk" reads as a promise.
const CARD_FIRST = ["amenzi", "control-anaf", "control-itm"];

const LABEL = {
  "raport-z": "Raport Z", "raport-x": "Raport X și Z", "inchidere-zi": "Închiderea zilei", "registru-de-casa": "Registrul de casă",
  "multi-casierie": "Mai multe case", reconciliere: "Card vs numerar", numerar: "Numerar",
  nir: "NIR", achizitii: "Achiziții", furnizori: "Furnizori",
  stoc: "Stoc", inventar: "Inventar", "materii-prime": "Materii prime", transfer: "Transfer stoc",
  "stoc-negativ": "Stoc negativ", risipa: "Stoc perisabil", "bon-de-consum": "Bon de consum",
  retete: "Rețete", "cost-reteta": "Cost rețetă", pret: "Prețul în meniu", marja: "Marjă",
  rapoarte: "Rapoarte", kpi: "KPI săptămânal", vanzari: "Targeturi", export: "Export contabil",
  "export-contabil": "Export contabil", saga: "Export Saga",
  pos: "POS", storno: "Storno", bacsis: "Bacșiș", fiscalnet: "FiscalNet offline", offline: "Vânzare offline",
  cafenea: "Cafenea", checklist: "Deschidere", deschidere: "Deschidere",
  amenzi: "Amenzi", "control-anaf": "Control ANAF", "control-itm": "Control ITM",
  personal: "Personal", pontaj: "Pontaj", salarii: "Salarii", legal: "Legislația muncii",
  training: "Training", performanta: "Performanță",
  tva: "TVA", "e-factura": "e-Factura", "saf-t": "SAF-T D406", "casa-de-marcat": "Casa de marcat",
  "bon-fiscal": "Bon fiscal", factura: "Factură sau bon", garantie: "Bon pierdut", defectiune: "Imprimanta fiscală",
  conformitate: "Documente", cheltuieli: "Cheltuieli", contabilitate: "Contabilitate",
  "cash-flow": "Cash-flow", breakeven: "Prag de rentabilitate", costuri: "Costuri", financiar: "Bani",
  comparatie: "Comparație", franciza: "Franciză", "dark-kitchen": "Dark kitchen", delivery: "Livrare",
  catering: "Catering", "food-truck": "Food truck", caen: "Coduri CAEN", infiintare: "Înființare",
  haccp: "HACCP", gdpr: "GDPR", fiscal: "Fiscal", gestiune: "Gestiune",
};
// Broad tags only name the cover when nothing more specific is on the post.
const GENERIC = new Set(["fiscal", "pos", "cafenea", "contabilitate", "operatiuni", "personal", "financiar", "gestiune", "strategie"]);

const MOTIF_BY_TAG = [
  [/tva|bon-fiscal|e-factura|saf-t|casa-de-marcat|factura/, "receipt"],
  [/amenzi|control|gdpr|haccp|caen|infiintare|legal|conformitate/, "shield"],
  [/personal|pontaj|salarii|training|performanta/, "clock"],
  [/financiar|cash|breakeven|costuri|comparatie|cheltuieli|marja/, "bars"],
  [/delivery|food-truck|dark-kitchen|catering|franciza/, "box"],
];

function parsePosts(src) {
  const out = [];
  for (const m of src.matchAll(/slug: "([^"]+)",\s*title: "((?:[^"\\]|\\.)*)"[\s\S]*?tags: \[([^\]]*)\]/g)) {
    out.push({ slug: m[1], title: m[2], tags: [...m[3].matchAll(/"([^"]+)"/g)].map((t) => t[1]) });
  }
  return out;
}

export function coverFor(post) {
  const label = () => {
    const known = post.tags.filter((t) => LABEL[t]);
    return LABEL[known.find((t) => !GENERIC.has(t)) ?? known[0]] ?? "Ghid HoReCa";
  };
  const fear = post.tags.find((t) => CARD_FIRST.includes(t));
  if (fear) return { kind: "card", label: LABEL[fear], motif: "shield" };
  const screenTags = post.tags.filter((t) => TAG_SCREEN[t]);
  const screenTag = screenTags.find((t) => !GENERIC.has(t)) ?? screenTags[0];
  if (screenTag) return { kind: "screen", screen: TAG_SCREEN[screenTag], label: label() };
  const joined = post.tags.join(" ");
  const motif = MOTIF_BY_TAG.find(([re]) => re.test(joined))?.[1] ?? "receipt";
  return { kind: "card", label: label(), motif };
}

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function wrap(text, max) {
  const words = text.split(" ");
  const lines = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + " " + w).length > max) lines.push(w);
    else lines[lines.length - 1] = cur ? `${cur} ${w}` : w;
  }
  return lines;
}

const MOTIFS = {
  receipt: `<g transform="translate(1080 170)" fill="none" stroke="${BRASS}" stroke-width="6" stroke-linejoin="round">
    <path d="M0 0 H320 V520 l-32 -24 -32 24 -32 -24 -32 24 -32 -24 -32 24 -32 -24 -32 24 -32 -24 -32 24 Z" fill="${BRASS}" fill-opacity="0.07"/>
    <path d="M50 80 H270 M50 140 H230 M50 200 H270 M50 260 H190" stroke-opacity="0.7"/>
    <path d="M50 360 H270" stroke-dasharray="14 12" stroke-opacity="0.7"/>
    <path d="M170 420 H270" stroke-width="12"/></g>`,
  shield: `<g transform="translate(1060 150)" fill="none" stroke="${BRASS}" stroke-width="6" stroke-linejoin="round">
    <path d="M180 0 L360 70 V260 C360 400 270 500 180 560 C90 500 0 400 0 260 V70 Z" fill="${BRASS}" fill-opacity="0.07"/>
    <path d="M110 280 L165 335 L265 220" stroke-width="12" stroke-linecap="round"/></g>`,
  clock: `<g transform="translate(1240 450)" fill="none" stroke="${BRASS}" stroke-width="6">
    <circle r="250" fill="${BRASS}" fill-opacity="0.07"/>
    <path d="M0 -170 V0 L120 80" stroke-width="12" stroke-linecap="round"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<path d="M${(Math.sin(a) * 215).toFixed(1)} ${(-Math.cos(a) * 215).toFixed(1)} L${(Math.sin(a) * 235).toFixed(1)} ${(-Math.cos(a) * 235).toFixed(1)}"/>`; }).join("")}</g>`,
  bars: `<g transform="translate(1030 200)" fill="${BRASS}">
    <rect x="0" y="330" width="80" height="170" rx="10" fill-opacity="0.35"/>
    <rect x="115" y="240" width="80" height="260" rx="10" fill-opacity="0.5"/>
    <rect x="230" y="150" width="80" height="350" rx="10" fill-opacity="0.7"/>
    <rect x="345" y="40" width="80" height="460" rx="10"/>
    <path d="M0 260 L155 170 L270 80 L420 -10" fill="none" stroke="${PAPER}" stroke-opacity="0.5" stroke-width="5" stroke-dasharray="12 10"/></g>`,
  box: `<g transform="translate(1060 210)" fill="none" stroke="${BRASS}" stroke-width="6" stroke-linejoin="round">
    <path d="M180 0 L360 90 V330 L180 420 L0 330 V90 Z" fill="${BRASS}" fill-opacity="0.07"/>
    <path d="M0 90 L180 180 L360 90 M180 180 V420"/>
    <path d="M90 45 L270 135" stroke-opacity="0.6"/></g>`,
};

async function logo(width, white) {
  let img = sharp(LOGO).resize({ width });
  if (white) img = img.negate({ alpha: false });
  return img.png().toBuffer();
}

async function renderCard(cover) {
  const lines = wrap(cover.label, 14);
  const size = lines.length > 1 || cover.label.length > 11 ? 118 : 150;
  const y0 = 470 - ((lines.length - 1) * size * 1.05) / 2;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.85" cy="0.1" r="0.9"><stop offset="0" stop-color="${BRASS}" stop-opacity="0.28"/><stop offset="0.6" stop-color="${BRASS}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="${INK}"/><rect width="${W}" height="${H}" fill="url(#g)"/>
    ${MOTIFS[cover.motif]}
    <text x="120" y="${y0 - size + 10}" font-family="${MONO}" font-size="28" letter-spacing="4" fill="${BRASS}">GHID PRACTIC · HORECA ROMÂNIA</text>
    ${lines.map((l, i) => `<text x="114" y="${y0 + i * size * 1.05 + size * 0.35}" font-family="${SERIF}" font-weight="700" font-size="${size}" fill="${PAPER}">${esc(l)}</text>`).join("")}
    <rect x="120" y="${y0 + (lines.length - 1) * size * 1.05 + size * 0.35 + 50}" width="120" height="10" rx="5" fill="${BRASS}"/>
  </svg>`;
  return sharp(Buffer.from(svg)).composite([{ input: await logo(300, true), left: 120, top: 100 }]);
}

async function renderScreen(cover) {
  const shotPath = path.join(SCREENS, `${cover.screen}.png`);
  const meta = await sharp(shotPath).metadata();
  const winX = 600;
  const winW = 940; // the whole screen stays inside the cover: the numbers are the point
  const bar = 46;
  const shotH = Math.round((meta.height * winW) / meta.width);
  const winH = bar + shotH;
  const winY = winH + 150 > H ? 150 : Math.round((H - winH) / 2 + 40);
  const shot = await sharp(shotPath).resize({ width: winW }).png().toBuffer();
  const lines = wrap(cover.label, 12);
  const size = lines.length > 1 ? 76 : cover.label.length > 8 ? 80 : 92;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="0.75" cy="0.2" r="0.8"><stop offset="0" stop-color="${BRASS}" stop-opacity="0.22"/><stop offset="0.7" stop-color="${BRASS}" stop-opacity="0"/></radialGradient>
      <filter id="s" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="${INK}" flood-opacity="0.22"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="${winX}" y="${winY}" width="${winW}" height="${winH + 40}" rx="20" fill="${CARD}" stroke="#dfdcd2" stroke-width="2" filter="url(#s)"/>
    ${[0, 1, 2].map((i) => `<circle cx="${winX + 28 + i * 24}" cy="${winY + bar / 2}" r="7" fill="${i === 0 ? BRASS : "#d8d2c2"}"/>`).join("")}
    <text x="100" y="300" font-family="${MONO}" font-size="26" letter-spacing="4" fill="${BRASS}">DIN APLICAȚIE</text>
    ${lines.map((l, i) => `<text x="96" y="${300 + 30 + size + i * size * 1.05}" font-family="${SERIF}" font-weight="700" font-size="${size}" fill="${INK}">${esc(l)}</text>`).join("")}
    ${wrap(SCREEN_INFO[cover.screen].note, 24).map((l, i) => `<text x="100" y="${300 + 30 + size + (lines.length - 1) * size * 1.05 + 70 + i * 40}" font-family="${SANS}" font-size="30" fill="${MID}">${esc(l)}</text>`).join("")}
    <text x="100" y="800" font-family="${SANS}" font-size="22" fill="${MID}">Cafenea demo, date de test</text>
  </svg>`;
  return sharp(Buffer.from(svg)).composite([
    { input: await logo(250, false), left: 100, top: 100 },
    { input: shot, left: winX, top: winY + bar },
  ]);
}

const files = [path.join(ROOT, "lib/marketing/blog.ts"), ...process.argv.slice(2)];
const posts = new Map();
for (const f of files) for (const p of parsePosts(await fs.readFile(f, "utf8"))) posts.set(p.slug, p);

await fs.mkdir(OUT, { recursive: true });
const manifest = {};
const counts = { screen: 0, card: 0 };
for (const post of [...posts.values()].sort((a, b) => a.slug.localeCompare(b.slug))) {
  const cover = coverFor(post);
  const img = cover.kind === "screen" ? await renderScreen(cover) : await renderCard(cover);
  await img.webp({ quality: 80 }).toFile(path.join(OUT, `${post.slug}.webp`));
  manifest[post.slug] = {
    src: `/blog/covers/${post.slug}.webp`,
    kind: cover.kind,
    alt: cover.kind === "screen" ? `${SCREEN_INFO[cover.screen].alt} (cafenea demo, date de test)` : "",
  };
  counts[cover.kind] += 1;
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`covers: ${posts.size} (${counts.screen} screenshot, ${counts.card} branded card)`);

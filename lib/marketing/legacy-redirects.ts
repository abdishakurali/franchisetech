// URLs Google still reports (Search Console, 26 Jul – 25 Oct 2026) that 404
// on the live site: typo variants of live articles, posts pruned on
// 2026-09-05, and removed comparison/industry pages. Only paths with a live
// page answering the same question are redirected; the rest stay 404, which is
// the right signal for content that was deliberately removed.
// lib/marketing/legacy-redirects.test.ts checks every destination is live.

export const LEGACY_REDIRECTS: Record<string, string> = {
  // Typo variants of live articles
  "/blog/ce-estez-si-cum-il-faci": "/blog/ce-este-raportul-z-si-cum-il-faci",
  "/blog/ce-este-raportul-z-cum-il-faci": "/blog/ce-este-raportul-z-si-cum-il-faci",
  "/blog/ce-este-raportul-z-si-cum-l-faci": "/blog/ce-este-raportul-z-si-cum-il-faci",
  "/blog/ce-este-raportul-z-si-ce-il-faci": "/blog/ce-este-raportul-z-si-cum-il-faci",
  "/blog/raport-x-vs-raport-x-diferenta": "/blog/raport-x-vs-raport-z-diferenta",
  "/blog/raport-x-vs-raport-diferenta": "/blog/raport-x-vs-raport-z-diferenta",
  "/blog/program-legal-de-locru-horeca-romania": "/blog/program-legal-de-lucru-horeca-romania",
  "/blog/inventar-fiic-vs-scriptic-diferente": "/blog/inventar-fizic-vs-scriptic-diferente",

  // Pruned posts → the live article on the same question
  "/blog/food-cost-percentage-ideal-horeca": "/blog/cum-calculezi-costul-unei-retete-cafenea",
  "/blog/5-metode-reducere-food-cost": "/blog/cum-calculezi-costul-unei-retete-cafenea",
  "/blog/reteta-standard-portionare-consistenta": "/blog/cum-calculezi-costul-unei-retete-cafenea",
  "/blog/obligatii-fiscale-lunare-cafenea-restaurant-lista": "/blog/ce-rapoarte-cere-contabilul-de-la-tine-lunar",
  "/blog/raport-tva-lunar-cum-il-pregatesti": "/blog/ce-rapoarte-cere-contabilul-de-la-tine-lunar",
  "/blog/reconciliere-banca-casa-lunar": "/blog/reconciliere-card-vs-numerar-la-final-de-zi",
  "/blog/reguli-casa-de-marcat-electronica-restaurant": "/blog/bon-fiscal-obligatoriu-cand-si-cum",
  "/blog/ce-drepturi-ai-la-un-control-fiscal-anaf": "/blog/cum-te-pregatesti-pentru-control-anaf",
  "/blog/checklist-deschidere-restaurant-de-la-zero": "/blog/checklist-deschidere-cafenea-de-la-zero",
  "/blog/fifo-produse-perisabile-cafenea-restaurant": "/blog/stoc-perisabil-patiserie-cum-il-gestionezi",
  "/blog/pierderi-de-stoc-scazaminte-cum-le-gestionezi": "/blog/inventar-fizic-vs-scriptic-diferente",
  "/blog/7-greseli-frecvente-gestiune-stoc-horeca": "/blog/cum-gestionezi-stocul-intr-o-cafenea-de-la-1-kg-de-cafea-la-profit",
  "/blog/happy-hour-impact-marja-cum-calculezi": "/blog/cum-calculezi-marja-bruta-produs-restaurant",
  "/blog/buget-lunar-model-cafenea-mica": "/blog/costuri-fixe-vs-variabile-horeca",
  "/blog/numerar-in-exces-in-casa-ce-faci": "/blog/cand-si-cum-depui-numerarul-la-banca",
  "/blog/comision-vanzari-personal-horeca-modele": "/blog/targeturi-vanzari-per-angajat-cum-le-stabilesti",

  // Removed comparison and industry pages
  "/compare/nexuserp": "/compare",
  "/compare/freyapos": "/compare",
  "/compare/saga": "/compare",
  "/compare/oblio": "/compare",
  "/compare/bit-soft": "/compare",
  "/compare/rezosoft": "/compare",
  "/compare/vilicorest": "/compare",
  "/industries/food-trucks": "/industries",
  "/industries/bar-pub": "/industries",
  "/industries/multi-site": "/industries",
  "/help/romania-fiscalnet-setup": "/help",
};

export const legacyRedirects = Object.entries(LEGACY_REDIRECTS).map(([source, destination]) => ({
  source,
  destination,
  permanent: true,
}));

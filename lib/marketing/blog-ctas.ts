// Article CTAs (rendered by app/blog/[slug]/page.tsx). Kept out of the page
// file because Next.js only allows route exports there, and so a test can
// check every destination is a public route.

/**
 * Posts where a reader arrived anxious about a fine, an inspection, or being
 * out of compliance — not browsing features. Real traffic data (PostHog,
 * 2026-08-25) shows this exact cluster is what actually converts: lowest
 * bounce rates on the site sit on these topics, not on feature pages. Each
 * gets a CTA naming the specific record-keeping franchisetech actually
 * provides for that fear — never "we make you compliant" (the product
 * doesn't interpret law), only the concrete thing it keeps organised that
 * makes a control or a mistake easier to survive.
 */
export type BlogCta = {
  eyebrow: string;
  body: string;
  /** Secondary destination: the feature page that answers the article's problem. */
  href: string;
  label: string;
  /** One-line question shown after the opening answer, linking to /demo. Omit to skip the demo for off-topic posts. */
  context?: string;
};

export const REGULATION_FEAR_CTAS: Record<string, BlogCta> = {
  "bon-fiscal-obligatoriu-cand-si-cum": {
    context: "Descoperiți cum gestionați vânzările și integrarea fiscală într-un singur sistem.",
    eyebrow: "Din regula fiscală în fluxul de lucru",
    body: "În franchisetech, bonul fiscal nu este o promisiune generică: vânzarea din POS păstrează produsele, TVA-ul, metoda de plată, statusul FiscalNet și datele pentru raportul Z într-un singur loc.",
    href: "/features/qr-code-receipts",
    label: "Vezi fluxul de bon fiscal",
  },
  "cum-anulezi-un-bon-fiscal-emis-gresit": {
    context: "Vreți ca fiecare anulare să rămână înregistrată, cu ora și casierul? Vedeți cum arată în FranchiseTech.",
    eyebrow: "Anulările rămân în evidență, nu în memorie",
    body: "O anulare sau un retur greșit gestionat e exact genul de neconcordanță pe care un control fiscal o caută. În franchisetech, fiecare anulare trece prin POS și rămâne înregistrată cu utilizatorul și ora, nu doar notată verbal.",
    href: "/features/pos",
    label: "Vezi cum funcționează POS-ul",
  },
  "program-legal-de-lucru-horeca-romania": {
    eyebrow: "Nu ținem evidența legală a orelor — dar simplificăm rotația",
    body: "franchisetech nu înlocuiește pontajul sau un specialist în legislația muncii. Ce oferă real: personal nelimitat pe plan, fără taxă per angajat, ca rotația de ture să nu coste extra de fiecare dată când adaugi un casier.",
    href: "/pricing",
    label: "Vezi planurile cu personal nelimitat",
  },
  // SEO audit 2026-10-27 (GSC Jul–Oct): the posts below carry most organic
  // clicks or the strongest buyer intent. The QR post previously fell through
  // to the generic "feature included" CTA, which implied franchisetech
  // generates the QR code — the certified fiscal device does.
  "e-obligatoriu-qr-code-pe-bonul-fiscal": {
    context: "Folosiți o casă de marcat într-o cafenea? Verificați dacă sistemul dumneavoastră este compatibil cu integrarea POS.",
    eyebrow: "Codul QR îl pune casa de marcat, nu programul POS",
    body: "franchisetech nu generează codul QR. Trimite vânzarea, cu produsele, TVA-ul și metoda de plată, către casa de marcat certificată prin driverul fiscal configurat și vă arată dacă bonul a fost emis sau a eșuat.",
    href: "/features/qr-code-receipts",
    label: "Vezi cum funcționează integrarea fiscală",
  },
  "ce-este-raportul-z-si-cum-il-faci": {
    context: "Vreți să verificați mai ușor încasările zilnice? Vedeți cum funcționează FranchiseTech.",
    eyebrow: "Închiderea zilei, cu cifrele deja calculate",
    body: "În franchisetech, închiderea sesiunii POS arată numerarul așteptat, încasările pe card și TVA-ul zilei, ca să comparați sertarul cu o cifră exactă înainte de raportul Z de pe casa de marcat.",
    href: "/features/z-report",
    label: "Vezi închiderea zilei",
  },
  "raport-x-vs-raport-z-diferenta": {
    context: "Vreți să vedeți încasările din timpul zilei fără să închideți casa? Vă arătăm în demonstrație.",
    eyebrow: "Verificați tura fără să închideți ziua",
    body: "franchisetech arată în timpul zilei vânzările pe numerar și card din sesiunea deschisă, iar la închidere compară numerarul numărat cu cel așteptat.",
    href: "/features/z-report",
    label: "Vezi închiderea zilei",
  },
  "export-saga-din-program-gestiune-restaurant": {
    context: "Trimiteți încă datele contabilului în Excel? Vedeți exportul pentru contabil pe un exemplu real.",
    eyebrow: "Exportul pentru contabil, fără retastare",
    body: "Planul Pro include exporturile pentru contabil: vânzări, NIR și documente de stoc, generate din ce s-a înregistrat deja în POS și la recepție.",
    href: "/pricing",
    label: "Vezi ce include planul Pro",
  },
  "cum-faci-nir-in-romania-fara-excel": {
    context: "Țineți NIR-urile în Excel? Vedeți cum intră recepția direct în stoc.",
    eyebrow: "NIR-ul actualizează stocul direct",
    body: "În planul Pro, recepția de la furnizor se înregistrează ca NIR și stocul se actualizează imediat, fără un tabel Excel separat de ținut la zi.",
    href: "/features/stock-management",
    label: "Vezi gestiunea stocului și NIR",
  },
  "cum-alegi-un-soft-pos-pentru-cafenea-mica": {
    context: "Alegeți un POS pentru cafenea? Vedeți-l pe produsele dumneavoastră înainte să decideți.",
    eyebrow: "Testați pe produsele dumneavoastră reale",
    body: "Pro costă €49/lună pentru o locație (€39/lună la plata anuală) și include POS, stoc, rețete și export pentru contabil. Multi adaugă mai multe locații. Fără contract pe termen lung, anulare oricând.",
    href: "/pricing",
    label: "Vezi planurile și prețurile",
  },
  "cum-calculezi-costul-unei-retete-cafenea": {
    context: "Calculați costul rețetelor de mână? Vedeți cum îl calculează FranchiseTech din prețurile de achiziție.",
    eyebrow: "Costul pe porție, din prețurile reale de achiziție",
    body: "În planul Pro, rețeta fiecărui produs leagă ingredientele de prețurile din NIR, iar costul pe porție și marja se actualizează când se schimbă prețul de la furnizor.",
    href: "/features/stock-management",
    label: "Vezi stocul și rețetele",
  },
  "cum-gestionezi-stocul-intr-o-cafenea-de-la-1-kg-de-cafea-la-profit": {
    context: "Vreți să vedeți exemplul cu 1 kg de cafea pe datele dumneavoastră? Vă arătăm în demonstrație.",
    eyebrow: "Stoc, rețete și NIR, legate între ele",
    body: "În planul Pro, recepția intră în stoc, fiecare vânzare scade ingredientele din rețetă, iar inventarul arată diferența față de stocul scriptic.",
    href: "/features/stock-management",
    label: "Vezi gestiunea stocului",
  },
  "conectare-casa-marcat-anaf-erori-frecvente": {
    context: "Aveți o casă de marcat Datecs și vreți să o legați de POS? Verificăm împreună configurația în demonstrație.",
    eyebrow: "Starea fiecărui bon, vizibilă înainte să devină problemă",
    body: "franchisetech arată starea fiecărui bon trimis prin FiscalNet — trimis, în așteptare sau eșuat — cu reîncercare directă din POS, nu abia descoperită la o reconciliere de sfârșit de lună.",
    href: "/features/qr-code-receipts",
    label: "Vezi statusul bonurilor fiscale",
  },
};

// Feature pages are partly hidden by lib/product-scope.ts (LEAN_PUBLIC_FEATURE_SLUGS);
// CTA hrefs here must stay on public routes — app/blog/blog-ctas.test.ts checks it.
/** /demo with the source article and CTA position, read by DemoRequestForm and stored on the lead. */
export function demoHref(slug: string, cta: "blog_mid" | "blog_end"): string {
  return `/demo?from=${encodeURIComponent(slug)}&cta=${cta}`;
}

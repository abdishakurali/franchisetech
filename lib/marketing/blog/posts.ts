import type { MarketingLocale } from "@/lib/marketing/locale";

export type BlogSection = { title: string; body: string };

export type BlogPostContent = {
  title: string;
  metaTitle: string;
  description: string;
  excerpt: string;
  eyebrow: string;
  sections: BlogSection[];
  readMinutes: number;
};

export type BlogPost = {
  slug: string;
  publishedAt: string;
  image: string;
  imageAlt: Record<"en" | "ro", string>;
  en: BlogPostContent;
  ro: BlogPostContent;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "pos-system-small-cafes",
    publishedAt: "2026-05-12",
    image: "/showcase/pos-cart.png",
    imageAlt: {
      en: "franchisetech POS cart on a cafe till",
      ro: "Coș POS franchisetech la casa unei cafenele",
    },
    en: {
      eyebrow: "POS guide",
      title: "What a small cafe actually needs from a POS",
      metaTitle: "POS for Small Cafes — What Owners Really Need",
      description:
        "A practical guide for cafe owners: fast till, clear close-of-day, stock visibility, and honest pricing without per-seat fees.",
      excerpt:
        "Skip feature overload. Small cafes need a fast register, a clear till close, and numbers owners can trust after service.",
      readMinutes: 6,
      sections: [
        {
          title: "Speed at the counter beats feature lists",
          body: "During the morning rush, staff need a product grid, one-tap quantities, and a payment step that does not hide errors. franchisetech keeps selling on one screen so new team members learn quickly.",
        },
        {
          title: "Close the till with confidence",
          body: "Owners care about expected cash, card totals, cash in/out, and the difference at close — not just sales. A POS that records every movement reduces end-of-day arguments and support calls.",
        },
        {
          title: "Stock and margins without a second system",
          body: "When purchases and recipes live beside the till, you see low stock and recipe cost before service — not only in a spreadsheet on Sunday night.",
        },
      ],
    },
    ro: {
      eyebrow: "Ghid POS",
      title: "Ce are nevoie o cafenea mică de la un POS",
      metaTitle: "POS pentru cafenele mici — ce contează pentru proprietari",
      description:
        "Ghid practic pentru cafenele: casă rapidă, închidere clară, vizibilitate stoc și prețuri corecte, fără taxe per utilizator.",
      excerpt:
        "Uitați listele lungi de funcții. Cafenelele mici au nevoie de casă rapidă, închidere clară și cifre în care proprietarul poate avea încredere după serviciu.",
      readMinutes: 6,
      sections: [
        {
          title: "Viteza la casă bate lista de funcții",
          body: "Dimineața, personalul are nevoie de grilă de produse, cantități rapide și un pas de plată care nu ascunde erorile. franchisetech ține vânzarea pe un singur ecran, ușor de învățat.",
        },
        {
          title: "Închideți casa cu încredere",
          body: "Proprietarii vor numerar așteptat, total card, intrări/ieșiri numerar și diferența la închidere — nu doar vânzări. Un POS care înregistrază fiecare mișcare reduce discuțiile de la final de zi.",
        },
        {
          title: "Stoc și marje fără al doilea sistem",
          body: "Când achizițiile și rețetele stau lângă casă, vedeți stocul scăzut și costul rețetei înainte de serviciu — nu doar duminica seara într-un Excel.",
        },
      ],
    },
  },
  {
    slug: "closing-the-till",
    publishedAt: "2026-05-20",
    image: "/showcase/reports-dashboard.png",
    imageAlt: {
      en: "franchisetech owner dashboard after till close",
      ro: "Panou proprietar franchisetech după închiderea casei",
    },
    en: {
      eyebrow: "Operations",
      title: "Closing the till: a simple daily routine owners can trust",
      metaTitle: "How to Close the Till — Daily Cash-Up for Food Businesses",
      description:
        "Opening cash, sales, cash movements, counted cash, and difference — a clear close-of-day workflow for cafes and restaurants.",
      excerpt:
        "A repeatable till-close routine builds owner trust. Here is what to check every day before you leave.",
      readMinutes: 5,
      sections: [
        {
          title: "Start with opening float",
          body: "Record opening cash when the session opens. franchisetech keeps that number with the session so expected cash at close is calculated — not guessed.",
        },
        {
          title: "Separate cash sales from drawer movements",
          body: "Cash in and cash out (payouts, change fund top-ups) must not be mixed with revenue. Clear lines make Z-report and owner review easier.",
        },
        {
          title: "Count, compare, note the difference",
          body: "Staff count physical cash; the system shows expected cash. A small difference with a note is better than a silent mismatch discovered next week.",
        },
      ],
    },
    ro: {
      eyebrow: "Operațiuni",
      title: "Închiderea casei: o rutină zilnică simplă în care proprietarul poate avea încredere",
      metaTitle: "Cum închizi casa — reconciliere zilnică pentru HORECA",
      description:
        "Numerar deschidere, vânzări, mișcări numerar, numerar numărat și diferență — flux clar de închidere pentru cafenele și restaurante.",
      excerpt:
        "O rutină repetabilă la închiderea casei creează încredere. Iată ce verificați în fiecare zi înainte să plecați.",
      readMinutes: 5,
      sections: [
        {
          title: "Începeți cu fondul de deschidere",
          body: "Înregistrați numerarul de deschidere când pornește sesiunea. franchisetech păstrează suma cu sesiunea, astfel numerarul așteptat la închidere este calculat — nu estimat.",
        },
        {
          title: "Separați vânzările cash de mișcările din sertar",
          body: "Intrările și ieșirile de numerar nu trebuie amestecate cu veniturile. Linii clare fac raportul Z și verificarea proprietarului mai ușoare.",
        },
        {
          title: "Numărați, comparați, notați diferența",
          body: "Personalul numără numerarul fizic; sistemul arată numerarul așteptat. O diferență mică cu o notă e mai bună decât o nepotrivire descoperită săptămâna viitoare.",
        },
      ],
    },
  },
  {
    slug: "food-business-stock-control",
    publishedAt: "2026-06-01",
    image: "/showcase/stock-levels.png",
    imageAlt: {
      en: "Stock levels screen in franchisetech",
      ro: "Ecran niveluri stoc în franchisetech",
    },
    en: {
      eyebrow: "Stock",
      title: "Stock control for food businesses without spreadsheet chaos",
      metaTitle: "Food Business Stock Control — Ingredients, Purchases & Low Stock",
      description:
        "Connect purchases, ingredients, and sales so owners see low stock and can-make counts before service.",
      excerpt:
        "Stock breaks when purchases, recipes, and sales live in different places. One connected view fixes that.",
      readMinutes: 5,
      sections: [
        {
          title: "Purchases should update stock automatically",
          body: "When a delivery arrives, record it once against suppliers and products. Stock levels and ingredient cost stay current for ordering decisions.",
        },
        {
          title: "Recipes link sales to ingredients",
          body: "Configured recipes let POS sales reduce ingredient stock — so 'can we make 20 more lattes?' is a system answer, not a guess.",
        },
        {
          title: "Low-stock alerts before the rush",
          body: "See what is running low before Friday service, not when a barista opens the milk fridge at peak hour.",
        },
      ],
    },
    ro: {
      eyebrow: "Stoc",
      title: "Control stoc pentru afaceri alimentare fără haos în Excel",
      metaTitle: "Control stoc HORECA — ingrediente, achiziții și alerte",
      description:
        "Conectați achizițiile, ingredientele și vânzările pentru a vedea stoc scăzut și câte porții puteți face înainte de serviciu.",
      excerpt:
        "Stocul se strică când achizițiile, rețetele și vânzările sunt în locuri diferite. O singură vedere conectată rezolvă asta.",
      readMinutes: 5,
      sections: [
        {
          title: "Achizițiile ar trebui să actualizeze stocul automat",
          body: "Când vine livrarea, înregistrați-o o dată la furnizori și produse. Nivelurile și costul ingredientelor rămân actuale pentru comenzi.",
        },
        {
          title: "Rețetele leagă vânzările de ingrediente",
          body: "Rețetele configurate permit ca vânzările POS să scadă stocul de ingrediente — astfel „mai putem 20 de latte?” e un răspuns din sistem, nu o estimare.",
        },
        {
          title: "Alerte stoc scăzut înainte de rush",
          body: "Vedeți ce scade înainte de serviciul de vineri, nu când barista deschide frigiderul la ora de vârf.",
        },
      ],
    },
  },
  {
    slug: "z-report-explained",
    publishedAt: "2026-06-10",
    image: "/showcase/settings-features.png",
    imageAlt: {
      en: "franchisetech settings and fiscal features",
      ro: "Setări și funcții fiscale franchisetech",
    },
    en: {
      eyebrow: "Compliance",
      title: "Z-report explained for cafe and restaurant owners",
      metaTitle: "Z-Report Explained — End-of-Day Fiscal Close for Food Businesses",
      description:
        "What a Z-report is, when to run it, and how franchisetech keeps till records aligned with fiscal close in Romania.",
      excerpt:
        "Owners hear 'Z-report' from accountants and fiscal providers. Here is what it means in plain language.",
      readMinutes: 4,
      sections: [
        {
          title: "What a Z-report does",
          body: "A Z-report closes the fiscal day on the cash register. It summarises sales and resets counters for the next trading day. It is not the same as a till reconciliation — both matter.",
        },
        {
          title: "Who should run it",
          body: "Only authorised staff should trigger a Z-report. franchisetech keeps that permission on admin roles so casual register users cannot close the fiscal day by mistake.",
        },
        {
          title: "Romania: FiscalNet when enabled",
          body: "For Romanian businesses with FiscalNet enabled in Settings, franchisetech can send the receipt command from the browser to the local fiscal device — when configured and eligible.",
        },
      ],
    },
    ro: {
      eyebrow: "Conformitate",
      title: "Raportul Z explicat pentru proprietari de cafenele și restaurante",
      metaTitle: "Raport Z explicat — închidere fiscală zilnică pentru HORECA",
      description:
        "Ce este raportul Z, când îl rulați și cum franchisetech aliniază casa cu închiderea fiscală în România.",
      excerpt:
        "Proprietarii aud „raport Z” de la contabili și furnizori fiscali. Iată ce înseamnă, pe înțelesul tuturor.",
      readMinutes: 4,
      sections: [
        {
          title: "Ce face raportul Z",
          body: "Raportul Z închide ziua fiscală la casa de marcat. Sumarizează vânzările și resetează contoarele pentru ziua următoare. Nu e același lucru cu reconcilierea casei — ambele contează.",
        },
        {
          title: "Cine ar trebui să îl ruleze",
          body: "Doar personalul autorizat ar trebui să declanșeze raportul Z. franchisetech păstrează permisiunea pe roluri admin, ca utilizatorii obișnuiți să nu închidă din greșeală ziua fiscală.",
        },
        {
          title: "România: FiscalNet când e activat",
          body: "Pentru afaceri din România cu FiscalNet activat în Setări, franchisetech poate trimite comanda de bon din browser către dispozitivul fiscal local — când e configurat și eligibil.",
        },
      ],
    },
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function blogContentForLocale(
  post: BlogPost,
  locale: MarketingLocale,
): BlogPostContent {
  if (locale === "ro") return post.ro;
  return post.en;
}

export function blogLocaleKey(locale: MarketingLocale): "en" | "ro" {
  return locale === "ro" ? "ro" : "en";
}

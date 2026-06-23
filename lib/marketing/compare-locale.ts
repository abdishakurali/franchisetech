import type { MarketingLocale } from "@/lib/marketing/locale";
import type { ComparisonPage } from "@/lib/marketing/comparisons";

/** Map English comparison-table area labels → Romanian (baseRows + legacy rows). */
const ROW_AREA_RO: Record<string, string> = {
  "POS register": "Casă de marcat (POS)",
  "Payments / hardware": "Plăți / hardware",
  "Stock & purchases": "Stoc & achiziții",
  "Recipe costing": "Cost rețete & marje",
  "Till close / Z-report": "Închidere casă / Raport Z",
  "Fiscal receipts (RO)": "Bonuri fiscale (RO)",
  "Team / pricing": "Echipă / preț",
  "Best fit": "Cel mai potrivit pentru",
  Area: "Domeniu",
};

const ROW_FRANCHISETECH_RO: Record<string, string> = {
  "Browser POS with products, cart, refunds, and till sessions":
    "POS în browser: produse, coș, retururi, sesiune casă",
  "Records payment method; FiscalNet where configured (Romania)":
    "Înregistrează metoda de plată; FiscalNet când e configurat (România)",
  "Products, ingredients, suppliers, purchase records, low stock":
    "Produse, ingrediente, furnizori, achiziții/NIR, alerte stoc",
  "Recipe builder, cost per portion, margin, can-make counts":
    "Rețete, cost/porție, marjă brută, can-make din stoc",
  "Opening cash, cash in/out, expected vs counted, daily close":
    "Deschidere casă, intrări/ieșiri numerar, așteptat vs numărat, închidere zi",
  "FiscalNet integration when enabled and configured":
    "Integrare FiscalNet când e activată și configurată",
  "Unlimited staff on paid plans — no per-seat POS fee":
    "Personal nelimitat pe plan plătit — fără taxă per casier",
  "Small food businesses wanting POS + stock + recipes + daily records together":
    "Afaceri alimentare mici: POS + stoc + rețete + rapoarte zilnice împreună",
};

export function compareSignupHref(slug: string, locale: MarketingLocale): string {
  const params = new URLSearchParams({
    plan: "starter",
    utm_source: "compare",
    utm_medium: "organic",
    utm_campaign: "ro-compare-q2",
    utm_content: slug,
  });
  if (locale === "ro") params.set("lang", "ro");
  return `/signup?${params.toString()}`;
}

export function localizeComparisonPage(page: ComparisonPage, locale: MarketingLocale): ComparisonPage {
  if (locale !== "ro") return page;
  return {
    ...page,
    rows: page.rows.map(([area, ft, comp]) => [
      ROW_AREA_RO[area] ?? area,
      ROW_FRANCHISETECH_RO[ft] ?? ft,
      comp,
    ]),
  };
}

export type CompareHubFaq = { question: string; answer: string };

export function compareHubFaqs(locale: MarketingLocale): CompareHubFaq[] {
  if (locale === "ro") {
    return [
      {
        question: "Care e cea mai bună alternativă POS în România?",
        answer:
          "Depinde de prioritate: facturare (SmartBill/Oblio/Saga), hardware plăți (Square/SumUp) sau operațiuni zilnice (POS + stoc + rețete + închidere casă). franchisetech țintește ultimul — comparați pe paginile Ebriza, SmartBill, Oblio și Bit-Soft.",
      },
      {
        question: "De ce unii vânzători POS taxează extra rapoartele?",
        answer:
          "Unele platforme listă ~49€/locație, apoi vând Insights sau rapoarte custom ca add-on (~19€/lună). franchisetech include vânzări, raport Z și TVA în Starter — comparați costul lunar total. Vezi /compare/ebriza pentru un exemplu concret.",
      },
      {
        question: "Pot schimba POS-ul fără să pierd setup-ul fiscal?",
        answer:
          "FiscalNet și imprimanta fiscală rămân pe PC-ul de casă. Rulați trial paralel, verificați bonurile cu contabilul, apoi migrați produsele — nu presupuneți migrare automată de la alt furnizor.",
      },
      {
        question: "franchisetech înlocuiește software-ul contabil?",
        answer:
          "Nu neapărat. Mulți operatori păstrează SmartBill/Oblio/Saga pentru facturare și folosesc franchisetech pentru POS zilnic, stoc, rețete și raport Z. Sfatul fiscal profesional rămâne responsabilitatea dvs.",
      },
    ];
  }
  return [
    {
      question: "What is the best POS alternative in Romania?",
      answer:
        "It depends on your priority: invoicing (SmartBill/Oblio/Saga), payments hardware (Square/SumUp class), or daily operations (POS + stock + recipes + till close). franchisetech targets the last — compare on our Ebriza, SmartBill, Oblio, and Bit-Soft pages.",
    },
    {
      question: "Why do some POS vendors charge extra for reports?",
      answer:
        "Some platforms list €49/location then sell Insights or custom reporting as a paid add-on (often ~€19/month). franchisetech includes sales, Z-style till close, and VAT reports in Starter — compare total monthly cost. See /compare/ebriza for a worked example.",
    },
    {
      question: "Can I switch POS without losing my fiscal setup?",
      answer:
        "FiscalNet and fiscal printer setup stay on your till PC. Run a parallel trial, verify receipts with your accountant, then migrate products and workflows — do not assume automatic migration from another vendor.",
    },
    {
      question: "Does franchisetech replace my accountant software?",
      answer:
        "Not necessarily. Many operators keep invoicing/accounting tools and use franchisetech for daily POS, stock, recipes, and Z-style till close. Professional tax advice remains your responsibility.",
    },
  ];
}

export function compareUi(locale: MarketingLocale) {
  const ro = locale === "ro";
  return {
    readComparison: ro ? "Citește comparația" : "Read comparison",
    faq: ro ? "Întrebări frecvente" : "FAQ",
    tableArea: ro ? "Domeniu" : "Area",
    tableFranchisetech: "franchisetech",
    disclaimer: ro
      ? "Informațiile se pot schimba. Verificați prețurile, modulele fiscale și funcțiile actuale ale fiecărui furnizor înainte de achiziție."
      : "Information may change. Verify each provider's current pricing, fiscal modules, and features before buying.",
    breadcrumbCompare: ro ? "Comparații" : "Compare",
    breadcrumbHome: ro ? "Acasă" : "Home",
    comparisonRo: "Comparație România",
    comparison: "Comparison",
    allComparisons: ro ? "Toate comparațiile" : "All comparisons",
  };
}

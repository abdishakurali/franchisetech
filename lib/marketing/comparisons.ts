export type ComparisonPage = {
  slug: string;
  path: string;
  competitor: string;
  market: "global" | "ro" | "ie";
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  betterFor: string;
  competitorStrengths: string[];
  franchisetechStrengths: string[];
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  rows: Array<[area: string, franchisetech: string, competitor: string]>;
};

function baseRows(competitor: string, competitorPos: string): ComparisonPage["rows"] {
  return [
    ["POS register", "Browser POS with products, cart, refunds, and till sessions", competitorPos],
    ["Payments / hardware", "Records payment method; FiscalNet where configured (Romania)", "Varies — often stronger on payment terminals"],
    ["Stock & purchases", "Products, ingredients, suppliers, purchase records, low stock", "Varies by product — often invoicing-first, not kitchen stock"],
    ["Recipe costing", "Recipe builder, cost per portion, margin, can-make counts", "Usually limited or absent in invoicing-first tools"],
    ["Till close / Z-report", "Opening cash, cash in/out, expected vs counted, daily close", "Varies — may need separate cash-up workflow"],
    ["Fiscal receipts (RO)", "FiscalNet integration when enabled and configured", "Varies — check current fiscal module and setup"],
    ["Team / pricing", "Unlimited staff on paid plans — no per-seat POS fee", "Check current per-user or terminal pricing"],
    ["Best fit", "Small food businesses wanting POS + stock + recipes + daily records together", `Businesses whose main need is ${competitor}'s core strength`],
  ];
}

export const comparisonPages: ComparisonPage[] = [
  {
    slug: "square",
    path: "/compare/square",
    competitor: "Square",
    market: "global",
    metaTitle: "franchisetech vs Square for Small Food Businesses",
    description:
      "Honest comparison of franchisetech and Square for cafes and restaurants that need POS, stock, purchases, recipes, and daily till records.",
    h1: "franchisetech vs Square for small food businesses",
    intro:
      "Square is strong for payments and card acceptance. franchisetech focuses on the operating layer around the till: products, stock, suppliers, purchases, recipe costing, Z-reports, and food-safety records.",
    betterFor:
      "Square may fit if integrated payment hardware is your top priority today. franchisetech may fit if you want a simple POS with stock, purchases, recipes, and food-business records in one browser workspace.",
    competitorStrengths: [
      "Widely known brand and payment ecosystem",
      "Card readers and payment hardware options",
      "Established POS for many retail and hospitality setups",
    ],
    franchisetechStrengths: [
      "Operations-first: stock, purchases, recipes, and till close together",
      "Unlimited staff on paid plans — no per-seat POS fee",
      "Romania-ready with lei, TVA rates, and FiscalNet when configured",
    ],
    sections: [
      {
        title: "When Square is the better starting point",
        body: "If your main blocker is taking card payments with minimal setup, Square’s payment hardware and ecosystem may solve that faster than switching your whole back office.",
      },
      {
        title: "When franchisetech is worth a look",
        body: "If you already sell through a till but rebuild stock, margins, and cash-up in spreadsheets, franchisetech connects POS sales to ingredients, purchases, and daily close figures.",
      },
      {
        title: "Migration mindset",
        body: "You can run a 15-day trial in parallel with your current till. Products, opening cash, and a test sale take minutes — compare daily records before you switch.",
      },
    ],
    faqs: [
      {
        question: "Is franchisetech a Square replacement?",
        answer:
          "Not always. franchisetech is an operations workspace (POS, stock, recipes, reports). Payment terminal integration should not be assumed unless configured for your setup.",
      },
      {
        question: "Can I use franchisetech in Ireland and Romania?",
        answer:
          "Yes. Irish organisations use EUR and Irish VAT rates. Romanian organisations use lei (RON), TVA rates, and optional FiscalNet fiscal receipts when enabled.",
      },
      {
        question: "Which is cheaper for a 10-person team?",
        answer:
          "Compare total cost: Square’s hardware and plan fees vs franchisetech’s flat plan with unlimited staff. Pricing changes — check both sites before deciding.",
      },
    ],
    related: [
      { label: "POS feature", href: "/features/pos" },
      { label: "Recipe costing", href: "/features/recipe-costing" },
      { label: "SumUp comparison", href: "/compare/sumup" },
    ],
    rows: baseRows("Square", "Square POS — strong payments ecosystem, varies by region"),
  },
  {
    slug: "sumup",
    path: "/compare/sumup",
    competitor: "SumUp",
    market: "global",
    metaTitle: "franchisetech vs SumUp for Cafes and Restaurants",
    description:
      "Compare franchisetech and SumUp for food businesses that need simple POS plus stock, purchases, recipes, and end-of-day records.",
    h1: "franchisetech vs SumUp for cafes and restaurants",
    intro:
      "SumUp is widely chosen for card acceptance. franchisetech focuses on daily operations after the sale: stock, suppliers, recipe margins, till close, and owner reports.",
    betterFor:
      "SumUp may fit if payment acceptance is the main job. franchisetech may fit if connecting sales to stock, recipes, and cash-up matters more than the terminal brand.",
    competitorStrengths: ["Simple card acceptance story", "Portable terminals for small operators", "Low-friction signup for payments"],
    franchisetechStrengths: [
      "Full product catalogue with categories and VAT",
      "Stock and purchase records tied to ingredients",
      "Z-report style till close with expected vs counted cash",
    ],
    sections: [
      {
        title: "Payments-first vs operations-first",
        body: "SumUp often wins the ‘take card payments quickly’ decision. franchisetech wins when owners ask ‘what did we sell, what stock moved, and did the till match the drawer?’",
      },
      {
        title: "Food businesses need more than a receipt",
        body: "Cafes and restaurants track ingredients, waste, and margins. franchisetech links recipes to stock so can-make counts and gross margin are visible before menu changes.",
      },
    ],
    faqs: [
      {
        question: "Does franchisetech include a SumUp terminal?",
        answer: "No. franchisetech records the payment method. Terminal choice remains yours.",
      },
      {
        question: "Can I trial franchisetech while keeping SumUp?",
        answer: "Yes. Many operators parallel-run for 15 days to compare daily records before switching workflows.",
      },
    ],
    related: [
      { label: "Square comparison", href: "/compare/square" },
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Cash-up guide", href: "/resources/cash-up-at-end-of-day" },
    ],
    rows: baseRows("SumUp", "SumUp POS / payments — card acceptance focused"),
  },
  {
    slug: "lightspeed",
    path: "/compare/lightspeed",
    competitor: "Lightspeed",
    market: "global",
    metaTitle: "franchisetech vs Lightspeed for Small Food Businesses",
    description:
      "Compare franchisetech and Lightspeed for operators who want POS, stock, suppliers, recipe costing, and records without enterprise complexity.",
    h1: "franchisetech vs Lightspeed for small food businesses",
    intro:
      "Lightspeed offers a broad hospitality and retail platform. franchisetech is built for small food operators who want a focused till-plus-operations workspace.",
    betterFor:
      "Lightspeed may fit larger multi-site setups needing deep integrations. franchisetech may fit single-site and small chains wanting clarity without a heavy back office.",
    competitorStrengths: ["Large feature set and partner ecosystem", "Established brand in hospitality POS", "Many integration options at higher tiers"],
    franchisetechStrengths: [
      "Simpler daily workflow for small teams",
      "Recipe costing and stock connected to POS",
      "Transparent plans with unlimited staff",
    ],
    sections: [
      {
        title: "Complexity vs clarity",
        body: "Enterprise platforms carry configuration cost. franchisetech defaults to essentials: sell, track stock, close the till, review reports.",
      },
    ],
    faqs: [
      {
        question: "Is franchisetech an enterprise POS?",
        answer:
          "No. It targets small food businesses and small chains — not large enterprise warehouse or franchise HQ requirements.",
      },
    ],
    related: [
      { label: "Pricing", href: "/pricing" },
      { label: "Restaurants", href: "/industries/restaurants" },
      { label: "Lightspeed alternative (RO)", href: "/compare/expressoft" },
    ],
    rows: baseRows("Lightspeed", "Lightspeed — broad hospitality platform, tiered pricing"),
  },
  {
    slug: "smartbill",
    path: "/compare/smartbill",
    competitor: "SmartBill",
    market: "ro",
    metaTitle: "Alternativă SmartBill pentru restaurante — POS, stoc, rețete | franchisetech",
    description:
      "Comparație onestă franchisetech vs SmartBill pentru cafenele și restaurante din România: POS zilnic, stoc, achiziții, cost rețete și raport Z — lângă facturare.",
    h1: "franchisetech vs SmartBill pentru restaurante și cafenele",
    intro:
      "SmartBill este puternic la facturare și contabilitate pentru IMM-uri din România. franchisetech se concentrează pe fluxul zilnic al casei: vânzări POS, stoc, achiziții, cost rețete, închidere casă și rapoarte pentru proprietar.",
    betterFor:
      "SmartBill poate rămâne alegerea principală dacă aveți nevoie doar de facturare și e-Factura. franchisetech merită evaluat dacă POS-ul, stocul și marjele pe rețete trebuie să stea în același loc cu vânzarea zilnică.",
    competitorStrengths: [
      "Facturare și e-Factura cunoscute în România",
      "Ecosistem contabil familiar pentru IMM-uri",
      "Integrări cu fluxuri de facturare existente",
    ],
    franchisetechStrengths: [
      "POS în browser cu sesiuni casă și raport Z",
      "Stoc, furnizori, achiziții și rețete legate de vânzări",
      "FiscalNet când este activat și configurat",
      "Personal nelimitat pe planurile plătite",
    ],
    sections: [
      {
        title: "Facturare vs operațiuni zilnice",
        body: "Multe restaurante folosesc SmartBill pentru facturi către furnizori și e-Factura, dar încă reconciliază casa și stocul în Excel. franchisetech țintește golul dintre bonul fiscal și marja reală pe produs.",
      },
      {
        title: "Trial paralel",
        body: "Rulați 15 zile în paralel: aceleași produse, aceeași echipă, comparați raportul zilnic și timpul de reconciliere înainte de a muta fluxul principal.",
      },
    ],
    faqs: [
      {
        question: "franchisetech înlocuiește SmartBill complet?",
        answer:
          "Nu neapărat. Multe afaceri păstrează SmartBill pentru facturare și folosesc franchisetech pentru POS, stoc și rapoarte zilnice. Verificați cu contabilul ce combinație vi se potrivește.",
      },
      {
        question: "Suportă FiscalNet?",
        answer:
          "Da, când integrarea este activată și configurată corect pe stația de casă. Nu presupuneți conformitate fiscală fără verificarea contabilului.",
      },
      {
        question: "Pot importa produse?",
        answer: "Da, prin CSV. Setup asistat este disponibil pentru prima configurare.",
      },
    ],
    related: [
      { label: "România", href: "/industries/romania" },
      { label: "Ghid FiscalNet", href: "/help/romania-fiscalnet" },
      { label: "Obiecții frecvente POS", href: "/resources/objections-pos-romania" },
      { label: "Alternative Saga", href: "/compare/saga" },
      { label: "Software POS România", href: "/resources/pos-software-romania" },
    ],
    rows: baseRows("SmartBill", "SmartBill — facturare și contabilitate IMM, POS limitat spre operațiuni adânci"),
  },
  {
    slug: "saga",
    path: "/compare/saga",
    competitor: "Saga",
    market: "ro",
    metaTitle: "Alternativă Saga POS pentru restaurante — stoc și casă | franchisetech",
    description:
      "Comparație franchisetech vs Saga pentru operatori din România: POS, gestiune stoc, NIR/achiziții, rețete și raport Z față de suite contabile tradiționale.",
    h1: "franchisetech vs Saga pentru afaceri alimentare",
    intro:
      "Saga este folosită frecvent în contabilitate și gestiune comercială tradițională. franchisetech oferă un workspace modern în browser pentru casă, stoc și marje — fără să pretindem că înlocuiește tot ecosistemul contabil.",
    betterFor:
      "Saga poate rămâne potrivită dacă contabilul dvs. impune un flux specific de gestiune. franchisetech merită testat dacă echipa de serviciu are nevoie de POS rapid și stoc legat de rețete.",
    competitorStrengths: ["Prezență lungă în piața românească", "Fluxuri contabile familiare contabililor", "Module de gestiune comercială"],
    franchisetechStrengths: [
      "Interfață POS simplă pentru personal de serviciu",
      "Rețete, marjă brută și can-make din stoc",
      "Raport Z și reconciliere numerar în același sistem",
    ],
    sections: [
      {
        title: "Contabil vs echipă de serviciu",
        body: "Saga servește adesea biroul contabil. franchisetech servește casierul și managerul la final de zi — cu exporturi pentru contabil, nu în locul sfaturii fiscale profesionale.",
      },
    ],
    faqs: [
      {
        question: "Contabilul meu folosește Saga — pot folosi franchisetech?",
        answer:
          "Da, în multe cazuri ca strat operațional zilnic. Exportați rapoarte și reconciliați cu contabilul — nu înlocuiește obligațiile fiscale profesionale.",
      },
    ],
    related: [
      { label: "SmartBill comparison", href: "/compare/smartbill" },
      { label: "Gestiune stoc România", href: "/resources/stock-management-romania" },
      { label: "POS România", href: "/industries/romania" },
    ],
    rows: baseRows("Saga", "Saga — gestiune comercială / contabilitate, POS modern limitat"),
  },
  {
    slug: "rezosoft",
    path: "/compare/rezosoft",
    competitor: "RezoSoft",
    market: "ro",
    metaTitle: "Alternativă RezoSoft — POS restaurant România | franchisetech",
    description:
      "Comparație franchisetech vs RezoSoft pentru restaurante din România: POS, FiscalNet, stoc, rețete și rapoarte — evaluare onestă pentru operatori mici.",
    h1: "franchisetech vs RezoSoft pentru restaurante",
    intro:
      "RezoSoft este un nume cunoscut în POS pentru HoReCa în România. franchisetech propune același tip de job — casă, stoc, rapoarte — într-un workspace cloud cu personal nelimitat și setup mai rapid pentru afaceri mici.",
    betterFor:
      "RezoSoft poate fi potrivit dacă aveți deja investiție în echipamente și training local. franchisetech merită evaluat dacă doriți browser POS, trial rapid și cost predictibil fără taxă per casier.",
    competitorStrengths: ["Brand local HoReCa", "Instalări tradiționale la restaurante", "Suport local cunoscut"],
    franchisetechStrengths: [
      "Rulează în browser — fără instalare grea pe fiecare stație",
      "Trial 15 zile fără card",
      "Module stoc și rețete opționale",
    ],
    sections: [
      {
        title: "Local instalat vs cloud browser",
        body: "POS-urile locale pot fi robuste dar costisitoare de menținut. franchisetech reduce dependența de server local pentru fluxul zilnic — FiscalNet rămâne pe stația configurată.",
      },
    ],
    faqs: [
      {
        question: "franchisetech funcționează offline?",
        answer:
          "Este orientat cloud. Planificați conexiune stabilă pentru POS; verificați procedura de backup pentru situații offline.",
      },
    ],
    related: [
      { label: "Expressoft comparison", href: "/compare/expressoft" },
      { label: "România", href: "/industries/romania" },
    ],
    rows: baseRows("RezoSoft", "RezoSoft — POS HoReCa local, ecosistem instalat"),
  },
  {
    slug: "expressoft",
    path: "/compare/expressoft",
    competitor: "Expressoft",
    market: "ro",
    metaTitle: "Alternativă Expressoft restaurant — POS cloud România | franchisetech",
    description:
      "Comparație franchisetech vs Expressoft: POS, gestiune stoc, rețete și rapoarte pentru restaurante mici și lanțuri 2–5 locații din România.",
    h1: "franchisetech vs Expressoft",
    intro:
      "Expressoft acoperă restaurante și retail cu soluții consacrate. franchisetech se poziționează pentru operatori care vor simplitate: casă rapidă, stoc, marje și închidere zi fără suite enterprise.",
    betterFor:
      "Expressoft poate câștiga la lanțuri mari cu implementare dedicată. franchisetech țintește cafenele, restaurante mici și lanțuri 2–5 locații care vor time-to-value rapid.",
    competitorStrengths: ["Portofoliu larg HoReCa + retail", "Implementări la lanțuri consacrate", "Ecosistem matur"],
    franchisetechStrengths: [
      "Preț transparent și personal nelimitat",
      "Onboarding ghidat și setup checklist",
      "Multi-location pe plan dedicat",
    ],
    sections: [
      {
        title: "Time to first sale",
        body: "franchisetech optimizează primele 15 minute: produse, deschidere casă, vânzare test. Enterprise rollouts durează săptămâni — noi targetăm zile.",
      },
    ],
    faqs: [
      {
        question: "Suport multi-locație?",
        answer: "Da, pe plan Multi-location. Verificați pagina de prețuri pentru limitele curente.",
      },
    ],
    related: [
      { label: "RezoSoft comparison", href: "/compare/rezosoft" },
      { label: "Pricing", href: "/pricing" },
    ],
    rows: baseRows("Expressoft", "Expressoft — platformă HoReCa/retail, implementare variabilă"),
  },
  {
    slug: "hepos",
    path: "/compare/hepos",
    competitor: "hePOS",
    market: "ro",
    metaTitle: "Alternativă hePOS — software casă de marcat restaurant | franchisetech",
    description:
      "Comparație franchisetech vs hePOS pentru POS restaurant în România: FiscalNet, stoc, rețete, raport Z și cost total pentru echipe mici.",
    h1: "franchisetech vs hePOS",
    intro:
      "hePOS este o opțiune POS pentru restaurante în România. franchisetech compară onest pe dimensiuni pe care proprietarii le cer: casă, stoc, marje, rapoarte și cost per echipă.",
    betterFor:
      "hePOS poate fi ales dacă aveți deja contract și hardware compatibil. franchisetech merită trial dacă reconcilierea zilnică și rețetele sunt încă în Excel.",
    competitorStrengths: ["Focus restaurant România", "Flux POS familiar operatorilor locali"],
    franchisetechStrengths: [
      "Stoc + rețete + POS în același workspace",
      "Fără taxă per utilizator pe planurile plătite",
      "Resurse și ghiduri în română",
    ],
    sections: [
      {
        title: "Cost total de proprietate",
        body: "Comparați licențe, terminale, taxe per casier și ore de reconciliere manuală — nu doar prețul lunar afișat.",
      },
    ],
    faqs: [
      {
        question: "Care e diferența principală?",
        answer:
          "Ambele țintesc POS restaurant. franchisetech pune accent pe stoc, cost rețete și raport Z integrat, cu personal nelimitat pe plan.",
      },
    ],
    related: [
      { label: "POS feature", href: "/features/pos" },
      { label: "România industry page", href: "/industries/romania" },
    ],
    rows: baseRows("hePOS", "hePOS — POS restaurant România"),
  },
  {
    slug: "vilicorest",
    path: "/compare/vilicorest",
    competitor: "VilicoRest",
    market: "ro",
    metaTitle: "Alternativă VilicoRest — POS restaurant România | franchisetech",
    description:
      "Comparație franchisetech vs VilicoRest pentru restaurante din România: POS cloud, stoc, rețete, raport Z și cost per echipă.",
    h1: "franchisetech vs VilicoRest pentru restaurante",
    intro:
      "VilicoRest este folosit în piața HoReCa din România. franchisetech oferă un workspace cloud orientat spre simplitate zilnică: casă, stoc, marje și închidere zi — evaluați ambele în trial paralel.",
    betterFor:
      "VilicoRest poate rămâne potrivit dacă aveți deja implementare locală și training echipă. franchisetech merită testat dacă doriți browser POS, personal nelimitat și setup rapid.",
    competitorStrengths: ["Prezență pe piața restaurantelor din România", "Flux POS cunoscut operatorilor locali"],
    franchisetechStrengths: [
      "POS + stoc + rețete + raport Z în același sistem",
      "Trial 15 zile fără card",
      "FiscalNet când este activat și configurat",
    ],
    sections: [
      {
        title: "Evaluare practică",
        body: "Comparați timpul până la prima vânzare reală, claritatea raportului zilnic și costul total cu toți casierii — nu doar licența lunară.",
      },
    ],
    faqs: [
      {
        question: "Pot migra meniul din VilicoRest?",
        answer: "Import CSV pentru produse este disponibil. Setup asistat poate ajuta la migrarea inițială.",
      },
    ],
    related: [
      { label: "RezoSoft comparison", href: "/compare/rezosoft" },
      { label: "Expressoft comparison", href: "/compare/expressoft" },
      { label: "România", href: "/industries/romania" },
    ],
    rows: baseRows("VilicoRest", "VilicoRest — POS restaurant România"),
  },
];

export const COMPARE_HUB_PATH = "/compare";

export function comparisonsByMarket(market?: ComparisonPage["market"]) {
  if (!market) return comparisonPages;
  return comparisonPages.filter((p) => p.market === market);
}

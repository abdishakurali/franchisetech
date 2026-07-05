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
      "Square is strong for payments and card acceptance. franchisetech focuses on the operating layer around the till: products, stock, suppliers, purchases, recipe costing, and Z-reports.",
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
    metaTitle: "Alternativă SmartBill pentru restaurante — POS, stoc, rețete",
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
    metaTitle: "Alternativă Saga pentru restaurante — POS zilnic, stoc, NIR",
    description:
      "Comparație onestă franchisetech vs Saga: păstrați Saga pentru contabilitate, adăugați POS, stoc, NIR și raport Z în browser — fără să înlocuiți ecosistemul contabil impus de birou.",
    h1: "franchisetech vs Saga — contabilitate vs ziua de la casă",
    intro:
      "Saga este adânc înrădăcinată în contabilitate și gestiune comercială tradițională din România — mulți contabili o impun sau o recomandă. franchisetech nu concurează la facturare sau la înlocuirea sfatului fiscal profesional; țintește stratul zilnic al cafenelei sau restaurantului: casă, stoc, NIR, marje pe rețete și raport Z — cu exporturi pentru contabil, nu în locul lui.",
    betterFor:
      "Saga rămâne potrivită dacă biroul contabil impune un flux specific de gestiune sau export contabil. franchisetech merită evaluat dacă echipa de serviciu are nevoie de POS rapid în browser, stoc legat de vânzări și închidere de zi clară — păstrând Saga pentru documente și e-Factura acolo unde contabilul o cere.",
    competitorStrengths: [
      "Prezență lungă în piața românească — familiar contabililor și birourilor de contabilitate",
      "Fluxuri contabile și de gestiune comercială consacrate (NIR, inventar, rapoarte contabile)",
      "Integrări și exporturi așteptate de contabili — WinMentor, Ciel și ecosistem similar",
      "Module de gestiune comercială pentru IMM-uri care nu sunt doar HoReCa",
    ],
    franchisetechStrengths: [
      "POS în browser orientat pe serviciu zilnic — coș rapid, sesiune casă, raport Z inclus în Core",
      "Stoc, furnizori, achiziții/NIR (14-3-1A) și rețete cu marjă brută pe Operations",
      "Coexistă cu Saga/SmartBill/Oblio — facturare separată, operațiuni zilnice în același workspace",
      "Personal nelimitat pe planurile plătite — fără taxă per casier",
      "FiscalNet când este activat și configurat pe stația de casă",
    ],
    sections: [
      {
        title: "Coexistență cu Saga, nu înlocuire automată",
        body: "Model frecvent: Saga (sau SmartBill/Oblio) pentru facturi B2B, e-Factura și cerințele biroului contabil; franchisetech pentru vânzări POS, stoc, NIR operațional și raport Z seara. Exportați rapoarte și reconciliați cu contabilul — franchisetech nu înlocuiește obligațiile fiscale profesionale.",
      },
      {
        title: "Biroul contabil vs echipa de serviciu",
        body: "Saga servește adesea contabilul și administratorul back-office. franchisetech servește casierul la serviciu și proprietarul la final de zi — cu întrebarea „casa se potrivește cu sertarul?” în loc de „am exportat corect în gestiune luna viitoare?”.",
      },
      {
        title: "Trial paralel în 15 zile",
        body: "Nu trebuie să renunțați la Saga pentru a testa. Rulați franchisetech în paralel: aceleași produse, aceeași echipă, aceeași închidere de zi. Comparați timpul de reconciliere și claritatea raportului Z înainte de a muta fluxul zilnic al casei.",
      },
    ],
    faqs: [
      {
        question: "Contabilul meu folosește Saga — pot folosi franchisetech?",
        answer:
          "Da, în multe cazuri ca strat operațional zilnic. Păstrați Saga pentru ce impune contabilul (facturare, export contabil); folosiți franchisetech pentru POS, stoc, NIR și raport Z. Verificați cu contabilul combinația potrivită înainte de a schimba fluxul principal.",
      },
      {
        question: "franchisetech înlocuiește Saga complet?",
        answer:
          "Nu neapărat — și adesea nu e recomandat dacă biroul contabil depinde de Saga. franchisetech optimizează ziua de lucru la casă; Saga rămâne puternică la gestiune comercială tradițională și la cerințele contabile. Multe afaceri folosesc ambele pentru joburi diferite.",
      },
      {
        question: "Am deja NIR în Saga — de ce aș avea nevoie de franchisetech?",
        answer:
          "NIR în Saga servește adesea contabilitatea. franchisetech leagă NIR/achizițiile de stocul folosit la POS și rețete — astfel vedeți can-make, marje și consum în timpul serviciului, nu doar la închiderea lunii. Pe Pro, NIR (14-3-1A) este orientat pe fluxul HoReCa zilnic.",
      },
    ],
    related: [
      { label: "Comparație SmartBill", href: "/compare/smartbill" },
      { label: "Comparație Oblio", href: "/compare/oblio" },
      { label: "Gestiune stoc România", href: "/resources/stock-management-romania" },
      { label: "POS România", href: "/industries/romania" },
      { label: "Ghid FiscalNet", href: "/help/romania-fiscalnet" },
    ],
    rows: [
      ["Rol principal", "Operațiuni zilnice: POS, stoc, închidere casă", "Contabilitate și gestiune comercială tradițională"],
      ["Facturare / e-Factura", "Coexistă — folosiți Saga/SmartBill/Oblio pentru documente", "Punct forte Saga — flux contabil consacrat"],
      ["POS register zilnic", "Browser POS: coș, plăți, sesiune casă, retururi", "POS modern limitat — focus pe gestiune, nu pe ritm HoReCa"],
      ["NIR / recepție marfă", "Pro — NIR legat de stoc și rețete (14-3-1A)", "NIR în gestiune comercială — orientat contabilitate"],
      ["Rețete & marje", "Pro — cost porție, marjă brută, can-make din stoc", "Producție/gestiune generală — nu focus HoReCa"],
      ["Raport Z / închidere casă", "Inclus în Starter — numerar așteptat vs numărat", "Variază — poate necesita flux separat de casă"],
      ["Export pentru contabil", "Rapoarte zilnice exportabile — reconciliere cu Saga", "Export nativ — punct forte pentru biroul contabil"],
      ["Personal / utilizatori", "Nelimitat pe plan plătit", "Verificați licențe curente — adesea per post sau modul"],
      ["FiscalNet (bon fiscal RO)", "Când este activat și configurat pe stație", "Variază — verificați modulul fiscal și setup-ul"],
      ["Cel mai potrivit pentru", "Cafenea/restaurant cu casă zilnică + contabil pe Saga", "IMM cu flux contabil impus de birou — nu doar serviciu rapid"],
    ],
  },
  {
    slug: "rezosoft",
    path: "/compare/rezosoft",
    competitor: "RezoSoft",
    market: "ro",
    metaTitle: "Alternativă RezoSoft — POS restaurant, stoc, raport Z",
    description:
      "Comparație onestă franchisetech vs RezoSoft pentru restaurante din România: POS local consacrat vs workspace cloud — casă, FiscalNet, stoc, rețete, raport Z și cost total fără taxă per casier.",
    h1: "franchisetech vs RezoSoft — POS local vs operațiuni în browser",
    intro:
      "RezoSoft este un nume cunoscut în POS HoReCa din România, cu instalări tradiționale la restaurante și suport local. franchisetech propune același tip de job — casă, stoc, rapoarte — într-un workspace cloud în browser, cu personal nelimitat și trial rapid. Nu pretindem că RezoSoft e „greșit”; comparăm onest unde fiecare câștigă: investiție locală existentă vs time-to-value și cost predictibil pentru afaceri mici.",
    betterFor:
      "RezoSoft poate fi potrivit dacă aveți deja investiție în echipamente, training local și contract de suport — și fluxul funcționează. franchisetech merită evaluat dacă doriți browser POS, trial 15 zile fără card, raport Z inclus și cost fără taxă per casier — plus coexistență cu SmartBill/Oblio pentru facturare.",
    competitorStrengths: [
      "Brand local HoReCa — recunoscut de operatori și integratori din România",
      "Instalări tradiționale la restaurante — ecosistem instalat, familiar echipei",
      "Suport local cunoscut — relație directă cu furnizorul POS",
      "Experiență acumulată în fluxuri POS restaurant specifice pieței românești",
    ],
    franchisetechStrengths: [
      "Rulează în browser — fără server local de menținut pentru fluxul zilnic",
      "Raport Z, vânzări și TVA incluse în Core (49€) — fără add-on doar pentru raportare",
      "Stoc, NIR, rețete și marjă brută pe Operations — legate de vânzările POS",
      "Personal nelimitat pe planurile plătite — fără taxă per casier",
      "Trial 15 zile fără card; FiscalNet când este activat și configurat",
    ],
    sections: [
      {
        title: "Local instalat vs cloud browser",
        body: "POS-urile locale precum RezoSoft pot fi robuste când sunt deja implementate — dar adaugă cost de mentenanță, upgrade-uri și dependență de hardware. franchisetech reduce complexitatea pentru fluxul zilnic: laptop sau tabletă, aceeași casă oriunde. FiscalNet rămâne pe stația configurată, conform ghidului.",
      },
      {
        title: "Facturare separată, casă clară",
        body: "Multe restaurante cu RezoSoft folosesc tot SmartBill, Oblio sau Saga pentru facturi furnizori și e-Factura. franchisetech nu înlocuiește automat tool-ul de facturare — adaugă stratul operațional: POS, stoc, NIR și raport Z seara. Verificați cu contabilul dacă păstrați facturarea existentă.",
      },
      {
        title: "Comparați costul total, nu doar licența",
        body: "Adunați licențe, terminale, taxe per casier, ore de reconciliere manuală și suport. franchisetech listează prețul pe site (Core 49€, Operations 79€) cu personal nelimitat. Rulați trial paralel 15 zile: aceeași echipă, aceeași închidere de zi — măsurați timpul până la raport clar.",
      },
    ],
    faqs: [
      {
        question: "franchisetech funcționează offline?",
        answer:
          "Este orientat cloud, cu coadă offline pentru vânzări când conexiunea pică temporar. Planificați internet stabil pentru POS zilnic. RezoSoft local poate avea avantaj în scenarii offline prelungite — evaluați cât de des apare problema la voi.",
      },
      {
        question: "Am investiție în RezoSoft — merită să testez franchisetech?",
        answer:
          "Da, fără să renunțați imediat. Trial 15 zile în paralel: import CSV produse, deschidere casă, vânzări reale, raport Z. Comparați claritatea raportului zilnic și costul total cu toți casierii — decizia vine după date, nu după marketing.",
      },
      {
        question: "Pot păstra SmartBill/Oblio pentru facturi?",
        answer:
          "Da — model comun în România. SmartBill/Oblio/Saga pentru facturare B2B și e-Factura; franchisetech pentru POS, stoc, NIR și închidere casă. franchisetech nu concurează la prețul de facturare (~2–3€/lună Oblio); concurează la „știu ce s-a întâmplat azi la casă”.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Comparație SmartBill", href: "/compare/smartbill" },
      { label: "Raport Z", href: "/features/z-report" },
      { label: "România", href: "/industries/romania" },
      { label: "Obiecții POS România", href: "/resources/objections-pos-romania" },
    ],
    rows: [
      ["Model de deploy", "Browser cloud — laptop/tabletă, fără server local", "Instalare locală tradițională — ecosistem POS instalat"],
      ["Time to first sale", "Zile — trial self-serve, setup checklist", "Săptămâni — implementare, training, hardware"],
      ["POS register", "Coș rapid, categorii, retururi, sesiune casă", "POS HoReCa local — flux familiar operatorilor existenți"],
      ["Raport Z / închidere casă", "Inclus în Starter — așteptat vs numărat", "Disponibil — verificați claritatea raportului în setup-ul vostru"],
      ["Stoc & NIR", "Pro — stoc, furnizori, achiziții/NIR legate de POS", "Variază — adesea modul separat sau integrare"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Limitat sau absent — depinde de configurație"],
      ["Facturare / e-Factura", "Coexistă cu SmartBill/Oblio/Saga", "POS-focused — facturare adesea în alt sistem"],
      ["FiscalNet", "Când este activat pe stația configurată", "Suport local — verificați compatibilitatea hardware"],
      ["Personal / casieri", "Nelimitat pe plan plătit", "Verificați taxă per utilizator sau terminal"],
      ["Cost tipic echipe mici", "49–79€/lună + personal nelimitat", "Licențe + hardware + suport — ofertă variabilă"],
      ["Cel mai potrivit pentru", "Restaurant mic care vrea trial rapid și cost predictibil", "Operatori cu investiție existentă RezoSoft și suport local mulțumitor"],
    ],
  },
  {
    slug: "expressoft",
    path: "/compare/expressoft",
    competitor: "Expressoft",
    market: "ro",
    metaTitle: "Alternativă Expressoft — SMB vs enterprise HoReCa",
    description:
      "Comparație onestă franchisetech vs Expressoft: lanțuri mari cu implementare dedicată vs cafenea/restaurant 1–3 locații — POS browser, stoc, rețete, raport Z și cost predictibil.",
    h1: "franchisetech vs Expressoft — enterprise vs time-to-value",
    intro:
      "Expressoft acoperă restaurante și retail cu un portofoliu larg și implementări consacrate la lanțuri. franchisetech nu concurează la rollout enterprise de săptămâni — țintește operatorii care vor casă, stoc, marje și închidere de zi în zile, nu luni, cu preț transparent și personal nelimitat.",
    betterFor:
      "Expressoft poate câștiga la rețele mari (5+ locații) cu echipă IT, training dedicat și fluxuri custom. franchisetech merită evaluat pentru cafenea, restaurant mic sau lanț 2–5 locații care vrea trial self-serve, raport Z inclus și coexistență cu SmartBill/Oblio pentru facturare.",
    competitorStrengths: [
      "Portofoliu larg HoReCa + retail — module mature pentru lanțuri",
      "Implementări la operatori consacrați — experiență enterprise",
      "Ecosistem integrat pentru volume mari (delivery, call center — verificați planul)",
      "Suport și relație comercială pentru proiecte complexe",
    ],
    franchisetechStrengths: [
      "Time-to-first-sale în zile — trial 15 zile, setup checklist, onboarding ghidat",
      "Preț listat pe site (Core 49€, Operations 79€) — personal nelimitat",
      "Raport Z, vânzări și TVA incluse în Starter — fără add-on doar pentru raportare",
      "Multi-location 99€/locație — fără suite enterprise obligatorie",
      "Coexistă cu SmartBill/Oblio/Saga pentru facturare și e-Factura",
    ],
    sections: [
      {
        title: "Enterprise rollout vs self-serve trial",
        body: "Expressoft shine când aveți buget și timp pentru implementare structurată. franchisetech optimizează primele 48h: produse, deschidere casă, vânzare test, raport Z — comparați în trial paralel înainte de a angaja un proiect de migrare.",
      },
      {
        title: "2–5 locații fără complexitate inutilă",
        body: "Planul Multi-location franchisetech acoperă 2–5 locații fără să forțeze module enterprise pe care un operator mic nu le folosește. Verificați dacă Expressoft cere module suplimentare per locație sau per terminal — adunați costul total.",
      },
      {
        title: "Facturare separată, operațiuni zilnice clare",
        body: "Ca la RezoSoft sau Bit-Soft, mulți operatori păstrează SmartBill/Oblio pentru documente. franchisetech adaugă stratul zilnic: POS, stoc, NIR (Pro) și raport Z seara — verificați cu contabilul înainte de a schimba tot stack-ul.",
      },
    ],
    faqs: [
      {
        question: "Expressoft e mai bun pentru lanțul meu?",
        answer:
          "Dacă aveți 5+ locații, call center, dispatch delivery la volum și echipă dedicată implementării, Expressoft poate fi alegerea corectă. Pentru 1–3 locații cu focus pe casă și marje, comparați timpul până la prima vânzare și costul total în trial paralel franchisetech.",
      },
      {
        question: "Suport multi-locație la franchisetech?",
        answer:
          "Da — plan Multi-location (99€/locație/lună). Raport Z și vânzări per locație; verificați pagina de prețuri pentru limitele curente și FiscalNet pe Multi-location.",
      },
      {
        question: "Pot păstra contabilul pe SmartBill?",
        answer:
          "Da — model comun. SmartBill/Oblio pentru facturi B2B și e-Factura; franchisetech pentru POS zilnic, stoc și închidere casă. Nu pretindem înlocuire automată a facturării.",
      },
    ],
    related: [
      { label: "Comparație RezoSoft", href: "/compare/rezosoft" },
      { label: "Comparație Bit-Soft", href: "/compare/bit-soft" },
      { label: "Prețuri", href: "/pricing" },
      { label: "România", href: "/industries/romania" },
    ],
    rows: [
      ["Segment țintă", "Cafenea/restaurant 1–5 locații, time-to-value rapid", "Lanțuri și operatori enterprise HoReCa/retail"],
      ["Implementare", "Zile — trial self-serve + setup checklist", "Săptămâni/luni — proiect dedicat, training"],
      ["POS register", "Browser: coș, sesiune casă, retururi", "Platformă matură — fluxuri complexe la volum"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat", "Disponibil — verificați claritatea în oferta voastră"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR legat de POS", "Module gestiune — adesea parte din suite mai mare"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Variază — nu focus principal pe marje rețetă"],
      ["Multi-location", "99€/locație — fără enterprise obligatoriu", "Punct forte la rețele mari — preț la ofertă"],
      ["Facturare / e-Factura", "Coexistă SmartBill/Oblio/Saga", "POS/gestiune — facturare adesea separat"],
      ["Personal / casieri", "Nelimitat pe plan plătit", "Verificați licențe per terminal/post"],
      ["Cel mai potrivit pentru", "Operator mic care vrea trial rapid și cost listat", "Lanț 5+ locații cu buget implementare"],
    ],
  },
  {
    slug: "hepos",
    path: "/compare/hepos",
    competitor: "hePOS",
    market: "ro",
    metaTitle: "Alternativă hePOS — POS restaurant, stoc, raport Z",
    description:
      "Comparație onestă franchisetech vs hePOS: POS restaurant România — FiscalNet, stoc, rețete, raport Z, cost total fără taxă per casier și trial paralel 15 zile.",
    h1: "franchisetech vs hePOS — același job, alt model",
    intro:
      "hePOS este o opțiune POS orientată restaurante în România, cu flux familiar operatorilor locali. franchisetech compară onest același job — casă, stoc, marje, raport Z — într-un workspace cloud cu personal nelimitat. Nu spunem că hePOS e greșit; comparăm cost total, claritatea raportului zilnic și cât timp petreceți în Excel după program.",
    betterFor:
      "hePOS poate rămâne potrivit dacă aveți contract activ, hardware compatibil și echipa e deja antrenată. franchisetech merită trial dacă reconcilierea zilnică, rețetele sau stocul sunt încă manual — sau dacă taxa per casier crește odată cu echipa.",
    competitorStrengths: [
      "Focus restaurant România — POS cunoscut pe piața locală",
      "Flux casă familiar operatorilor care l-au folosit deja",
      "Suport local — relație directă cu furnizorul POS",
      "Integrare fiscală — verificați setup FiscalNet actual cu furnizorul",
    ],
    franchisetechStrengths: [
      "POS + stoc + rețete + raport Z în același workspace browser",
      "Personal nelimitat pe plan plătit — fără taxă per casier",
      "Raport Z și TVA incluse în Core (49€) — fără add-on raportare",
      "Trial 15 zile fără card; ghiduri și resurse în română",
      "Coexistă cu SmartBill/Oblio pentru facturare",
    ],
    sections: [
      {
        title: "Cost total, nu doar licența lunară",
        body: "Adunați licențe, terminale, taxe per utilizator, ore de reconciliere în Excel și suport. franchisetech listează 49–79€/lună cu personal nelimitat. Rulați trial paralel 15 zile și măsurați timpul până la raport Z clar.",
      },
      {
        title: "Stoc și marje legate de vânzări",
        body: "Dacă marjele stau în spreadsheet după serviciu, Pro adaugă rețete, cost porție și can-make din stoc — legat direct de vânzările POS, nu doar de raportul de casă.",
      },
      {
        title: "Migrare fără ruptură fiscală",
        body: "FiscalNet rămâne pe stația configurată. Import CSV produse, trial paralel, verificați bonurile cu contabilul — nu presupuneți migrare automată de la hePOS.",
      },
    ],
    faqs: [
      {
        question: "Care e diferența principală față de hePOS?",
        answer:
          "Ambele țintesc POS restaurant. franchisetech pune stoc, cost rețete și raport Z integrat în același sistem, cu personal nelimitat. hePOS poate câștiga dacă aveți deja investiție și flux stabil — comparați cost total și claritatea raportului zilnic.",
      },
      {
        question: "Funcționează cu FiscalNet?",
        answer:
          "Da, când este activat și configurat pe stația de casă conform ghidului. Verificați cu contabilul și integratorul fiscal înainte de go-live — la fel ca la orice schimbare POS.",
      },
      {
        question: "Pot importa produsele din hePOS?",
        answer:
          "Import CSV pentru produse este disponibil. Setup asistat (199€) poate accelera migrarea inițială. Rulați trial paralel înainte de a opri hePOS.",
      },
    ],
    related: [
      { label: "Comparație VilicoRest", href: "/compare/vilicorest" },
      { label: "Comparație RezoSoft", href: "/compare/rezosoft" },
      { label: "POS", href: "/features/pos" },
      { label: "România", href: "/industries/romania" },
      { label: "Obiecții POS", href: "/resources/objections-pos-romania" },
    ],
    rows: [
      ["Cost configurare self-serve", "0€ — ghid în aplicație", "Verificați taxe implementare / training"],
      ["Timp până la prima vânzare", "Sub o oră (cale ghidată)", "Zile–săptămâni (setup tipic POS)"],
      ["Model", "Browser cloud — laptop/tabletă", "POS restaurant România — verificați deploy local/cloud"],
      ["POS register", "Coș rapid, sesiune casă, retururi", "Flux casă familiar operatorilor hePOS"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat", "Disponibil — comparați claritatea în setup-ul vostru"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR (14-3-1A)", "Variază — adesea limitat sau modul separat"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Limitat — verificați dacă aveți nevoie de rețete"],
      ["Facturare", "Coexistă SmartBill/Oblio/Saga", "POS-focused — facturare adesea în alt sistem"],
      ["FiscalNet", "Când activat pe stație", "Verificați compatibilitatea curentă"],
      ["Personal / casieri", "Nelimitat pe plan plătit", "Verificați taxă per utilizator/terminal"],
      ["Trial / migrare", "15 zile paralel, import CSV", "Contract existent — evaluați cost schimbare"],
      ["Cel mai potrivit pentru", "Restaurant mic — stoc+marje+Z fără Excel", "Operator cu hePOS stabil și cost total acceptabil"],
    ],
  },
  {
    slug: "vilicorest",
    path: "/compare/vilicorest",
    competitor: "VilicoRest",
    market: "ro",
    metaTitle: "Alternativă VilicoRest — POS cloud restaurant România",
    description:
      "Comparație onestă franchisetech vs VilicoRest: POS HoReCa România — browser vs instalat, stoc, rețete, raport Z, personal nelimitat și trial paralel.",
    h1: "franchisetech vs VilicoRest — evaluare practică",
    intro:
      "VilicoRest este folosit în piața restaurantelor din România. franchisetech oferă același tip de outcome — casă, stoc, marje, închidere zi — într-un workspace cloud cu trial rapid. Pagina aceasta nu critică VilicoRest; vă ajută să comparați timp până la prima vânzare, cost cu toți casierii și cât de mult reconstruiți adevărul zilei în Excel.",
    betterFor:
      "VilicoRest poate rămâne potrivit dacă implementarea locală funcționează și echipa e antrenată. franchisetech merită testat dacă doriți browser POS, personal nelimitat, raport Z inclus la 49€ și coexistență cu SmartBill/Oblio — similar fluxului RezoSoft/hePOS, dar cu alt furnizor.",
    competitorStrengths: [
      "Prezență pe piața restaurantelor din România",
      "Flux POS cunoscut operatorilor care îl folosesc deja",
      "Suport local — relație cu furnizorul",
      "Experiență acumulată în scenarii restaurant locale",
    ],
    franchisetechStrengths: [
      "POS + stoc + rețete + raport Z în același sistem browser",
      "Trial 15 zile fără card — evaluare paralelă fără ruptură",
      "Personal nelimitat — fără taxă per casier la creștere echipă",
      "Raport Z, vânzări, TVA incluse Starter — fără add-on Insights",
      "FiscalNet când activat; ghid `/help/romania-fiscalnet`",
    ],
    sections: [
      {
        title: "Browser vs instalare locală",
        body: "POS-urile locale pot fi robuste când sunt deja plătite și configurate. franchisetech reduce mentenanța serverului pentru fluxul zilnic — aceeași casă pe laptop sau tabletă. FiscalNet rămâne pe PC-ul configurat.",
      },
      {
        title: "Trial paralel — aceeași echipă, aceeași zi",
        body: "Nu opriți VilicoRest imediat. Rulați franchisetech 15 zile: aceleași produse, aceeași echipă, aceeași închidere. Comparați raportul Z și timpul de reconciliere — decizia vine după date.",
      },
      {
        title: "Coexistență cu facturarea",
        body: "Păstrați SmartBill/Oblio/Saga dacă contabilul o cere. franchisetech acoperă stratul operațional zilnic; facturarea B2B rămâne unde este deja stabilă.",
      },
    ],
    faqs: [
      {
        question: "Pot migra meniul din VilicoRest?",
        answer:
          "Import CSV pentru produse este disponibil. Setup asistat (199€) poate ajuta la migrarea inițială. Recomandăm trial paralel înainte de switch complet.",
      },
      {
        question: "VilicoRest vs RezoSoft vs franchisetech?",
        answer:
          "RezoSoft și VilicoRest sunt ambele POS locale HoReCa — comparați cost total și suportul vostru actual. franchisetech diferențiază prin browser, personal nelimitat și raport Z inclus fără add-on — testați toate în paralel dacă sunteți în evaluare.",
      },
      {
        question: "franchisetech funcționează offline?",
        answer:
          "Orientat cloud, cu coadă offline pentru vânzări când conexiunea revine. Planificați internet stabil. POS local poate avea avantaj la offline prelungit — evaluați frecvența la voi.",
      },
    ],
    related: [
      { label: "Comparație RezoSoft", href: "/compare/rezosoft" },
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "România", href: "/industries/romania" },
    ],
    rows: [
      ["Model deploy", "Browser cloud", "POS restaurant România — instalare/locală variabilă"],
      ["Time to first sale", "Zile — trial + checklist", "Depinde de implementare existentă"],
      ["POS register", "Coș, sesiune casă, retururi", "Flux VilicoRest familiar echipei"],
      ["Raport Z", "Inclus Starter", "Verificați claritate raport în setup-ul vostru"],
      ["Stoc & rețete", "Pro — stoc, NIR, marje rețetă", "Variază — comparați nevoia de rețete"],
      ["Facturare", "Coexistă SmartBill/Oblio", "Adesea POS separat de facturare"],
      ["FiscalNet", "Când activat pe stație", "Verificați modul fiscal curent"],
      ["Personal", "Nelimitat plan plătit", "Verificați licențe per casier"],
      ["Cost echipe mici", "49–79€/lună listat", "Licențe + suport — ofertă variabilă"],
      ["Cel mai potrivit pentru", "Evaluare paralelă rapidă, cost predictibil", "Operator mulțumit de VilicoRest existent"],
    ],
  },
  {
    slug: "ebriza",
    path: "/compare/ebriza",
    competitor: "Ebriza",
    market: "ro",
    metaTitle: "Alternativă Ebriza — rapoarte incluse, fără add-on Insights",
    description:
      "Comparație franchisetech vs Ebriza: același preț de intrare (~49€/locație), dar rapoarte Z, vânzări și TVA incluse — fără add-on Insights (+19€/lună) și fără taxe ascunse pe raportare.",
    h1: "franchisetech vs Ebriza — preț pe hârtie vs cost real",
    intro:
      "Ebriza afișează Pro de la 49€/locație/lună — același nivel de preț ca franchisetech Core. Diferența pe care mulți operatori o descoperă târziu: rapoartele personalizate (Insights) sunt add-on separat (+19€/lună), iar KDS, Saga sau comenzile delivery pot adăuga zeci de euro în plus. franchisetech include raport vânzări, raport Z și raport TVA în planul de bază — fără upsell doar ca să vedeți ce s-a vândut ieri.",
    betterFor:
      "Ebriza poate fi potrivită dacă aveți nevoie de ecosistemul lor complet (Premium/Titanium, integrări delivery la volum). franchisetech merită evaluat dacă vreți casă + rapoarte zilnice clare la 49€, fără să plătiți extra doar pentru Insights.",
    competitorStrengths: [
      "Planuri tiered (Pro / Premium / Titanium) cu multe module HoReCa",
      "Integrări delivery și meniu digital la scară",
      "Hardware POS inclus pe plan (1–2 dispozitive/locație)",
      "Ecosistem matur pentru restaurante cu volum mare",
    ],
    franchisetechStrengths: [
      "Raport vânzări, raport Z și raport TVA incluse în Core (49€) — fără add-on Insights",
      "Fără taxă per angajat; personal nelimitat pe plan",
      "Stoc, NIR, rețete și rapoarte marjă pe Operations (79€) — fără salt la 99€+ doar pentru gestiune",
      "Browser POS — trial 15 zile fără card; FiscalNet când este configurat",
    ],
    sections: [
      {
        title: "Lecția: prețul de listă ≠ costul raportării",
        body: "Mulți operatori compară doar „49€ Pro”. Pe structura publică Ebriza, Insights (rapoarte personalizate) costă +19€/lună pe orice plan. Kitchen Display +19€, integrare Saga +39€, comenzi delivery tarifate per comandă sau incluse doar pe tier superior. franchisetech nu taxează separat raportul Z sau vânzările zilnice — sunt în abonament.",
      },
      {
        title: "Comparație onestă pe funcții, nu pe marketing",
        body: "Ebriza Premium (99€) și Titanium (179€) adaugă gestiune, NIR automat și rapoarte avansate. franchisetech Operations (79€) acoperă stoc, furnizori, achiziții/NIR și cost rețete pentru majoritatea cafenelelor și restaurantelor mici — cu rapoarte incluse, nu ca add-on.",
      },
      {
        title: "Cum să testați în 15 zile",
        body: "Rulați paralel: aceleași produse, aceeași echipă, aceeași închidere de zi. Verificați cât plătiți efectiv (plan + add-on-uri) vs cât timp pierdeți reconciliind fără rapoarte clare. franchisetech trial nu cere card pentru deschiderea casei.",
      },
    ],
    faqs: [
      {
        question: "Ebriza Pro și franchisetech Core costă la fel — care e diferența?",
        answer:
          "Ambele pornesc de la circa 49€/locație/lună. franchisetech Core include raport vânzări, raport Z (închidere casă) și raport TVA. Pe pagina publică Ebriza, Insights (rapoarte personalizate) este listat ca add-on de 19€/lună — verificați factura voastră actuală dacă folosiți Ebriza.",
      },
      {
        question: "Am auzit că raportarea costă extra — e adevărat?",
        answer:
          "La unii furnizori, da: rapoarte avansate sau „Insights” sunt module plătite separat. La franchisetech, rapoartele zilnice de vânzări, Z și TVA sunt în planul Starter — nu trebuie să cumpărați un add-on doar ca să vedeți ce s-a întâmplat la casă.",
      },
      {
        question: "Ce add-on-uri Ebriza ar putea mări factura?",
        answer:
          "Conform comparației publice: Insights +19€/lună, Kitchen Display +19€/lună, integrare Saga +39€/lună, comenzi delivery per tranzacție sau incluse doar pe plan superior. franchisetech nu folosește același model de add-on pentru rapoarte de bază.",
      },
      {
        question: "Pot folosi franchisetech doar pentru rapoarte și casă?",
        answer:
          "Da. Starter este construit pentru casă, produse și rapoarte zilnice. Pro adaugă stoc, rețete și conector sertar când aveți nevoie — fără să treceți automat la un plan de 99€+.",
      },
    ],
    related: [
      { label: "Prețuri franchisetech", href: "/pricing" },
      { label: "Raport Z", href: "/features/z-report" },
      { label: "Alternative RezoSoft", href: "/compare/rezosoft" },
      { label: "Obiecții POS România", href: "/resources/objections-pos-romania" },
    ],
    rows: [
      ["Cost configurare self-serve", "0€ — ghid în aplicație", "Taxe implementare / training — contact comercial"],
      ["Timp până la prima vânzare", "Sub o oră (cale ghidată)", "Zile–săptămâni (implementare tipică)"],
      ["Preț intrare / locație", "Core 49€/lună (rapoarte incluse)", "Pro 49€/locație/lună (+ TVA)"],
      ["Raport vânzări zilnic", "Inclus în Starter", "Raportare timp real pe plan; Insights personalizate +19€/lună (add-on)"],
      ["Raport Z / închidere casă", "Inclus în Starter", "Registru de casă pe plan — verificați dacă rapoarte avansate necesită add-on"],
      ["Raport TVA", "Inclus în Starter", "Facturare & e-Factura pe plan — detaliu raport TVA vs add-on Insights"],
      ["Stoc & NIR", "Operations 79€ — stoc, furnizori, achiziții/NIR", "Premium 99€+ sau module gestiune separate"],
      ["Kitchen Display", "Opțional (KDS pe Operations)", "+19€/lună add-on"],
      ["Integrări contabilitate (Saga)", "Export rapoarte în plan eligibil", "+39€/lună add-on integrare Saga"],
      ["Comenzi delivery / meniu digital", "Nu în pachet de bază", "0,06€/comandă sau incluse pe tier superior"],
      ["Personal / utilizatori", "Nelimitat pe plan plătit", "Nelimitat"],
      ["Cost tipic casă + rapoarte clare", "49€ — fără add-on raportare", "49€ + 19€ Insights ≈ 68€+ înainte de alte module"],
      ["Cel mai potrivit pentru", "Cafenea/restaurant mic care vrea casă + rapoarte fără surprize", "Operatori care folosesc deja ecosistem Ebriza complet sau volume delivery mari"],
    ],
  },
  {
    slug: "oblio",
    path: "/compare/oblio",
    competitor: "Oblio",
    market: "ro",
    metaTitle: "Alternativă Oblio pentru restaurante — POS vs facturare",
    description:
      "Comparație onestă franchisetech vs Oblio: facturare la ~2,49€/lună vs workspace zilnic POS, stoc, rețete și raport Z pentru cafenele și restaurante.",
    h1: "franchisetech vs Oblio — factura vs ziua de lucru",
    intro:
      "Oblio este iubit pentru e-Factura și facturare la preț foarte mic (~29€/an, utilizatori și firme nelimitate). franchisetech nu concurează la numărul de facturi — ci la întrebarea proprietarului: „Casa se potrivește cu sertarul? Știu marja pe produs? Am închis ziua corect?”",
    betterFor:
      "Oblio rămâne excelent pentru PFA/SRL care emit facturi și folosesc e-Factura/SAF-T la cost minim. franchisetech merită evaluat dacă aveți nevoie de casă, stoc, rețete și raport Z în același flux cu vânzarea zilnică.",
    competitorStrengths: [
      "Preț agresiv: ~29€/an pentru facturare nelimitată",
      "e-Factura, e-Transport, SAF-T incluse în mesajul public",
      "Stoc, producție și casă de marcat listate ca module gratuite",
      "150.000+ firme — social proof puternic",
      "Integrări contabilitate (Saga, WinMentor, Ciel) și e-commerce",
    ],
    franchisetechStrengths: [
      "POS browser orientat pe serviciu zilnic — nu doar emitere document",
      "Sesiune casă, numerar așteptat vs numărat, raport Z incluse în Starter",
      "Rețete, cost porție și marjă brută pe Operations",
      "Kitchen display și flux bucătărie pentru restaurante",
      "Personal nelimitat; trial 15 zile asistat",
    ],
    sections: [
      {
        title: "Coexistență, nu înlocuire automată",
        body: "Mulți operatori păstrează Oblio sau SmartBill pentru facturi către furnizori și e-Factura, și folosesc franchisetech pentru POS, stoc și închidere de zi. Verificați cu contabilul combinația potrivită.",
      },
      {
        title: "Confuzia „am deja stoc și casă de marcat”",
        body: "Oblio oferă NIR, producție și bon fiscal prin casă de marcat — util pentru IMM-uri generale. franchisetech țintește ritmul HoReCa: grilă produse, coș rapid, offline queue, rețete legate de vânzări.",
      },
      {
        title: "Comparați costul total al zilei",
        body: "Oblio poate costa sub 3€/lună pentru facturare. franchisetech Core (49€) include rapoarte de vânzări, Z și TVA — comparați timpul pierdut reconciliind Excel vs prețul abonamentului operațional.",
      },
    ],
    faqs: [
      {
        question: "Oblio e mai ieftin — de ce aș plăti franchisetech?",
        answer:
          "Oblio optimizează facturarea și conformitatea documentelor. franchisetech optimizează operațiunile zilnice ale unei cafenei sau restaurant: vânzare, stoc, marje, închidere casă. Multe afaceri folosesc ambele tipuri de tool pentru joburi diferite.",
      },
      {
        question: "Oblio are casă de marcat — înlocuiește POS-ul?",
        answer:
          "Oblio se conectează la case de marcat compatibile pentru bon fiscal. franchisetech oferă flux complet de casă (produse, coș, plăți, sesiune, raport Z) în browser — plus rețete și kitchen display pe planurile superioare.",
      },
      {
        question: "Pot folosi ambele?",
        answer:
          "Da. Model comun: Oblio/SmartBill pentru facturi B2B și e-Factura; franchisetech pentru POS zilnic și rapoarte proprietar.",
      },
    ],
    related: [
      { label: "SmartBill comparison", href: "/compare/smartbill" },
      { label: "Ebriza comparison", href: "/compare/ebriza" },
      { label: "Prețuri franchisetech", href: "/pricing" },
    ],
    rows: [
      ["Preț public tipic", "Core 49€/lună (operațiuni zilnice)", "~2,49€/lună (29€/an facturare nelimitată)"],
      ["e-Factura / SPV", "Nu este produs de facturare — coexistă cu Oblio", "Integrat — punct forte Oblio"],
      ["POS register zilnic", "Browser POS cu coș, plăți, sesiune casă", "Casă de marcat + documente — nu POS HoReCa complet"],
      ["Rețete & marje", "Operations 79€ — cost porție, marjă brută", "Modul producție pentru retetar general"],
      ["Raport Z / închidere casă", "Inclus în Starter", "Nu este focusul principal"],
      ["Kitchen display", "Pro — KDS", "Nu listat ca modul HoReCa"],
      ["Personal", "Nelimitat pe plan plătit", "Nelimitat"],
      ["Cel mai potrivit pentru", "Cafenea/restaurant cu flux zilnic de vânzare", "PFA/SRL care prioritizează facturare ieftină"],
    ],
  },
  {
    slug: "bit-soft",
    path: "/compare/bit-soft",
    competitor: "Bit-Soft",
    market: "ro",
    metaTitle: "franchisetech vs Bit-Soft Breeze — SMB vs lanțuri enterprise",
    description:
      "Comparație onestă franchisetech vs Bit-Soft (Breeze POS, Oracle Simphony): locații independente cu preț public vs integrator enterprise pentru lanțuri și hoteluri.",
    h1: "franchisetech vs Bit-Soft — start azi vs proiect enterprise",
    intro:
      "Bit-Soft este lider pe integrări HoReCa enterprise în România: Breeze POS, KDS, delivery, e-commerce și Oracle Simphony/Opera pentru lanțuri (City Grill, Pizza Hut, hoteluri). Prețurile nu sunt publice — vânzare și implementare ghidate. franchisetech țintește proprietarii de cafenele și restaurante mici care vor să vândă mâine, din browser, la preț transparent.",
    betterFor:
      "Bit-Soft merită evaluat pentru lanțuri, hoteluri sau proiecte Oracle la scară. franchisetech merită evaluat pentru 1–3 locații independente fără ciclu de vânzări de luni.",
    competitorStrengths: [
      "1.500+ proiecte HoReCa; partener Oracle de lungă durată",
      "Breeze: POS mobil, KDS, delivery (call center, șoferi), e-commerce propriu",
      "Clienți enterprise: Burger King, KFC, City Grill, Ana Hotels (public PR)",
      "Suport 24/7 și implementare la fața locului",
      "Multi-proprietate în timp real pentru rețele",
    ],
    franchisetechStrengths: [
      "Preț public: Core 49€, Operations 79€, Multi 89€/locație suplimentară",
      "Self-serve: trial 15 zile, prima vânzare în sub o oră — nu luni de implementare",
      "Browser POS — fără licențe Oracle sau proiect integrator",
      "Rapoarte Z, vânzări, TVA incluse fără add-on",
      "Potrivit cafenele, restaurant mic, takeaway — nu doar franciză națională",
    ],
    sections: [
      {
        title: "Tier diferit de piață",
        body: "Bit-Soft câștigă licitații de lanț și hotel. franchisetech câștigă când proprietarul vrea control zilnic fără departament IT sau manager de proiect.",
      },
      {
        title: "Preț transparent vs ofertă personalizată",
        body: "Bit-Soft nu publică tarife — contact comercial și implementare. franchisetech listează planurile pe site; comparați costul total al primului an incluzând setup asistat (199€ opțional) vs proiect enterprise.",
      },
      {
        title: "Funcții overlap",
        body: "Ambele acoperă POS, KDS, stoc și rapoarte la nivel înalt. Diferența este adâncimea delivery/call-center Bit-Soft vs simplitatea franchisetech pentru operatori cu 3–25 angajați.",
      },
    ],
    faqs: [
      {
        question: "Bit-Soft e mai complet — de ce franchisetech?",
        answer:
          "Bit-Soft Breeze este complet pentru operatori mari cu buget de implementare. franchisetech este construit pentru independenți care nu au nevoie de call center delivery sau Oracle Simphony — ci de casă clară și marje.",
      },
      {
        question: "Aveți prețuri Bit-Soft?",
        answer:
          "Nu listăm prețuri Bit-Soft — nu sunt publice. Contactați Bit-Soft pentru ofertă. Comparăm modelul: quote enterprise vs abonament SaaS public franchisetech.",
      },
      {
        question: "Pot migra de la Breeze?",
        answer:
          "Import CSV produse este disponibil. Setup asistat poate ajuta la migrarea inițială. Rulați trial paralel înainte de switch.",
      },
    ],
    related: [
      { label: "Ebriza comparison", href: "/compare/ebriza" },
      { label: "Multi-location pricing", href: "/pricing" },
      { label: "Industries", href: "/industries" },
    ],
    rows: [
      ["Cost configurare self-serve", "0€ — ghid în aplicație", "Proiect integrator — contact comercial"],
      ["Timp până la prima vânzare", "Sub o oră (cale ghidată)", "Săptămâni–luni (implementare enterprise)"],
      ["Preț", "49–99€/lună public pe site", "Ofertă comercială — fără preț public"],
      ["Implementare", "Self-serve + setup asistat opțional (199€)", "Proiect integrator, training echipă"],
      ["POS", "Browser — laptop/tablet", "Breeze mobil + ecosistem Bit-Soft"],
      ["KDS / bucătărie", "Pro", "Breeze KDS — modul enterprise"],
      ["Delivery / call center", "Nu în pachet de bază", "Dispatch, call center, app șofer — punct forte Bit-Soft"],
      ["Multi-location", "Multi 89€/locație suplimentară", "Multi-proprietate timp real — rețele mari"],
      ["Oracle Simphony", "Nu", "Partener Oracle — Simphony Cloud"],
      ["Cel mai potrivit pentru", "Cafenea/restaurant independent 1–3 locații", "Lanțuri, hoteluri, franciză națională"],
    ],
  },
  // ── NEW: Boogit ──────────────────────────────────────────────────────────
  {
    slug: "boogit",
    path: "/compare/boogit",
    competitor: "Boogit",
    market: "ro",
    metaTitle: "Boogit vs franchisetech — livrare vs POS operațional",
    description:
      "Boogit este o platformă de comandă online pentru clienți, nu un POS. Dacă restaurantul tău e pe Boogit, ai nevoie și de un POS pentru a gestiona vânzările, stocul și raportul Z. Comparație onestă.",
    h1: "Boogit vs franchisetech — două produse diferite care fac treabă împreună",
    intro:
      "Boogit este o platformă de comandă online și livrare prin care clienții comandă mâncare de la restaurante partenere (similar Glovo sau Tazz, dar local în Brașov). Nu este un POS sau software de management restaurant. franchisetech este POS-ul pe care îl folosiți în locație — vânzări, stoc, rețete, raport Z, export Saga. Dacă restaurantul vostru e listat pe Boogit, aveți nevoie în continuare de un sistem de casă. Aceasta nu este o comparație de produse concurente, ci o clarificare.",
    betterFor:
      "Boogit vă aduce comenzi online de la clienți din zona sa de acoperire. franchisetech gestionează operațiunile din locație: casa, stocul, marjele și raportul zilnic. Cele două funcționează împreună — nu se exclud.",
    competitorStrengths: [
      "Platformă de comandă online pentru clienți — mai multe comenzi de livrare",
      "Prezență locală în Brașov — clientelă locală captivă",
      "Aplicație mobilă pentru clienți (iOS și Android)",
      "Vizibilitate pentru restaurantele partenere listate pe platformă",
    ],
    franchisetechStrengths: [
      "POS în browser — gestionează vânzările din locație și livrările separat",
      "Glovo — integrat automat prin webhook. Bolt Food și Tazz — în curând.",
      "Raport Z zilnic — numerar așteptat vs numărat, fără Excel",
      "Export Saga C (XML) pentru contabil — fără transcriere manuală",
      "Stoc și rețete legate de vânzări — știți marja înainte de a schimba meniul",
      "Multi-location 99€/locație — dacă aveți mai multe puncte de lucru",
    ],
    sections: [
      {
        title: "Ce face Boogit și ce nu face",
        body: "Boogit este o platformă de comandă online prin care clienții finali comandă mâncare de la restaurante partenere din Brașov. Boogit nu oferă: POS pentru casă, gestiune stoc, raport Z, cost rețete sau export contabil. Dacă sunteți parteneri Boogit, aveți nevoie de un sistem de casă separat pentru a gestiona vânzările zilnice.",
      },
      {
        title: "Cum înregistrați comenzile Boogit în casa fiscală",
        body: "Comenzile primite prin Boogit trebuie înregistrate în casa fiscală ca orice altă vânzare. franchisetech înregistrează vânzările per canal separat (în locație vs livrare) — corect fiscal ANAF. Fără un POS care separă canalele, riscați erori la reconciliere și probleme la control.",
      },
      {
        title: "Boogit + franchisetech — complementare",
        body: "Boogit aduce comenzile online. franchisetech gestionează operațiunile din locație: casă, stoc, marje și raport Z. La final de zi, raportul Z și exportul Saga reflectă toate vânzările — inclusiv cele din Boogit — corect înregistrate.",
      },
    ],
    faqs: [
      {
        question: "Boogit înlocuiește un POS?",
        answer:
          "Nu. Boogit este o platformă de comandă online pentru clienți — nu un POS sau software de management restaurant. Dacă restaurantul vostru e pe Boogit, aveți nevoie în continuare de un sistem de casă pentru vânzări, stoc, raport Z și export contabil.",
      },
      {
        question: "Cum înregistrez comenzile Boogit în casa fiscală?",
        answer:
          "Comenzile din Boogit trebuie înregistrate ca vânzări în casa de marcat — la fel ca orice altă comandă. franchisetech înregistrează vânzările per canal (în locație, Glovo, Boogit etc.) separat, corect fiscal ANAF. Verificați cu contabilul dvs. modalitatea corectă de înregistrare.",
      },
      {
        question: "Funcționează franchisetech cu mai multe platforme de livrare?",
        answer:
          "Glovo — integrat automat (webhook direct), comenzile apar în sistem fără intervenție manuală. Bolt Food și Tazz — pot fi înregistrate manual în POS; integrare automată în curând. Export Saga inclus pentru contabil.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Comparație hePOS", href: "/compare/hepos" },
      { label: "Prețuri", href: "/pricing" },
      { label: "POS", href: "/features/pos" },
    ],
    rows: [
      ["Ce este", "POS + stoc + rețete + raport Z — management operațional", "Platformă comandă online pentru clienți finali"],
      ["Cui se adresează", "Proprietarilor de restaurante/cafenele", "Clienților care comandă mâncare online"],
      ["POS / casă", "Browser POS — sesiune casă, coș, retururi", "Nu oferă POS"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat zilnic", "Nu oferă raport Z"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR", "Nu oferă gestiune stoc"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Nu oferă rețete"],
      ["Export contabilitate", "Saga C (XML) inclus pentru contabil", "Nu oferă export contabil"],
      ["Înregistrare livrare", "Glovo — automat; Bolt/Tazz — în curând", "Comenzile primite trebuie înregistrate în casa voastră"],
      ["Multi-locație", "99€/locație — dashboard unificat", "Listare per locație pe platformă"],
      ["Preț pentru restaurant", "49–99€/lună listat pe site", "Comision per comandă — verificați termenii"],
    ],
  },
  // ── NEW: FreyaPOS ─────────────────────────────────────────────────────────
  {
    slug: "freyapos",
    path: "/compare/freyapos",
    competitor: "FreyaPOS",
    market: "ro",
    metaTitle: "Alternativă FreyaPOS — POS HoReCa, preț listat, Saga inclus",
    description:
      "Comparație onestă franchisetech vs FreyaPOS: ambele au POS + livrare + gestiune pentru HoReCa România. Diferențele reale: preț listat vs cotație, Saga export, rețete și browser vs instalat.",
    h1: "franchisetech vs FreyaPOS — comparație onestă HoReCa România",
    intro:
      "FreyaPOS este un POS pentru restaurante și retail din România cu funcții de gestiune, livrare (Glovo/Tazz ca modul opțional), rezervări și loyalty. Nu afișează prețuri publice — obțineți ofertă la sales@freyapos.com. franchisetech acoperă același job cu browser POS, livrare separată pe canale, cost rețete și export Saga — la 49–99€/lună listat pe site, trial 15 zile fără card.",
    betterFor:
      "FreyaPOS poate câștiga dacă aveți nevoie de modul de rezervări, loyalty integrat și preferați relație directă cu un furnizor local cu cotație. franchisetech câștigă dacă vreți preț listat transparent, browser POS fără instalare, export Saga pentru contabil și cost rețete inclus în planul Pro.",
    competitorStrengths: [
      "POS HoReCa și retail — modul restaurant și retail în același sistem",
      "Integrare Glovo și Tazz disponibilă (modul opțional la cerere)",
      "Modul rezervări și check-in — util pentru restaurante cu locuri rezervate",
      "Loyalty și promoții — programe de fidelizare integrate",
      "Scalabil pentru franciză — management centralizat multi-locație",
      "e-Factura și facturare incluse",
    ],
    franchisetechStrengths: [
      "Prețuri listate pe site: Starter 49€, Pro 79€ — fără cotație",
      "Browser POS — fără instalare locală, funcționează pe orice laptop sau tabletă",
      "Export Saga C (XML) inclus — contabilul importă direct, fără transcriere",
      "Cost rețete și marje — știți marja pe preparat înainte de a schimba meniul",
      "Glovo — integrat automat, inclus. Bolt Food și Tazz — în curând.",
      "Trial 15 zile fără card — prima vânzare în ore, fără proiect de implementare",
    ],
    sections: [
      {
        title: "Preț listat vs cotație",
        body: "FreyaPOS nu afișează prețuri pe site — obțineți ofertă contactând echipa de vânzări. franchisetech listează 49€/lună (Starter: POS, raport Z, TVA, personal nelimitat) și 79€/lună (Pro: adaugă stoc, NIR, rețete, Saga export). Comparați costul total cu oferta FreyaPOS înainte de a decide.",
      },
      {
        title: "Livrare — modul opțional vs inclus",
        body: "FreyaPOS oferă integrare Glovo/Tazz ca modul opțional la cerere. franchisetech integrează Glovo automat — comenzile apar direct în sistem, inclus în plan. Bolt Food și Tazz — în curând. Verificați dacă modulul de livrare FreyaPOS are cost suplimentar.",
      },
      {
        title: "Export Saga și cost rețete",
        body: "FreyaPOS nu menționează export Saga pe site-ul lor. franchisetech include export Saga C (XML) în planul Pro — contabilul primește fișierul gata de import. Cost rețete (cost/porție, marjă, can-make) este disponibil în planul Pro — FreyaPOS nu detaliază această funcție.",
      },
    ],
    faqs: [
      {
        question: "FreyaPOS are export Saga pentru contabil?",
        answer:
          "Site-ul FreyaPOS nu menționează export Saga. Contactați-i la sales@freyapos.com pentru confirmare. franchisetech include export Saga C (XML) în planul Pro la 79€/lună — contabilul importă fișierul direct în Saga, fără transcriere.",
      },
      {
        question: "Care e diferența principală față de FreyaPOS?",
        answer:
          "Ambele acoperă POS HoReCa + livrare + multi-locație. Diferențele reale: franchisetech listează prețurile pe site (49–99€), include export Saga și cost rețete, funcționează browser fără instalare, cu trial 15 zile fără card. FreyaPOS are loyalty și rezervări integrate — funcții pe care franchisetech nu le include.",
      },
      {
        question: "FreyaPOS funcționează offline?",
        answer:
          "Nu putem confirma capacitățile offline ale FreyaPOS — verificați cu furnizorul. franchisetech este cloud-based; funcționalitatea offline nu este disponibilă în versiunea standard.",
      },
    ],
    related: [
      { label: "Comparație hePOS", href: "/compare/hepos" },
      { label: "Comparație RezoSoft", href: "/compare/rezosoft" },
      { label: "Cost rețete", href: "/features/recipe-costing" },
      { label: "Prețuri", href: "/pricing" },
    ],
    rows: [
      ["Preț", "Starter 49€, Pro 79€, Multi 99€/lună — listat pe site", "Cotație la cerere — sales@freyapos.com"],
      ["Model deploy", "Browser cloud — fără instalare", "Aplicație locală — instalare necesară"],
      ["Integrare livrare", "Glovo automat inclus; Bolt/Tazz în curând", "Glovo/Tazz — modul opțional la cerere"],
      ["Export Saga", "Inclus Pro (79€/lună)", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Cost rețete & marje", "Inclus Pro — cost/porție, marjă, can-make", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Loyalty & rezervări", "Nu este inclus", "Disponibil — punct forte FreyaPOS"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat", "Disponibil — verificați claritatea"],
      ["Stoc & NIR", "Inclus Pro (79€/lună)", "Gestiune — verificați modulele incluse"],
      ["Multi-locație", "99€/locație — dashboard unificat", "Scalabil pentru franciză — cotație"],
      ["Trial gratuit", "15 zile fără card", "Nu este menționat pe site"],
    ],
  },
  // ── NEW: POSnet ───────────────────────────────────────────────────────────
  {
    slug: "posnet",
    path: "/compare/posnet",
    competitor: "POSnet",
    market: "ro",
    metaTitle: "Alternativă POSnet — POS cloud, rețete, Saga, preț listat",
    description:
      "Comparație onestă franchisetech vs POSnet: ambele au Glovo auto-import și Saga C. POSnet adaugă Bolt/Wolt automat și licență definitivă; franchisetech adaugă rețete cu marje și preț lunar listat.",
    h1: "franchisetech vs POSnet — comparație onestă pentru HoReCa România",
    intro:
      "POSnet este un POS puternic pentru restaurante din România: import automat comenzi Glovo, Bolt, Wolt, integrare Saga C, NIR auto, KDS, chioșc self-ordering și funcționare offline. Licență definitivă (fără abonament lunar). franchisetech acoperă aceleași job-uri principale — casă, stoc, livrare, Saga — cu browser cloud (fără instalare), cost rețete pe porție, marje și trial 15 zile fără card la preț lunar listat.",
    betterFor:
      "POSnet câștigă dacă preferați licență definitivă fără abonament lunar, aveți nevoie de funcționare offline sau chioșc self-ordering. franchisetech câștigă dacă vreți cloud fără server local de menținut, cost rețete și marje per preparat, preț lunar listat transparent și trial fără angajament.",
    competitorStrengths: [
      "Import automat comenzi Glovo, Bolt, Wolt — fără introducere manuală",
      "Integrare Saga C pentru contabilitate — direct din sistem",
      "Licență definitivă (one-time) — fără abonament lunar recurent",
      "Funcționare offline — lucrează fără internet",
      "KDS (kitchen display), chioșc self-ordering și POS mobil la masă",
      "NIR auto din e-Factura SPV — import direct fără reintroducere",
      "Rapoarte în timp real — my.posnet.ro și aplicație mobilă",
    ],
    franchisetechStrengths: [
      "Browser cloud — fără instalare, server local sau mentenanță IT",
      "Cost rețete per porție — știți marja brută înainte de a schimba meniul",
      "Preț lunar listat pe site: 49€ Starter, 79€ Pro, 99€/locație Multi",
      "Trial 15 zile fără card — prima vânzare în ore, fără proiect de implementare",
      "Multi-location la 99€/locație — dashboard unificat, rapoarte separate",
      "Glovo — integrat automat. Bolt Food și Tazz — în curând.",
    ],
    sections: [
      {
        title: "Licență definitivă vs abonament lunar — care vă convine?",
        body: "POSnet funcționează pe model de licență definitivă (one-time purchase) — plătiți odată, folosiți nelimitat (plus suport anual eventual). franchisetech funcționează pe abonament lunar (49–99€/lună). Pentru un restaurant cu 5+ ani activitate, licența POSnet poate fi mai ieftină pe termen lung. Pentru flexibilitate maximă și upgrade automat, abonamentul lunar franchisetech nu necesită investiție inițială.",
      },
      {
        title: "Offline vs cloud — ce contează pentru locația voastră",
        body: "POSnet funcționează offline (local) — util dacă internetul este instabil la locație. franchisetech este cloud-based și necesită conexiune activă. Dacă locația are internet stabil (fibră sau 4G), cloud-ul elimină mentenanța serverului local și backup-urile manuale.",
      },
      {
        title: "Cost rețete și marje — diferența practică",
        body: "POSnet nu detaliază pe site funcții de cost rețete sau calculator marjă pe preparat. franchisetech Pro include cost per porție, marjă brută și can-make (câte porții poți face din stocul actual) — direct legat de stocul din sistem. Dacă schimbați periodic meniul sau vreți să vedeți rentabilitatea per preparat, aceasta este o diferență concretă.",
      },
    ],
    faqs: [
      {
        question: "POSnet are integrare Saga C?",
        answer:
          "Da — POSnet include integrare Saga C pentru contabilitate, conform informațiilor de pe site-ul lor. franchisetech include de asemenea export Saga C (XML) în planul Pro la 79€/lună. Ambele sisteme acoperă această cerință.",
      },
      {
        question: "Ce are POSnet și franchisetech nu are?",
        answer:
          "POSnet are: licență definitivă (fără abonament lunar), funcționare offline, chioșc self-ordering, import NIR auto din SPV e-Factura. franchisetech nu oferă licență one-time, nu funcționează offline și nu are chioșc. Evaluați dacă aceste funcții sunt critice pentru locația voastră.",
      },
      {
        question: "Ce are franchisetech și POSnet nu detaliază?",
        answer:
          "franchisetech include: cost rețete per porție și marjă brută, preț lunar listat transparent pe site, browser fără instalare și trial 15 zile fără card. POSnet nu detaliază pe site cost rețete sau trial gratuit — verificați cu furnizorul.",
      },
    ],
    related: [
      { label: "Comparație hePOS", href: "/compare/hepos" },
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Cost rețete", href: "/features/recipe-costing" },
      { label: "Prețuri", href: "/pricing" },
    ],
    rows: [
      ["Model comercial", "Abonament lunar — 49€/79€/99€ listat pe site", "Licență definitivă (one-time) — fără abonament lunar"],
      ["Import livrare", "Glovo — automat; Bolt/Tazz în curând", "Glovo, Bolt, Wolt auto-import — fără introducere manuală"],
      ["Export Saga C", "Inclus Pro (79€/lună)", "Da — integrare Saga C inclusă"],
      ["NIR auto", "Pro — NIR manual și furnizori", "NIR auto din e-Factura SPV — import direct"],
      ["Cost rețete & marje", "Pro — cost/porție, marjă, can-make", "Nedetaliat pe site — verificați cu furnizorul"],
      ["Funcționare offline", "Nu — necesită internet", "Da — funcționează fără internet"],
      ["Chioșc self-ordering", "Nu este inclus", "Da — disponibil la POSnet"],
      ["KDS bucătărie", "Pro", "Da — disponibil la POSnet"],
      ["Deploy", "Browser cloud — fără instalare", "Aplicație locală — necesită instalare și server"],
      ["Trial gratuit", "15 zile fără card", "Neconfirmat — contactați furnizorul"],
    ],
  },
  // ── NEW: rKeeper ──────────────────────────────────────────────────────────
  {
    slug: "rkeeper",
    path: "/compare/rkeeper",
    competitor: "rKeeper",
    market: "ro",
    metaTitle: "Alternativă rKeeper România — POS simplu, preț listat",
    description:
      "Comparație franchisetech vs rKeeper: sistem enterprise pentru hoteluri și lanțuri vs workspace operațional pentru HoReCa 1–5 locații — preț listat, implementare în ore, Glovo automat și Saga.",
    h1: "franchisetech vs rKeeper — simplitate vs suite enterprise",
    intro:
      "rKeeper (UCS) este un sistem enterprise de management restaurant și hotelier cu prezență internațională, folosit în hoteluri, lanțuri de restaurante, cluburi și spații de entertainment. Modulele includ: POS, StoreHouse (gestiune stoc), software hotelier, chioșcuri, r_keeper Delivery, CRM loyalty și aplicație chelner mobil. Prețul este la cotație. franchisetech nu concurează la enterprise — țintește operatorul 1–5 locații care vrea POS, stoc, rețete, Glovo integrat automat și Saga la preț listat, cu prima vânzare în ore.",
    betterFor:
      "rKeeper câștigă la lanțuri 10+ locații, hoteluri, cluburi și operatori cu cerințe enterprise: call center, dispatch delivery propriu, CRM avansat, StoreHouse pentru stocuri complexe. franchisetech câștigă pentru cafenea, restaurant sau bistro 1–5 locații care vrea implementare self-serve, preț transparent și Glovo integrat automat fără modul suplimentar.",
    competitorStrengths: [
      "Sistem enterprise matur — prezență internațională, sute de instalări în România",
      "StoreHouse: gestiune stoc avansată pentru volume mari și rețele",
      "r_keeper Delivery: modul propriu de livrare și dispatch",
      "CRM loyalty integrat — programe de fidelizare pentru lanțuri",
      "Software hotelier (Shelter) — integrare POS + hotel în același ecosistem",
      "Chioșcuri self-ordering și aplicație chelner mobil disponibile",
    ],
    franchisetechStrengths: [
      "Prețuri listate: Starter 49€, Pro 79€, Multi-location 99€/lună — fără cotație",
      "Implementare self-serve — prima vânzare în ore, fără proiect IT",
      "Browser POS — fără instalare locală sau mentenanță server",
      "Glovo — integrat automat, inclus în plan. Bolt Food/Tazz — în curând.",
      "Export Saga C (XML) — contabilul primește fișierul gata de import",
      "Cost rețete per porție și marjă brută — inclus Pro",
    ],
    sections: [
      {
        title: "Suite enterprise vs operațiuni zilnice simple",
        body: "rKeeper strălucește când aveți 10+ locații cu echipă IT, hotel integrat sau cerințe de dispatch delivery propriu. Pentru un restaurant sau cafenea cu 1–5 locații, rKeeper poate aduce complexitate și costuri de implementare nejustificate. Evaluați ce module veți folosi efectiv înainte de a angaja un proiect de implementare.",
      },
      {
        title: "Preț listat vs cotație — transparență înainte de decizie",
        body: "rKeeper funcționează exclusiv la cotație comercială — prețul depinde de module, terminale, training și contractul de suport. franchisetech listează 49–99€/lună pe site cu personal nelimitat. Calculați costul total rKeeper (licențe + terminale + training + suport anual) înainte de comparație.",
      },
      {
        title: "Delivery integrat — r_keeper Delivery vs Glovo/Bolt separat",
        body: "rKeeper are r_keeper Delivery, modulul propriu pentru livrare și dispatch. Nu este clar pe site-ul românesc dacă oferă import automat din Glovo/Bolt sau necesită integrare separată. franchisetech integrează Glovo automat prin webhook — comenzile apar în sistem fără intervenție manuală, inclus în plan. Bolt Food și Tazz — în curând.",
      },
    ],
    faqs: [
      {
        question: "rKeeper se potrivește unui restaurant cu 1–3 locații fără IT intern?",
        answer:
          "rKeeper poate fi supradimensionat pentru 1–3 locații fără echipă IT. Implementarea necesită timp și resurse; costul total (licențe + hardware + training + suport) poate fi semnificativ față de un operator mic. franchisetech oferă alternativa self-serve la preț listat — comparați costul total pe 12 luni.",
      },
      {
        question: "rKeeper are import automat din Glovo și Bolt?",
        answer:
          "Site-ul rKeeper Romania nu detaliază integrarea cu Glovo sau Bolt — contactați office@rkeeper.ro pentru clarificare. franchisetech integrează Glovo automat prin webhook — inclus în plan. Bolt Food și Tazz — în curând.",
      },
      {
        question: "rKeeper exportă în Saga pentru contabil?",
        answer:
          "Nu este menționat pe site-ul rKeeper România. Verificați cu furnizorul (+40 741 065 298). franchisetech include export Saga C (XML) în planul Pro la 79€/lună.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Comparație Bit-Soft", href: "/compare/bit-soft" },
      { label: "Prețuri", href: "/pricing" },
      { label: "Multi-locație", href: "/pricing" },
    ],
    rows: [
      ["Segment țintă", "HoReCa 1–5 locații, implementare rapidă", "Lanțuri, hoteluri, cluburi — enterprise"],
      ["Implementare", "Ore — self-serve, fără proiect IT", "Săptămâni–luni — proiect dedicat, training"],
      ["Preț", "49–99€/lună listat pe site", "Cotație comercială — contact office@rkeeper.ro"],
      ["Import livrare", "Glovo — automat inclus; Bolt/Tazz în curând", "Neconfirmat pe site RO — verificați cu furnizorul"],
      ["Export Saga", "Inclus Pro (79€/lună)", "Neconfirmat pe site RO — verificați cu furnizorul"],
      ["Gestiune stoc", "Pro — stoc, furnizori, NIR", "StoreHouse — modul enterprise dedicat"],
      ["KDS bucătărie", "Pro", "Disponibil — punct forte rKeeper"],
      ["Chioșc self-ordering", "Nu este inclus", "Disponibil la rKeeper"],
      ["CRM loyalty", "Nu este inclus", "Disponibil la rKeeper — punct forte"],
      ["Cost rețete & marje", "Pro — cost/porție, marjă, can-make", "Neconfirmat pe site — verificați cu furnizorul"],
    ],
  },
  // ── NEW: NexusERP ─────────────────────────────────────────────────────────
  {
    slug: "nexuserp",
    path: "/compare/nexuserp",
    competitor: "Nexus ERP",
    market: "ro",
    metaTitle: "Alternativă Nexus ERP — multi-locație, Glovo, Saga",
    description:
      "Căutați o alternativă la Nexus ERP pentru 3–5 puncte de lucru în București? Comparație onestă: ce acoperă și ce nu acoperă franchisetech față de Nexus ERP — POS, stoc, livrare, Saga, bancă.",
    h1: "franchisetech vs Nexus ERP — alternativă operațională fără complexitate ERP",
    intro:
      "Nexus ERP este o soluție ERP completă pentru companii de orice dimensiune din România — 6.291+ clienți. Include: facturare, import extrase bancare automat, SAF-T, e-Factura, API plăți, WhatsApp notificări. Modulul Nexus Retail acoperă restaurant, fast-food și catering. Prețul este la cotație. franchisetech nu este ERP — este workspace operațional pentru HoReCa: POS, stoc, Glovo integrat automat, Saga și raport Z, la 49–99€/lună listat pe site, fără proiect IT.",
    betterFor:
      "Nexus ERP câștigă pentru companii cu IT intern, cerințe ERP complete (HR, documente, extrase bancare automate, API custom), VPN și bază de date unică pentru rețele mari. franchisetech câștigă pentru operatorul 3–5 locații care vrea POS zilnic + stoc + Glovo (automat) + Saga — fără complexitate ERP și cu prima vânzare în ore, la preț listat.",
    competitorStrengths: [
      "ERP complet — facturare, bancă, SAF-T, e-Factura, HR, documente",
      "Import extrase bancare automat — reconciliere bancară nativă",
      "API propriu — integrări custom și rapoarte pe structura DB internă",
      "6.291+ clienți activi în România — platformă matură",
      "Nexus Retail — modul dedicat restaurant, fast-food și catering",
      "WhatsApp notificări și plăți prin API bancar",
    ],
    franchisetechStrengths: [
      "Implementare în ore — trial self-serve 15 zile fără card, fără proiect IT",
      "Prețuri listate: Starter 49€, Pro 79€, Multi 99€/locație — fără cotație",
      "Glovo — integrat automat, inclus. Bolt Food și Tazz — în curând.",
      "Export Saga C (XML) — contabilul primește fișierul gata de import",
      "Cost rețete per porție și marjă — știți rentabilitatea înainte de a schimba meniul",
      "Personal nelimitat pe plan plătit — fără taxă per casier/terminal",
    ],
    sections: [
      {
        title: "Ce acoperă franchisetech din cerințele unui operator 3–5 locații",
        body: "POS zilnic: da. Stoc și NIR: da (Pro). Glovo — automat: da. Bolt Food/Tazz — în curând. Export Saga: da (Pro). Multi-locație la 99€/locație: da. Raport Z clar la fiecare închidere: da. Cost rețete și marjă per preparat: da (Pro).",
      },
      {
        title: "Ce NU acoperă franchisetech față de Nexus ERP",
        body: "Import extrase bancare automat: nu — Nexus ERP are această funcție nativ; franchisetech nu. API DB direct pentru rapoarte custom: nu în planul standard. Facturare B2B completă (înlocuire SmartBill/Oblio): nu — recomandăm coexistența. Prețuri diferite automat per canal (in-store vs Glovo vs online): nu în planul standard. HR sau documente HR: nu.",
      },
      {
        title: "Contabilitate și Saga — ce face fiecare",
        body: "Nexus ERP nu menționează export Saga pe site-ul lor. Verificați cu echipa NexusERP dacă exportul Saga C este disponibil și în ce plan. franchisetech include export Saga C (XML) în Pro la 79€/lună — contabilul importă direct, fără transcriere. Nexus ERP are integrare bancară nativă (extrase automate) — franchisetech nu are această funcție.",
      },
      {
        title: "Multi-locație — abordare diferită",
        body: "Nexus ERP funcționează cu bază de date unică pentru toate locațiile — un singur adevăr tehnic pentru rețele mari cu VPN. franchisetech oferă workspace separat per locație, cu raportare agregată la nivel de cont de proprietar. Dacă cerința strictă este bază de date unică în timp real, Nexus ERP poate fi mai potrivit.",
      },
    ],
    faqs: [
      {
        question: "Ești o alternativă bună la Nexus ERP pentru 3–5 locații din București?",
        answer:
          "Depinde de cerințe. franchisetech acoperă: POS, stoc, Glovo (automat) + Bolt/Tazz (în curând), Saga, multi-locație la 99€ și cost rețete. Nu acoperă: extrase bancare automate, API DB direct, prețuri diferite per canal sau HR. Dacă cerințele principale sunt operațiunile zilnice HoReCa, rulați trial paralel 15 zile și comparați.",
      },
      {
        question: "Nexus ERP are integrare cu Glovo sau Bolt Food?",
        answer:
          "Site-ul Nexus ERP nu menționează integrare cu Glovo sau Bolt Food. Verificați cu echipa lor la nexuserp.ro. franchisetech integrează Glovo automat prin webhook — inclus în plan. Bolt Food și Tazz — în curând.",
      },
      {
        question: "Nexus ERP exportă în Saga?",
        answer:
          "Site-ul Nexus ERP nu menționează export Saga C. Verificați direct cu echipa lor. franchisetech include export Saga C (XML) în Pro la 79€/lună — fișierul gata de import pentru contabil.",
      },
      {
        question: "Nexus ERP are import extrase bancare automat?",
        answer:
          "Da — Nexus ERP include import automat extrase bancare. Aceasta este o funcție pe care franchisetech nu o are în planurile standard. Dacă reconcilierea bancară automată este o cerință critică, Nexus ERP acoperă mai bine acest job.",
      },
      {
        question: "Pot păstra SmartBill sau Oblio pentru facturare dacă folosesc franchisetech?",
        answer:
          "Da — model comun. SmartBill/Oblio/Saga pentru facturi B2B și e-Factura; franchisetech pentru POS zilnic, stoc, rețete și raport Z. Nu pretindem înlocuire automată a facturării — verificați cu contabilul înainte de orice schimbare.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Comparație rKeeper", href: "/compare/rkeeper" },
      { label: "Comparație Bit-Soft", href: "/compare/bit-soft" },
      { label: "Prețuri multi-locație", href: "/pricing" },
    ],
    rows: [
      ["Tip produs", "POS operațional HoReCa — casă, stoc, rețete, raport Z", "ERP complet — facturare, bancă, HR, documente"],
      ["Preț", "49–99€/lună listat pe site", "Cotație — fără preț public"],
      ["Implementare", "Ore — trial self-serve fără card", "Proiect ERP — săptămâni/luni"],
      ["Import livrare", "Glovo — automat inclus; Bolt/Tazz în curând", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Export Saga C", "Inclus Pro (79€/lună)", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Import extrase bancare", "Nu este disponibil", "Da — integrare bancară nativă, punct forte"],
      ["Cost rețete & marje", "Pro — cost/porție, marjă, can-make", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Multi-locație", "99€/locație — workspace separat, raportare agregată", "Bază de date unică — arhitectură diferită"],
      ["API / acces date", "Contact echipă pentru plan Enterprise", "API propriu, acces DB — punct forte NexusERP"],
      ["Cel mai potrivit pentru", "HoReCa 1–5 locații: POS + Glovo + Saga + preț listat", "Companie cu IT intern, bancă automată, cerințe ERP"],
    ],
  },
];

export const COMPARE_HUB_PATH = "/compare";

/** Romania compare hub groupings */
export const RO_COMPARE_HORECA_SLUGS = [
  "ebriza",
  "bit-soft",
  "rezosoft",
  "expressoft",
  "vilicorest",
  "boogit",
  "freyapos",
  "posnet",
  "rkeeper",
  "nexuserp",
] as const;

export const RO_COMPARE_INVOICING_SLUGS = ["smartbill", "oblio", "saga"] as const;

export function comparisonsByMarket(market?: ComparisonPage["market"]) {
  if (!market) return comparisonPages;
  return comparisonPages.filter((p) => p.market === market);
}

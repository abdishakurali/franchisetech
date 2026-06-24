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
    metaTitle: "Alternativă Saga pentru restaurante — POS zilnic, stoc, NIR | franchisetech",
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
    metaTitle: "Alternativă RezoSoft — POS restaurant browser, stoc, raport Z | franchisetech",
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
    metaTitle: "Alternativă Expressoft — SMB vs enterprise HoReCa | franchisetech",
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
    metaTitle: "Alternativă hePOS — POS restaurant, stoc, raport Z | franchisetech",
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
    metaTitle: "Alternativă VilicoRest — POS cloud restaurant România | franchisetech",
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
    metaTitle: "Alternativă Ebriza — rapoarte incluse, fără add-on Insights | franchisetech",
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
      ["Integrări contabilitate (Saga)", "Export rapoarte — fără add-on Saga", "+39€/lună add-on integrare Saga"],
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
    metaTitle: "Alternativă Oblio pentru restaurante — POS zilnic vs facturare | franchisetech",
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
    metaTitle: "franchisetech vs Bit-Soft Breeze — SMB vs lanțuri enterprise | franchisetech",
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
];

export const COMPARE_HUB_PATH = "/compare";

/** Romania compare hub groupings */
export const RO_COMPARE_HORECA_SLUGS = [
  "ebriza",
  "bit-soft",
  "rezosoft",
  "expressoft",
  "vilicorest",
] as const;

export const RO_COMPARE_INVOICING_SLUGS = ["smartbill", "oblio", "saga"] as const;

export function comparisonsByMarket(market?: ComparisonPage["market"]) {
  if (!market) return comparisonPages;
  return comparisonPages.filter((p) => p.market === market);
}
